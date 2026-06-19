import { describe, it, expect } from "vitest";
import { clampInt, MINUTE_FIELDS, TOGGLE_FIELDS } from "./settingsFields";

describe("clampInt", () => {
  it("範囲内はそのまま（小数は整数化）", () => {
    expect(clampInt(25, 1, 180)).toBe(25);
    expect(clampInt(4.6, 1, 12)).toBe(5);
  });

  it("範囲外はクランプ", () => {
    expect(clampInt(0, 1, 180)).toBe(1);
    expect(clampInt(999, 1, 180)).toBe(180);
  });

  it("不正値は min にフォールバック", () => {
    expect(clampInt(NaN, 1, 60)).toBe(1);
    expect(clampInt(Infinity, 1, 60)).toBe(1);
  });
});

describe("フィールド定義", () => {
  it("Settings の全キーを過不足なく網羅する", () => {
    const keys = [...MINUTE_FIELDS.map((f) => f.key), ...TOGGLE_FIELDS.map((f) => f.key)].sort();
    expect(keys).toEqual(
      [
        "autoStartBreaks",
        "autoStartWork",
        "longBreakInterval",
        "longBreakMin",
        "notificationsEnabled",
        "shortBreakMin",
        "soundEnabled",
        "workMin",
      ].sort(),
    );
  });
});
