import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../config/constants';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => {
        set((state) => {
          const newIsDark = !state.isDark;
          document.documentElement.classList.toggle('dark', newIsDark);
          return { isDark: newIsDark };
        });
      },
      setTheme: (isDark) => {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ isDark });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
