// タイマーの純粋ロジック（React 非依存）。すべて now / settings を引数で受け取り決定論的に動く。
// 時間の真実源は呼び出し側が渡す now（= Date.now()）。ADR 0003 / docs/design/pomodoro-design.md 準拠。
import type { Phase, Settings, TimerState } from "./types";

const MIN = 60_000;

export function phaseDurationMs(phase: Phase, settings: Settings): number {
  switch (phase) {
    case "work":
      return settings.workMin * MIN;
    case "shortBreak":
      return settings.shortBreakMin * MIN;
    case "longBreak":
      return settings.longBreakMin * MIN;
    default: {
      // union の網羅漏れを静的に検出（.claude/rules/typescript-react.md）
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

export function initialState(settings: Settings): TimerState {
  return {
    phase: "work",
    status: "idle",
    endAt: null,
    remainingMs: phaseDurationMs("work", settings),
    completedPomodoros: 0,
  };
}

/** 指定時刻における残り時間（ms）。running は endAt から算出、それ以外は保持値。 */
export function remainingMsAt(state: TimerState, now: number): number {
  if (state.status === "running" && state.endAt !== null) {
    return Math.max(0, state.endAt - now);
  }
  return state.remainingMs;
}

/**
 * tick による完了時の次フェーズ。work 完了後は completedPomodoros（加算後）が
 * longBreakInterval の倍数なら longBreak、それ以外は shortBreak。休憩後は work。
 */
export function nextPhaseAfter(
  phase: Phase,
  completedPomodoros: number,
  settings: Settings,
): Phase {
  if (phase === "work") {
    return completedPomodoros % settings.longBreakInterval === 0 ? "longBreak" : "shortBreak";
  }
  return "work";
}

/** 指定フェーズを開始/待機状態にする（run=true で running、false で idle）。 */
function beginPhase(
  phase: Phase,
  settings: Settings,
  now: number,
  run: boolean,
  completedPomodoros: number,
): TimerState {
  const duration = phaseDurationMs(phase, settings);
  return {
    phase,
    status: run ? "running" : "idle",
    endAt: run ? now + duration : null,
    remainingMs: duration,
    completedPomodoros,
  };
}

/** idle / paused から計測開始。残り時間ぶんだけ endAt を再計算する。 */
export function start(state: TimerState, _settings: Settings, now: number): TimerState {
  if (state.status === "running") return state;
  return { ...state, status: "running", endAt: now + state.remainingMs };
}

/** running を一時停止。残り時間を確定保存し endAt を捨てる。 */
export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== "running") return state;
  return {
    ...state,
    status: "paused",
    endAt: null,
    remainingMs: remainingMsAt(state, now),
  };
}

/** 一時停止からの再開（= start）。 */
export function resume(state: TimerState, settings: Settings, now: number): TimerState {
  return start(state, settings, now);
}

/** 現フェーズを満了値に戻して idle に。phase と completedPomodoros は保持する。 */
export function reset(state: TimerState, settings: Settings): TimerState {
  return {
    ...state,
    status: "idle",
    endAt: null,
    remainingMs: phaseDurationMs(state.phase, settings),
  };
}

/**
 * 次フェーズへ手動移動して idle・満了値にする。work をスキップしても未完了なので
 * completedPomodoros は増やさず、次は shortBreak。休憩スキップは work へ。
 */
export function skip(state: TimerState, settings: Settings): TimerState {
  const next: Phase = state.phase === "work" ? "shortBreak" : "work";
  return beginPhase(next, settings, 0, false, state.completedPomodoros);
}

/**
 * 表示更新のたびに呼ぶ。running かつ残り 0 で現フェーズを完了し、次フェーズへ遷移する。
 * autoStart 設定に応じて次を running か idle にする。完了していなければ無変化。
 * （背景タブ等で複数フェーズを跨ぐ取りこぼしは単段で扱わない＝永続化 #4 の復元で対応）
 */
export function tick(state: TimerState, settings: Settings, now: number): TimerState {
  if (state.status !== "running") return state;
  if (remainingMsAt(state, now) > 0) return state;

  const completedPomodoros =
    state.phase === "work" ? state.completedPomodoros + 1 : state.completedPomodoros;
  const next = nextPhaseAfter(state.phase, completedPomodoros, settings);
  const run = next === "work" ? settings.autoStartWork : settings.autoStartBreaks;
  return beginPhase(next, settings, now, run, completedPomodoros);
}
