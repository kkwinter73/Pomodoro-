# CLAUDE.md — Pomodoro Timer

> このファイルはセッション開始時に必ず読み込まれる「常時文脈」です（指示ファイル）。
> ここは**自己完結**させ、最重要の禁止事項は本文にインラインで置きます（リンクだけにしない / §4-2）。

---

## ⛔ 最重要ルール（インライン必須・毎回これだけは守る）

1. **保護ブランチ（`main`）へ直接コミットしない。** 必ず作業ブランチを切る: `git switch -c feat/<topic>`。
   （branch-guard hook が物理的に止めます。コミット/プッシュは原則ユーザーの指示があってから）
2. **恒久知識を個人メモリ（`~/.claude/.../memory/`）に逃がさない。** チームが参照しうる知識は
   このリポの `docs/` に書く（横断的決定→`docs/decisions/`、設計→`docs/design/`）。個人メモリはこのセッション限りのメモだけ。
3. **意思決定ログは薄く保つ。** `docs/decisions/` には「決定の1文＋根拠リンク」だけ。
   コード・スキーマ・設計書・Issue を見れば再到達できる事実は載せない（§3-3）。
4. **着手前に「これから何をするか」を1メッセージで宣言する。** 調査だけのときは「実装はまだしない」と明示。
   設計余地の大きい変更は計画モードで計画→承認→実装。

@.claude/rules/core.md

---

## 技術スタック

- **React 18 + TypeScript + Vite**（[ADR 0001](docs/decisions/0001-tech-stack.md)）
- 状態: 軽量なカスタムフック + Context（外部状態管理ライブラリは現時点で導入しない）
- テスト: Vitest + Testing Library / Lint: ESLint(flat) / 整形: Prettier
- タイマーは**タイムスタンプ基準で残り時間を算出**する（`setInterval`で減算しない / [ADR 0003](docs/decisions/0003-timer-architecture.md)）

詳しいコーディング規約は [.claude/rules/typescript-react.md](.claude/rules/typescript-react.md)（`*.ts`/`*.tsx` を触る前に参照）。

---

## セッション開始プロトコル

シナリオを判定し、読むものを最小限に絞る（全部読まない）。

### A. このプロジェクトに初めて触れる
1. この CLAUDE.md（=今ここ）と [README.md](README.md) で全体像
2. [docs/dev-environment/](docs/dev-environment/) を **workflow → security → hooks-guide** の順で
   （workflow を飛ばして実装に入ると、担当境界や戻し方を知らずに事故る）
3. やりたいことに応じて [docs/README.md](docs/README.md) のタスク別表から目的のファイルへ

### B. 設計に関わる変更
- まず [docs/decisions-index.md](docs/decisions-index.md) で過去の判断を確認
  → 該当する [docs/design/](docs/design/) を精読 → 必要なら [docs/investigation/](docs/investigation/)

### C. 実装する
- [docs/README.md](docs/README.md) のタスク別表 →「タスク種別→参照すべきドキュメント」に従い必要な設計書だけ開く
- 作業ブランチを切る → 実装 → lint/test → 終了プロトコル

---

## タスク種別 → 参照すべきドキュメント

| 作業 | 最初に読む |
|---|---|
| タイマーのロジック/状態遷移を変える | [docs/design/pomodoro-design.md](docs/design/pomodoro-design.md) → [ADR 0003](docs/decisions/0003-timer-architecture.md) |
| UI コンポーネントを足す/直す | [.claude/rules/typescript-react.md](.claude/rules/typescript-react.md) |
| 設定/永続化を変える | [docs/design/pomodoro-design.md](docs/design/pomodoro-design.md)（Settings / Persistence 節） |
| 設計判断の"なぜ"を遡る | [docs/decisions-index.md](docs/decisions-index.md) → 該当 ADR |
| 進め方・安全規約を知る | [docs/dev-environment/workflow.md](docs/dev-environment/workflow.md) / [security.md](docs/dev-environment/security.md) |
| ガード(hook)の挙動を知る | [docs/dev-environment/hooks-guide.md](docs/dev-environment/hooks-guide.md) |

---

## ワークフロー（Issue 駆動 / 要約・詳細は workflow.md・DEVELOPMENT.md）

1. **Issue を1つ選ぶ**（Blocker 解消済みから / [一覧](https://github.com/kkwinter73/Pomodoro-/issues)）。やることを1メッセージで宣言（調査だけなら「実装しない」と明示）
2. 作業ブランチ `feat/<topic>` を切る（`main` 直コミットは禁止＝hookで遮断）
3. 実装（編集直後に軽量lintが自動で走る / PostToolUse）
4. `npm run lint && npm run test && npm run typecheck` を通す（終了時にもフルlintが自動で走る / Stop）
5. **PR を出して Issue と紐付ける**（`Closes #n`）。新しい決定が出たら `docs/decisions/` に1ファイル追加 → `npm run gen:decisions` で索引再生成
6. 終了プロトコル（変化の種類→反映先）に従って締める

## 終了プロトコル（変化の種類 → 反映先）

| 生じた変化 | 反映先 |
|---|---|
| 横断的・恒久の判断（"あえてこうする/やらない"） | `docs/decisions/NNNN-*.md` ＋索引再生成 |
| 設計の意図/契約のずれ | `docs/design/*.md` を更新 |
| リポ固有の規約変更 | この CLAUDE.md / `.claude/rules/*.md` |
| 残タスク・次の作業 | GitHub Issues（[一覧](https://github.com/kkwinter73/Pomodoro-/issues)）。ロードマップは [DEVELOPMENT.md](DEVELOPMENT.md) |
| このセッション限りのメモ | 個人メモリ（恒久知識は置かない / 上の最重要ルール2） |
