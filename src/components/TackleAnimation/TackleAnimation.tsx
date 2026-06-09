import styles from "./TackleAnimation.module.css";

const TackleAnimation: React.FC = () => (
  <div className={styles.scene} aria-label="Tackling animation">
    {/* Ball carrier running in from the left */}
    <span className={styles.playerA} role="img" aria-label="Player with ball">
      🏃
    </span>

    {/* Ball on the pitch */}
    <span className={styles.ball} role="img" aria-label="Football">
      ⚽
    </span>

    {/* Tackler sliding in from the right */}
    <span className={styles.playerB} role="img" aria-label="Tackling player">
      🏃
    </span>

    {/* Impact flash */}
    <span className={styles.impact} role="img" aria-label="Impact">
      💥
    </span>
  </div>
);

export default TackleAnimation;
