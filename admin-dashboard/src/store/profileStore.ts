/* eslint-disable @typescript-eslint/no-empty-object-type */
import { create } from 'zustand';

interface UserProfile {
  id: number;
  username: string;
  phoneNumber: string;
  wallet: string;
  referralCode: string;
  referralBonus: string;
  role: string;
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean; // Add loading state
  error: string | ''
  setProfile: (profile: UserProfile) => void;
  setLoading: (loading: boolean) => void; // Method to set loading state
  setError: (error: string) => void; // Method to set error
}

// Create the store
export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false, // Initialize loading state
  error: '',
  setProfile: (profile) => set({ profile, loading: false }), // Set profile and reset loading
  setLoading: (loading) => set({ loading }), // Update loading state
  setError: (error) => set({error, loading: false}), //;
}));
