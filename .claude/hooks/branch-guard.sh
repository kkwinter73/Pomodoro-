#!/usr/bin/env bash
# PreToolUse(Bash) — 保護ブランチ(main/master)への直接 git commit を拒否する。
# block型: 「現在ブランチ」+「コマンドにgit commitが含まれるか」という構造化判定のみ。
# 善意のうっかり向けなので素朴検出で十分（§5-2）。環境差では無音で通す（§5-5）。
set -uo pipefail

input="$(cat)"

# node が無ければ判定不能 → 無音で通す
command -v node >/dev/null 2>&1 || exit 0

cmd="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.tool_input&&j.tool_input.command)||"")}catch(e){}})')"

# git commit を含まないコマンドは対象外
case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

# symbolic-ref は未コミットの unborn branch でも現在ブランチ名を返す
branch="$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
case "$branch" in
  main|master)
    reason="保護ブランチ '$branch' への直接コミットは禁止です（workflow / branch-guard）。先に作業ブランチを切ってください: git switch -c feat/<topic>"
    node -e 'const r=process.argv[1];process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:r}}))' "$reason"
    exit 0
    ;;
esac
exit 0
