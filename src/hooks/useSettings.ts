import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsStoreState {
  sticazziEnabled: boolean;
  toggleSticazzi: () => void;
}

const STORAGE_KEY = "moonmood_settings";

/**
 * Custom storage that handles SSR cases where localStorage is unavailable.
 */
const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    // SSR: return a no-op storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  // Client: use actual localStorage
  return localStorage;
});

export const useSettings = create<SettingsStoreState>()(
  persist(
    (set) => ({
      sticazziEnabled: true,
      toggleSticazzi: () =>
        set((state) => ({
          sticazziEnabled: !state.sticazziEnabled,
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
