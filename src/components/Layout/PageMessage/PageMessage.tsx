import { PropsWithChildren } from "react";
import styles from "./PageMessage.module.css";

const PageMessage: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default PageMessage;
