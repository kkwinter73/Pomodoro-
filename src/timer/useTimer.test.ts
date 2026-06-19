import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { DEFAULT_SETTINGS, type Settings } from "./types";
import { useTimer } from "./useTimer";

// 短い満了時間で完了まで素早く検証する（安定参照で渡す）
const FAST: Settings = { ...DEFAULT_SETTINGS, workMin: 1, shortBreakMin: 1 };
const MIN = 60_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTimer", () => {
  it("初期状態は work / idle / 満了値", () => {
    const { result } = renderHook(() => useTimer(FAST));
    expect(result.current.phase).toBe("work");
    expect(result.current.isIdle).toBe(true);
    expect(result.current.remainingMs).toBe(1 * MIN);
  });

  it("start 後、時間経過で remainingMs が減る", () => {
    const { result } = renderHook(() => useTimer(FAST));
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);

    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.remainingMs).toBe(1 * MIN - 10_000);
  });

  it("pause で計測が止まり、resume で残りから再開する", () => {
    const { result } = renderHook(() => useTimer(FAST));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10_000)); // 残り 50s

    act(() => result.current.pause());
    expect(result.current.isPaused).toBe(true);
    const remainingAtPause = result.current.remainingMs;
    expect(remainingAtPause).toBe(50_000);

    // 一時停止中は時間が進んでも残りは変わらない（インターバル停止）
    act(() => vi.advanceTimersByTime(30_000));
    expect(result.current.remainingMs).toBe(50_000);

    act(() => result.current.resume());
    expect(result.current.isRunning).toBe(true);
    act(() => vi.advanceTimersByTime(20_000));
    expect(result.current.remainingMs).toBe(30_000);
  });

  it("満了するとインターバル経由で次フェーズへ遷移する（autoStart off で idle）", () => {
    const { result } = renderHook(() => useTimer(FAST));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1 * MIN)); // work 満了

    expect(result.current.phase).toBe("shortBreak");
    expect(result.current.isIdle).toBe(true);
    expect(result.current.completedPomodoros).toBe(1);
    expect(result.current.remainingMs).toBe(1 * MIN);
  });

  it("autoStart on なら満了後そのまま次フェーズが走る", () => {
    const auto: Settings = { ...FAST, autoStartBreaks: true };
    const { result } = renderHook(() => useTimer(auto));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1 * MIN)); // work 満了 → shortBreak 自動開始

    expect(result.current.phase).toBe("shortBreak");
    expect(result.current.isRunning).toBe(true);
  });
});
