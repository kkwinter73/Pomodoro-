# workflow — 進め方・担当境界・戻し方

ハーネスの「層4: ワークフロー」を単一リポ向けに具体化したもの（§6）。

## 0. Issue を選ぶ（Issue 駆動 / ADR 0004・§6-2）

タスクの真実源は [GitHub Issues](https://github.com/kkwinter73/Pomodoro-/issues)。
本文の「Blocker」節が解消済みの Issue から1つ選ぶ（カスタムラベルは使わない）。
フェーズ構成は [DEVELOPMENT.md](../../DEVELOPMENT.md)。1 セッション = 1 Issue を基本にする。

## 1. 最初の1メッセージで宣言する（踏み込みすぎ防止 / §6-3）

セッション冒頭で「これから何をするか」を明確化する。
- 調査だけのときは **「実装はまだしない」と明示**（これがないと探索の途中で編集が始まる）。
- 設計余地の大きい変更は **計画モード**で計画 → 人が承認 → 実装。

## 2. ブランチ戦略（担当境界の代替 / §6-1）

単一リポなので「1セッション=1担当リポ」は適用しない。代わりに:
- **`main` へ直接コミットしない**（branch-guard hook が遮断）。
- 1 トピック = 1 作業ブランチ: `git switch -c feat/<topic>` / `fix/<topic>`。
- 1 セッションでは原則 1 トピックに集中する（文脈の混線を避ける / §6-2）。

## 3. 実装ループ

1. ブランチを切る
2. 実装（編集直後に軽量 lint が自動で走る = PostToolUse hook）
3. `npm run lint && npm run test && npm run typecheck` を通す
4. セッション終了時にフル lint が自動で走る（Stop hook）
5. PR を出して Issue と紐付ける（`Closes #n`）→ `main` へマージ
6. コミット/プッシュは原則ユーザーの指示後

## 4. 詰まったときの戻し方（§6-3）

最終手段ほど下。自動で全捨てはしない。
1. `git diff` で差分を確認
2. ファイル単位で戻す: `git restore <path>`
3. 退避: `git stash`（後で戻せる）
4. （最終手段）`git restore .` / ブランチ作り直し — **必ず確認を取ってから**

## 5. 終了プロトコル（変化の種類 → 反映先）

| 生じた変化 | 反映先 |
|---|---|
| 横断・恒久の判断 | `docs/decisions/NNNN-*.md` ＋ `npm run gen:decisions` |
| 設計の意図/契約のずれ | `docs/design/*.md` |
| リポ固有の規約 | `CLAUDE.md` / `.claude/rules/*.md` |
| 残タスク | [GitHub Issues](https://github.com/kkwinter73/Pomodoro-/issues)（ロードマップは DEVELOPMENT.md） |
| セッション限りのメモ | 個人メモリ（恒久知識は置かない） |
