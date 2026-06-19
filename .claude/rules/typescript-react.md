# TypeScript / React 規約

`*.ts` / `*.tsx` を触る前に参照（§4-3）。自己完結。

## TypeScript
- `strict` 前提。`any` を避け、ドメイン型は `docs/design/pomodoro-design.md` の契約に合わせる。
- union/enum の分岐は網羅。`default` で `never` チェックを入れて漏れを静的に検出。
- 副作用のない純粋関数（時間計算など）はコンポーネント外に出してテスト可能にする。

## React
- 関数コンポーネント + フック。クラスは使わない。
- 状態は最小限・単方向。タイマーロジックは `useTimer` 等のカスタムフックに集約し、UI から分離する。
- `useEffect` の依存配列を正確に（lint の exhaustive-deps を無効化しない）。
- タイマーは `setInterval` を表示更新トリガにのみ使い、時間計算は `Date.now()` 基準（ADR 0003）。クリーンアップで必ず `clearInterval`。

## テスト
- ロジック（フック・純粋関数）を優先的にテスト。pause→resume の残り時間、フェーズ遷移、long break 周期は必須ケース。
- UI は Testing Library でユーザー視点（ロール・テキスト）で検証。

## スタイル
- Prettier に整形を委ねる（手で整形しない）。ESLint の警告は残さない。
