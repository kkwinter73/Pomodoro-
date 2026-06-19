import { useState } from "react";
import { useTimer, loadSettings, DEFAULT_SETTINGS } from "../timer";
import type { Phase } from "../timer";
import { formatTime } from "./formatTime";
import { SettingsPanel } from "./SettingsPanel";
import { useChime } from "./useChime";
import styles from "./PomodoroTimer.module.css";

const PHASE_LABEL: Record<Phase, string> = {
  work: "作業",
  shortBreak: "小休憩",
  longBreak: "長休憩",
};

export function PomodoroTimer() {
  // 永続化された設定を初回に復元。編集は SettingsPanel から行い、変更は useTimer 経由で保存される。
  const [settings, setSettings] = useState(() => loadSettings() ?? DEFAULT_SETTINGS);
  const chime = useChime(settings.soundEnabled);
  const timer = useTimer(settings, { onPhaseComplete: () => chime.play() });

  // ボタン操作（ユーザー操作起点）で AudioContext を解放してから実行する
  const withUnlock = (fn: () => void) => () => {
    chime.ensure();
    fn();
  };

  // 主ボタンは状態に応じて 開始 / 一時停止 / 再開 を切り替える
  const primary = timer.isRunning
    ? { label: "一時停止", onClick: withUnlock(timer.pause) }
    : timer.isPaused
      ? { label: "再開", onClick: withUnlock(timer.resume) }
      : { label: "開始", onClick: withUnlock(timer.start) };

  return (
    <div className={styles.wrapper}>
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
          <button type="button" onClick={withUnlock(timer.reset)}>
            リセット
          </button>
          <button type="button" onClick={withUnlock(timer.skip)}>
            スキップ
          </button>
        </div>
      </section>

      <SettingsPanel settings={settings} onChange={setSettings} />
    </div>
  );
}
