import { create } from "zustand";
import { PendingWithdrawal } from "../types";

interface PendingWithdrawalsStore {
    pendingWithdrawals: PendingWithdrawal[];
  setPendingWithdrawals: (pendingWithdrawals: PendingWithdrawal[]) => void;
}

export const usePendingWithdrawalsStore = create<PendingWithdrawalsStore>((set) => ({
    pendingWithdrawals: [],
    setPendingWithdrawals: (pendingWithdrawals) => set({ pendingWithdrawals }),
}));
