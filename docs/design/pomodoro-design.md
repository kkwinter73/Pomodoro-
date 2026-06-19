# 設計: ポモドーロタイマー

タイマーの意図・状態遷移・データ契約。実装の指針（SoT）。関連: [ADR 0003](../decisions/0003-timer-architecture.md)。

## ドメインモデル

### フェーズ (Phase)
- `work` … 集中（既定 25 分）
- `shortBreak` … 短い休憩（既定 5 分）
- `longBreak` … 長い休憩（既定 15 分）

### サイクル
`work` を完了するたびに完了ポモドーロ数 `completedPomodoros` を +1。
`completedPomodoros % longBreakInterval === 0`（既定 4）なら次は `longBreak`、それ以外は `shortBreak`。
休憩が終われば次は `work`。

## 状態機械

```
idle ──start──▶ running ──pause──▶ paused ──resume──▶ running
  ▲                │  ▲                                   │
  │                │  └──────────── (tickで残り0) ────────┘
  └──reset─────────┴──complete──▶ (次フェーズへ遷移し idle/running)
```

- **状態**: `idle | running | paused`
- **イベント**: `start | pause | resume | reset | skip | tick`
- `tick` で `remainingMs <= 0` を検知したら現フェーズを `complete` 扱いにして次フェーズへ。
  自動開始 (`autoStart*`) が ON なら次フェーズを `running`、OFF なら `idle`。

## 時間計算（ADR 0003 準拠）

- 真実源は `Date.now()`。`running` 中は `remainingMs = endAt - Date.now()`。
- `pause`: `remainingMs` を確定保存（`endAt` は捨てる）。
- `resume` / `start`: `endAt = Date.now() + remainingMs`。
- `setInterval` は ~250ms 周期の**表示更新トリガ**のみ。秒の減算には使わない。

## 状態の形（TypeScript 契約）

```ts
type Phase = 'work' | 'shortBreak' | 'longBreak';
type Status = 'idle' | 'running' | 'paused';

interface Settings {
  workMin: number;            // 既定 25
  shortBreakMin: number;      // 既定 5
  longBreakMin: number;       // 既定 15
  longBreakInterval: number;  // 既定 4
  autoStartBreaks: boolean;   // 既定 false
  autoStartWork: boolean;     // 既定 false
  soundEnabled: boolean;      // 既定 true
  notificationsEnabled: boolean; // 既定 false（許可は明示操作で取得）
}

interface TimerState {
  phase: Phase;
  status: Status;
  endAt: number | null;       // running のときのみ非null
  remainingMs: number;        // paused/idle のときの残り
  completedPomodoros: number;
}
```

## 永続化 (Persistence)

- `localStorage` に `settings` と `TimerState` を保存。
- リロード時、`status === 'running'` なら `endAt` から残りを再計算（過ぎていれば complete 処理を適用）。
- キーは `pomodoro.settings` / `pomodoro.state`（バージョン付与を検討: `pomodoro.v1.*`）。

## 通知・音

- 音: フェーズ完了時に短いチャイム。`soundEnabled` で制御。
- 通知: `Notification` API。`notificationsEnabled` かつ権限 `granted` のときのみ発火。権限要求はユーザー操作起点で行う。

## スコープ外（現時点でやらない）

- タスク管理 / ポモドーロ履歴の統計ダッシュボード（必要になれば ADR を起こす）。
- 複数デバイス同期・サーバ保存（ADR 0001 のとおりサーバ機能は未導入）。
