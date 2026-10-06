import { describe, it, expect } from "vitest";
import {
  migrateStorageKeys,
  SAVE_KEY,
  SETTINGS_KEY,
} from "../src/app/persistence";

function store(entries: Record<string, string>, failWrites = false) {
  const data = new Map(Object.entries(entries));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (failWrites) throw new Error("QuotaExceededError");
      data.set(k, v);
    },
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("storage key migration", () => {
  it("moves a pre-rename save and settings to the Side Quest keys", () => {
    const s = store({
      "drink-at-ron.session.v1": "save",
      "drink-at-ron.settings.v1": "prefs",
    });
    migrateStorageKeys(s);
    expect(Object.fromEntries(s.data)).toEqual({
      [SAVE_KEY]: "save",
      [SETTINGS_KEY]: "prefs",
    });
  });
  it("keeps a value already under the new key and drops the old one", () => {
    const s = store({ "drink-at-ron.session.v1": "old", [SAVE_KEY]: "new" });
    migrateStorageKeys(s);
    expect(Object.fromEntries(s.data)).toEqual({ [SAVE_KEY]: "new" });
  });
  it("leaves the old key in place when the copy fails", () => {
    const s = store({ "drink-at-ron.session.v1": "save" }, true);
    migrateStorageKeys(s);
    expect(Object.fromEntries(s.data)).toEqual({
      "drink-at-ron.session.v1": "save",
    });
  });
  it("is a no-op with nothing to move", () => {
    const s = store({ other: "x" });
    migrateStorageKeys(s);
    expect(Object.fromEntries(s.data)).toEqual({ other: "x" });
  });
});
