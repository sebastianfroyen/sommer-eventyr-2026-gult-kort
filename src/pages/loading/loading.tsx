import LoadingSpinner from "@/components/LoadingSpinner";
import PageLayout from "@/components/Layout/PageLayout";
import PageMessage from "@/components/Layout/PageMessage";

import backgroundImage from "@/assets/images/bg_default.png";
import styles from "./loading.module.css";

const Loading: React.FC = () => {
  return (
    <PageLayout backgroundImage={backgroundImage}>
      <PageMessage>
        <div className={styles.container}>
          <LoadingSpinner text={"Kontrollerer brukernavn"} />
        </div>
      </PageMessage>
    </PageLayout>
  );
};

export default Loading;
