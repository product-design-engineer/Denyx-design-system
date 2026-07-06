#!/usr/bin/env node
/**
 * design-lint — DESIGN.md 구조 검증 + 깨진 토큰 참조 탐지 + WCAG 대비비 검사.
 *
 * Lint 규칙 8개:
 *   1. broken-ref      (error)   — 깨진 {token.path} 참조
 *   2. missing-primary  (warning) — 필수 토큰 누락 (text-primary, primary 등)
 *   3. contrast-ratio   (warning) — WCAG AA 4.5:1 미만
 *   4. orphaned-tokens  (warning) — 정의됐지만 어디서도 참조되지 않은 색상
 *   5. missing-typography (warning) — Named typography pattern 에 필수 속성 누락
 *   6. section-order    (warning) — YAML/산문 섹션 순서 위반
 *   7. token-summary    (info)    — 토큰 수/참조 수 요약
 *   8. missing-sections (info)    — 사양 권장 섹션 중 누락된 것
 *
 * Usage:  node scripts/design-lint.js [path/to/DESIGN.md]
 * Exit:   0 = pass, 1 = error(s) found
 */

import { loadDesignTokens, flattenTokens, findReferences, extractProse, DESIGN_PATH } from "./parse-design.js";

const filePath = process.argv[2] || DESIGN_PATH;

const results = {
  errors: [],   // exit 1
  warnings: [], // 표시만
  info: [],     // 정보성
};

function error(rule, msg) { results.errors.push({ rule, msg }); }
function warn(rule, msg) { results.warnings.push({ rule, msg }); }
function info(rule, msg) { results.info.push({ rule, msg }); }

const tokens = loadDesignTokens(filePath);
const flat = flattenTokens(tokens);
const refs = findReferences(flat);

/* ── Rule 1: broken-ref (error) ────────────────────────── */

// 참조 대상이 flat 에 직접 있거나, 객체 참조(하위 키의 prefix)로 존재하면 유효
function refExists(ref, flatMap) {
  if (ref in flatMap) return true;
  // 객체 참조 — ref 가 하위 키들의 prefix 인 경우 (typography.pattern-body → typography.pattern-body.fontFamily 등)
  const prefix = ref + ".";
  for (const k of Object.keys(flatMap)) {
    if (k.startsWith(prefix)) return true;
  }
  return false;
}

for (const { key, ref } of refs) {
  if (!refExists(ref, flat)) {
    error("broken-ref", `'${key}' → {${ref}} — 대상 토큰이 존재하지 않음.`);
  }
}

/* ── Rule 2: missing-primary (warning) ─────────────────── */

const PRIMARY_TOKENS = [
  "colors.text-primary",
  "colors.text-secondary",
  "colors.primary",
  "colors.status-success",
  "colors.status-warning",
  "colors.status-error",
  "typography.family-korean",
  "typography.family-numeric",
  "typography.size-base",
  "typography.weight-regular",
  "typography.tracking-default",
  "typography.leading-normal",
];

for (const required of PRIMARY_TOKENS) {
  if (!(required in flat)) {
    warn("missing-primary", `필수 토큰 '${required}' 누락.`);
  }
}

/* ── Rule 3: contrast-ratio (warning) — WCAG AA ────────── */

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function isHexColor(v) {
  return typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v);
}

const BG_WHITE = "#ffffff";
const WCAG_AA = 4.5;
const WCAG_AA_LARGE = 3.0;

// text-* vs 흰색 배경
const textTokenPairs = [
  ["text-primary", "colors.text-primary"],
  ["text-secondary", "colors.text-secondary"],
  ["text-tertiary", "colors.text-tertiary"],
  ["text-disabled", "colors.text-disabled"],
];

for (const [label, path] of textTokenPairs) {
  const hex = flat[path];
  if (!hex || !isHexColor(hex)) continue;
  const ratio = contrastRatio(hex, BG_WHITE);
  if (ratio < WCAG_AA_LARGE) {
    warn("contrast-ratio", `WCAG AA 실패: '${label}' (${hex}) vs #fff = ${ratio.toFixed(2)}:1 (최소 ${WCAG_AA_LARGE}:1 large text)`);
  } else if (ratio < WCAG_AA) {
    warn("contrast-ratio", `WCAG AA 미달 (normal text): '${label}' (${hex}) vs #fff = ${ratio.toFixed(2)}:1 (최소 ${WCAG_AA}:1)`);
  }
}

// indicator-* vs tone-surface-* (배지)
const TONES = ["critical", "warning", "info", "muted", "neutral"];
for (const tone of TONES) {
  const fg = flat[`colors.indicator-${tone}`];
  const bg = flat[`colors.tone-surface-${tone}`];
  if (!fg || !bg || !isHexColor(fg) || !isHexColor(bg)) continue;
  const ratio = contrastRatio(fg, bg);
  if (ratio < WCAG_AA) {
    warn("contrast-ratio", `배지 대비 미달: indicator-${tone} (${fg}) on tone-surface-${tone} (${bg}) = ${ratio.toFixed(2)}:1`);
  }
}

/* ── Rule 4: orphaned-tokens (warning) ─────────────────── */

// colors.* 중 어떤 Reference 에서도 참조되지 않은 색상 탐지
const allRefTargets = new Set(refs.map(({ ref }) => ref));
const colorKeys = Object.keys(flat).filter(
  (k) => k.startsWith("colors.") && isHexColor(flat[k])
);

// 메타/배열 키 제외
const metaKeys = new Set(["colors.tone-types"]);
const orphaned = colorKeys.filter(
  (k) => !allRefTargets.has(k) && !metaKeys.has(k)
);

