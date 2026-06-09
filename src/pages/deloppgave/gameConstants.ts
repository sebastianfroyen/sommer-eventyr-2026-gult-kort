export type GamePhase =
  | "playing"
  | "waiting-yellow-1"
  | "flash-yellow-1"
  | "waiting-yellow-2"
  | "flash-yellow-2"
  | "waiting-red"
  | "flash-red"
  | "victory";

export const TACKLE_MESSAGES = [
  "😤 Motspilleren smeller til Haaland igjen!",
  "💥 BRAK! Haaland på bakken — IGJEN!",
  "😡 Motspilleren respekterer ingenting!",
  "🤕 Haaland slår seg for femte gang...",
  "🔥 Dommeren er maktesløs — kortet er borte!",
];

export const DETECTION_THRESHOLD = 0.5;
export const HOLD_DURATION = 1000;
export const COUNTDOWN_SECONDS = 10;

export const PHASE_SPEED: Partial<Record<GamePhase, number>> = {
  "waiting-yellow-1": 0.35,
  "waiting-yellow-2": 0.60,
  "waiting-red": 0.90,
};
