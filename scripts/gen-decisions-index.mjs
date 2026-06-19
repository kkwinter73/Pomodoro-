#!/usr/bin/env node
// docs/decisions/*.md を束ねて docs/decisions-index.md を自動生成する（§3-3）。
// 索引は手編集しない。各決定ファイルは frontmatter（id/title/status/date/links）＋「## 決定」の1文を持つ。
// 1決定=1ファイルにすることで、同時追加でもマージ衝突しない。
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const decisionsDir = join(root, "docs", "decisions");
const outFile = join(root, "docs", "decisions-index.md");

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

// 「## 決定」直下の最初の非空行を1文として取り出す
function parseDecisionLine(text) {
  const m = text.match(/##\s*決定\s*\n+([^\n]+)/);
  return m ? m[1].trim() : "";
}

function parseLinks(text) {
  // frontmatter 内の `links:` 配下の `- xxx` 行だけを拾う（閉じ `---` を誤って拾わない）
  const block = text.match(/links:\s*\n((?:\s*-\s+.+\n?)+)/);
  if (!block) return [];
  return [...block[1].matchAll(/-\s+(.+)/g)].map((x) => x[1].trim());
}

const files = (await readdir(decisionsDir))
  .filter((f) => /^\d+.*\.md$/.test(f))
  .sort();

const rows = [];
for (const f of files) {
  const text = await readFile(join(decisionsDir, f), "utf8");
  const fm = parseFrontmatter(text);
  const decision = parseDecisionLine(text);
  const links = parseLinks(text);
  const id = fm.id || f.match(/^\d+/)?.[0] || "";
  const title = fm.title || f;
  const status = fm.status || "";
  // 索引は docs/ にあるので、root相対の links を docs相対に変換する
  //   docs/ 配下 → 先頭 docs/ を剥がす / それ以外（リポ直下）→ ../ を付ける
  const toDocsRel = (l) => (l.startsWith("docs/") ? l.replace(/^docs\//, "") : `../${l}`);
  const linkCell = [
    `[${id}](decisions/${f})`,
    ...links.map((l) => `[${l.split("/").pop()}](${toDocsRel(l)})`),
  ].join(" / ");
  rows.push(
    `| ${id} | ${title} | ${status} | ${decision || "—"} | ${linkCell} |`,
  );
}

const md = `# 意思決定インデックス（自動生成）

> このファイルは \`scripts/gen-decisions-index.mjs\` が生成します。**手編集しないでください。**
> 採録基準（§3-3）: 消してもコード/スキーマ/設計書/Issue から再到達できる事実は載せない。
> 決定は「1文＋根拠リンク」に切り詰め、rationale は各 ADR ファイルへ。

| id | タイトル | status | 決定（1文） | 根拠 |
|---|---|---|---|---|
${rows.join("\n")}

_生成元: ${files.length} ファイル（docs/decisions/）_
`;

await writeFile(outFile, md);
console.log(`generated ${outFile} from ${files.length} decision(s)`);
