import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfo } from '../types';
import { STORAGE_KEYS } from '../config/constants';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserInfo) => void;
  logout: () => void;
  updateUser: (user: UserInfo) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          }
          set({ token, user, isAuthenticated: true });
        } catch (error) {
          console.error('Error setting auth:', error);
          set({ token, user, isAuthenticated: true });
        }
      },
      logout: () => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        } catch (error) {
          console.error('Error during logout:', error);
        }
        set({ token: null, user: null, isAuthenticated: false });
      },
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: false,
    }
  )
);
