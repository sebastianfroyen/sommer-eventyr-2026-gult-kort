import { Link } from "react-router-dom";

const Deloppgave: React.FC = () => {
  return (
    <main>
      <h1>Dette er en deloppgave.</h1>
      <p>Denne siden kan nok slettes når du er i gang.</p>
      <Link to="/">Gå tilbake</Link>
    </main>
  );
};

export default Deloppgave;
