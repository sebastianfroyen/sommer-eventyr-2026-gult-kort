type CardFlashPhase = "flash-yellow-1" | "flash-yellow-2" | "flash-red";

interface CardFlashProps {
  phase: CardFlashPhase;
}

const CardFlash: React.FC<CardFlashProps> = ({ phase }) => {
  if (phase === "flash-red") {
    return (
      <div className="card-flash red-flash">
        <div className="card-visual red-card" />
        <p className="card-label">RØDT KORT!</p>
        <p className="card-sublabel">MOTSPILLEREN ER UTVIST! 🚨</p>
      </div>
    );
  }

  return (
    <div className="card-flash yellow-flash">
      <div className="card-visual yellow-card" />
      <p className="card-label">GULT KORT!</p>
      <p className="card-sublabel">
        {phase === "flash-yellow-1" ? "1 av 2 — bra! Nå det andre… 🏃" : "2 av 2 — RØDT KORT NESTE! 🟥"}
      </p>
    </div>
  );
};

export default CardFlash;
