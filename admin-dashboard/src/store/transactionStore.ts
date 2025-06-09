import { create } from "zustand";
import { Transaction } from "../types";


interface TransactionStore {
    transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
    transactions: [],
    setTransactions: (transactions) => set({ transactions }),
}));
