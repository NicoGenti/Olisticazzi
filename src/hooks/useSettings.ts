import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsStoreState {
  language: "it";
  notificationsEnabled: boolean;
  sticazziEnabled: boolean;
  ecoEnabled: boolean;
  toggleNotifications: () => void;
  toggleSticazzi: () => void;
  toggleEco: () => void;
}

const STORAGE_KEY = "moonmood_settings";

const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
});

export const useSettings = create<SettingsStoreState>()(
  persist(
    (set) => ({
      language: "it" as const,
      notificationsEnabled: false,
      sticazziEnabled: true,
      ecoEnabled: true,
      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
      toggleSticazzi: () =>
        set((state) => ({
          sticazziEnabled: !state.sticazziEnabled,
        })),
      toggleEco: () =>
        set((state) => ({
          ecoEnabled: !state.ecoEnabled,
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: safeStorage,
    }
  )
);

export const useSticazziEnabled = () =>
  useSettings((state) => state.sticazziEnabled);

export const useEcoEnabled = () =>
  useSettings((state) => state.ecoEnabled);

export const useNotificationsEnabled = () =>
  useSettings((state) => state.notificationsEnabled);
