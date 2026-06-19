# 意思決定インデックス（自動生成）

> このファイルは `scripts/gen-decisions-index.mjs` が生成します。**手編集しないでください。**
> 採録基準（§3-3）: 消してもコード/スキーマ/設計書/Issue から再到達できる事実は載せない。
> 決定は「1文＋根拠リンク」に切り詰め、rationale は各 ADR ファイルへ。

| id | タイトル | status | 決定（1文） | 根拠 |
|---|---|---|---|---|
| 0001 | 技術スタックは React + TypeScript + Vite | accepted | ポモドーロタイマーは React 18 + TypeScript + Vite で実装し、外部状態管理ライブラリは導入しない。 | [0001](decisions/0001-tech-stack.md) / [pomodoro-design.md](design/pomodoro-design.md) |
| 0002 | ハーネスはマルチリポ版を単一リポ向けに圧縮して転用する | accepted | AIエージェント・ハーネスを単一リポ構成に圧縮して採用する。「種類→唯一の置き場所」「指示ファイルの自己完結」「ガードの3型(block/reminder/品質)の選び分け」「記録は薄く」を保ち、マルチリポ固有要素は単一リポ向けに置換する。 | [0002](decisions/0002-single-repo-harness.md) / [workflow.md](dev-environment/workflow.md) / [hooks-guide.md](dev-environment/hooks-guide.md) |
| 0003 | タイマーはタイムスタンプ基準で残り時間を算出する | accepted | 残り時間は `endAt`（終了予定の絶対時刻）と現在時刻の差で**毎フレーム算出**する。`setInterval` で秒を1ずつ減算する方式は採らない。 | [0003](decisions/0003-timer-architecture.md) / [pomodoro-design.md](design/pomodoro-design.md) |
| 0004 | タスク管理は GitHub Issue 駆動 + PR フローにする | accepted | タスクの真実源を GitHub Issues に置き、1 Issue = 1 作業ブランチ = 1 PR（`Closes #n`）で進める。`docs/backlog.md` は廃止。 | [0004](decisions/0004-issue-driven.md) / [DEVELOPMENT.md](../DEVELOPMENT.md) / [workflow.md](dev-environment/workflow.md) |
| 0005 | 表示は白黒ミニマルなアナログ時計（SVG・数字非表示）にする | accepted | タイマー表示をデジタル mm:ss から、白黒・ローマ数字・細枠の**アナログ時計（SVG）**に刷新する。残りは1本の針で表し満了で一周（経過割合 = `useTimer.progress`）。視覚的な数字は出さず、残り時間は `role="timer"` の `aria-label` でのみ公開する。 | [0005](decisions/0005-analog-clock-ui.md) / [pomodoro-design.md](design/pomodoro-design.md) |

_生成元: 5 ファイル（docs/decisions/）_
