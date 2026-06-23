import { TACKLE_MESSAGES } from "../../pages/deloppgave/gameConstants";
import TackleAnimation from "../TackleAnimation";
import styles from "./GameScreen.module.css";

interface GameScreenProps {
  tackleIndex: number;
  shaking: boolean;
  onStart: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ tackleIndex, shaking, onStart }) => (
  <div className={styles["game-screen"]}>
    <div className={styles.scoreboard}>
      <span>⚽ KAMP I GANG</span>
      <span className={styles["card-counter"]}>🟡🟡 → 🟥</span>
    </div>
        <TackleAnimation />


    <div className={`${styles["pitch-scene"]} ${shaking ? styles.shake : ""}`}>
      <div className={styles["pitch-text"]}>
        <span className={styles.haaland}>🧑‍⚽ Haaland</span>
        <span className={styles["vs-arrow"]}>←💥</span>
        <span className={styles.villain}>😈 Motspiller</span>
      </div>
      <p className={styles["tackle-msg"]}>{TACKLE_MESSAGES[tackleIndex]}</p>
      <p className={styles["ref-msg"]}>🙈 Dommeren er sjanseløs og trenger din hjelp!</p>
    </div>

    <div className={styles["card-instructions"]}>
      <p>Det du leter etter, er det ikke lett å se.</p>
      <p className={styles["instruction-detail"]}>Ingenting er helt som det virker.</p>
    </div>

    <div className={styles["er-jeg-bare-en-fantasi"]}>
      <p className={styles["instruction-detail"]}>
        Skjulte signaler er ikke alltid gule.
      </p>
      <p className={styles["instruction-detail"]}>
        Følg det som faller bort fra det åpenbare.
      </p>
      <button className={`${styles["card-btn"]} ${styles["yellow-btn"]}`} onClick={onStart}>
        📷 Vis ditt kort
      </button>
    </div>
  </div>
);

export default GameScreen;
