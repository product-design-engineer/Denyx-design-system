#!/usr/bin/env node
/**
 * check-gates — gate-roster 와 실제 배선(package.json)의 정합성 검산.
 *
 * ## 검사 항목
 *   1. status "auto" 게이트의 script 파일이 디스크에 존재하는가
 *   2. status "auto" 게이트가 pnpm 스크립트에 배선돼 있는가
 *      (script → lint/check 에서 직접 실행, pipeline → pnpm 스크립트명과 일치)
 *   3. "auto" + script/pipeline 없는 게이트에 justification 이 있는가
 *   4. 디스크의 check-*.mjs 스크립트가 roster 에 등록돼 있는가 (새 게이트 누락 방지)
 *
 * Usage:
 *   node scripts/check-gates.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPTS_DIR = join(ROOT, "scripts");

// roster import
const { GATE_ROSTER } = await import(join(SCRIPTS_DIR, "gate-roster.mjs"));

// package.json scripts
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const pnpmScripts = pkg.scripts ?? {};

// check 체인에서 도달 가능한 스크립트 수집
const checkChain = pnpmScripts.check ?? "";
const reachable = new Set();
for (const segment of checkChain.split("&&")) {
  const m = segment.trim().match(/pnpm\s+(\S+)/);
  if (m) reachable.add(m[1]);
}

// pnpm 스크립트 값에서 실행되는 스크립트 파일 추출
const scriptToNpm = new Map(); // "scripts/foo.mjs" → "lint:foo"
for (const [name, cmd] of Object.entries(pnpmScripts)) {
  const m = cmd.match(/node\s+scripts\/(\S+)/);
  if (m) scriptToNpm.set(`scripts/${m[1]}`, name);
}

const errors = [];

for (const gate of GATE_ROSTER) {
  if (gate.status !== "auto") continue;

  // 1. script 파일 존재
  if (gate.script) {
    if (!existsSync(join(ROOT, gate.script))) {
      errors.push(`[${gate.id}] script 파일 없음: ${gate.script}`);
    }
  }

  // 2. pnpm 배선 확인
  if (gate.script) {
    const npmName = scriptToNpm.get(gate.script);
    if (!npmName) {
      errors.push(`[${gate.id}] script ${gate.script} 이 pnpm 스크립트에 배선되지 않음`);
    }
  } else if (gate.pipeline) {
    if (!pnpmScripts[gate.pipeline]) {
      errors.push(`[${gate.id}] pipeline "${gate.pipeline}" 이 package.json scripts 에 없음`);
    }
  } else if (!gate.justification) {
    // 3. script/pipeline 없으면 justification 필수
    errors.push(`[${gate.id}] auto 게이트인데 script·pipeline·justification 모두 없음`);
  }
}

// 4. 디스크의 check-*.mjs 가 roster 에 등록돼 있는가
const rosterScripts = new Set(
  GATE_ROSTER.filter((g) => g.script).map((g) => g.script),
);
const diskCheckScripts = readdirSync(SCRIPTS_DIR)
  .filter((f) => f.startsWith("check-") && f.endsWith(".mjs"))
  .map((f) => `scripts/${f}`);

for (const diskScript of diskCheckScripts) {
  // check-gates.mjs 자체는 roster 등록 대상 아님
  if (diskScript === "scripts/check-gates.mjs") continue;
  if (!rosterScripts.has(diskScript)) {
    errors.push(`[누락] ${diskScript} 이 gate-roster 에 등록되지 않음`);
  }
}

/* ── 결과 ──────────────────────────────────────────────── */

const autoGates = GATE_ROSTER.filter((g) => g.status === "auto");
const policyGates = GATE_ROSTER.filter((g) => g.status === "policy");
const plannedGates = GATE_ROSTER.filter((g) => g.status === "planned");

console.log(`\n🚦 gate-roster 검산`);
console.log("════════════════════════════════════════════════════════");
console.log(
  `  게이트 ${GATE_ROSTER.length}개 (auto ${autoGates.length} · policy ${policyGates.length} · planned ${plannedGates.length})`,
);
console.log(`  check-*.mjs 스크립트 ${diskCheckScripts.length}개`);

if (errors.length) {
  console.error(`\n✗ 정합성 오류 ${errors.length}건:\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error(
    `\ngate-roster.mjs 를 수정하거나, 누락된 배선을 package.json 에 추가하세요.`,
  );
  process.exit(1);
}

console.log("════════════════════════════════════════════════════════");
console.log("PASS — roster ↔ 배선 정합");
