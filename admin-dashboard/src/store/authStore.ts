import {create} from 'zustand';

interface AuthStore {
  isAuthenticated: boolean;
  loginUser: (username: string, role: string) => void;
  logoutUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: !!localStorage.getItem('accessToken'), // Check if token exists
  loginUser: () => {
    set({ isAuthenticated: true });
    // You may also want to store username and role if needed
    // For example: localStorage.setItem('username', username);
  },
  logoutUser: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isAuthenticated: false });
  },
}));
