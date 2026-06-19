import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS, type Settings, type TimerState } from "./types";
import {
  initialState,
  phaseDurationMs,
  remainingMsAt,
  nextPhaseAfter,
  start,
  pause,
  resume,
  reset,
  skip,
  tick,
} from "./timerCore";

const S = DEFAULT_SETTINGS; // 25/5/15/4, autoStart 両方 false
const NOW = 1_000_000;
const MIN = 60_000;

/** 残り0で満了直前の running 状態を作る */
function expiredWork(completedPomodoros: number): TimerState {
  return { phase: "work", status: "running", endAt: NOW, remainingMs: 0, completedPomodoros };
}

describe("phaseDurationMs / initialState", () => {
  it("各フェーズの満了時間を分から算出する", () => {
    expect(phaseDurationMs("work", S)).toBe(25 * MIN);
    expect(phaseDurationMs("shortBreak", S)).toBe(5 * MIN);
    expect(phaseDurationMs("longBreak", S)).toBe(15 * MIN);
  });

  it("初期状態は work / idle / 満了値保持 / count 0", () => {
    expect(initialState(S)).toEqual({
      phase: "work",
      status: "idle",
      endAt: null,
      remainingMs: 25 * MIN,
      completedPomodoros: 0,
    });
  });
});

describe("start / pause / resume", () => {
  it("idle から start すると endAt = now + remainingMs になる", () => {
    const s = start(initialState(S), S, NOW);
    expect(s.status).toBe("running");
    expect(s.endAt).toBe(NOW + 25 * MIN);
  });

  it("running 中の start は無変化（同一参照）", () => {
    const running = start(initialState(S), S, NOW);
    expect(start(running, S, NOW)).toBe(running);
  });

  it("pause は残り時間を確定保存し endAt を捨てる", () => {
    const running = start(initialState(S), S, NOW); // endAt = NOW + 25min
    const paused = pause(running, NOW + 10_000); // 10秒経過
    expect(paused.status).toBe("paused");
    expect(paused.endAt).toBeNull();
    expect(paused.remainingMs).toBe(25 * MIN - 10_000);
  });

  it("idle での pause は無変化", () => {
    const idle = initialState(S);
    expect(pause(idle, NOW)).toBe(idle);
  });

  it("pause→resume で残り時間が保たれ、endAt が再計算される", () => {
    const running = start(initialState(S), S, NOW);
    const paused = pause(running, NOW + 10_000); // 残り 25min-10s
    const resumed = resume(paused, S, NOW + 60_000); // 別時刻で再開
    expect(resumed.status).toBe("running");
    expect(resumed.endAt).toBe(NOW + 60_000 + (25 * MIN - 10_000));
    expect(remainingMsAt(resumed, NOW + 60_000)).toBe(25 * MIN - 10_000);
  });
});

describe("remainingMsAt", () => {
  it("running は endAt から算出し、0 未満は 0 にクランプ", () => {
    const running = start(initialState(S), S, NOW);
    expect(remainingMsAt(running, NOW + 60_000)).toBe(25 * MIN - 60_000);
    expect(remainingMsAt(running, NOW + 999 * MIN)).toBe(0);
  });

  it("paused / idle は保持値を返す", () => {
    const paused = pause(start(initialState(S), S, NOW), NOW + 10_000);
    expect(remainingMsAt(paused, NOW + 999 * MIN)).toBe(25 * MIN - 10_000);
  });
});

describe("nextPhaseAfter", () => {
  it("work 後は interval の倍数で longBreak、それ以外は shortBreak", () => {
    expect(nextPhaseAfter("work", 1, S)).toBe("shortBreak");
    expect(nextPhaseAfter("work", 3, S)).toBe("shortBreak");
    expect(nextPhaseAfter("work", 4, S)).toBe("longBreak");
    expect(nextPhaseAfter("work", 8, S)).toBe("longBreak");
  });

  it("休憩後は work", () => {
    expect(nextPhaseAfter("shortBreak", 2, S)).toBe("work");
    expect(nextPhaseAfter("longBreak", 4, S)).toBe("work");
  });
});

describe("tick（完了とフェーズ遷移）", () => {
  it("running でない / 残りありなら無変化（同一参照）", () => {
    const idle = initialState(S);
    expect(tick(idle, S, NOW)).toBe(idle);
    const running = start(initialState(S), S, NOW);
    expect(tick(running, S, NOW + 1)).toBe(running); // まだ残りあり
  });

  it("work 完了で count++、次は shortBreak、autoStart off で idle", () => {
    const done = tick(expiredWork(0), S, NOW);
    expect(done.completedPomodoros).toBe(1);
    expect(done.phase).toBe("shortBreak");
    expect(done.status).toBe("idle");
    expect(done.endAt).toBeNull();
    expect(done.remainingMs).toBe(5 * MIN);
  });

  it("4 回目の work 完了で longBreak", () => {
    const done = tick(expiredWork(3), S, NOW); // count 3 → 4
    expect(done.completedPomodoros).toBe(4);
    expect(done.phase).toBe("longBreak");
    expect(done.remainingMs).toBe(15 * MIN);
  });

  it("休憩完了で work に戻り count は不変", () => {
    const breakState: TimerState = {
      phase: "shortBreak",
      status: "running",
      endAt: NOW,
      remainingMs: 0,
      completedPomodoros: 2,
    };
    const done = tick(breakState, S, NOW);
    expect(done.phase).toBe("work");
    expect(done.completedPomodoros).toBe(2);
    expect(done.remainingMs).toBe(25 * MIN);
  });

  it("autoStart on なら完了後そのまま running になる", () => {
    const auto: Settings = { ...S, autoStartBreaks: true };
    const done = tick(expiredWork(0), auto, NOW);
    expect(done.status).toBe("running");
    expect(done.phase).toBe("shortBreak");
    expect(done.endAt).toBe(NOW + 5 * MIN);
  });
});

describe("reset / skip", () => {
  it("reset は現フェーズを満了値に戻し idle、count は保持", () => {
    const running = { ...expiredWork(2), remainingMs: 123 };
    const r = reset(running, S);
    expect(r.phase).toBe("work");
    expect(r.status).toBe("idle");
    expect(r.endAt).toBeNull();
    expect(r.remainingMs).toBe(25 * MIN);
    expect(r.completedPomodoros).toBe(2);
  });

  it("skip(work) は shortBreak へ・count 不変・idle", () => {
    const running = start(initialState(S), S, NOW);
    const sk = skip({ ...running, completedPomodoros: 1 }, S);
    expect(sk.phase).toBe("shortBreak");
    expect(sk.status).toBe("idle");
    expect(sk.completedPomodoros).toBe(1);
    expect(sk.remainingMs).toBe(5 * MIN);
  });

  it("skip(break) は work へ戻る", () => {
    const breakState: TimerState = {
      phase: "longBreak",
      status: "idle",
      endAt: null,
      remainingMs: 15 * MIN,
      completedPomodoros: 4,
    };
    expect(skip(breakState, S).phase).toBe("work");
  });
});
