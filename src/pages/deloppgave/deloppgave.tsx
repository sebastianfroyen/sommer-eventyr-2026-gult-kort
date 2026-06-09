import { useState, useEffect, useRef, useCallback } from "react";
import "./deloppgave.css";

type GamePhase =
  | "playing"
  | "waiting-yellow-1"
  | "flash-yellow-1"
  | "waiting-yellow-2"
  | "flash-yellow-2"
  | "waiting-red"
  | "flash-red"
  | "victory";

const TACKLE_MESSAGES = [
  "😤 Motspilleren smeller til Haaland igjen!",
  "💥 BRAK! Haaland på bakken — IGJEN!",
  "😡 Motspilleren respekterer ingenting!",
  "🤕 Haaland slår seg for femte gang...",
  "🔥 Dommeren er maktesløs — kortet er borte!",
];

const DETECTION_THRESHOLD = 0.50; // 50% av piksler i sonen må matche
const HOLD_DURATION = 1000;        // ms å holde stabilt
const COUNTDOWN_SECONDS = 10;

// Bevegelseshastighet per kortfase
const PHASE_SPEED: Partial<Record<GamePhase, number>> = {
  "waiting-yellow-1": 0.35,
  "waiting-yellow-2": 0.60,
  "waiting-red": 0.90,
};

function analyzeFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  targetColor: "yellow" | "red",
  targetX: number,
  targetY: number
): number {
  const ctx = canvas.getContext("2d");
  if (!ctx || video.videoWidth === 0) return 0;

  const w = 100;
  const h = 100;
  canvas.width = w;
  canvas.height = h;

  const srcX = Math.max(0, Math.min(video.videoWidth * targetX - w / 2, video.videoWidth - w));
  const srcY = Math.max(0, Math.min(video.videoHeight * targetY - h / 2, video.videoHeight - h));
  ctx.drawImage(video, srcX, srcY, w, h, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  let match = 0;
  const total = w * h;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (targetColor === "yellow") {
      if (r > 160 && g > 120 && b < 120 && r - b > 60 && g - b > 40) match++;
    } else {
      if (r > 150 && g < 100 && b < 120 && r - g > 60) match++;
    }
  }

  return match / total;
}

