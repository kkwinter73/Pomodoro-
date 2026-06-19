import type { Settings } from "../timer";
import { MINUTE_FIELDS, TOGGLE_FIELDS, clampInt } from "./settingsFields";
import styles from "./SettingsPanel.module.css";

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
  /** 通知トグルを無効化する（権限拒否・非対応時） */
  notificationDisabled?: boolean;
  /** 通知トグルに添える案内文 */
  notificationNote?: string;
}

export function SettingsPanel({
  settings,
  onChange,
  notificationDisabled = false,
  notificationNote,
}: Props) {
  const setField = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <section className={styles.panel} aria-label="設定">
      <h2 className={styles.heading}>設定</h2>

      <div className={styles.grid}>
        {MINUTE_FIELDS.map((f) => (
          <label key={f.key} className={styles.field}>
            <span>{f.label}</span>
            <input
              type="number"
              min={f.min}
              max={f.max}
              value={settings[f.key]}
              onChange={(e) => setField(f.key, clampInt(Number(e.target.value), f.min, f.max))}
            />
          </label>
        ))}
      </div>

      <div className={styles.toggles}>
        {TOGGLE_FIELDS.map((f) => {
          const isNotification = f.key === "notificationsEnabled";
          const disabled = isNotification && notificationDisabled;
          return (
            <div key={f.key} className={styles.toggleRow}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings[f.key]}
                  disabled={disabled}
                  onChange={(e) => setField(f.key, e.target.checked)}
                />
                <span>{f.label}</span>
              </label>
              {isNotification && notificationNote ? (
                <small className={styles.note}>{notificationNote}</small>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
