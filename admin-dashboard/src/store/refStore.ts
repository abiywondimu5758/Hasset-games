import { create } from "zustand";
import { ReferredUser } from "../types";


interface ReferredUserStore {
  referredUsers: ReferredUser[];
  setReferredUsers: (referredUsers: ReferredUser[]) => void;
}

export const useReferredUserStore = create<ReferredUserStore>((set) => ({
    referredUsers: [],
    setReferredUsers: (referredUsers) => set({ referredUsers }),
}));
