// detailwind — 경로 B: Tailwind 출력 동결본(styles.css)을 깨끗한 Denyx CSS 로 재작성하고
// JSX className(arbitrary/variant/dot/slash)을 escape 없는 깨끗한 이름으로 코드모드.
//
// 진실 원본: 현재 src/styles.css (Tailwind 가 만든 정확한 선언). 여기서 @layer/--tw-/escape 를
// 걷어내고 동일 값의 plain CSS 로 옮긴다. 사용 클래스는 src+stories tsx 에서 수집.
//
// 사용:
//   node scripts/detailwind.mjs analyze   # 커버리지 리포트 (매칭 누락 검출, 파일 미변경)
//   node scripts/detailwind.mjs generate  # 클린 CSS 생성 + JSX 코드모드 적용
import fs from "node:fs";
import { execSync } from "node:child_process";

const MODE = process.argv[2] || "analyze";
// 진실 원본(구 Tailwind 출력 1회 스냅샷). 생성 결과(denyx-ds.css)로 덮어써지므로 분리 보관.
const FROZEN = "scripts/frozen-denyx-ds.css";
const OUT = "src/denyx-ds.css";

/* ── 1. 사용 className 토큰 수집 ─────────────────────────────── */
const files = execSync(`find src stories -name '*.tsx'`).toString().split("\n").filter(Boolean);
const used = new Set();
const fileText = new Map();
const isClass = (t) =>
  /^[a-z]/.test(t) &&
  !/^[a-z][a-zA-Z0-9]*$/.test(t) === false ? false : false; // placeholder (unused)

// 토큰 후보 판별: 소문자 시작 + Tailwind/유틸 형태. 변수/JS 식별자 제외.
function looksLikeClass(t) {
  if (!t || /[A-Z]/.test(t.split(/[\[\(]/)[0])) return false; // camelCase 변수 제외 (단 arbitrary 내부 제외)
  if (/^(true|false|null|undefined|className|w|h)$/.test(t)) return false;
  if (/[${}`]/.test(t)) return false;
  const known = /^(flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|border|truncate|italic|underline|uppercase|lowercase|capitalize)$/;
  return t.includes("-") || t.includes("/") || known.test(t);
}

// Tailwind 스캐너와 동일하게 **모든 문자열 리터럴**에서 class 후보 수집
// (className= 밖의 const 맵 — 예: Button SIZE_CLASS "h-[36px] ..." — 도 포함).
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  fileText.set(f, t);
  for (const m of t.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
    const blob = m[1] ?? m[2] ?? m[3] ?? "";
    // 따옴표/백틱도 구분자 — 템플릿 리터럴 안 중첩 "..." 의 edge 토큰 오염 방지.
    for (let tok of blob.split(/[\s"'`]+/)) {
      tok = tok.trim();
      if (looksLikeClass(tok)) used.add(tok);
    }
  }
}

/* ── 2. 토큰 → 깨끗한 클래스명 sanitize ─────────────────────── */
// variant 접두어 분리 (hover: / disabled: / last: / placeholder: / group-hover: / group-hover/plus: / group-[.is-active]:)
function splitVariants(tok) {
  const parts = [];
  let rest = tok;
  // group-[.is-active]: 같이 ':' 가 arbitrary 안에 있는 경우 보호하며 좌측 variant 만 분리
  const VAR = /^(group-\[[^\]]*\]|group-hover\/[a-z0-9]+|group-hover|group-focus|peer-hover|hover|focus|focus-visible|focus-within|active|disabled|last|first|placeholder|checked|aria-[a-z]+)\:/;
  let mm;
  while ((mm = rest.match(VAR))) {
    parts.push(mm[1]);
    rest = rest.slice(mm[0].length);
  }
  return { variants: parts, base: rest };
}

