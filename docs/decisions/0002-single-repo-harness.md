---
id: 0002
title: ハーネスはマルチリポ版を単一リポ向けに圧縮して転用する
status: accepted
date: 2026-06-19
links:
  - docs/dev-environment/workflow.md
  - docs/dev-environment/hooks-guide.md
---

## 決定
AIエージェント・ハーネスを単一リポ構成に圧縮して採用する。「種類→唯一の置き場所」「指示ファイルの自己完結」「ガードの3型(block/reminder/品質)の選び分け」「記録は薄く」を保ち、マルチリポ固有要素は単一リポ向けに置換する。

## 保持する原則
- 知識の住所表（`docs/README.md`）と読む順番（`CLAUDE.md` の開始プロトコル）。
- `CLAUDE.md` を自己完結化し、最重要1行は本文インライン（リンクだけにしない）。
- ガードは判定可能性と安全方向で選び分ける（block=確実判定/reminder=判定不能/品質=多段＋空回り防止）。
- 意思決定ログは「決定1文＋根拠リンク」＋自動生成索引。

## 置き換えた/落とした要素（"あえてやらない"の記録）
- **1セッション=1担当リポ / 越境allowlist**: 単一リポなので不要。担当境界の代わりに「main直コミット禁止＋作業ブランチ」で代替（branch-guard）。
- **テンプレSoT＋手動コピー**: 配布先リポが1つなので、共通部品の原本＝そのまま `.claude/` 実体。
- **横断SoTリポ(docs-hub)**: `docs/` 一式をこのリポ内に内包。
- **Issueトラッカー必須**: ソロ/小規模のため `docs/backlog.md` で代替（リモート運用に移ったら Issues へ）。
  → **[ADR 0004] により GitHub Issues へ移行済み（`docs/backlog.md` は廃止）。**
