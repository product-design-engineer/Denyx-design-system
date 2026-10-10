#!/usr/bin/env node
/**
 * build-tokens-json — tokens.css 파싱 → docs/tokens.json 생성.
 *
 * 단일 출처 원칙: 값은 CSS 변수 선언, 의미는 그 위 @role/@use/@avoid 주석.
 * 값과 의미를 다른 파일에 두면 반드시 갈라진다.
 *
 * 유도되는 것 (손으로 쓰지 않는다):
 *   tier     — Global(값이 이름) / Semantic(용도가 이름) / Component(--wds-*)
 *   group    — 이름 두 번째 마디
 *   dark     — .dark 블록의 재매핑 값
 *   aliasOf  — 값이 var(--other) 인 경우의 대상
 *   usedBy   — src 에서 이 토큰을 참조하는 컴포넌트 파일
 *
 * Usage: node scripts/build-tokens-json.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_PATH = join(ROOT, "src/tokens.css");

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

const css = readFileSync(CSS_PATH, "utf8");
const lines = css.split("\n");

/* ── .dark 블록 경계 ──────────────────────────────────── */

const darkStart = lines.findIndex((l) => /^\.dark\b/.test(l));

/* ── @role/@use/@avoid 주석 파싱 ──────────────────────── */

const FIELDS = ["role", "use", "avoid"];

function parseAnnotation(text) {
  if (!text || !text.includes("@")) return null;
  const out = {};
  for (const f of FIELDS) {
    const re = new RegExp(
      `@${f}\\s+([\\s\\S]*?)(?=\\s*[|]\\s*@(?:${FIELDS.join("|")})\\b|$)`,
    );
    const m = text.match(re);
    if (m) {
      const v = m[1].replace(/\s+/g, " ").trim();
      if (v) out[f] = v;
    }
  }
  return Object.keys(out).length ? out : null;
}

function commentAbove(i) {
  const buf = [];
  for (let k = i - 1; k >= 0; k--) {
    const ln = lines[k].trim();
    if (!ln) break;
    if (ln.startsWith("/*") || ln.startsWith("*") || ln.endsWith("*/")) {
      buf.unshift(ln.replace(/^\/\*+|\*+\/$|^\*/g, "").trim());
      if (ln.startsWith("/*")) break;
      continue;
    }
    break;
  }
  return buf.join(" ").trim();
}

/* ── tier 판정 ─────────────────────────────────────────── */

function tierOf(name) {
  if (name.startsWith("--wds-")) return "Component";
  if (/^--color-(gray|palette)-/.test(name)) return "Global";
  if (/^--(text|leading|tracking|spacing|radius|font-weight|font-family)-/.test(name)) return "Global";
  if (/^--gradient-/.test(name)) return "Semantic";
  if (/^--shadow-/.test(name)) return "Semantic";
  if (/^--label-/.test(name)) return "Semantic";
  return "Semantic";
}

const groupOf = (name) => name.replace(/^--/, "").split("-").slice(0, 2).join("-");

/* ── 수집 ──────────────────────────────────────────────── */

const tokens = new Map();
const darkValues = new Map();
let inherited = null;

lines.forEach((ln, i) => {
  // @group-role 상속
  const gm = ln.match(/@group-role\s+([\s\S]*?)(?:\*\/|$)/);
  if (gm) {
    inherited = parseAnnotation("@role " + gm[1]) ?? null;
    const extra = parseAnnotation(ln.replace("@group-role", "@role"));
    if (extra) inherited = { ...inherited, ...extra };
    return;
  }
  if (/^\s*\}/.test(ln)) inherited = null;

  // @deprecated 토큰 무시
  if (/@deprecated/.test(commentAbove(i))) return;

  // 토큰 선언
  const head = ln.match(/^\s*(--[a-z0-9-]+)\s*:\s*([\s\S]*)$/);
  if (!head) return;
  const [, name] = head;
  let raw = head[2];
  for (let k = i + 1; !raw.includes(";") && k < lines.length && k < i + 6; k++) {
    raw += " " + lines[k].trim();
  }
  const value = raw.slice(0, raw.indexOf(";") >= 0 ? raw.indexOf(";") : undefined).replace(/\s+/g, " ").trim();
  if (!value) return;

  if (darkStart >= 0 && i > darkStart) {
    if (!darkValues.has(name)) darkValues.set(name, value);
    return;
  }
  if (tokens.has(name)) return;

  const above = commentAbove(i).replace("@group-role", "@role");
  const own = parseAnnotation(above) ?? parseAnnotation(ln.split(";")[1] ?? "");
  const meta = own ?? inherited ?? null;

  tokens.set(name, {
    name,
    tier: tierOf(name),
    group: groupOf(name),
    value,
    dark: null,
    aliasOf: value.match(/^var\((--[a-z0-9-]+)/)?.[1] ?? null,
    role: meta?.role ?? null,
    use: meta?.use ?? null,
    avoid: meta?.avoid ?? null,
    inheritedFrom: own ? null : inherited ? "group" : null,
    usedBy: [],
  });
});

for (const [name, v] of darkValues) {
  if (tokens.has(name)) tokens.get(name).dark = v;
}

/* ── 컴포넌트 사용처 ──────────────────────────────────── */

for (const f of walk(join(ROOT, "src")).filter((f) => /\.(tsx|ts)$/.test(f))) {
  const src = readFileSync(f, "utf8");
  const name = basename(f).replace(/\.(tsx|ts)$/, "");
  for (const v of new Set([...src.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))) {
    const t = tokens.get(v);
    if (t && !t.usedBy.includes(name)) t.usedBy.push(name);
  }
}

/* ── 산출 ──────────────────────────────────────────────── */

const list = [...tokens.values()].sort((a, b) => a.name.localeCompare(b.name));
const undocumented = list.filter((t) => !t.role).map((t) => t.name);

const out = {
  $comment:
    "자동 생성 (scripts/build-tokens-json.mjs). 직접 편집 금지 — src/tokens.css 의 @role 주석을 고치고 재생성.",
  generatedFrom: { css: "src/tokens.css", tokens: list.length, dark: darkValues.size },
  coverage: { documented: list.length - undocumented.length, total: list.length, undocumented },
  tokens: list,
};

writeFileSync(join(ROOT, "docs/tokens.json"), JSON.stringify(out, null, 2) + "\n");
console.log(
  `✓ tokens.json — ${list.length}개 토큰 (role ${list.length - undocumented.length}/${list.length} · 다크 ${darkValues.size})`,
);
