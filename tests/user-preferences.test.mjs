import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, parsePreferences, writePreferences } from "../src/lib/store/user-preferences.ts";

test("missing settings use defaults, while GPS off survives serialization", () => {
  assert.deepEqual(parsePreferences(null), DEFAULT_PREFERENCES);
  const stored = JSON.stringify({ displayName: "Phúc", useDeviceLocationForCapture: false, version: 1 });
  assert.equal(parsePreferences(stored).useDeviceLocationForCapture, false);
});

test("corrupt, unsupported or wrongly typed settings are rejected", () => {
  for (const raw of ["{broken", "null", "[]", '{"version":2}', '{"version":1,"displayName":5,"useDeviceLocationForCapture":"false"}']) {
    assert.throws(() => parsePreferences(raw));
  }
});

test("writes normalized names to the dedicated key", () => {
  const calls = [];
  const result = writePreferences({ setItem: (...args) => calls.push(args) }, { ...DEFAULT_PREFERENCES, displayName: `  ${"A".repeat(90)}  ` });
  assert.equal(result.displayName.length, 80);
  assert.deepEqual(calls, [[PREFERENCES_KEY, JSON.stringify(result)]]);
});

test("storage failures propagate instead of claiming a successful save", () => {
  const storage = { setItem() { throw new Error("QuotaExceededError"); } };
  assert.throws(() => writePreferences(storage, DEFAULT_PREFERENCES), /QuotaExceededError/);
});
