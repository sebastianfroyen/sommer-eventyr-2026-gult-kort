import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <main>
      <h1>Home</h1>
      <p>Dette er hovedsiden. Kanskje trenger du bare denne?</p>
      <Link to="/deloppgave">Til deloppgave</Link>
    </main>
  );
};

export default Home;
