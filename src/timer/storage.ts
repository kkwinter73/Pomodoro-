// localStorage への永続化。破損・未対応環境に耐性を持たせ、無効データは null を返す。
// キーはバージョン付き（将来のスキーマ変更で衝突しないように / docs/design/pomodoro-design.md）。
import { DEFAULT_SETTINGS } from "./types";
import type { Phase, Settings, Status, TimerState } from "./types";

export const STORAGE_KEYS = {
  state: "pomodoro.v1.state",
  settings: "pomodoro.v1.settings",
} as const;

const PHASES: readonly Phase[] = ["work", "shortBreak", "longBreak"];
const STATUSES: readonly Status[] = ["idle", "running", "paused"];

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    // プライバシーモード等で localStorage アクセスが例外になる環境に耐性
    return null;
  }
}

function readJson(key: string): unknown {
  const s = getStorage();
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  const s = getStorage();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(value));
  } catch {
    // 容量超過等は黙って無視（永続化失敗で機能を止めない）
  }
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === "boolean";

function validateState(v: unknown): TimerState | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  if (!PHASES.includes(o.phase as Phase)) return null;
  if (!STATUSES.includes(o.status as Status)) return null;
  if (!(o.endAt === null || isNum(o.endAt))) return null;
  if (!isNum(o.remainingMs)) return null;
  if (!isNum(o.completedPomodoros)) return null;
  return {
    phase: o.phase as Phase,
    status: o.status as Status,
    endAt: o.endAt as number | null,
    remainingMs: o.remainingMs,
    completedPomodoros: o.completedPomodoros,
  };
}

function validateSettings(v: unknown): Settings | null {
  if (typeof v !== "object" || v === null) return null;
  // 欠けたキーは既定で補完し（将来のキー追加に耐性）、型が違えば無効扱い
  const merged = { ...DEFAULT_SETTINGS, ...(v as Record<string, unknown>) };
  const numKeys = ["workMin", "shortBreakMin", "longBreakMin", "longBreakInterval"] as const;
  const boolKeys = ["autoStartBreaks", "autoStartWork", "soundEnabled", "notificationsEnabled"] as const;
  for (const k of numKeys) if (!isNum(merged[k])) return null;
  for (const k of boolKeys) if (!isBool(merged[k])) return null;
  return {
    workMin: merged.workMin,
    shortBreakMin: merged.shortBreakMin,
    longBreakMin: merged.longBreakMin,
    longBreakInterval: merged.longBreakInterval,
    autoStartBreaks: merged.autoStartBreaks,
    autoStartWork: merged.autoStartWork,
    soundEnabled: merged.soundEnabled,
    notificationsEnabled: merged.notificationsEnabled,
  };
}

export function loadState(): TimerState | null {
  return validateState(readJson(STORAGE_KEYS.state));
}

export function saveState(state: TimerState): void {
  writeJson(STORAGE_KEYS.state, state);
}

export function loadSettings(): Settings | null {
  return validateSettings(readJson(STORAGE_KEYS.settings));
}

export function saveSettings(settings: Settings): void {
  writeJson(STORAGE_KEYS.settings, settings);
}

export function clearPersisted(): void {
  const s = getStorage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEYS.state);
    s.removeItem(STORAGE_KEYS.settings);
  } catch {
    // 無視
  }
}
