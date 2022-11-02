import { PropsWithChildren } from "react";
import styles from "./PageLayout.module.css";

interface PageLayoutProps extends PropsWithChildren {
  backgroundImage?: any;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  backgroundImage,
  children,
}) => {
  return (
    <div
      className={styles.container}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {children}
    </div>
  );
};

export default PageLayout;
