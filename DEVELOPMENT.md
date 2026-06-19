# DEVELOPMENT — 開発計画

ポモドーロタイマーの開発ロードマップと進め方。タスクの**真実源は GitHub Issues**、
この文書は**フェーズ構成と進め方**を示す（個々の進捗は Issue を見る）。

- リポジトリ: https://github.com/kkwinter73/Pomodoro-
- Issue 一覧: https://github.com/kkwinter73/Pomodoro-/issues
- 設計 SoT: [docs/design/pomodoro-design.md](docs/design/pomodoro-design.md)
- 意思決定: [docs/decisions-index.md](docs/decisions-index.md)

---

## 進め方（Issue 駆動 / ADR 0004）

1. **Issue を1つ選ぶ。** 本文の「Blocker」が解消済みのものから着手（カスタムラベルは使わず Blocker 節で着手可否を表す / §6-2）。
2. **着手前に1メッセージで宣言。** 調査だけなら「実装しない」と明示。設計余地が大きければ計画モードで承認を取る。
3. **作業ブランチを切る。** `feat/<topic>`（例: `feat/use-timer`）。`main` 直コミットは branch-guard が遮断。
4. **実装 → ローカル検査。** `npm run lint && npm run test && npm run typecheck`。編集直後/終了時に lint hook が自動で走る。
5. **PR を出す。** タイトル/本文に `Closes #<n>` を入れて Issue と紐付け。`main` へマージ。
6. **終了プロトコル。** 決定が出たら `docs/decisions/` 追加→`npm run gen:decisions`、設計のずれは `docs/design/` 更新。

> 1 セッション = 1 Issue を基本に（文脈の混線を避ける / §6-2）。

---

## ロードマップ

### ✅ Phase 0 — 基盤（完了）
ハーネス（CLAUDE.md / docs / .claude hooks）＋ React+TS+Vite 雛形。lint/test/typecheck/dev/build 確認済み。

### Phase 1 — タイマーコア
| Issue | 内容 | Blocker |
|---|---|---|
| [#1](https://github.com/kkwinter73/Pomodoro-/issues/1) | `useTimer` フック（状態機械・タイムスタンプ基準）＋テスト | なし |

### Phase 2 — 表示 UI
| Issue | 内容 | Blocker |
|---|---|---|
| [#2](https://github.com/kkwinter73/Pomodoro-/issues/2) | タイマー表示UI（残り/フェーズ/開始・一時停止・リセット・スキップ） | #1 |

### Phase 3 — 設定 & 永続化
| Issue | 内容 | Blocker |
|---|---|---|
| [#3](https://github.com/kkwinter73/Pomodoro-/issues/3) | 設定UI（時間・自動開始・音/通知トグル） | #1 |
| [#4](https://github.com/kkwinter73/Pomodoro-/issues/4) | localStorage 永続化とリロード復元 | #1 |

### Phase 4 — フィードバック
| Issue | 内容 | Blocker |
|---|---|---|
| [#5](https://github.com/kkwinter73/Pomodoro-/issues/5) | フェーズ完了時のサウンド | #2, #3 |
| [#6](https://github.com/kkwinter73/Pomodoro-/issues/6) | デスクトップ通知（Notification API） | #2, #3 |

### Someday（未 Issue 化・要 ADR）
- ポモドーロ履歴 / 統計ダッシュボード
- PWA 化・通知の常駐

---

## 現在地
**次の着手**: [#1 useTimer](https://github.com/kkwinter73/Pomodoro-/issues/1)（Blocker なし）。
ブランチ例: `git switch -c feat/use-timer`。
