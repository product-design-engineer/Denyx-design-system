#!/usr/bin/env node
/**
 * check-docstrings — docstring 4섹션 표준 게이트.
 *
 * ## 무엇을 요구하나
 *   1. 소스 docstring 4섹션 — Purpose / When to use / When NOT to use / Composition rules
 *   2. @example (TSX 사용 예시)
 *   3. Do/Don't 유도 가능 — whenNotToUse 또는 compositionRules 의 금지형 문장이
 *      하나도 없으면 «하지 말 것»이 비게 되므로 실패.
 *
 * ## 판정 방법
 * `docs/components.json` (build-components-json.mjs 산출물) 을 읽어 검사.
 * 파싱을 두 번 구현하면 게이트와 배달물이 서로 다른 것을 보게 된다.
 *
 * ## Baseline ratchet (비파괴)
 * 기존 위반은 `docstring-baseline.json` 에 동결. 신규 유입만 실패.
 * 위반을 줄였으면 `--update` 로 baseline 을 줄여 ratchet.
 *
 * Usage:
 *   node scripts/check-docstrings.mjs            # 검사 (baseline 초과 시 exit 1)
 *   node scripts/check-docstrings.mjs --update   # baseline 재생성
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(ROOT, "docs", "components.json");
const BASELINE = join(ROOT, "docstring-baseline.json");
const update = process.argv.includes("--update");

// 항상 최신 산출물로 검사 — 낡은 json 을 보고 통과하면 게이트가 거짓말을 한다.
execFileSync(process.execPath, [join(ROOT, "scripts/build-components-json.mjs")], {
  stdio: "pipe",
});

if (!existsSync(JSON_PATH)) {
  console.error("✗ docs/components.json 이 없습니다. `node scripts/build-components-json.mjs` 먼저 실행하세요.");
  process.exit(1);
}

const { components } = JSON.parse(readFileSync(JSON_PATH, "utf8"));

// Policy 컴포넌트(DsReadOnlyNotice 등)는 검사 대상에서 제외
const targets = components.filter((c) => c.layer !== "Policy");

const violations = [];

for (const c of targets) {
  const missing = [];

  if (!c.purpose) missing.push("## Purpose");
  if (!c.whenToUse.length) missing.push("## When to use");
  if (!c.whenNotToUse.length) missing.push("## When NOT to use");
  if (!c.compositionRules.length) missing.push("## Composition rules");
  if (!c.example) missing.push("@example");
  if (!c.dont.length) missing.push("Do/Don't 유도 불가 (금지형 문장 0)");

  if (missing.length) {
    violations.push({ name: c.name, file: c.sourceFile, missing });
  }
}

const key = (v) => v.name;
const current = violations.map(key).sort();

/* ── --update: baseline 갱신 ───────────────────────────── */

if (update) {
  writeFileSync(BASELINE, JSON.stringify({ frozen: current }, null, 2) + "\n");
  console.log(`✓ docstring baseline 갱신 — ${current.length}건 동결 (신규만 차단)`);
  process.exit(0);
}

/* ── 비교 ──────────────────────────────────────────────── */

const frozen = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, "utf8")).frozen
  : [];
const frozenSet = new Set(frozen);

const fresh = violations.filter((v) => !frozenSet.has(key(v)));
const fixed = frozen.filter((k) => !current.includes(k));

if (fresh.length) {
  console.error(`✗ docstring 표준 위반 ${fresh.length}건 (신규):\n`);
  for (const v of fresh) {
    console.error(`  ${v.name}\n    ${v.file}\n    누락: ${v.missing.join(" · ")}`);
  }
  console.error(
    `\n표준: Purpose / When to use / When NOT to use / Composition rules + @example.` +
      `\nDo/Don't 는 When NOT to use + Composition rules 의 금지형 문장에서 유도됩니다.`,
  );
  process.exit(1);
}

if (fixed.length) {
  console.error(
    `✗ 동결 목록이 낡았습니다 — ${fixed.length}건이 해소됐습니다:\n  ${fixed.join("\n  ")}`,
  );
  console.error(
    `\n\`node scripts/check-docstrings.mjs --update\` 로 동결선을 줄이세요.`,
  );
  process.exit(1);
}

console.log(
  `✓ docstring 표준 OK — 컴포넌트 ${targets.length}개 (완전 ${targets.length - violations.length} · 동결 ${violations.length})`,
);
