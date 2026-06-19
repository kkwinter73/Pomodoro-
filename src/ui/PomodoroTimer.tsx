import { useState } from "react";
import { useTimer, loadSettings, DEFAULT_SETTINGS } from "../timer";
import type { Phase } from "../timer";
import { formatTime } from "./formatTime";
import styles from "./PomodoroTimer.module.css";

const PHASE_LABEL: Record<Phase, string> = {
  work: "作業",
  shortBreak: "小休憩",
  longBreak: "長休憩",
};

export function PomodoroTimer() {
  // 永続化された設定を初回に復元する。設定の編集UIは #3 で追加予定。
  const [settings] = useState(() => loadSettings() ?? DEFAULT_SETTINGS);
  const timer = useTimer(settings);

  // 主ボタンは状態に応じて 開始 / 一時停止 / 再開 を切り替える
  const primary = timer.isRunning
    ? { label: "一時停止", onClick: timer.pause }
    : timer.isPaused
      ? { label: "再開", onClick: timer.resume }
      : { label: "開始", onClick: timer.start };

  return (
    <section className={styles.timer} data-phase={timer.phase}>
      <p className={styles.phase}>{PHASE_LABEL[timer.phase]}</p>
      <p className={styles.time} role="timer" aria-live="polite">
        {formatTime(timer.remainingMs)}
      </p>
      <p className={styles.count}>完了ポモドーロ: {timer.completedPomodoros}</p>
      <div className={styles.controls}>
        <button type="button" className={styles.primary} onClick={primary.onClick}>
          {primary.label}
        </button>
        <button type="button" onClick={timer.reset}>
          リセット
        </button>
        <button type="button" onClick={timer.skip}>
          スキップ
        </button>
      </div>
    </section>
  );
}