const Deloppgave: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [tackleIndex, setTackleIndex] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [camError, setCamError] = useState<string | null>(null);
  const [targetPos, setTargetPos] = useState({ x: 0.5, y: 0.5 });
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [showFailed, setShowFailed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<GamePhase>("playing");
  const cooldownRef = useRef(false);
  const targetPosRef = useRef({ x: 0.5, y: 0.5 });
  const phaseStartTimeRef = useRef<number>(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { targetPosRef.current = targetPos; }, [targetPos]);

  // Tackle animation
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setShaking(true);
      setTackleIndex((i) => (i + 1) % TACKLE_MESSAGES.length);
      setTimeout(() => setShaking(false), 500);
    }, 2500);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-advance from flash phases
  useEffect(() => {
    if (phase === "flash-yellow-1") {
      const t = setTimeout(() => setPhase("waiting-yellow-2"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "flash-yellow-2") {
      const t = setTimeout(() => setPhase("waiting-red"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "flash-red") {
      const t = setTimeout(() => setPhase("victory"), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) { clearInterval(detectionIntervalRef.current); detectionIntervalRef.current = null; }
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (targetAnimRef.current) { clearInterval(targetAnimRef.current); targetAnimRef.current = null; }
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
    setConfidence(0);
  }, []);

  const stopCamera = useCallback(() => {
    stopDetection();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [stopDetection]);

  const startDetectionLoop = useCallback(() => {
    stopDetection();
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 900);

    // Bevegelig målboks – Lissajous-kurve, raskere for hvert kort
    phaseStartTimeRef.current = Date.now();
    targetAnimRef.current = setInterval(() => {
      const elapsed = (Date.now() - phaseStartTimeRef.current) / 1000;
      const speed = PHASE_SPEED[phaseRef.current] ?? 0.35;
      const pos = {
        x: 0.5 + 0.32 * Math.sin(elapsed * speed * Math.PI * 2),
        y: 0.5 + 0.25 * Math.sin(elapsed * speed * 1.37 * Math.PI * 2 + 1.0),
      };
      setTargetPos(pos);
      targetPosRef.current = pos;
    }, 50);

    // Nedtelling
    setCountdown(COUNTDOWN_SECONDS);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
          setShowFailed(true);
          setTimeout(() => setShowFailed(false), 1600);
          return COUNTDOWN_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    // Fargedeteksjon
    detectionIntervalRef.current = setInterval(() => {
      if (cooldownRef.current) return;
      const currentPhase = phaseRef.current;
      if (currentPhase !== "waiting-yellow-1" && currentPhase !== "waiting-yellow-2" && currentPhase !== "waiting-red") return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const targetColor = currentPhase === "waiting-red" ? "red" : "yellow";
      const { x, y } = targetPosRef.current;
      const ratio = analyzeFrame(video, canvas, targetColor, x, y);
      setConfidence(ratio);

      if (ratio > DETECTION_THRESHOLD) {
        if (!holdTimerRef.current) {
          holdTimerRef.current = setTimeout(() => {
            holdTimerRef.current = null;
            const p = phaseRef.current;
            if (p === "waiting-yellow-1") setPhase("flash-yellow-1");
            else if (p === "waiting-yellow-2") setPhase("flash-yellow-2");
            else if (p === "waiting-red") setPhase("flash-red");
          }, HOLD_DURATION);
        }
      } else {
        if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
      }
    }, 150);
  }, [stopDetection]);

  const startCamera = useCallback(async () => {
    if (streamRef.current) { startDetectionLoop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCamError(null);
      startDetectionLoop();
    } catch {
      setCamError("Kunne ikke åpne kameraet. Gi tillatelse til kamerabruk og prøv igjen.");
    }
  }, [startDetectionLoop]);

  useEffect(() => {
    const isWaiting = phase === "waiting-yellow-1" || phase === "waiting-yellow-2" || phase === "waiting-red";
    if (isWaiting) startCamera();
    else stopCamera();
  }, [phase, startCamera, stopCamera]);

  // --- Flash-faser ---
  if (phase === "flash-yellow-1" || phase === "flash-yellow-2") {
    return (
      <div className="card-flash yellow-flash">
        <div className="card-visual yellow-card" />
        <p className="card-label">GULT KORT!</p>
        <p className="card-sublabel">
          {phase === "flash-yellow-1" ? "1 av 2 — bra! Nå det andre… 🏃" : "2 av 2 — RØDT KORT NESTE! 🟥"}
        </p>
      </div>
    );
  }

  if (phase === "flash-red") {
    return (
      <div className="card-flash red-flash">
        <div className="card-visual red-card" />
        <p className="card-label">RØDT KORT!</p>
        <p className="card-sublabel">MOTSPILLEREN ER UTVIST! 🚨</p>
      </div>
    );
  }

  if (phase === "victory") {
    return (
      <div className="victory-screen">
        <div className="victory-emoji">🎉</div>
        <h1>MOTSPILLEREN ER UTVIST!</h1>
        <p className="victory-sub">Haaland er trygg! Kampen kan fortsette ⚽</p>
        <div className="confetti-row">
          {"🏆⚽🌟🎊🥳🎉⚽🏆".split("").map((e, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
          ))}
        </div>
      </div>
    );
  }

  // --- Kamera-faser ---
  const isWaiting = phase === "waiting-yellow-1" || phase === "waiting-yellow-2" || phase === "waiting-red";

  if (isWaiting) {
    const isRed = phase === "waiting-red";
    const stepLabel = phase === "waiting-yellow-1" ? "Gult kort 1 av 2" : phase === "waiting-yellow-2" ? "Gult kort 2 av 2" : "Rødt kort";
    const detected = confidence > DETECTION_THRESHOLD;
    const urgentCountdown = countdown <= 3;

    return (
      <div className={`camera-screen ${isRed ? "camera-screen--red" : "camera-screen--yellow"}`}>
        <div className="cam-top-bar">
          <p className="cam-step">{stepLabel}</p>
          <div className={`cam-countdown ${urgentCountdown ? "cam-countdown--urgent" : ""}`}>
            {countdown}s
          </div>
        </div>

        <h2 className="cam-title">
          {isRed ? "🟥 Vis RØDT KORT — hold i boksen!" : "🟡 Vis GULT KORT — hold i boksen!"}
        </h2>

        {showFailed && <div className="cam-fail-banner">⏱ For sent! Prøv igjen…</div>}

        <div className="cam-preview-wrap">
          {camError ? (
            <div className="cam-error">{camError}</div>
          ) : (
            <video ref={videoRef} className="cam-video" autoPlay playsInline muted />
          )}
          <div
            className={`cam-target-box ${isRed ? "cam-target-box--red" : "cam-target-box--yellow"} ${detected ? "cam-target-box--hit" : ""}`}
            style={{ left: `${targetPos.x * 100}%`, top: `${targetPos.y * 100}%` }}
          />
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div className="cam-bar-track">
          <div
            className={`cam-bar-fill ${isRed ? "bar-red" : "bar-yellow"}`}
            style={{ width: `${Math.min(confidence * 200, 100)}%` }}
          />
        </div>
        <p className="cam-hint">
          {detected ? "✅ Hold stille…" : isRed ? "Hold rød skjerm inne i den bevegelige boksen" : "Hold gul skjerm inne i den bevegelige boksen"}
        </p>
      </div>
    );
  }

  // --- Spillfase ---
  return (
    <div className="game-screen">
      <div className="scoreboard">
        <span>⚽ KAMP I GANG</span>
        <span className="card-counter">🟡🟡 → 🟥</span>
      </div>

      <div className={`pitch-scene ${shaking ? "shake" : ""}`}>
        <div className="pitch-text">
          <span className="haaland">🧑‍⚽ Haaland</span>
          <span className="vs-arrow">←💥</span>
          <span className="villain">😈 Motspiller</span>
        </div>
        <p className="tackle-msg">{TACKLE_MESSAGES[tackleIndex]}</p>
        <p className="ref-msg">🙈 Dommeren er sjanseløs og trenger din hjelp!</p>
      </div>

      <div className="card-instructions">
        <p>Dommeren trenger hjelp!</p>
        <p className="instruction-detail">Finn ut hva dommeren trenger...</p>
      </div>

      <div className="er-jeg-bare-en-fantasi">
        <p style={{ display: "none" }} className="instruction-detail">
          Vis <strong>2 gule kort</strong> og deretter <strong>1 rødt kort</strong> foran kameraet.
        </p>
        <p style={{ display: "none" }} className="instruction-detail">
          ⚠️ Hold kortet inne i den <strong>bevegelige boksen</strong> — du har kun <strong>{COUNTDOWN_SECONDS} sekunder</strong> per kort!
        </p>
        <button className="card-btn yellow-btn" onClick={() => setPhase("waiting-yellow-1")}>
          📷
        </button>
      </div>
    </div>
  );
};

export default Deloppgave;
