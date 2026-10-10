#!/usr/bin/env node
/**
 * build-components-json — 소스 docstring + barrel export 파싱 → docs/components.json 생성.
 *
 * ## 산출물
 * `docs/components.json` — 컴포넌트별 구조화된 메타데이터:
 *   name, layer, sourceFile, purpose, whenToUse[], whenNotToUse[],
 *   compositionRules[], example, dont[] (whenNotToUse + compositionRules 금지형 유도).
 *
 * ## 단일 파싱 원칙
 * docstring lint (`check-docstrings.mjs`) 가 이 JSON 을 읽으므로 파싱은 이 파일에서만 한다.
 * AI 에게 실제로 배달되는 파일을 검사해야 의미가 있다.
 *
 * ## 파싱 대상
 * - `src/index.ts` + `src/widget/index.ts` barrel 에서 default export 추출
 * - 각 소스 파일의 첫 JSDoc 블록에서 4섹션 + @example 파싱
 * - `_primitives.tsx` 는 다중 컴포넌트 — 각 JSDoc 블록을 개별 파싱
 *
 * Usage:
 *   node scripts/build-components-json.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "docs", "components.json");

/* ── barrel 에서 컴포넌트 목록 추출 ─────────────────────── */

/**
 * barrel 파일에서 `export { default as Name } from "./path"` 패턴 추출.
 * @returns {{ name: string, relPath: string }[]}
 */
function parseBarrelExports(barrelPath) {
  if (!existsSync(barrelPath)) return [];
  const src = readFileSync(barrelPath, "utf8");
  const results = [];
  // default export: export { default as Name } from "./Foo";
  const re = /export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from\s*["']([^"']+)["']/g;
  for (const m of src.matchAll(re)) {
    results.push({ name: m[1], relPath: m[2] });
  }
  return results;
}

/**
 * barrel 의 계층 주석으로 layer 판정.
 * `// ─── Primitives ...` / `// ─── Composite ...` / `// ─── Shell ...` 패턴.
 */
function buildLayerMap(barrelPath) {
  if (!existsSync(barrelPath)) return new Map();
  const lines = readFileSync(barrelPath, "utf8").split("\n");
  const map = new Map(); // name → layer
  let currentLayer = "Primitives"; // default

  for (const line of lines) {
    if (/─+\s*Primitives/i.test(line)) currentLayer = "Primitives";
    else if (/─+\s*Composite/i.test(line)) currentLayer = "Composite";
    else if (/─+\s*Shell/i.test(line)) currentLayer = "Shell";
    else if (/─+\s*Policy/i.test(line)) currentLayer = "Policy";

    const expMatch = line.match(/export\s*\{\s*default\s+as\s+(\w+)\s*\}/);
    if (expMatch) map.set(expMatch[1], currentLayer);
  }
  return map;
}

/* ── docstring 파싱 ─────────────────────────────────────── */

/** 파일에서 모든 JSDoc 블록 추출 (/** ... * /) */
function extractDocBlocks(source) {
  const blocks = [];
  const re = /\/\*\*\s*\n([\s\S]*?)\*\//g;
  for (const m of source.matchAll(re)) {
    blocks.push(m[1]);
  }
  return blocks;
}

/** docstring 텍스트에서 ## 섹션 파싱 */
function parseDocstring(block) {
  // 줄 앞 ` * ` 접두사 제거
  const lines = block
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, ""))
    .filter((l) => l !== undefined);

  const raw = lines.join("\n");

  // 첫 줄 = 타이틀
  const titleLine = lines.find((l) => l.trim().length > 0) ?? "";

  // ## 섹션 추출
  const sectionRe = /^## (.+)/gm;
  const sections = {};
  let lastKey = null;
  let lastIdx = -1;
  for (const m of raw.matchAll(sectionRe)) {
    if (lastKey !== null) {
      sections[lastKey] = raw.slice(lastIdx, m.index).trim();
    }
    lastKey = m[1].trim();
    lastIdx = m.index + m[0].length;
  }
  if (lastKey !== null) {
    // @example 앞까지
    const exIdx = raw.indexOf("@example", lastIdx);
    sections[lastKey] = raw
      .slice(lastIdx, exIdx > 0 ? exIdx : undefined)
      .trim();
  }

  // @example 추출
  const exMatch = raw.match(/@example\s*\n([\s\S]*?)$/);
  const example = exMatch ? exMatch[1].trim() : null;

  return { titleLine, sections, example, raw };
}

/** 섹션 텍스트 → bullet 항목 배열 */
function extractBullets(text) {
  if (!text) return [];
  return text
    .split("\n")
    .filter((l) => /^\s*-\s/.test(l))
    .map((l) => l.replace(/^\s*-\s+/, "").trim());
}

