import { describe, it, expect } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it("ms を mm:ss にゼロ埋め整形する", () => {
    expect(formatTime(25 * 60_000)).toBe("25:00");
    expect(formatTime(5 * 60_000)).toBe("05:00");
    expect(formatTime(65_000)).toBe("01:05");
    expect(formatTime(9_000)).toBe("00:09");
  });

  it("秒は切り上げる（端数があれば次の秒として表示）", () => {
    expect(formatTime(59_001)).toBe("01:00");
    expect(formatTime(1)).toBe("00:01");
  });

  it("0 以下は 00:00 にクランプ", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(-5000)).toBe("00:00");
  });
});
