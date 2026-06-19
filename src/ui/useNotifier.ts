import { useCallback, useState } from "react";

// デスクトップ通知（Notification API）。権限要求はユーザー操作起点で呼ぶこと。
// notify は enabled かつ permission === "granted" のときだけ発火する。

export type PermissionState = NotificationPermission | "unsupported";

function currentPermission(): PermissionState {
  if (typeof window === "undefined" || typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export interface Notifier {
  permission: PermissionState;
  /** ユーザー操作起点で呼ぶ。許可ダイアログを出し、結果の権限を返す。 */
  requestPermission: () => Promise<PermissionState>;
  notify: (title: string, options?: NotificationOptions) => void;
}

export function useNotifier(enabled: boolean): Notifier {
  const [permission, setPermission] = useState<PermissionState>(() => currentPermission());

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return "unsupported";
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      const p = currentPermission();
      setPermission(p);
      return p;
    }
  }, []);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!enabled) return;
      if (typeof Notification === "undefined") return;
      if (Notification.permission !== "granted") return;
      try {
        new Notification(title, options);
      } catch {
        // 失敗はタイマー機能を止めないため無視
      }
    },
    [enabled],
  );

  return { permission, requestPermission, notify };
}
