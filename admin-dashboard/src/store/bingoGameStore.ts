import { create } from "zustand";
import { BingoGame } from "../types";

interface BingoGameStore {
  bingoGames: BingoGame[];
  setBingoGames: (bingoGames: BingoGame[]) => void;
}

export const useBingoGameStore = create<BingoGameStore>((set) => ({
  bingoGames: [],
  setBingoGames: (bingoGames) => set({ bingoGames }),
}));
