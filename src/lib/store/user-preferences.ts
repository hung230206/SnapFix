export interface UserPreferences {
  displayName: string;
  useDeviceLocationForCapture: boolean;
  version: 1;
}

export const PREFERENCES_KEY = "snapfix:user-preferences:v1";
export const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: "",
  useDeviceLocationForCapture: true,
  version: 1,
};

export function parsePreferences(raw: string | null): UserPreferences {
  if (raw === null) return { ...DEFAULT_PREFERENCES };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid preferences");
  const data = value as Record<string, unknown>;
  if (data.version !== 1 || typeof data.displayName !== "string" || typeof data.useDeviceLocationForCapture !== "boolean") {
    throw new Error("Invalid preferences");
  }
  return { displayName: data.displayName.trim().slice(0, 80), useDeviceLocationForCapture: data.useDeviceLocationForCapture, version: 1 };
}

export function writePreferences(storage: Pick<Storage, "setItem">, preferences: UserPreferences) {
  const normalized = parsePreferences(JSON.stringify(preferences));
  storage.setItem(PREFERENCES_KEY, JSON.stringify(normalized));
  return normalized;
}
