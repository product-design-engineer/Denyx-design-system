#!/usr/bin/env node
/**
 * check-token-addon — Addon 파일 구조 무결성 게이트.
 *
 * ## 규칙
 *   R1. 변수명 중복 없음 — 4파일 간 같은 변수명이 :root 에 중복 선언되면 로드 순서 의존.
 *       Core fallback 과 Addon 의 의도적 덮어쓰기는 허용 (allowlist).
 *   R2. Core 그레이스케일 순수성 — core.css 의 :root 에 컬러 의미 토큰(primary·accent·status·
 *       indicator·surface-critical/warning/info·palette) 이 직접 hex 값으로 있으면 안 됨.
 *       gray fallback (#757575 등 중립 회색) 은 허용.
 *   R3. Addon 자기 완결 — 각 Addon 의 .dark 블록은 자기 :root 에 선언된 변수만 override.
 *
 * Usage:
 *   node scripts/check-token-addon.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKENS_DIR = join(ROOT, "src", "tokens");

const FILES = ["core.css", "brand.css", "status.css", "chart.css"];

const errors = [];

/* ── 파일 존재 확인 ────────────────────────────────────── */

for (const f of FILES) {
  if (!existsSync(join(TOKENS_DIR, f))) {
    errors.push(`[missing] src/tokens/${f} 가 없습니다`);
  }
}
if (errors.length) {
  console.error(`✗ ${errors.length}건:\n` + errors.map((e) => `  ${e}`).join("\n"));
  process.exit(1);
}

/* ── CSS 파싱 헬퍼 ─────────────────────────────────────── */

function parseVarDecls(css, selector) {
  const vars = new Map(); // name → value
  const re = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^{]*\\{([^}]*)\\}`, "g");
  for (const m of css.matchAll(re)) {
    const block = m[1];
    for (const [, name, value] of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      vars.set(name.trim(), value.trim());
    }
  }
  return vars;
}

const fileSources = {};
const fileRootVars = {};
const fileDarkVars = {};

for (const f of FILES) {
  const css = readFileSync(join(TOKENS_DIR, f), "utf8");
  fileSources[f] = css;
  fileRootVars[f] = parseVarDecls(css, ":root");
  fileDarkVars[f] = parseVarDecls(css, ".dark");
}

/* ── R1. 변수명 중복 (Core fallback 허용) ──────────────── */

// Core 의 fallback 변수명 = Brand/Status/Chart 에도 있는 것 → 의도적 덮어쓰기
const coreVars = fileRootVars["core.css"];
const addonFiles = ["brand.css", "status.css", "chart.css"];
const allowedOverlap = new Set(); // Core fallback 으로 허용

for (const af of addonFiles) {
  for (const [name] of fileRootVars[af]) {
    if (coreVars.has(name)) allowedOverlap.add(name);
  }
}

// Addon 간 중복 (Core 제외)
for (let i = 0; i < addonFiles.length; i++) {
  for (let j = i + 1; j < addonFiles.length; j++) {
    const a = fileRootVars[addonFiles[i]];
    const b = fileRootVars[addonFiles[j]];
    for (const [name] of a) {
      if (b.has(name)) {
        errors.push(
          `[R1:duplicate] --${name.replace(/^--/, "")} 이 ${addonFiles[i]} 과 ${addonFiles[j]} 에 모두 선언됨`,
        );
      }
    }
  }
}

/* ── R2. Core 그레이스케일 순수성 ──────────────────────── */

// Core 에서 브랜드/상태 의미를 가진 변수에 chromatic 색(hex 가 회색이 아닌)이 있으면 위반
const BRAND_STATUS_PATTERN =
  /^--(color-primary|color-accent|color-status|color-indicator-(critical|warning|info)|color-surface-(critical|warning|info)|color-palette|gradient-brand)/;

const GRAY_HEX = /^#([0-9a-f])\1\1([0-9a-f])\2\2$/i; // #aaa, #7f7f7f 등
const NEUTRAL_VALUES = new Set(["#757575", "#616161", "#9e9e9e", "#f1f2f4", "#f5f5f5", "#e8e8e8"]);

function isGrayValue(value) {
  if (NEUTRAL_VALUES.has(value.toLowerCase())) return true;
  if (GRAY_HEX.test(value)) return true;
  if (value.startsWith("linear-gradient")) {
    // gradient 내 모든 색이 gray 이면 허용
    const colors = value.match(/#[0-9a-fA-F]{3,6}/g) ?? [];
    return colors.every((c) => NEUTRAL_VALUES.has(c.toLowerCase()) || GRAY_HEX.test(c));
  }
  // var() 참조, 문자열 라벨 등은 허용
  if (value.startsWith("var(") || value.startsWith('"') || value === "") return true;
  return false;
}

for (const [name, value] of coreVars) {
  if (BRAND_STATUS_PATTERN.test(name) && !isGrayValue(value)) {
    errors.push(
      `[R2:core-purity] core.css 에 chromatic 값: ${name}: ${value} — gray fallback 만 허용`,
    );
  }
}

/* ── R3. Addon .dark 자기 완결 ─────────────────────────── */

for (const f of FILES) {
  const rootVars = fileRootVars[f];
  const darkVars = fileDarkVars[f];
  for (const [name] of darkVars) {
    if (!rootVars.has(name) && !allowedOverlap.has(name)) {
      errors.push(
        `[R3:dark-orphan] ${f} .dark 에 ${name} 이 있지만 같은 파일 :root 에 선언 없음`,
      );
    }
  }
}

/* ── 결과 ──────────────────────────────────────────────── */

const totalVars = FILES.reduce((s, f) => s + fileRootVars[f].size, 0);
const totalDark = FILES.reduce((s, f) => s + fileDarkVars[f].size, 0);

console.log(`\n🧩 token-addon — Addon 파일 구조 무결성`);
console.log("════════════════════════════════════════════════════════");
console.log(
  `  ${FILES.length}파일 · :root ${totalVars}개 · .dark ${totalDark}개 · Core fallback ${allowedOverlap.size}개`,
);

if (errors.length) {
  console.error(`\n✗ ${errors.length}건:\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log("════════════════════════════════════════════════════════");
console.log("PASS — Addon 구조 정합");
