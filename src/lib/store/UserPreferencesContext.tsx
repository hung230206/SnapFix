"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, parsePreferences, writePreferences, type UserPreferences } from "./user-preferences";

type PreferenceUpdates = Partial<Pick<UserPreferences, "displayName" | "useDeviceLocationForCapture">>;
interface PreferencesContext {
  preferences: UserPreferences;
  updatePreferences: (updates: PreferenceUpdates) => boolean;
  resetPreferences: () => boolean;
  isLoaded: boolean;
  storageError: string;
}

const UserPreferencesContext = createContext<PreferencesContext | null>(null);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const current = useRef(preferences);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    function load() {
      try {
        const loaded = parsePreferences(localStorage.getItem(PREFERENCES_KEY));
        current.current = loaded;
        setPreferences(loaded);
        setStorageError("");
      } catch {
        // Keep the usable in-memory defaults; never overwrite damaged storage automatically.
        setStorageError("Không đọc được cài đặt đã lưu. Đang dùng cài đặt hiện tại; bạn có thể lưu lại để thử khôi phục.");
      }
      setIsLoaded(true);
    }
    // Hydrate browser storage after mounting, and reflect changes from other tabs.
    load();
    function onStorage(event: StorageEvent) {
      if (event.key === PREFERENCES_KEY || event.key === null) load();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function updatePreferences(updates: PreferenceUpdates) {
    try {
      const next = writePreferences(localStorage, { ...current.current, ...updates });
      current.current = next;
      setPreferences(next);
      setStorageError("");
      return true;
    } catch {
      setStorageError("Không lưu được cài đặt. Trình duyệt có thể đang chặn lưu trữ hoặc đã hết dung lượng. Thay đổi chưa được áp dụng.");
      return false;
    }
  }

  function resetPreferences() {
    return updatePreferences(DEFAULT_PREFERENCES);
  }

  return <UserPreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences, isLoaded, storageError }}>{children}</UserPreferencesContext.Provider>;
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) throw new Error("UserPreferencesProvider is required");
  return context;
}
