import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <pre className={styles.pre}>{text}</pre>
    </div>
  );
};

export default LoadingSpinner;