/** 금지형 문장 추출 (Don't 유도) — "금지", "~ 말 것", "→", "NOT", etc. */
function extractDonts(whenNotToUse, compositionRules) {
  const donts = [];
  for (const item of whenNotToUse) {
    donts.push(item);
  }
  for (const rule of compositionRules) {
    if (/금지|말\s*것|하지\s*말|NOT|never|forbidden/i.test(rule)) {
      donts.push(rule);
    }
  }
  return donts;
}

/* ── 단일 컴포넌트 엔트리 빌드 ──────────────────────────── */

function buildEntry(name, layer, sourceFile, docBlock) {
  if (!docBlock) {
    return {
      name,
      layer,
      sourceFile,
      purpose: null,
      whenToUse: [],
      whenNotToUse: [],
      compositionRules: [],
      example: null,
      dont: [],
    };
  }

  const { titleLine, sections, example } = parseDocstring(docBlock);

  const purpose = sections["Purpose"] ?? null;
  const whenToUse = extractBullets(sections["When to use"]);
  const whenNotToUse = extractBullets(sections["When NOT to use"]);
  const compositionRules = extractBullets(sections["Composition rules"]);
  const dont = extractDonts(whenNotToUse, compositionRules);

  return {
    name,
    layer,
    sourceFile,
    purpose,
    whenToUse,
    whenNotToUse,
    compositionRules,
    example,
    dont,
  };
}

/* ── 메인 ───────────────────────────────────────────────── */

const indexPath = join(SRC, "index.ts");
const widgetPath = join(SRC, "widget", "index.ts");

// barrel 에서 export 목록 + 계층 추출
const rootExports = parseBarrelExports(indexPath);
const widgetExports = parseBarrelExports(widgetPath);
const layerMap = buildLayerMap(indexPath);

// 위젯 barrel 의 컴포넌트는 기본 Primitives (Composite 는 root barrel 에서 판정)
for (const e of widgetExports) {
  if (!layerMap.has(e.name)) layerMap.set(e.name, "Primitives");
}

// 중복 제거 (root 가 widget 을 re-export)
const seen = new Set();
const allExports = [];
for (const e of [...rootExports, ...widgetExports]) {
  if (!seen.has(e.name)) {
    seen.add(e.name);
    allExports.push(e);
  }
}

const components = [];

for (const { name, relPath } of allExports) {
  // 소스 파일 경로 해석
  let absPath;
  if (relPath.startsWith("./widget/") || relPath.startsWith("./widget\\")) {
    absPath = join(SRC, relPath.replace(/^\.\//, "") + ".tsx");
  } else {
    absPath = join(SRC, relPath.replace(/^\.\//, "") + ".tsx");
  }

  if (!existsSync(absPath)) continue;

  const source = readFileSync(absPath, "utf8");
  const layer = layerMap.get(name) ?? "Primitives";

  const blocks = extractDocBlocks(source);
  // 첫 블록이 컴포넌트 docstring (prop docstring 은 보통 짧고 ## 없음)
  const componentBlock = blocks.find((b) => b.includes("## Purpose") || b.includes("## When to use"));

  components.push(buildEntry(name, layer, `src/${relPath.replace(/^\.\//, "")}.tsx`, componentBlock));
}

// _primitives.tsx 의 다중 컴포넌트 (AiCard, AiCaption, AiSectionHeading, AiToneBadge, AiBulletList)
const primitivesPath = join(SRC, "widget", "_primitives.tsx");
if (existsSync(primitivesPath)) {
  const primSrc = readFileSync(primitivesPath, "utf8");
  const blocks = extractDocBlocks(primSrc);
  for (const block of blocks) {
    // 타이틀에서 컴포넌트명 추출: "AiCard — ..."
    const titleMatch = block.match(/^\s*\*?\s*(\w+)\s*[—–-]/m);
    if (!titleMatch) continue;
    const pName = titleMatch[1];
    if (!pName.startsWith("Ai")) continue; // 파일 모듈 docstring 제외
    if (seen.has(pName)) continue;
    seen.add(pName);
    components.push(
      buildEntry(pName, "Primitives", "src/widget/_primitives.tsx", block),
    );
  }
}

// name 정렬
components.sort((a, b) => a.name.localeCompare(b.name));

const output = {
  generated: new Date().toISOString(),
  description:
    "자동 생성 — 직접 편집 금지. `node scripts/build-components-json.mjs` 로 재생성.",
  count: components.length,
  components,
};

writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(
  `✓ docs/components.json — ${components.length}개 컴포넌트 (${new Set(components.map((c) => c.layer)).size} layers)`,
);
