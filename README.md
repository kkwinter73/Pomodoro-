# Pomodoro Timer

集中と休憩のサイクル（ポモドーロ・テクニック）を支援するタイマーアプリ。

- **技術スタック**: React + TypeScript + Vite（決定の経緯: [docs/decisions/0001-tech-stack.md](docs/decisions/0001-tech-stack.md)）
- **設計**: [docs/design/pomodoro-design.md](docs/design/pomodoro-design.md)

## セットアップ

```bash
npm install
npm run dev        # 開発サーバ
npm run build      # 本番ビルド
npm run lint       # ESLint（フル）
npm run test       # Vitest
npm run typecheck  # 型チェック
```

## このリポジトリの歩き方

開発を始める前に **[docs/README.md](docs/README.md)（タスク別エントリポイント表）** を見てください。
AIエージェント（Claude Code 等）で作業する場合は、まず **[CLAUDE.md](CLAUDE.md)** がセッション開始時に自動で読まれます。

ハーネス（AIエージェントを安全・一貫して回す仕組み）の設計意図は
[docs/dev-environment/](docs/dev-environment/) にまとまっています。
