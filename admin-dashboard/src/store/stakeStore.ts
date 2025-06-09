import { create } from "zustand";
import { Stake } from "../types";


interface StakeStore {
  stakes: Stake[];
  setStakes: (stakes: Stake[]) => void;
}

export const useStakeStore = create<StakeStore>((set) => ({
    stakes: [],
    setStakes: (stakes) => set({ stakes }),
}));
