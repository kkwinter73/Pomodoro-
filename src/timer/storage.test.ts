import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DEFAULT_SETTINGS, type Settings, type TimerState } from "./types";
import {
  STORAGE_KEYS,
  loadState,
  saveState,
  loadSettings,
  saveSettings,
  clearPersisted,
} from "./storage";

const sampleState: TimerState = {
  phase: "shortBreak",
  status: "paused",
  endAt: null,
  remainingMs: 123_456,
  completedPomodoros: 2,
};

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("state の保存/復元", () => {
  it("ラウンドトリップできる", () => {
    saveState(sampleState);
    expect(loadState()).toEqual(sampleState);
  });

  it("未保存なら null", () => {
    expect(loadState()).toBeNull();
  });

  it("壊れた JSON は null", () => {
    localStorage.setItem(STORAGE_KEYS.state, "{not json");
    expect(loadState()).toBeNull();
  });

  it("形が不正なら null（必須キー欠落・型不一致）", () => {
    localStorage.setItem(STORAGE_KEYS.state, JSON.stringify({ phase: "work" }));
    expect(loadState()).toBeNull();
    localStorage.setItem(
      STORAGE_KEYS.state,
      JSON.stringify({ ...sampleState, phase: "invalid" }),
    );
    expect(loadState()).toBeNull();
  });
});

describe("settings の保存/復元", () => {
  it("ラウンドトリップできる", () => {
    const s: Settings = { ...DEFAULT_SETTINGS, workMin: 50, soundEnabled: false };
    saveSettings(s);
    expect(loadSettings()).toEqual(s);
  });

  it("欠けたキーは既定で補完する（将来のキー追加に耐性）", () => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ workMin: 30 }));
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, workMin: 30 });
  });

  it("型が不正なら null", () => {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ ...DEFAULT_SETTINGS, workMin: "25" }),
    );
    expect(loadSettings()).toBeNull();
  });
});

describe("clearPersisted", () => {
  it("state と settings を消す", () => {
    saveState(sampleState);
    saveSettings(DEFAULT_SETTINGS);
    clearPersisted();
    expect(loadState()).toBeNull();
    expect(loadSettings()).toBeNull();
  });
});
