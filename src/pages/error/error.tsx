import BgError from "@/assets/images/bg_error.png";
import PageLayout from "@/components/Layout/PageLayout";
import PageMessage from "@/components/Layout/PageMessage";

import styles from "./error.module.css";

const Error: React.FC = () => {
  return (
    <PageLayout backgroundImage={BgError}>
      <PageMessage>
        <div className={styles.container}>
          <h1 className={styles.heading}>
            Oops, vi fant ikke brukernavnet ditt!
            <span role="img">🤷‍♂️</span>
          </h1>
          <p>
            <strong>
              Kontroller at gruppens brukernavn er skrevet korrekt, og at det er
              angitt på riktig måte.
            </strong>
          </p>
          <code>{`http://www.${window.location.hostname}?username=[brukernavn]`}</code>
        </div>
      </PageMessage>
    </PageLayout>
  );
};

export default Error;
