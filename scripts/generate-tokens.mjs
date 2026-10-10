#!/usr/bin/env node
/**
 * generate-tokens.mjs — tokens.css -> _tokens.ts 단일 출처 파이프라인.
 *
 * tokens.css 의 :root CSS custom properties 를 파싱하여
 * src/widget/_tokens.ts 를 자동 생성합니다.
 *
 * Usage:
 *   node scripts/generate-tokens.mjs            # generate src/widget/_tokens.ts
 *   node scripts/generate-tokens.mjs --check     # generate + git diff --exit-code (CI 용)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TOKENS_CSS = resolve(ROOT, "src/tokens.css");
const OUTPUT = resolve(ROOT, "src/widget/_tokens.ts");

/* ── CSS Parser ──────────────────────────────────────────────────────── */

/**
 * Extract the content between balanced braces starting at a given index.
 */
function extractBlock(css, openIndex) {
  let depth = 0;
  let start = -1;
  for (let i = openIndex; i < css.length; i++) {
    if (css[i] === "{") {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(start, i);
    }
  }
  return "";
}

/**
 * Parse CSS custom properties from a block string into a Map.
 */
function parseProps(block) {
  const map = new Map();
  for (const [, name, value] of block.matchAll(
    /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g
  )) {
    map.set(name, value.trim());
  }
  return map;
}

/**
 * Parse `:root { ... }` and `.dark, [data-theme="dark"] { ... }` blocks
 * from tokens.css. Returns Map<varName, value> for each.
 */
