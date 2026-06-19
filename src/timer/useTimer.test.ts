import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { DEFAULT_SETTINGS, type Settings, type TimerState } from "./types";
import { useTimer } from "./useTimer";
import { loadState, saveState } from "./storage";

// 短い満了時間で完了まで素早く検証する（安定参照で渡す）
const FAST: Settings = { ...DEFAULT_SETTINGS, workMin: 1, shortBreakMin: 1 };
const MIN = 60_000;

beforeEach(() => {
  localStorage.clear(); // 永続化の影響を遮断
  vi.useFakeTimers();
  vi.setSystemTime(0);
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe("useTimer", () => {
  it("初期状態は work / idle / 満了値", () => {
    const { result } = renderHook(() => useTimer(FAST));
    expect(result.current.phase).toBe("work");
    expect(result.current.isIdle).toBe(true);
    expect(result.current.remainingMs).toBe(1 * MIN);
    expect(result.current.totalMs).toBe(1 * MIN);
    expect(result.current.progress).toBe(0);
  });

  it("totalMs / progress が経過に応じて更新される", () => {
    const { result } = renderHook(() => useTimer(FAST)); // work 1分
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(30_000)); // 半分経過
    expect(result.current.totalMs).toBe(1 * MIN);
    expect(result.current.remainingMs).toBe(30_000);
    expect(result.current.progress).toBeCloseTo(0.5, 5);
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

describe("useTimer 永続化（#4）", () => {
  it("開始後の状態が localStorage に保存される", () => {
    const { result } = renderHook(() => useTimer(FAST));
    act(() => result.current.start());

    const saved = loadState();
    expect(saved?.status).toBe("running");
    expect(saved?.endAt).toBe(1 * MIN); // systemTime 0 + 1分
  });

  it("保存された running 状態を復元し、未満了なら残りを再計算する", () => {
    const seeded: TimerState = {
      phase: "work",
      status: "running",
      endAt: 30_000, // systemTime 0 から 30秒後
      remainingMs: 0,
      completedPomodoros: 0,
    };
    saveState(seeded);

    const { result } = renderHook(() => useTimer(FAST));
    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingMs).toBe(30_000);
  });

  it("復元時に既に満了していれば完了処理を適用して次フェーズへ", () => {
    const expired: TimerState = {
      phase: "work",
      status: "running",
      endAt: -1, // 既に過去
      remainingMs: 0,
      completedPomodoros: 0,
    };
    saveState(expired);

    const { result } = renderHook(() => useTimer(FAST)); // autoStart off
    expect(result.current.phase).toBe("shortBreak");
    expect(result.current.isIdle).toBe(true);
    expect(result.current.completedPomodoros).toBe(1);
  });
});

describe("useTimer onPhaseComplete（#5）", () => {
  it("満了時に完了フェーズ名で1回だけ呼ばれる", () => {
    const spy = vi.fn();
    const { result } = renderHook(() => useTimer(FAST, { onPhaseComplete: spy }));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1 * MIN));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("work");
  });

  it("skip / reset では呼ばれない", () => {
    const spy = vi.fn();
    const { result } = renderHook(() => useTimer(FAST, { onPhaseComplete: spy }));
    act(() => result.current.skip());
    act(() => result.current.reset());
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("useTimer 設定変更の反映（#3）", () => {
  it("idle 中に設定を変えると残り時間が新しい満了値になる", () => {
    const { result, rerender } = renderHook(({ s }) => useTimer(s), { initialProps: { s: FAST } });
    expect(result.current.remainingMs).toBe(1 * MIN);
    act(() => rerender({ s: { ...FAST, workMin: 2 } }));
    expect(result.current.remainingMs).toBe(2 * MIN);
  });

  it("running 中の設定変更は現在の残りを乱さない", () => {
    const { result, rerender } = renderHook(({ s }) => useTimer(s), { initialProps: { s: FAST } });
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10_000)); // 残り 50s
    expect(result.current.remainingMs).toBe(50_000);
    act(() => rerender({ s: { ...FAST, workMin: 2 } }));
    expect(result.current.remainingMs).toBe(50_000);
  });
});
