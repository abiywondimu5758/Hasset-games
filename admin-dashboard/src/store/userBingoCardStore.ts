import { create } from "zustand";
import { UserBingoCard } from "../types";


interface UserBingoCardStore {
  userBingoCards: UserBingoCard[];
  setUserBingoCards: (userBingoCards: UserBingoCard[]) => void;
}

export const useUserBingoCardStore = create<UserBingoCardStore>((set) => ({
  userBingoCards: [],
  setUserBingoCards: (userBingoCards) => set({ userBingoCards }),
}));