function parseCssVars(css) {
  let light = new Map();
  let dark = new Map();

  // Find ALL :root blocks (multiple after @import resolution)
  const rootRe = /:root\s*\{/g;
  let rootMatch;
  while ((rootMatch = rootRe.exec(css)) !== null) {
    for (const [k, v] of parseProps(extractBlock(css, rootMatch.index))) {
      light.set(k, v);
    }
  }

  // Find ALL .dark blocks
  const darkRe = /\.dark[\s,][^{]*\{/g;
  let darkMatch;
  while ((darkMatch = darkRe.exec(css)) !== null) {
    for (const [k, v] of parseProps(extractBlock(css, darkMatch.index))) {
      dark.set(k, v);
    }
  }

  return { light, dark };
}

/* ── Token Lookup Helpers ────────────────────────────────────────────── */

function getColor(vars, cssName) {
  return vars.get(cssName) ?? null;
}

function getLabel(vars, cssName) {
  const raw = vars.get(cssName);
  if (!raw) return null;
  // CSS stores as "quoted string" — strip quotes
  return raw.replace(/^["']|["']$/g, "");
}

function getNumeric(vars, cssName) {
  const raw = vars.get(cssName);
  if (!raw) return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

function getString(vars, cssName) {
  return vars.get(cssName) ?? null;
}

/**
 * Get a font-family value, normalizing CSS double-quotes to single-quotes
 * for consistency with JS/TS convention.
 */
function getFontFamily(vars, cssName) {
  const raw = vars.get(cssName);
  if (!raw) return null;
  return raw.replace(/"/g, "'");
}

/* ── Code Generator ──────────────────────────────────────────────────── */

function generateTs(vars) {
  // Helper: format a Token<string> literal
  const t = (value, description) =>
    `{ value: ${JSON.stringify(value)}, description: ${JSON.stringify(description)} }`;

  // Helper: format a Token<number> literal
  const tn = (value, description) =>
    `{ value: ${value}, description: ${JSON.stringify(description)} }`;

  // Read values from CSS vars with fallbacks matching current _tokens.ts
  const surface = {
    critical: getColor(vars, "color-surface-critical") ?? "#ffe8e8",
    warning: getColor(vars, "color-surface-warning") ?? "#fff7e0",
    info: getColor(vars, "color-surface-info") ?? "#e8f4ff",
    muted: getColor(vars, "color-surface-muted") ?? "#f1f2f4",
    neutral: getColor(vars, "color-surface-neutral") ?? "#f1f2f4",
  };

  const indicator = {
    critical: getColor(vars, "color-indicator-critical") ?? "#E53935",
    warning: getColor(vars, "color-indicator-warning") ?? "#F0B400",
    info: getColor(vars, "color-indicator-info") ?? "#296CF2",
    muted: getColor(vars, "color-indicator-muted") ?? "#757575",
    neutral: getColor(vars, "color-indicator-neutral") ?? "#757575",
  };

  const text = {
    primary: getColor(vars, "color-text-primary") ?? "#222",
    secondary: getColor(vars, "color-text-secondary") ?? "#4c4c4c",
    tertiary: getColor(vars, "color-text-tertiary") ?? "#757575",
    disabled: getColor(vars, "color-text-disabled") ?? "#adadad",
  };

  const label = {
    critical: getLabel(vars, "label-critical") ?? "고활용",
    warning: getLabel(vars, "label-warning") ?? "활용",
    info: getLabel(vars, "label-info") ?? "저활용",
    muted: getLabel(vars, "label-muted") ?? "완전 유휴",
    neutral: getLabel(vars, "label-neutral") ?? "",
  };

  const fontFamily = {
    korean: getFontFamily(vars, "font-family-korean") ?? "'Noto Sans', 'Noto Sans KR', sans-serif",
    numeric: getFontFamily(vars, "font-family-numeric") ?? "Roboto, 'Noto Sans', sans-serif",
  };

  const fontSize = {
    chart: getString(vars, "text-chart") ?? "9px",
    xs: getString(vars, "text-xs") ?? "10px",
    sm: getString(vars, "text-sm") ?? "11px",
    base: getString(vars, "text-base") ?? "12px",
    md: getString(vars, "text-md") ?? "13px",
    lg: getString(vars, "text-lg") ?? "14px",
    xl: getString(vars, "text-xl") ?? "16px",
    "2xl": getString(vars, "text-2xl") ?? "20px",
    "3xl": getString(vars, "text-3xl") ?? "24px",
    "4xl": getString(vars, "text-4xl") ?? "32px",
    "5xl": getString(vars, "text-5xl") ?? "48px",
  };

  const fontWeight = {
    regular: getNumeric(vars, "font-weight-regular") ?? 400,
    medium: getNumeric(vars, "font-weight-medium") ?? 500,
    bold: getNumeric(vars, "font-weight-bold") ?? 700,
  };

  const lineHeight = {
    none: getNumeric(vars, "leading-none") ?? 1.0,
    tight: getNumeric(vars, "leading-tight") ?? 1.2,
    snug: getNumeric(vars, "leading-snug") ?? 1.3,
    normal: getNumeric(vars, "leading-normal") ?? 1.4,
    relaxed: getNumeric(vars, "leading-relaxed") ?? 1.5,
    loose: getNumeric(vars, "leading-loose") ?? 1.6,
  };

  const tracking = {
    display: getString(vars, "tracking-display") ?? "-0.3px",
    metric: getString(vars, "tracking-metric") ?? "-0.2px",
    default: getString(vars, "tracking-default") ?? "-0.1px",
    caps: getString(vars, "tracking-caps") ?? "0.3px",
  };

  return `// AUTO-GENERATED from tokens.css — do not edit manually. Run: node scripts/generate-tokens.mjs

/**
 * Denyx AI Prototype — Widget Design Tokens.
 *
 * AI 위젯/메시지 카드/차트에서 의미를 전달하는 색상·라벨·폰트의 단일 출처.
 *
 * ## 구조
 *
 * \`\`\`
 * tokens
 * \u251C\u2500 color
 * \u2502  \u251C\u2500 surface.<intent>   \u2500 카드/패널 배경 (낮은 채도)
 * \u2502  \u2514\u2500 indicator.<intent> \u2500 도트/스트로크/강조 (높은 채도)
 * \u251C\u2500 label.<intent>        \u2500 분류 배지의 기본 한국어 라벨
 * \u2514\u2500 font.family.<role>    \u2500 폰트 패밀리 stack
 * \`\`\`
 *
 * 각 토큰은 \`{ value, description }\` 형태 — \`value\` 는 실제 적용값, \`description\` 은
 * AI agent / 사람이 이해 가능한 사용 의도. JSDoc 으로 IDE hover 에서도 동일 정보 노출.
 *
 * ## Semantic intent
 *
 * | intent     | 의미                              | 색 계열   |
 * |------------|-----------------------------------|-----------|
 * | \`critical\` | 시급한 문제 · 실패 · 이상치       | 빨강      |
 * | \`warning\`  | 주의 · 경계 · 주변값              | 노랑/주황 |
 * | \`info\`     | 안내 · 정상 · 정보 전달           | 파랑      |
 * | \`muted\`    | 비활성 · idle · 중립 컨테이너      | 회색      |
 * | \`neutral\`  | 강조 없는 기본 (placeholder 격)    | 회색      |
 *
 * ## Backward compat
 *
 * 구 이름 (\`Tone="high"/"mid"/"low"/"idle"/"neutral"\`, \`TONE_BG\`/\`TONE_DOT\`/\`TONE_LABEL\`,
 * \`WIDGET_FONT_KO\`/\`WIDGET_FONT_NUM\`) 은 @deprecated 로 유지 — 기존 callsite 무중단.
 * 신규 코드는 \`tokens.color.surface.critical.value\` 같은 의미 경로 사용 권장.
 *
 * ## 사용 규칙
 *
 * 1. 인라인 색상 리터럴 (#xxx, rgba(...)) 컴포넌트 안에 직접 쓰지 말 것 — 토큰만 사용.
 * 2. 새 의미 색이 필요하면 토큰을 먼저 추가하고 컴포넌트가 그 토큰을 참조하도록.
 * 3. \`description\` 필드는 사용 시 변경 금지 — 변경 시 카탈로그 (\`packages/design-system/docs/tokens.md\`) 동시 업데이트.
 */

/* ─── Types ─────────────────────────────────────────── */

/**
 * SemanticIntent — 색상이 전달하는 의미. 신규 코드 권장.
 *
 * 매핑: critical=시급/위험, warning=주의, info=안내/정상, muted=비활성, neutral=기본
 */
export type SemanticIntent = "critical" | "warning" | "info" | "muted" | "neutral";

/**
 * LegacyTone — \`Tone\` 타입의 구 이름. 새로 작성하는 코드에서는 SemanticIntent 사용 권장.
 *
 * 매핑: high\u2192critical, mid\u2192warning, low\u2192info, idle\u2192muted, neutral\u2192neutral
 */
export type LegacyTone = "high" | "mid" | "low" | "idle";

/**
 * Tone — 위젯 컴포넌트의 톤 prop 타입. SemanticIntent 와 LegacyTone 모두 수용.
 *
 * 신규 호출처는 의미 명시되는 이름 (\`critical\`/\`warning\`/\`info\`/\`muted\`/\`neutral\`) 권장.
 * 기존 callsite (high/mid/low/idle) 은 그대로 동작 — 점진 마이그레이션.
 */
export type Tone = SemanticIntent | LegacyTone;

/**
 * Token<V> — 디자인 토큰 단위.
 *
 * - \`value\`: 실제 적용값 (CSS color, font-family stack 등)
 * - \`description\`: AI/사람이 이해 가능한 한 줄 사용 의도
 */
export interface Token<V = string> {
  readonly value: V;
  readonly description: string;
}

/* ─── Tokens ────────────────────────────────────────── */

/**
 * 디자인 토큰 단일 출처. 모든 위젯·카드·차트가 이 객체를 참조해야 합니다.
 */
export const tokens = {
  color: {
    /** 카드/패널의 배경 — 낮은 채도, 콘텐츠 가독성 보장. */
    surface: {
      critical: ${t(surface.critical, "Critical 톤 카드 배경 — 시급한 문제·실패·이상치 메시지 컨테이너.")},
      warning: ${t(surface.warning, "Warning 톤 카드 배경 — 주의·경계가 필요한 메시지.")},
      info: ${t(surface.info, "Info 톤 카드 배경 — 안내·정상·정보 전달 메시지.")},
      muted: ${t(surface.muted, "Muted 톤 카드 배경 — 비활성·idle 컨테이너.")},
      neutral: ${t(surface.neutral, "Neutral 톤 카드 배경 — 강조 없는 기본 placeholder.")},
    },
    /** 도트, 스트로크, 강조 — 높은 채도, 시각 신호. */
    indicator: {
      critical: ${t(indicator.critical, "Critical 톤 indicator — 위험·이상치 도트/스트로크/차트 강조선.")},
      warning: ${t(indicator.warning, "Warning 톤 indicator — 경고 도트/스트로크/차트 강조선.")},
      info: ${t(indicator.info, "Info 톤 indicator — 정보·안내 도트/스트로크/차트 강조선.")},
      muted: ${t(indicator.muted, "Muted 톤 indicator — 비활성 도트/스트로크.")},
      neutral: ${t(indicator.neutral, "Neutral 톤 indicator — 기본 회색 도트/스트로크.")},
    },
    /**
     * 텍스트 색 hierarchy — 시각적 위계 4 단계.
     *
     * 본문 텍스트가 가장 흔하므로 primary 가 다른 색보다 압도적으로 많이 쓰임 (154 회).
     * 인라인 hex 리터럴 대신 이 토큰을 참조.
     */
    text: {
      primary: ${t(text.primary, "본문 default · 헤딩 · 강조 텍스트. 가장 흔한 텍스트 색.")},
      secondary: ${t(text.secondary, "보조 본문 · dim 텍스트 · sub-section 본문.")},
      tertiary: ${t(text.tertiary, "라벨 · 메타 · placeholder · 캡션 부속 정보.")},
      disabled: ${t(text.disabled, "비활성 상태 텍스트 · 사용 불가 항목 표시.")},
    },
  },
  /** 분류 배지의 기본 한국어 라벨. AiToneBadge 등에서 톤 → 텍스트 매핑. */
  label: {
    critical: ${t(label.critical, "Critical 톤 배지의 기본 라벨 — GPU/리소스 분석 시나리오의 고활용군.")},
    warning: ${t(label.warning, "Warning 톤 배지의 기본 라벨 — 보통 수준의 활용군.")},
    info: ${t(label.info, "Info 톤 배지의 기본 라벨 — 저활용군 / 최적화 후보.")},
    muted: ${t(label.muted, "Muted 톤 배지의 기본 라벨 — 완전히 사용되지 않는 자원.")},
    neutral: ${t(label.neutral, "Neutral 톤 — 기본값으로 라벨 표기 없음.")},
  },
  font: {
    /** 폰트 패밀리 stack — 본문/숫자 역할 분리. */
    family: {
      korean: ${t(fontFamily.korean, "한국어 본문 — 위젯 카드 내 메시지·라벨·제목. Latin glyph 도 Noto Sans 가 처리.")},
      numeric: ${t(fontFamily.numeric, "숫자·메트릭 — 차트 라벨, 테이블의 numeric 컬럼, 통계 강조 숫자에 사용.")},
    },
    /**
     * Type Scale — Hybrid (Dense 1px 정밀 + Display 2배수 인접).
     *
     * Dense (9~14px) — 정보 밀도 보존, 1px 단위. dashboard UI 핵심 영역.
     * Display (16~48px) — 강조·페이지 레벨, 4~16px 간격.
     */
    size: {
      chart: ${t(fontSize.chart, "SVG 차트 텍스트 (axis label · peak 라벨). 단위 명시 필수.")},
      xs: ${t(fontSize.xs, "DataTable compact 헤더 · AiToneBadge 텍스트 · dim 메타.")},
      sm: ${t(fontSize.sm, "AiCaption (uppercase) · compact 테이블 셀 · sidebar 보조.")},
      base: ${t(fontSize.base, "본문 default — AiBulletList sm · step label · 옵션바 본문. 가장 흔한 본문 사이즈.")},
      md: ${t(fontSize.md, "AiSectionHeading · DataTable default · Toast · AiUserBubble · AiBulletList md.")},
      lg: ${t(fontSize.lg, "AiCard 큰 헤더 · LiveTimerCompact digit · DashboardBuildingProgress title.")},
      xl: ${t(fontSize.xl, "Sub-display · marketing 타이틀 보조 사이즈.")},
      "2xl": ${t(fontSize["2xl"], "PageHeader title — 사실상 페이지 레벨 표준 사이즈.")},
      "3xl": ${t(fontSize["3xl"], "Stage 슬라이드 헤딩 · marketing 데모 화면 강조 텍스트.")},
      "4xl": ${t(fontSize["4xl"], "Stage 대형 메시지 · 풀스크린 디스플레이 강조.")},
      "5xl": ${t(fontSize["5xl"], "Stage 풀스크린 hero · marketing 최대 강조 (rare).")},
    },
    /**
     * Font Weight — 3 단계. 한국어 본문 가독성 균형.
     */
    weight: {
      regular: ${tn(fontWeight.regular, "본문 default — 모든 일반 텍스트. 109+ callsite.")},
      medium: ${tn(fontWeight.medium, "강조 — PageHeader title · LIVE 라벨 · AiToneBadge 텍스트.")},
      bold: ${tn(fontWeight.bold, "강한 강조 — AiCaption · AiSectionHeading · metric 숫자.")},
    },
    /**
     * Line-Height — 6 단계. leading-none 이 압도적으로 흔함 (단일 라인 카드/배지).
     */
    lineHeight: {
      none: ${tn(lineHeight.none, "leading-none — 단일 라인 (배지 · 헤딩 · 카드 헤더). 175+ callsite, 가장 흔함.")},
      tight: ${tn(lineHeight.tight, "매우 압축된 본문 (드문 사용).")},
      snug: ${tn(lineHeight.snug, "compact 테이블 row · 옵션바 본문.")},
      normal: ${tn(lineHeight.normal, "default 본문 · 섹션 헤딩 본문. 두 번째로 흔한 라인 하이트.")},
      relaxed: ${tn(lineHeight.relaxed, "AiBulletList small · sub-section 본문.")},
      loose: ${tn(lineHeight.loose, "긴 본문 단락 (drop-down 안내 · 도움말 텍스트).")},
    },
    /**
     * Tracking (Letter-Spacing) — 4 단계.
     *
     * Note: 한국어 디자인 시스템에서 \`-0.1px\` 가 default 인 이유는 Noto Sans KR 의
     * letter-spacing 이 살짝 넓어 한국어가 분리되어 보이는 현상을 보정하기 위함.
     */
    tracking: {
      display: ${t(tracking.display, "대형 페이지 타이틀 (20px+) 의 시각 균형 보정.")},
      metric: ${t(tracking.metric, "Roboto numeric digit 의 가독성 보정 — LiveTimer 등.")},
      default: ${t(tracking.default, "한국어 본문 사실상 표준 — 159+ callsite. 새 본문 텍스트의 기본.")},
      caps: ${t(tracking.caps, "uppercase caption (REASONING / COST ANALYSIS 등) — 가시성 보정.")},
    },
    /**
     * Named Typography Patterns — 의도 기반 lookup.
     *
     * 자주 사용되는 조합을 named pattern 으로 토큰화. AI agent 가 "section heading 만들어줘"
     * 했을 때 정확한 조합을 매칭. 각 pattern 은 family/size/weight/lineHeight/tracking 의 조합.
     */
    pattern: {
      pageTitle: {
        value: { family: "korean", size: "2xl", weight: "medium", lineHeight: "none", tracking: "display" },
        description: "PageHeader 페이지 타이틀 — 20px Medium / -0.3px / leading-none / korean.",
      },
      sectionHeading: {
        value: { family: "korean", size: "md", weight: "bold", lineHeight: "normal", tracking: "default" },
        description: "AiSectionHeading 카드 헤딩 — 13px Bold / -0.1px / 1.4 / korean.",
      },
      caption: {
        value: { family: "korean", size: "sm", weight: "bold", lineHeight: "none", tracking: "caps", transform: "uppercase" },
        description: "AiCaption sub-section 라벨 — 11px Bold uppercase / 0.3px / leading-none / korean.",
      },
      body: {
        value: { family: "korean", size: "md", weight: "regular", lineHeight: "normal", tracking: "default" },
        description: "default 본문 — 13px Regular / -0.1px / 1.4 / korean. AiBulletList md · AiUserBubble.",
      },
      bodySmall: {
        value: { family: "korean", size: "base", weight: "regular", lineHeight: "relaxed", tracking: "default" },
        description: "본문 작은 사이즈 — 12px Regular / -0.1px / 1.5 / korean. AiBulletList sm · dim 본문.",
      },
      label: {
        value: { family: "korean", size: "xs", weight: "medium", lineHeight: "none", tracking: "default" },
        description: "작은 라벨 — 10px Medium / -0.1px / leading-none / korean. AiToneBadge text.",
      },
      metric: {
        value: { family: "numeric", size: "lg", weight: "bold", lineHeight: "none", tracking: "metric" },
        description: "강조 metric 숫자 — 14px Bold / -0.2px / leading-none / numeric. LiveTimer · AiMigPlan total.",
      },
      chartLabel: {
        value: { family: "numeric", size: "chart", weight: "regular", lineHeight: "none", tracking: "default" },
        description: "SVG 차트 axis/peak 라벨 — 9px Regular / leading-none / numeric.",
      },
      tableHeaderCompact: {
        value: { family: "korean", size: "xs", weight: "bold", lineHeight: "none", tracking: "default" },
        description: "DataTable compact 헤더 — 10px Bold / -0.1px / leading-none / korean.",
      },
      tableCellCompact: {
        value: { family: "korean", size: "sm", weight: "regular", lineHeight: "snug", tracking: "default" },
        description: "DataTable compact 셀 (numeric 컬럼은 family numeric) — 11px Regular / -0.1px / 1.3 / korean.",
      },
    },
  },
} as const;

/* ─── Backward compat aliases (deprecated) ──────────── */
/* 기존 callsite 보호용. 단계적으로 새 경로 (tokens.*) 로 마이그레이션. */

/**
 * @deprecated \`tokens.color.surface[intent].value\` 사용 권장.
 * 옛 키 (high/mid/low/idle) 와 새 키 (critical/warning/info/muted/neutral) 모두 수용.
 */
export const TONE_BG: Record<Tone, string> = {
  // 구 이름 → 새 값
  high: tokens.color.surface.critical.value,
  mid: tokens.color.surface.warning.value,
  low: tokens.color.surface.info.value,
  idle: tokens.color.surface.muted.value,
  // 새 이름 (동의어로 같이 노출)
  critical: tokens.color.surface.critical.value,
  warning: tokens.color.surface.warning.value,
  info: tokens.color.surface.info.value,
  muted: tokens.color.surface.muted.value,
  neutral: tokens.color.surface.neutral.value,
};

/**
 * @deprecated \`tokens.color.indicator[intent].value\` 사용 권장.
 */
export const TONE_DOT: Record<Tone, string> = {
  high: tokens.color.indicator.critical.value,
  mid: tokens.color.indicator.warning.value,
  low: tokens.color.indicator.info.value,
  idle: tokens.color.indicator.muted.value,
  critical: tokens.color.indicator.critical.value,
  warning: tokens.color.indicator.warning.value,
  info: tokens.color.indicator.info.value,
  muted: tokens.color.indicator.muted.value,
  neutral: tokens.color.indicator.neutral.value,
};

/**
 * @deprecated \`tokens.label[intent].value\` 사용 권장.
 */
export const TONE_LABEL: Record<Tone, string> = {
  high: tokens.label.critical.value,
  mid: tokens.label.warning.value,
  low: tokens.label.info.value,
  idle: tokens.label.muted.value,
  critical: tokens.label.critical.value,
  warning: tokens.label.warning.value,
  info: tokens.label.info.value,
  muted: tokens.label.muted.value,
  neutral: tokens.label.neutral.value,
};

/** @deprecated \`tokens.font.family.korean.value\` 사용 권장. */
export const WIDGET_FONT_KO = tokens.font.family.korean.value;

/** @deprecated \`tokens.font.family.numeric.value\` 사용 권장. */
export const WIDGET_FONT_NUM = tokens.font.family.numeric.value;
`;

  return output;
}

/* ── Main ─────────────────────────────────────────────────────────────── */

/** @import 를 해석하여 단일 CSS 문자열로 합본 */
function resolveImports(filePath) {
  const src = readFileSync(filePath, "utf-8");
  return src.replace(/@import\s+['"]([^'"]+)['"]\s*;/g, (_, rel) => {
    const resolved = resolve(dirname(filePath), rel);
    if (existsSync(resolved)) return readFileSync(resolved, "utf-8");
    return "";
  });
}

const css = resolveImports(TOKENS_CSS);
const { light } = parseCssVars(css);

const output = generateTs(light);
writeFileSync(OUTPUT, output, "utf-8");
console.log(`[generate-tokens] wrote ${OUTPUT}`);

// --check mode: verify no diff
if (process.argv.includes("--check")) {
  const { execSync } = await import("node:child_process");
  try {
    execSync(`git diff --exit-code ${OUTPUT}`, { stdio: "inherit" });
    console.log("[generate-tokens] OK — no drift detected.");
  } catch {
    console.error("[generate-tokens] DRIFT DETECTED — _tokens.ts differs from tokens.css. Run: node scripts/generate-tokens.mjs");
    process.exit(1);
  }
}
