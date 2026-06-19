// タイマーの型契約。SoT: docs/design/pomodoro-design.md

export type Phase = "work" | "shortBreak" | "longBreak";
export type Status = "idle" | "running" | "paused";

export interface Settings {
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface TimerState {
  phase: Phase;
  status: Status;
  /** running のときのみ非 null（終了予定の絶対時刻 / ADR 0003） */
  endAt: number | null;
  /** paused / idle のときの残り時間（ms） */
  remainingMs: number;
  completedPomodoros: number;
}

export const DEFAULT_SETTINGS: Settings = {
  workMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  notificationsEnabled: false,
};