function sanitizeName(tok) {
  return tok
    .replace(/\//g, "-")            // group-hover/plus, border-white/10
    .replace(/\[|\]/g, "")          // [ ]
    .replace(/[():]/g, "-")          // ( ) :
    .replace(/,/g, "-")
    .replace(/#/g, "c")             // hex #
    .replace(/\./g, "_")            // 0.5, .is-active, rgba decimals
    .replace(/\s+/g, "-")
    .replace(/%/g, "pct")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ── 3. 동결 CSS 파싱 → rule 목록 (selector, body) ──────────── */
let css = fs.readFileSync(FROZEN, "utf8");
// 헤더 주석 제거
css = css.replace(/\/\*[\s\S]*?\*\//g, "");
// @layer NAME { ... } / @media { ... } 평탄화: 최상위 @layer 래퍼만 벗긴다.
// 간단 파서: 중괄호 균형으로 토큰화.
function parseRules(text) {
  const rules = [];
  let i = 0;
  function parseBlock(end) {
    while (i < text.length && i < end) {
      // skip ws
      while (i < end && /\s/.test(text[i])) i++;
      if (i >= end) break;
      // at-rule?
      if (text[i] === "@") {
        let head = "";
        while (i < end && text[i] !== "{" && text[i] !== ";") head += text[i++];
        if (text[i] === ";") { i++; continue; }
        if (text[i] === "{") {
          const close = matchBrace(i);
          const isLayerOrMedia = /^@(layer|media|supports)\b/.test(head.trim());
          if (isLayerOrMedia) {
            const save = i;
            i++; // into block
            parseBlock(close);
            i = close + 1;
          } else {
            // @property / @keyframes 등은 통째 보존
            rules.push({ at: head.trim(), raw: text.slice(i + 1, close) });
            i = close + 1;
          }
        }
      } else {
        // selector { body }
        let sel = "";
        while (i < end && text[i] !== "{" && text[i] !== "}") sel += text[i++];
        if (text[i] !== "{") { i++; continue; }
        const close = matchBrace(i);
        const body = text.slice(i + 1, close);
        rules.push({ sel: sel.trim(), body: body.trim() });
        i = close + 1;
      }
    }
  }
  function matchBrace(open) {
    let depth = 0;
    for (let j = open; j < text.length; j++) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}") { depth--; if (depth === 0) return j; }
    }
    return text.length - 1;
  }
  parseBlock(text.length);
  return rules;
}
const rules = parseRules(css);

/* ── 4. CSS escape 해제 ────────────────────────────────────── */
function unescapeCss(s) {
  return s
    .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\(.)/g, "$1");
}

/* ── 5. 셀렉터 → (base token, variant context) 복원 매칭 ─────── */
// 사용 토큰별 기대 셀렉터를 만들기보다, 사용 토큰을 escape 하여 frozen 셀렉터와 substring 매칭.
function escapeForCss(tok) {
  // Tailwind 와 동일하게 특수문자 escape (코드포인트 escape \2c 는 별도 처리 불가하므로 unescape 후 비교 사용)
  return tok.replace(/([:[\]().,#%/\\])/g, "\\$1").replace(/\./g, "\\.");
}

// frozen 의 모든 rule 셀렉터를 unescape 해 둔다.
const ruleIndex = rules
  .filter((r) => r.sel)
  .map((r) => ({ ...r, uns: unescapeCss(r.sel) }));

// 토큰 매칭: unescape 셀렉터에 ".<token>" 이 정확히 클래스 경계로 등장하는지
function rulesFor(tok) {
  const needle = "." + tok;
  return ruleIndex.filter((r) => {
    const idx = r.uns.indexOf(needle);
    if (idx < 0) return false;
    const after = r.uns[idx + needle.length];
    // 클래스 이름 경계: 다음 문자가 이름 구성문자가 아니어야 함 ([a-z0-9-_] 아님). 단 arbitrary 는 needle 에 포함됨.
    return after === undefined || !/[a-zA-Z0-9_-]/.test(after) || tok.includes("[");
  });
}

/* ── 실행 ──────────────────────────────────────────────────── */
const GLOBAL_CLEAN = /^(ai-|wds-|group$|group\/|peer$)/; // tokens.css 전역/구조 클래스 (이미 깨끗 or 스타일 hook)
const usedArr = [...used].sort();
const missing = [];
const matched = [];
for (const tok of usedArr) {
  if (GLOBAL_CLEAN.test(tok)) continue;
  const rs = rulesFor(tok);
  if (rs.length === 0) missing.push(tok);
  else matched.push({ tok, count: rs.length });
}

if (MODE === "analyze") {
  console.log("사용 토큰:", usedArr.length, "| GLOBAL 제외 매칭:", matched.length, "| 누락:", missing.length);
  console.log("\n=== 매칭 누락 (frozen CSS 에 규칙 없음 — no-op 유지) ===");
  console.log(missing.join("\n"));
  const tw = matched.filter((m) => rulesFor(m.tok).some((r) => r.body.includes("--tw-")));
  console.log("\n=== --tw- 의존 매칭 클래스:", tw.length, "===");
  console.log(tw.map((m) => m.tok).join("\n"));
  process.exit(0);
}

/* ════════════════════════════════════════════════════════════
 *  GENERATE 모드
 * ════════════════════════════════════════════════════════════ */

// --tw- 의존 클래스의 클린 치환 (현재 값 그대로 인라인). base 토큰 기준.
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const TRANS = (prop) =>
  `transition-property:${prop};transition-timing-function:${EASE};transition-duration:150ms`;
const OVERRIDE = {
  border: "border-width:1px;border-style:solid",
  "border-0": "border-width:0;border-style:solid",
  "border-t": "border-top-width:1px;border-top-style:solid",
  "border-r": "border-right-width:1px;border-right-style:solid",
  "border-b": "border-bottom-width:1px;border-bottom-style:solid",
  "border-b-0": "border-bottom-width:0;border-bottom-style:solid",
  "border-l": "border-left-width:1px;border-left-style:solid",
  "border-[1.5px]": "border-width:1.5px;border-style:solid",
  "duration-150": "transition-duration:150ms",
  "duration-200": "transition-duration:200ms",
  "duration-400": "transition-duration:400ms",
  "ease-in-out": `transition-timing-function:${EASE}`,
  "font-normal": "font-weight:400",
  "font-medium": "font-weight:500",
  "font-semibold": "font-weight:600",
  "font-bold": "font-weight:700",
  "leading-none": "line-height:var(--leading-none)",
  "leading-tight": "line-height:var(--leading-tight)",
  "leading-snug": "line-height:var(--leading-snug)",
  "leading-normal": "line-height:var(--leading-normal)",
  "leading-relaxed": "line-height:var(--leading-relaxed)",
  "leading-loose": "line-height:var(--leading-loose)",
  "leading-px-16": "line-height:var(--leading-px-16)",
  "leading-px-20": "line-height:var(--leading-px-20)",
  "leading-[20px]": "line-height:20px",
  "outline-none": "outline-style:none",
  "tabular-nums": "font-variant-numeric:tabular-nums",
  "text-xs": "font-size:var(--text-xs);line-height:calc(1 / 0.75)",
  "text-sm": "font-size:var(--text-sm);line-height:calc(1.25 / 0.875)",
  "text-base": "font-size:var(--text-base);line-height:calc(1.5 / 1)",
  "text-lg": "font-size:var(--text-lg);line-height:calc(1.75 / 1.125)",
  "text-2xl": "font-size:var(--text-2xl);line-height:calc(2 / 1.5)",
  "tracking-caps": "letter-spacing:var(--tracking-caps)",
  "tracking-default": "letter-spacing:var(--tracking-default)",
  "tracking-display": "letter-spacing:var(--tracking-display)",
  "tracking-metric": "letter-spacing:var(--tracking-metric)",
  "tracking-normal": "letter-spacing:0em",
  "tracking-wider": "letter-spacing:0.05em",
  "transition-all": TRANS("all"),
  "transition-colors": TRANS(
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke"
  ),
  "transition-opacity": TRANS("opacity"),
  "transition-shadow": TRANS("box-shadow"),
  "transition-[left]": TRANS("left"),
  "shadow-[0_2px_8px_rgba(41,108,242,0.25)]": "box-shadow:0 2px 8px rgba(41,108,242,0.25)",
  "shadow-[0_4px_16px_rgba(0,0,0,0.12)]": "box-shadow:0 4px 16px rgba(0,0,0,0.12)",
  "shadow-[0_20px_60px_rgba(0,0,0,0.45)]": "box-shadow:0 20px 60px rgba(0,0,0,0.45)",
};

// variant → 깨끗한 셀렉터 데코레이터
function decorate(name, variants) {
  let sel = "." + name;
  let prefix = "";
  for (const v of variants) {
    if (["hover", "focus", "focus-visible", "focus-within", "active", "disabled", "checked"].includes(v))
      sel += ":" + v;
    else if (v === "last") sel += ":last-child";
    else if (v === "first") sel += ":first-child";
    else if (v === "placeholder") sel += "::placeholder";
    else if (v === "group-hover") prefix = ".group:hover " + prefix;
    else if (v.startsWith("group-hover/")) prefix = "." + sanitizeName("group-" + v.split("/")[1]) + ":hover " + prefix;
    else if (v.startsWith("group-[")) {
      const inner = v.slice(v.indexOf("[") + 1, v.lastIndexOf("]")); // .is-active
      prefix = ".group" + inner + " " + prefix;
    } else if (v.startsWith("aria-")) sel += `[${v.replace("aria-", "aria-")}="true"]`;
  }
  return prefix + sel;
}

// 본문 정리: 멀티라인 → 한 줄
const oneLine = (b) => b.replace(/\s*\n\s*/g, "").replace(/\s{2,}/g, " ").trim();

// 범용 --tw-* / Tailwind 기본 var 정리: frozen 본문을 clean 선언으로.
function cleanTwBody(body) {
  let b = body;
  // shadow 합성: `--tw-shadow: VAL; box-shadow: <ring/inset 합성>` → `box-shadow: VAL`
  const sh = b.match(/--tw-shadow:\s*([^;]+);/);
  if (sh && /box-shadow:/.test(b)) {
    const val = sh[1].replace(/var\(--tw-shadow-color,\s*([^)]+)\)/g, "$1").trim();
    return oneLine(`box-shadow: ${val}`);
  }
  b = b.replace(/--tw-[a-z-]+:\s*[^;]+;?/g, "");                                  // --tw-* setter 제거
  b = b.replace(/var\(--tw-[a-z-]+,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)/g, "$1");   // var(--tw-x, FALLBACK)→FALLBACK
  b = b.replace(/var\(--tw-[a-z-]+\)/g, "");                                      // var(--tw-x)→제거
  b = b.replace(/var\(--default-transition-timing-function\)/g, "cubic-bezier(0.4, 0, 0.2, 1)");
  b = b.replace(/var\(--default-transition-duration\)/g, "150ms");
  b = b.replace(/;\s*;/g, ";").replace(/^\s*;/, "").trim();
  return oneLine(b);
}

// 중첩 variant 구문 평탄화: `&:hover { @media(hover:hover){ DECLS } }` → `DECLS`
// frozen 은 hover/disabled/group 등을 `&...{ @media...{ ... } }` 중첩으로 emit. leaf 선언만 추출.
function innermostDecls(body) {
  let b = body.trim();
  // 래퍼(&..., @media..., @supports..., :is...) 가 본문 전체를 감싸면 벗긴다.
  for (let i = 0; i < 6; i++) {
    const m = b.match(/^\s*(?:&[^{]*|@(?:media|supports)[^{]*|:[^{]*)\{([\s\S]*)\}\s*$/);
    if (!m) break;
    b = m[1].trim();
  }
  return oneLine(b);
}

// 멱등성 가드 — generate 는 **원본(escaped className) tsx** 에서만 유효.
// 이미 codemod된 트리(arbitrary `[` 클래스 없음)에서 재실행하면 frozen 매칭 실패로
// 유틸이 대량 누락된다. 그 경우 덮어쓰기 전에 중단.
const tsxHasArbitrary = usedArr.some((t) => t.includes("["));
if (!tsxHasArbitrary && /\\\[/.test(css)) {
  console.error("✗ tsx 가 이미 codemod된 상태로 보입니다 (className 에 arbitrary `[` 없음).");
  console.error("  detailwind generate 는 원본 escaped tsx 에서만 실행하세요.");
  console.error("  증분 변경은 src/denyx-ds.css 를 직접 편집하거나, `git checkout` 으로 원본 복원 후 실행하세요.");
  process.exit(1);
}

const renameMap = {};
const cssLines = [];
const skipped = [];
for (const tok of usedArr) {
  const { variants, base } = splitVariants(tok);
  const isGlobal = GLOBAL_CLEAN.test(tok);
  const ov = OVERRIDE[base];
  const rs = ov != null ? null : rulesFor(tok);
  // 진짜 class 만: frozen 규칙 보유 · OVERRIDE 대상 · 전역 마커. 그 외(import 경로·URL·
  // prop 값 등 looksLikeClass 오탐)는 rename/규칙 대상에서 제외 → 문자열 손상 방지.
  const realClass = isGlobal || ov != null || (rs && rs.length > 0);
  if (!realClass) { skipped.push(tok); continue; }

  const clean = sanitizeName(tok);
  if (clean !== tok) renameMap[tok] = clean;
  if (isGlobal) continue; // ai-*/wds-/group 마커 — 규칙 불필요(이미 tokens.css/frozen 정의)

  let body;
  if (ov != null) body = ov;
  else {
    const exact = rs.find((r) => {
      const u = r.uns;
      const n = "." + tok;
      const i = u.indexOf(n);
      const a = u[i + n.length];
      return a === undefined || /[\s:{>.[]/.test(a);
    });
    body = cleanTwBody(innermostDecls((exact || rs[0]).body));
  }
  cssLines.push(`${decorate(clean, variants)} { ${body} }`);
}

// EXTRAS — 테마 적응 표면/배경 유틸 (frozen 에 없음). .dark 토큰으로 자동 전환되는 의미 클래스.
const EXTRAS = [
  ".bg-bg { background-color: var(--color-bg); }",
  ".bg-card { background-color: var(--color-card); }",
  ".bg-surface-50 { background-color: var(--color-surface-50); }",
  ".bg-surface-100 { background-color: var(--color-surface-100); }",
  ".bg-surface-200 { background-color: var(--color-surface-200); }",
  ".hover-bg-surface-100:hover { background-color: var(--color-surface-100); }",
  ".hover-bg-surface-200:hover { background-color: var(--color-surface-200); }",
  // Layout Scale Tokens 유틸 (2026-07-02, DS-ENHANCEMENT-PLAN §2.1~2.3)
  ".rounded-xs { border-radius: var(--radius-xs); }",
  ".rounded-sm { border-radius: var(--radius-sm); }",
  ".rounded-2xl { border-radius: var(--radius-2xl); }",
  ".shadow-sm { box-shadow: var(--shadow-sm); }",
  ".shadow-md { box-shadow: var(--shadow-md); }",
  ".shadow-lg { box-shadow: var(--shadow-lg); }",
  // Elevation 시맨틱 유틸 (2026-07-03 — card/raised/overlay 층위)
  ".shadow-card { box-shadow: var(--shadow-card) }",
  ".shadow-raised { box-shadow: var(--shadow-raised) }",
  ".shadow-overlay { box-shadow: var(--shadow-overlay) }",
  // Text hierarchy · numeric font · display xl — tokens.css 문서에 명시돼 있으나 frozen 스냅샷에 누락됐던 유틸 (2026-07-05)
  ".text-primary { color: var(--color-text-primary); }",
  ".text-secondary { color: var(--color-text-secondary); }",
  ".text-tertiary { color: var(--color-text-tertiary); }",
  ".text-disabled { color: var(--color-text-disabled); }",
  ".font-numeric { font-family: var(--font-family-numeric); }",
  ".text-xl { font-size: var(--text-xl); }",
];
for (const e of EXTRAS) if (!cssLines.includes(e)) cssLines.push(e);

// --tw-/Tailwind 내부 var 잔존 검사
const joined = cssLines.join("\n");
const leak = joined.match(/--tw-|--default-|--line-height|@layer/g);
if (leak) {
  console.error("✗ 잔존 Tailwind 내부 참조 발견:", [...new Set(leak)]);
  const bad = cssLines.filter((l) => /--tw-|--default-|--line-height/.test(l));
  console.error(bad.join("\n"));
  process.exit(1);
}

/* ── @layer 블록 / @property 블록 추출·제거 헬퍼 ───────────────────────────── */
function balancedEnd(text, open) {
  let depth = 0;
  for (let j = open; j < text.length; j++) {
    if (text[j] === "{") depth++;
    else if (text[j] === "}") { depth--; if (depth === 0) return j; }
  }
  return text.length - 1;
}
// @layer NAME { ... } 블록 내용 추출 (statement `@layer a,b;` 는 무시)
function extractLayer(name) {
  const re = new RegExp("@layer\\s+" + name + "\\s*\\{");
  const m = re.exec(css);
  if (!m) return "";
  const start = m.index + m[0].length - 1; // '{'
  return css.slice(start + 1, balancedEnd(css, start));
}
// @layer{}·@property{}·@layer 문·배너 주석 제거 → 남은 비레이어 전역(keyframes·.ai-*·.wds-btn·.dark)
function removeBalancedBlocks(text, headerRe) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    headerRe.lastIndex = i;
    const m = headerRe.exec(text);
    if (!m) { out += text.slice(i); break; }
    out += text.slice(i, m.index);
    const brace = text.indexOf("{", m.index);
    i = balancedEnd(text, brace) + 1;
  }
  return out;
}
function extractGlobals(text) {
  let out = text.replace(/^\s*\/\*![\s\S]*?\*\//, "");      // 배너 주석
  out = out.replace(/@layer[^{};]*;/g, "");                  // @layer a,b; 문
  out = removeBalancedBlocks(out, /@layer\s+[a-zA-Z]+\s*\{/g); // @layer NAME {...}
  out = removeBalancedBlocks(out, /@property\s+[^{]+\{/g);    // @property --tw-* {...}
  return out.trim();
}

const themeBlock = extractLayer("theme").trim();   // :root,:host{ 토큰 } — self-contained, --tw- 없음
const preflight = extractLayer("base").trim();     // 요소 기본값 정규화
const globals = extractGlobals(css);               // keyframes · .ai-* · .wds-btn · .dark 등

let out = `/* ============================================================================
 * Denyx Design System — denyx-ds.css (자체 소유 plain CSS · 외부 CSS 프레임워크 의존 없음)
 *
 * 모든 선언은 DS 가 실제 렌더한 계산값에서 온 것입니다. 클래스명은 escape 없는 일반
 * CSS 식별자, 색/타이포/보더/transition 값은 토큰(:root) 또는 인라인 상수로 직접 표기.
 * 구조: 토큰(:root) → preflight → utilities → 전역(keyframes·.ai-*·.dark). 자체완결.
 *
 * 생성: node scripts/detailwind.mjs generate  (컴포넌트 className/토큰 변경 시 재생성)
 * 진실 원본: scripts/frozen-denyx-ds.css (구 빌드 1회 스냅샷, 미배포)
 * ============================================================================ */

/* ── tokens (:root) ─────────────────────────────────────────────────────── */
${themeBlock}

/* ── preflight reset ────────────────────────────────────────────────────── */
${preflight}

/* ── utilities (DS 계산값 기반 · 일반 CSS 클래스) ──────────────────────────── */
${cssLines.sort().join("\n")}

/* ── globals (keyframes · 컴포넌트 전역 클래스 · .dark) ────────────────────── */
${globals}
`;

// 최종 전수 scrub: 혹시 남은 --tw- setter/참조 제거 (theme/preflight/globals 포함 안전망)
out = out
  .replace(/^\s*--tw-[a-z-]+:\s*[^;]+;\s*$/gm, "")
  .replace(/var\(--tw-[a-z-]+,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)/g, "$1")
  .replace(/var\(--tw-[a-z-]+\)/g, "");

// 최종 흔적 0 검증
const finalLeak = out.match(/--tw-|@layer|@property/g);
if (finalLeak) {
  console.error("✗ 최종 출력에 잔존:", [...new Set(finalLeak)]);
  process.exit(1);
}

fs.writeFileSync(OUT, out);
fs.writeFileSync("/tmp/rename-map.json", JSON.stringify(renameMap, null, 2));
console.log("✓ denyx-ds.css 생성:", cssLines.length, "유틸 |", Object.keys(renameMap).length, "rename |", skipped.length, "비-class 제외");

/* ── JSX 코드모드 ──────────────────────────────────────────── */
// 화이트스페이스 토큰 단위로 renameMap 적용 (renameMap 은 distinctive 토큰만 → 안전).
function remapClassString(s) {
  return s
    .split(/(\s+)/)
    .map((t) => (renameMap[t] != null ? renameMap[t] : t))
    .join("");
}
// 모든 문자열/템플릿 리터럴의 정적 텍스트에서 토큰 치환 (className= 밖 const 맵 포함).
// renameMap 키는 전부 escape/특수문자 포함이라 비-class 문자열을 건드릴 위험이 없음.
let changed = 0;
for (const f of files) {
  let t = fileText.get(f);
  const orig = t;
  t = t.replace(/"([^"]*)"/g, (m, s) => `"${remapClassString(s)}"`);
  t = t.replace(/'([^']*)'/g, (m, s) => `'${remapClassString(s)}'`);
  t = t.replace(/`([^`]*)`/g, (m, s) => {
    const out = s.replace(/(\$\{[^}]*\})|([^$]+|\$(?!\{))/g, (seg, expr2, txt) =>
      expr2 != null ? expr2 : remapClassString(txt)
    );
    return "`" + out + "`";
  });
  if (t !== orig) { fs.writeFileSync(f, t); changed++; }
}
console.log("✓ JSX 코드모드:", changed, "파일 변경");
