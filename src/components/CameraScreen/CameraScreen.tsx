import { useRef, useState, useCallback, useEffect } from "react";
import { FailImageModal } from "./FailImageModal";
import { useWebcamSnapshot } from "../../hooks/useWebcamSnapshot";
import { useWebcamRecording } from "../../hooks/useWebcamRecording";
import {
  GamePhase,
  DETECTION_THRESHOLD,
  HOLD_DURATION,
  COUNTDOWN_SECONDS,
  PHASE_SPEED,
} from "../../pages/deloppgave/gameConstants";

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

type WaitingPhase = "waiting-yellow-1" | "waiting-yellow-2" | "waiting-red";

interface CameraScreenProps {
  phase: WaitingPhase;
  onAdvance: (next: GamePhase) => void;
  onCompletionRecorded?: (dataUrl: string) => void;
  onFailDialogClose?: () => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ phase, onAdvance, onCompletionRecorded, onFailDialogClose }) => {
  const [confidence, setConfidence] = useState(0);
  const [camError, setCamError] = useState<string | null>(null);
  const [targetPos, setTargetPos] = useState({ x: 0.5, y: 0.5 });
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [showFailed, setShowFailed] = useState(false);
  const [failImage, setFailImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const completionStreamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<WaitingPhase>(phase);
  const cooldownRef = useRef(false);
  const targetPosRef = useRef({ x: 0.5, y: 0.5 });
  const phaseStartTimeRef = useRef<number>(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { targetPosRef.current = targetPos; }, [targetPos]);

  // Stop tracks only after the completion recording has finished; then notify parent.
  const handleOnCompletionRecorded = useCallback((dataUrl: string) => {
    completionStreamRef.current?.getTracks().forEach((t) => t.stop());
    completionStreamRef.current = null;
    onCompletionRecorded?.(dataUrl);
  }, [onCompletionRecorded]);

  const captureFailSnapshot = useWebcamSnapshot(videoRef, "red-card-fail-snapshot", { delayMs: 500, onCapture: setFailImage });
  const captureSuccessSnapshot = useWebcamSnapshot(videoRef, "phase-success-snapshots", { maxCount: 3, delayMs: 500 });
  const captureRedClearSnapshot = useWebcamSnapshot(videoRef, "red-card-clear-snapshot", { delayMs: 500 });
  const startCompletionRecording = useWebcamRecording(videoRef, "game-completion-recording", { durationMs: 3000, onRecorded: handleOnCompletionRecorded });

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
      // If the completion recording is active, tracks will be stopped by
      // handleOnCompletionRecorded once the recording finishes. Stopping them
      // here would kill the MediaRecorder before it captures any data.
      if (!completionStreamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
    }
  }, [stopDetection]);

  const startDetectionLoop = useCallback(() => {
    stopDetection();
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 900);

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

    setCountdown(COUNTDOWN_SECONDS);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
          if (phaseRef.current === "waiting-red") captureFailSnapshot();
          setShowFailed(true);
          setTimeout(() => setShowFailed(false), 1600);
          return COUNTDOWN_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    detectionIntervalRef.current = setInterval(() => {
      if (cooldownRef.current) return;
      const currentPhase = phaseRef.current;

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
            captureSuccessSnapshot();
            const p = phaseRef.current;
            if (p === "waiting-yellow-1") onAdvance("flash-yellow-1");
            else if (p === "waiting-yellow-2") onAdvance("flash-yellow-2");
            else if (p === "waiting-red") {
              captureRedClearSnapshot();
              // Save the stream ref BEFORE advancing so stopCamera won't kill the tracks
              if (videoRef.current?.srcObject instanceof MediaStream) {
                completionStreamRef.current = videoRef.current.srcObject;
              }
              startCompletionRecording();
              onAdvance("flash-red");
            }
          }, HOLD_DURATION);
        }
      } else {
        if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
      }
    }, 150);
  }, [stopDetection, onAdvance, captureFailSnapshot, captureSuccessSnapshot, captureRedClearSnapshot, startCompletionRecording]);

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
    } catch (e) {
      console.log("Camera error:", e);
      setCamError("Kunne ikke åpne kameraet. Gi tillatelse til kamerabruk og prøv igjen. Feilen som oppstod:" + (e instanceof Error ? e.message : String(e)));
    }
  }, [startDetectionLoop]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const isRed = phase === "waiting-red";
  const stepLabel =
    phase === "waiting-yellow-1" ? "Gult kort 1 av 2" :
    phase === "waiting-yellow-2" ? "Gult kort 2 av 2" :
    "Rødt kort";
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

      {failImage && (
        <FailImageModal
          failImage={failImage}
          onClose={() => {
            setFailImage(null);
            onFailDialogClose?.();
          }}
        />
      )}

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

      {/* DEBUG BUTTON — remove before production */}
      <button
        onClick={() => {
          if (phase === "waiting-yellow-1") onAdvance("flash-yellow-1");
          else if (phase === "waiting-yellow-2") onAdvance("flash-yellow-2");
          else if (phase === "waiting-red") {
            if (videoRef.current?.srcObject instanceof MediaStream) {
              completionStreamRef.current = videoRef.current.srcObject;
            }
            startCompletionRecording();
            onAdvance("flash-red");
          }
        }}
        style={{
          position: "fixed",
          bottom: 12,
          right: 12,
          zIndex: 9999,
          background: "rgba(0,0,0,0.6)",
          color: "#ff0",
          border: "1px solid #ff0",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 11,
          cursor: "pointer",
          opacity: 0.6,
        }}
      >
        ⏭ DEBUG: neste fase
      </button>
    </div>
  );
};

export default CameraScreen;
