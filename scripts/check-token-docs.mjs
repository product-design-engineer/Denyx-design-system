#!/usr/bin/env node
/**
 * check-token-docs — 토큰 의미 커버리지 게이트.
 *
 * tokens.css 의 모든 토큰 선언은 @role 주석을 가져야 한다.
 * (@use/@avoid 는 선택, 그룹 공통은 @group-role 로 상속.)
 *
 * 판정 대상은 생성 산출물 docs/tokens.json — 파싱을 두 번 구현하면
 * 게이트와 배달물이 서로 다른 것을 본다.
 *
 * Baseline ratchet: 기존 미문서화 토큰은 동결, 신규만 차단. --update 로 줄임.
 *
 * Usage:
 *   node scripts/check-token-docs.mjs            # 검사
 *   node scripts/check-token-docs.mjs --update   # baseline 갱신
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(ROOT, "docs", "tokens.json");
const BASELINE = join(ROOT, "token-docs-baseline.json");
const update = process.argv.includes("--update");

// 최신 산출물로 검사
execFileSync(process.execPath, [join(ROOT, "scripts/build-tokens-json.mjs")], {
  stdio: "pipe",
});

if (!existsSync(JSON_PATH)) {
  console.error("✗ docs/tokens.json 이 없습니다.");
  process.exit(1);
}

const { tokens, coverage } = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const missing = tokens.filter((t) => !t.role);
const current = missing.map((t) => t.name).sort();

if (update) {
  writeFileSync(BASELINE, JSON.stringify({ frozen: current }, null, 2) + "\n");
  console.log(`✓ token-docs baseline 갱신 — ${current.length}건 동결 (신규만 차단)`);
  process.exit(0);
}

const frozen = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, "utf8")).frozen
  : [];
const frozenSet = new Set(frozen);
const fresh = missing.filter((t) => !frozenSet.has(t.name));
const fixed = frozen.filter((n) => !current.includes(n));

console.log(`\n🎨 token-docs — 토큰 의미 커버리지`);
console.log("════════════════════════════════════════════════════════");
console.log(
  `  토큰 ${tokens.length}개 (Semantic ${tokens.filter((t) => t.tier === "Semantic").length} · ` +
    `Global ${tokens.filter((t) => t.tier === "Global").length} · ` +
    `Component ${tokens.filter((t) => t.tier === "Component").length}) · ` +
    `다크 ${tokens.filter((t) => t.dark).length}`,
);
console.log(`  문서화 ${coverage.documented}/${coverage.total} · 미문서화 ${missing.length}건 (동결 ${frozen.length})`);

if (fresh.length) {
  console.error(`\n✗ @role 이 없는 토큰 ${fresh.length}건 (신규):\n`);
  for (const t of fresh) console.error(`  ${t.name}  (${t.tier} · ${t.group})`);
  console.error(
    `\n토큰 선언 위 줄에 이렇게 적으세요:\n` +
      `  /* @role 경고 상태의 원색 | @use 경고 배지·도트 | @avoid 본문 텍스트 */\n` +
      `그룹이 의미를 공유하면 @group-role 을 한 번 쓰면 아래 토큰이 상속합니다.`,
  );
  process.exit(1);
}

if (fixed.length) {
  console.error(
    `\n✗ 동결 목록이 낡았습니다 — ${fixed.length}건이 해소됐습니다: ${fixed.join(", ")}`,
  );
  console.error(
    `  \`node scripts/check-token-docs.mjs --update\` 로 동결선을 줄이세요.`,
  );
  process.exit(1);
}

console.log("════════════════════════════════════════════════════════");
console.log(`PASS — 미문서화 신규 0건 (${coverage.documented}/${coverage.total})`);
