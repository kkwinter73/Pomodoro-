# docs — タスク別エントリポイント

「やりたいこと → 最初に読むファイル」の起点。迷ったらここ（§3-2）。

## タスク別エントリポイント

| やりたいこと | 最初に読むファイル |
|---|---|
| タイマーの仕様・状態遷移を知る | [design/pomodoro-design.md](design/pomodoro-design.md) |
| なぜこの技術スタックか | [decisions/0001-tech-stack.md](decisions/0001-tech-stack.md) |
| なぜタイマーがタイムスタンプ基準か | [decisions/0003-timer-architecture.md](decisions/0003-timer-architecture.md) |
| 設計判断の一覧を俯瞰する | [decisions-index.md](decisions-index.md)（自動生成） |
| 進め方・担当境界・戻し方 | [dev-environment/workflow.md](dev-environment/workflow.md) |
| 設定の責任分界・秘密情報の扱い | [dev-environment/security.md](dev-environment/security.md) |
| ガード(hook)が何を・なぜするか | [dev-environment/hooks-guide.md](dev-environment/hooks-guide.md) |
| TS/React のコーディング規約 | [../.claude/rules/typescript-react.md](../.claude/rules/typescript-react.md) |
| 残タスク・次の作業 | [GitHub Issues](https://github.com/kkwinter73/Pomodoro-/issues) / ロードマップは [../DEVELOPMENT.md](../DEVELOPMENT.md) |

## 知識の住所（種類 → 唯一の置き場所 / §3-1）

| 知識の種類 | 置き場所 | 判定 |
|---|---|---|
| 恒久・横断の決定（"あえてこうする/やらない"） | `docs/decisions/NNNN-*.md` | コードを見ても"なぜ"が出てこない判断 |
| 設計の意図・契約（状態遷移・データ形） | `docs/design/*.md` | 実装の指針になる仕様 |
| 設計判断の根拠・調査 | `docs/investigation/*.md` | 後から経緯を追う用 |
| リポ固有の規約 | `CLAUDE.md` / `.claude/rules/*.md` | このリポでの作法 |
| 進行中タスク・次の作業 | GitHub Issues（ロードマップは `DEVELOPMENT.md`） | 進捗は動くのでログに書かない |
| このセッション限りのメモ | 個人メモリ | コミットしない・恒久知識は置かない |

**判定の3問**: ①他人/将来の自分が参照しうる? ②経緯を追う必要がある? ③コードを見れば分かる?
→ ③が No（コードに痕跡が残らない）なら `decisions/` か `design/`。③が Yes ならドキュメントに書かない。
