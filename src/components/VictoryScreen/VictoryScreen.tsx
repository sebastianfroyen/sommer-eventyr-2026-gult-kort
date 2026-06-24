import { useEffect, useMemo, useState } from "react";

interface VictoryScreenProps {
  recordingUrl?: string | null;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  recordingUrl: recordingUrlProp,
}) => {
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [nextAppUrl, setNextAppUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const usernameParam = params.get("username")?.trim();
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, []);

  useEffect(() => {
    if (username && recordingUrl && !nextAppUrl) {
      fetch("/api/key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyWord: recordingUrl.split(',')[0] }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.nextApp) {
            setNextAppUrl(data.nextApp);
          }
        });
    }
  }, [recordingUrl, username]);

  useEffect(() => {
    if (recordingUrlProp) {
      setRecordingUrl(recordingUrlProp);
      return;
    }
    // Fallback: read from localStorage (already stored by the hook)
    const stored = localStorage.getItem("game-completion-recording");
    if (stored) {
      setRecordingUrl(stored);
      return;
    }

    // Poll briefly in case the recording finishes slightly after mount
    const interval = setInterval(() => {
      const polled = localStorage.getItem("game-completion-recording");
      if (polled) {
        setRecordingUrl(polled);
        clearInterval(interval);
      }
    }, 300);
    const timeout = setTimeout(() => clearInterval(interval), 10000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [recordingUrlProp]);

  const continueUrl = useMemo(() => {
    const baseUrl = nextAppUrl;
    return username
      ? `${baseUrl}?username=${encodeURIComponent(username)}`
      : baseUrl;
  }, [username, nextAppUrl]);

  return (
    <div className="victory-screen">
      <div className="victory-emoji">🎉</div>
      <h1>MOTSPILLEREN ER UTVIST!</h1>
      <p className="victory-sub">Haaland er trygg! Kampen kan fortsette ⚽</p>
      <div className="confetti-row">
        {"🏆⚽🌟🎊🥳🎉⚽🏆".split("").map((e, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            {e}
          </span>
        ))}
      </div>

      {recordingUrl && (
        <div className="victory-recording">
          <p className="victory-recording-label">
            🎬 Slik så det ut da du vant!
          </p>
          <video
            src={recordingUrl}
            controls
            autoPlay
            loop
            playsInline
            className="victory-recording-video"
          />
        </div>
      )}

      {continueUrl && (
        <a
          className="victory-next-link"
          href={continueUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
        Fortsett eventyret her
      </a>)}
    </div>
  );
};

export default VictoryScreen;
