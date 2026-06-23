import { GamePhase, TACKLE_MESSAGES } from "../../pages/deloppgave/gameConstants";
import TackleAnimation from "../TackleAnimation";

interface GameScreenProps {
  tackleIndex: number;
  shaking: boolean;
  onStart: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ tackleIndex, shaking, onStart }) => (
  <div className="game-screen">
    <div className="scoreboard">
      <span>⚽ KAMP I GANG</span>
      <span className="card-counter">🟡🟡 → 🟥</span>
    </div>
        <TackleAnimation />


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
      <p className="instruction-detail">
        Vis <strong>2 gule kort</strong> og deretter <strong>1 rødt kort</strong> foran kameraet.
      </p>
      <p className="instruction-detail">
        ⚠️ Hold kortet inne i den <strong>bevegelige boksen</strong> — du har kun{" "}
        <strong>10 sekunder</strong> per kort!
      </p>
      <button className="card-btn yellow-btn" onClick={onStart}>
        📷
      </button>
    </div>
  </div>
);

export default GameScreen;
