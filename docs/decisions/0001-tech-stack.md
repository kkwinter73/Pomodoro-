---
id: 0001
title: 技術スタックは React + TypeScript + Vite
status: accepted
date: 2026-06-19
links:
  - docs/design/pomodoro-design.md
---

## 決定
ポモドーロタイマーは React 18 + TypeScript + Vite で実装し、外部状態管理ライブラリは導入しない。

## 背景 / 根拠
- ブラウザで動く軽量SPAで十分。サーバ機能・SSR・ルーティングの要件は現時点でない。
- React + Vite はエコシステムが厚く、ESLint(flat)/Prettier/Vitest/Testing Library を素直に組める＝ハーネスの品質ゲートを載せやすい。
- 状態は単一画面・少数のタイマー状態に閉じるため、Context + カスタムフックで足りる。Redux/Zustand 等は YAGNI として入れない（必要になってから ADR を起こす）。

## 採用しなかった選択肢（"あえてやらない"の記録）
- **Vanilla TS/JS**: コンポーネント分割・テストの足場を自前で用意するコストが、得られる軽さに見合わない。
- **Next.js**: SSR/ルーティングは不要。ビルド・デプロイが重くなる。サーバ機能が必要になった時点で再検討。
- **Electron / Tauri**: デスクトップ常駐の要件が出てから。まず Web で価値検証する。
