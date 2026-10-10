#!/usr/bin/env node
/**
 * check-catalog-coverage — 공개 export 컴포넌트의 카탈로그(story) 등재 검증.
 *
 * ## 왜 스크립트인가
 * story 가 없으면 docstring lint·시각 스냅샷·Chromatic·MCP 에서 동시에 빠진다.
 * 스크립트 없이는 "export 했지만 story 없는" 컴포넌트가 조용히 쌓인다.
 *
 * ## 등재 판정
 *   1. `docs/components.json` 에 이름이 있거나
 *   2. `stories/` 하위에 `<Name>.stories.tsx` 파일이 있으면 등재로 판정.
 * 타입 전용 export(`export type`)와 상수(대문자 스네이크)는 대상 아님.
 *
 * ## 제외 대상
 * - Provider/Context (`DenyxAiProvider`, `useDenyxAi`) — 훅/컨텍스트는 story 불필요.
 * - 아이콘 (`Ic*`, `*Icon`) — 번들로 등재 가능.
 * - `export * from` re-export — 개별 항목에서 검사.
 *
 * ## Baseline ratchet
 * `catalog-coverage-baseline.json` 에 기존 미등재 동결. 신규만 차단. `--update` 로 줄임.
 *
 * Usage:
 *   node scripts/check-catalog-coverage.mjs            # 검사
 *   node scripts/check-catalog-coverage.mjs --update   # baseline 갱신
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = join(ROOT, "catalog-coverage-baseline.json");
const STORIES_DIR = join(ROOT, "stories");
const update = process.argv.includes("--update");

// 최신 components.json 생성
execFileSync(process.execPath, [join(ROOT, "scripts/build-components-json.mjs")], {
  stdio: "pipe",
});
const componentsJsonPath = join(ROOT, "docs", "components.json");
const { components } = JSON.parse(readFileSync(componentsJsonPath, "utf8"));

/* ── 공개 export 수집 (값 export 만) ───────────────────── */

const exported = new Map(); // name → barrel
for (const b of ["src/index.ts", "src/widget/index.ts"]) {
  const p = join(ROOT, b);
  if (!existsSync(p)) continue;
  const src = readFileSync(p, "utf8");
  for (const line of src.split("\n")) {
    // `export * from` re-export 무시 — 개별 항목에서 검사
    if (/export\s*\*\s*from/.test(line)) continue;
    // @deprecated 무시
    if (/@deprecated/.test(line)) continue;

    for (const m of line.matchAll(/export\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
      const isTypeBlock = /export\s+type\s*\{/.test(m[0]);
      for (const raw of m[1].split(",")) {
        if (isTypeBlock || /\btype\b/.test(raw)) continue;
        const nm = raw.trim().split(/\s+as\s+/).pop()?.trim();
        if (!nm) continue;
        // PascalCase 컴포넌트만 (소문자 시작 = 훅/함수, UPPER_SNAKE = 상수)
        if (!/^[A-Z]/.test(nm)) continue;
        if (/^[A-Z0-9_]+$/.test(nm)) continue;
        if (!exported.has(nm)) exported.set(nm, b);
      }
    }
  }
}

/* ── 제외 목록 ─────────────────────────────────────────── */

const EXCLUDE = new Set([
  // Provider/Context — story 불필요
  "DenyxAiProvider",
]);
// 아이콘 패턴 제외
for (const [name] of exported) {
  if (/^Ic[A-Z]/.test(name) || name.endsWith("Icon")) {
    EXCLUDE.add(name);
  }
}

/* ── story 파일 수집 ───────────────────────────────────── */

function collectStories(dir, out = new Set()) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      collectStories(p, out);
    } else if (name.endsWith(".stories.tsx") || name.endsWith(".stories.ts")) {
      const componentName = basename(name).replace(/\.stories\.tsx?$/, "");
      out.add(componentName);
    }
  }
  return out;
}

const storyNames = collectStories(STORIES_DIR);
const catalogNames = new Set(components.map((c) => c.name));

/* ── 등재 판정 ─────────────────────────────────────────── */

const violations = [...exported]
  .filter(([name]) => !EXCLUDE.has(name))
  .filter(([name]) => !catalogNames.has(name) && !storyNames.has(name))
  .map(([name, barrel]) => ({ name, barrel }));

const current = violations.map((v) => v.name).sort();

/* ── --update ──────────────────────────────────────────── */

if (update) {
  writeFileSync(BASELINE, JSON.stringify({ frozen: current }, null, 2) + "\n");
  console.log(`✓ catalog-coverage baseline 갱신 — ${current.length}건 동결 (신규만 차단)`);
  process.exit(0);
}

/* ── 비교 ──────────────────────────────────────────────── */

const frozen = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, "utf8")).frozen
  : [];
const frozenSet = new Set(frozen);
const fresh = violations.filter((v) => !frozenSet.has(v.name));
const fixed = frozen.filter((n) => !current.includes(n));

console.log(`\n📚 catalog-coverage — 공개 export 의 카탈로그 등재`);
console.log("════════════════════════════════════════════════════════");
console.log(
  `  공개 컴포넌트 export ${exported.size - EXCLUDE.size}개 · story ${storyNames.size}개 · 미등재 ${violations.length}건 (동결 ${frozen.length})`,
);

if (fresh.length) {
  console.error(`\n✗ 카탈로그에 없는 공개 export ${fresh.length}건 (신규):\n`);
  for (const v of fresh) console.error(`  ${v.name}  ← ${v.barrel}`);
  console.error(
    `\nstory 를 추가하세요. story 가 없으면 docstring lint·시각 스냅샷·Chromatic·MCP 에서 동시에 빠집니다.`,
  );
  process.exit(1);
}

if (fixed.length) {
  console.error(
    `\n✗ 동결 목록이 낡았습니다 — ${fixed.length}건이 해소됐습니다: ${fixed.join(", ")}`,
  );
  console.error(
    `  \`node scripts/check-catalog-coverage.mjs --update\` 로 동결선을 줄이세요.`,
  );
  process.exit(1);
}

console.log("════════════════════════════════════════════════════════");
console.log("PASS — 신규 미등재 0건");
