#!/usr/bin/env bash
# 品質ゲート（§5-4・§5-6）。
#   post  : 編集直後。変更した *.ts/*.tsx だけを軽量 lint。
#   stop  : ターン終了。フル lint。ただし再試行中(stop_hook_active)はブロックせず通知のみ（無限ループ防止）。
# 環境差（未 npm install 等）では無音で通す（§5-5）。
set -uo pipefail

mode="${1:-post}"
input="$(cat || true)"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" 2>/dev/null || exit 0

# ツール未導入 → 無音で素通り
[ -x "node_modules/.bin/eslint" ] || exit 0

read_json_field() {
  # $1 = JS式（jオブジェクトから取り出す）
  command -v node >/dev/null 2>&1 || { printf ''; return; }
  printf '%s' "$input" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);process.stdout.write(String($1))}catch(e){process.stdout.write('')}})"
}

if [ "$mode" = "post" ]; then
  fp="$(read_json_field '(j.tool_input&&(j.tool_input.file_path||j.tool_input.path))||""')"
  case "$fp" in
    *.ts|*.tsx)
      if ! out="$(node_modules/.bin/eslint --quiet "$fp" 2>&1)"; then
        printf 'ESLint（重大なエラーのみ）:\n%s\n' "$out" 1>&2
        exit 2   # PostToolUse: stderr を Claude にフィードバックし、いま直させる
      fi
      ;;
  esac
  exit 0
fi

# mode = stop
active="$(read_json_field '!!j.stop_hook_active')"
if ! out="$(npm run -s lint 2>&1)"; then
  if [ "$active" = "true" ]; then
    # 既に1回直しを促した後 → ブロックせず通知のみ（無限ループ防止 §5-4）
    printf 'lint 未解決のまま終了します（再試行済みのためブロック解除）:\n%s\n' "$out" 1>&2
    exit 0
  fi
  printf 'コミット前に lint を通してください:\n%s\n' "$out" 1>&2
  exit 2   # Stop: 停止をブロックして直させる
fi
exit 0