// 참조되지 않는 색은 많을 수 있으므로 10개까지만 표시
if (orphaned.length > 0) {
  const shown = orphaned.slice(0, 10);
  const moreMsg = orphaned.length > 10 ? ` (외 ${orphaned.length - 10}개)` : "";
  warn("orphaned-tokens", `참조되지 않은 색상 ${orphaned.length}개: ${shown.join(", ")}${moreMsg}`);
}

/* ── Rule 5: missing-typography (warning) ──────────────── */

const TYPO_REQUIRED_PROPS = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing"];

if (tokens.typography) {
  for (const [k, v] of Object.entries(tokens.typography)) {
    if (!k.startsWith("pattern-")) continue;
    if (typeof v !== "object" || v === null) {
      warn("missing-typography", `Typography pattern '${k}' 이(가) 객체가 아님.`);
      continue;
    }
    for (const prop of TYPO_REQUIRED_PROPS) {
      if (!(prop in v)) {
        warn("missing-typography", `Pattern '${k}' 에 필수 속성 '${prop}' 누락.`);
      }
    }
  }
}

/* ── Rule 6: section-order (warning) ───────────────────── */

const SECTION_ORDER = ["overview", "colors", "typography", "layout", "elevation", "shapes", "components"];
const presentSections = SECTION_ORDER.filter((s) => tokens[s]);
const actualKeys = Object.keys(tokens).filter((k) => SECTION_ORDER.includes(k));

let orderOk = true;
for (let i = 0; i < actualKeys.length; i++) {
  if (actualKeys[i] !== presentSections[i]) {
    warn("section-order", `YAML 섹션 순서 위반: '${actualKeys[i]}' 이(가) '${presentSections[i]}' 위치에 있음. 올바른 순서: ${presentSections.join(" → ")}`);
    orderOk = false;
    break;
  }
}

// 산문 ## 헤딩 순서도 검증
const prose = extractProse(filePath);
const PROSE_ORDER = ["Overview", "Colors", "Typography", "Layout", "Elevation", "Shapes", "Components", "Do"];
const proseHeadings = [...prose.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
const proseIndices = proseHeadings
  .map((h) => PROSE_ORDER.findIndex((s) => h.toLowerCase().startsWith(s.toLowerCase())))
  .filter((i) => i !== -1);

for (let i = 1; i < proseIndices.length; i++) {
  if (proseIndices[i] < proseIndices[i - 1]) {
    warn("section-order", `산문 섹션 순서 위반: '${proseHeadings[i]}'`);
    break;
  }
}

/* ── Rule 7: token-summary (info) ──────────────────────── */

const colorCount = Object.keys(flat).filter((k) => k.startsWith("colors.")).length;
const typoCount = Object.keys(flat).filter((k) => k.startsWith("typography.")).length;
const layoutCount = Object.keys(flat).filter((k) => k.startsWith("layout.")).length;
const shapeCount = Object.keys(flat).filter((k) => k.startsWith("shapes.")).length;
const compCount = Object.keys(flat).filter((k) => k.startsWith("components.")).length;
const brokenCount = refs.filter(({ ref }) => !(ref in flat)).length;

info("token-summary", `총 ${Object.keys(flat).length} 토큰 | ${refs.length} 참조 (깨진: ${brokenCount}) | Colors ${colorCount} · Typography ${typoCount} · Layout ${layoutCount} · Shapes ${shapeCount} · Components ${compCount}`);

/* ── Rule 8: missing-sections (info) ───────────────────── */

const ALL_SECTIONS = ["overview", "colors", "typography", "layout", "elevation", "shapes", "components"];
const missingSections = ALL_SECTIONS.filter((s) => !tokens[s]);
if (missingSections.length > 0) {
  info("missing-sections", `사양 권장 섹션 중 누락: ${missingSections.join(", ")} (생략 허용, 정보성 알림)`);
}

// 컴포넌트 유효 속성 검증 (bonus — 규칙 외 보너스 검증)
const VALID_COMPONENT_PROPS = new Set([
  "backgroundColor", "textColor", "typography", "rounded",
  "padding", "size", "height", "width",
]);

if (tokens.components) {
  for (const [compName, compVal] of Object.entries(tokens.components)) {
    if (typeof compVal !== "object" || compVal === null) continue;
    for (const prop of Object.keys(compVal)) {
      if (!VALID_COMPONENT_PROPS.has(prop)) {
        warn("component-prop", `컴포넌트 '${compName}' 에 유효하지 않은 속성 '${prop}'. 유효: ${[...VALID_COMPONENT_PROPS].join(", ")}`);
      }
    }
  }
}

/* ── 출력 ──────────────────────────────────────────────── */

console.log(`\n📋 DESIGN.md Lint Report`);
console.log(`${"═".repeat(56)}`);

// Info
if (results.info.length) {
  for (const { rule, msg } of results.info) {
    console.log(`  ℹ️  [${rule}] ${msg}`);
  }
  console.log();
}

// Warnings
if (results.warnings.length) {
  console.log(`⚠️  Warnings (${results.warnings.length}):`);
  for (const { rule, msg } of results.warnings) {
    console.log(`  ⚠️  [${rule}] ${msg}`);
  }
  console.log();
}

// Errors
if (results.errors.length) {
  console.log(`❌ Errors (${results.errors.length}):`);
  for (const { rule, msg } of results.errors) {
    console.log(`  ❌ [${rule}] ${msg}`);
  }
  console.log();
  console.log(`${"═".repeat(56)}`);
  console.log(`FAIL — ${results.errors.length} error(s), ${results.warnings.length} warning(s)\n`);
  process.exit(1);
}

console.log(`${"═".repeat(56)}`);
console.log(`PASS — 0 error(s), ${results.warnings.length} warning(s)\n`);
