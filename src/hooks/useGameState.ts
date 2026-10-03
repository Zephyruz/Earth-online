import { useEffect, useState } from "react";
import { GameState } from "../types/game";
import { loadGame, saveGame } from "../utils/storage";
import { normalizeGameDates } from "../utils/gameLogic";

export const useGameState = () => {
  const [game, setGame] = useState<GameState>(() => normalizeGameDates(loadGame()));

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => {
    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key === "earth-online-solo-save" && event.newValue) {
        setGame(normalizeGameDates(loadGame()));
      }
    };
    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, []);

  const updateGame = (recipe: (current: GameState) => GameState) => {
    setGame((current) => recipe(current));
  };

  return { game, setGame, updateGame };
};
