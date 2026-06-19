#!/usr/bin/env bash
# PostToolUse(Edit/Write) — docs/decisions/ への書き込み後に採録基準を想起させる reminder型。
# 「その決定が恒久・横断か」は機械判定できないので、止めず注意文を注入する（§5-3）。
set -uo pipefail

input="$(cat)"
command -v node >/dev/null 2>&1 || exit 0

path="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);const p=(j.tool_input&&(j.tool_input.file_path||j.tool_input.path))||"";process.stdout.write(p)}catch(e){}})')"

case "$path" in
  *"/docs/decisions/"*)
    msg="採録基準チェック（§3-3）: この決定は『消してもコード/スキーマ/設計書/Issueから同じ結論に再到達できる』なら載せない。決定は1文＋根拠リンクに切り詰め、rationale/進捗/file:line は書かない。決定ファイルを追加/更新したら 'npm run gen:decisions' で索引を再生成すること。"
    node -e 'const m=process.argv[1];process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:m}}))' "$msg"
    ;;
esac
exit 0
