// 設定フォームのフィールド定義と入力サニタイズ（純粋・テスト可能）。
import type { Settings } from "../timer";

export interface MinuteField {
  key: "workMin" | "shortBreakMin" | "longBreakMin" | "longBreakInterval";
  label: string;
  min: number;
  max: number;
}

export interface ToggleField {
  key: "autoStartBreaks" | "autoStartWork" | "soundEnabled" | "notificationsEnabled";
  label: string;
}

export const MINUTE_FIELDS: readonly MinuteField[] = [
  { key: "workMin", label: "作業 (分)", min: 1, max: 180 },
  { key: "shortBreakMin", label: "小休憩 (分)", min: 1, max: 60 },
  { key: "longBreakMin", label: "長休憩 (分)", min: 1, max: 60 },
  { key: "longBreakInterval", label: "長休憩までの回数", min: 1, max: 12 },
];

export const TOGGLE_FIELDS: readonly ToggleField[] = [
  { key: "autoStartBreaks", label: "休憩を自動開始" },
  { key: "autoStartWork", label: "作業を自動開始" },
  { key: "soundEnabled", label: "音を鳴らす" },
  { key: "notificationsEnabled", label: "デスクトップ通知" },
];

/** 数値設定を「正の整数・指定範囲内」に丸める。不正値は min にフォールバック。 */
export function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

// 型レベルの保証: フィールドのキーは Settings のキーであること
type _AssertMinuteKeys = MinuteField["key"] extends keyof Settings ? true : never;
type _AssertToggleKeys = ToggleField["key"] extends keyof Settings ? true : never;
const _check: [_AssertMinuteKeys, _AssertToggleKeys] = [true, true];
void _check;
