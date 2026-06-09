import { useState, useEffect } from "react";
import "./deloppgave.css";
import { GamePhase, TACKLE_MESSAGES } from "./gameConstants";
import CardFlash from "../../components/CardFlash/CardFlash";
import VictoryScreen from "../../components/VictoryScreen/VictoryScreen";
import CameraScreen from "../../components/CameraScreen/CameraScreen";
import GameScreen from "../../components/GameScreen/GameScreen";
import TackleAnimation from "@/components/TackleAnimation";

const Deloppgave: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [tackleIndex, setTackleIndex] = useState(0);
  const [shaking, setShaking] = useState(false);

  // Tackle animation
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setShaking(true);
      setTackleIndex((i) => (i + 1) % TACKLE_MESSAGES.length);
      setTimeout(() => setShaking(false), 500);
    }, 2500);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-advance from flash phases
  useEffect(() => {
    if (phase === "flash-yellow-1") {
      const t = setTimeout(() => setPhase("waiting-yellow-2"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "flash-yellow-2") {
      const t = setTimeout(() => setPhase("waiting-red"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "flash-red") {
      const t = setTimeout(() => setPhase("victory"), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (
    phase === "flash-yellow-1" ||
    phase === "flash-yellow-2" ||
    phase === "flash-red"
  ) {
    return (
      <>
        <CardFlash phase={phase} />
      </>
    );
  }

  if (phase === "victory") {
    return <VictoryScreen />;
  }

  if (
    phase === "waiting-yellow-1" ||
    phase === "waiting-yellow-2" ||
    phase === "waiting-red"
  ) {
    return <CameraScreen phase={phase} onAdvance={setPhase} />;
  }

  return (
    <GameScreen
      tackleIndex={tackleIndex}
      shaking={shaking}
      onStart={() => setPhase("waiting-yellow-1")}
    />
  );
};

export default Deloppgave;
