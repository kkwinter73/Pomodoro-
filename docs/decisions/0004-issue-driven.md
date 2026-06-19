---
id: 0004
title: タスク管理は GitHub Issue 駆動 + PR フローにする
status: accepted
date: 2026-06-19
links:
  - DEVELOPMENT.md
  - docs/dev-environment/workflow.md
---

## 決定
タスクの真実源を GitHub Issues に置き、1 Issue = 1 作業ブランチ = 1 PR（`Closes #n`）で進める。`docs/backlog.md` は廃止。

## 背景 / 根拠
- リモート（GitHub）運用に移行したため、ADR 0002 で暫定だった `docs/backlog.md` を本来の Issue トラッカーへ置換（0002 の当該部分を更新）。
- ロードマップ/フェーズ構成は `DEVELOPMENT.md`、個々の進捗は Issue、と役割を分ける（進捗をドキュメントに書かない / §3-3）。
- カスタムラベルは増やさず、本文の「Blocker」節で着手可否を表現する（§6-2）。
