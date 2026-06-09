const VictoryScreen: React.FC = () => (
  <div className="victory-screen">
    <div className="victory-emoji">🎉</div>
    <h1>MOTSPILLEREN ER UTVIST!</h1>
    <p className="victory-sub">Haaland er trygg! Kampen kan fortsette ⚽</p>
    <div className="confetti-row">
      {"🏆⚽🌟🎊🥳🎉⚽🏆".split("").map((e, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
      ))}
    </div>
  </div>
);

export default VictoryScreen;
