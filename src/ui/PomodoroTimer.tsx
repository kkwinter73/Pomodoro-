import { useState } from "react";
import { useTimer, loadSettings, DEFAULT_SETTINGS } from "../timer";
import type { Phase, Settings } from "../timer";
import { AnalogClock } from "./AnalogClock";
import { SettingsPanel } from "./SettingsPanel";
import { useChime } from "./useChime";
import { useNotifier } from "./useNotifier";
import styles from "./PomodoroTimer.module.css";

const PHASE_LABEL: Record<Phase, string> = {
  work: "作業",
  shortBreak: "小休憩",
  longBreak: "長休憩",
};

// 完了した（直前の）フェーズに応じた通知メッセージ
function completionMessage(completedPhase: Phase): { title: string; body: string } {
  if (completedPhase === "work") {
    return { title: "作業完了", body: "休憩を取りましょう" };
  }
  return { title: "休憩終了", body: "作業を始めましょう" };
}

export function PomodoroTimer() {
  // 永続化された設定を初回に復元。編集は SettingsPanel から行い、変更は useTimer 経由で保存される。
  const [settings, setSettings] = useState(() => loadSettings() ?? DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const chime = useChime(settings.soundEnabled);
  const notifier = useNotifier(settings.notificationsEnabled);
  const timer = useTimer(settings, {
    onPhaseComplete: (completedPhase) => {
      chime.play();
      const msg = completionMessage(completedPhase);
      notifier.notify(msg.title, { body: msg.body });
    },
  });

  // ボタン操作（ユーザー操作起点）で AudioContext を解放してから実行する
  const withUnlock = (fn: () => void) => () => {
    chime.ensure();
    fn();
  };

  // 通知を ON にしようとしたときだけユーザー操作起点で権限要求し、許可されなければ ON にしない。
  const handleSettingsChange = (next: Settings) => {
    if (next.notificationsEnabled && !settings.notificationsEnabled) {
      void notifier.requestPermission().then((perm) => {
        setSettings(perm === "granted" ? next : { ...next, notificationsEnabled: false });
      });
      return;
    }
    setSettings(next);
  };

  const notificationDisabled =
    notifier.permission === "denied" || notifier.permission === "unsupported";
  const notificationNote =
    notifier.permission === "denied"
      ? "ブラウザで通知がブロックされています"
      : notifier.permission === "unsupported"
        ? "この環境は通知に未対応です"
        : undefined;

  // 主ボタンは状態に応じて 開始 / 一時停止 / 再開 を切り替える
  const primary = timer.isRunning
    ? { label: "一時停止", onClick: withUnlock(timer.pause) }
    : timer.isPaused
      ? { label: "再開", onClick: withUnlock(timer.resume) }
      : { label: "開始", onClick: withUnlock(timer.start) };

  return (
    <div className={styles.wrapper} data-phase={timer.phase}>
      <p className={styles.phase}>{PHASE_LABEL[timer.phase]}</p>

      <AnalogClock progress={timer.progress} remainingMs={timer.remainingMs} />

      <div className={styles.controls}>
        <button type="button" className={styles.primary} onClick={primary.onClick}>
          {primary.label}
        </button>
        <button type="button" className={styles.ghost} onClick={withUnlock(timer.reset)}>
          リセット
        </button>
        <button type="button" className={styles.ghost} onClick={withUnlock(timer.skip)}>
          スキップ
        </button>
      </div>

      <button
        type="button"
        className={styles.settingsToggle}
        aria-expanded={showSettings}
        onClick={() => setShowSettings((v) => !v)}
      >
        設定
      </button>

      {showSettings ? (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          notificationDisabled={notificationDisabled}
          notificationNote={notificationNote}
        />
      ) : null}
    </div>
  );
}
