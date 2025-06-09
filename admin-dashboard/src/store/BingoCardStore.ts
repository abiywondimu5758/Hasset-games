import { create } from "zustand";
import { BingoCard } from "../types";


interface BingoCardStore {
    bingoCards: BingoCard[];
  setBingoCards: (bingoCards: BingoCard[]) => void;
}

export const useBingoCardStore = create<BingoCardStore>((set) => ({
    bingoCards: [],
    setBingoCards: (bingoCards) => set({ bingoCards }),
}));
