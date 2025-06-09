import { create } from "zustand";
import { BonusPeriod } from "../types";


interface BonusPeriodStore {
    bonusPeriods: BonusPeriod[];
  setBonusPeriods: (bonusPeriods: BonusPeriod[]) => void;
}

export const useBonusPeriodStore = create<BonusPeriodStore>((set) => ({
    bonusPeriods: [],
    setBonusPeriods: (bonusPeriods) => set({ bonusPeriods }),
}));
