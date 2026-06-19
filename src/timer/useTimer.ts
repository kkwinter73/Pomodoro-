// React フック。state 保持と表示更新インターバルだけを担い、時間計算は timerCore に委譲する。
// 時間の真実源は Date.now()。setInterval は ~250ms の再描画/完了検知トリガのみ（ADR 0003）。
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "./types";
import type { Phase, Settings, Status } from "./types";
import * as core from "./timerCore";
import { loadState, saveState, saveSettings } from "./storage";

const TICK_MS = 250;

export interface UseTimerResult {
  phase: Phase;
  status: Status;
  completedPomodoros: number;
  /** 表示用の残り時間（ms）。running 中は now から算出される。 */
  remainingMs: number;
  isRunning: boolean;
  isPaused: boolean;
  isIdle: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

/**
 * ポモドーロタイマーのコアフック。
 * 注意: settings は安定参照を渡すこと（毎レンダーで新規オブジェクトを渡すと
 * インターバルが張り直される）。設定の管理は #3 で行う。
 */
export function useTimer(settings: Settings = DEFAULT_SETTINGS): UseTimerResult {
  const [state, setState] = useState(() => {
    // 永続化された状態を復元。running 中に経過していれば now で完了処理を適用する
    // （tick は未満了なら無変化 / ADR 0003・docs/design Persistence 節）。
    const base = loadState() ?? core.initialState(settings);
    return core.tick(base, settings, Date.now());
  });
  const [now, setNow] = useState(() => Date.now());

  // 状態・設定の変化を localStorage に保存する
  useEffect(() => {
    saveState(state);
  }, [state]);
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // running の間だけインターバルを回す。完了したら次フェーズへ遷移し、
  // running 以外になればクリーンアップで停止する。
  useEffect(() => {
    if (state.status !== "running") return;
    const id = setInterval(() => {
      const t = Date.now();
      // tick は未完了なら同一参照を返すため、その場合 React は再描画をスキップする。
      setState((prev) => core.tick(prev, settings, t));
      setNow(t);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [state.status, settings]);

  const remainingMs = core.remainingMsAt(state, now);

  const start = useCallback(() => setState((s) => core.start(s, settings, Date.now())), [settings]);
  const pause = useCallback(() => setState((s) => core.pause(s, Date.now())), []);
  const resume = useCallback(
    () => setState((s) => core.resume(s, settings, Date.now())),
    [settings],
  );
  const reset = useCallback(() => setState((s) => core.reset(s, settings)), [settings]);
  const skip = useCallback(() => setState((s) => core.skip(s, settings)), [settings]);

  return {
    phase: state.phase,
    status: state.status,
    completedPomodoros: state.completedPomodoros,
    remainingMs,
    isRunning: state.status === "running",
    isPaused: state.status === "paused",
    isIdle: state.status === "idle",
    start,
    pause,
    resume,
    reset,
    skip,
  };
}
