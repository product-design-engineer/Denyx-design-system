#!/usr/bin/env node
/**
 * gate-roster — 가드레일 명부의 단일 원천.
 *
 * ## 여기에 적는 것 (유도할 수 없는 것만)
 *   id · name · status · invariant · prevents · 집행 수단(script | pipeline | justification)
 *
 * ## 여기에 적지 않는 것 (유도되는 것)
 *   - 어느 pnpm 스크립트가 부르는지 → package.json 에서 읽어 대조
 *   - 실제로 도는지 → pnpm check 체인에서 도달성 계산
 *   두 가지를 손으로 적으면 배선을 지워도 "자동"이 참으로 남는다.
 *
 * ## 집행 수단 — status "auto" 는 반드시 하나를 대야 한다
 *   - script      검사 스크립트 경로. pnpm 배선 도달성 검산.
 *   - pipeline     스크립트는 아니지만 pnpm 으로 도는 것(생성기 등). 도달성만 검산.
 *   - justification  위 둘 다 없을 때 왜 구조적으로 보장되는지 적는다. 빈칸이면 실패.
 *
 * Usage:
 *   node scripts/gate-roster.mjs              # roster export (다른 스크립트에서 import)
 *   node scripts/check-gates.mjs              # roster ↔ 실제 배선 검산
 */

/** @typedef {"auto"|"policy"|"planned"} Status */

export const GATE_ROSTER = [
  /* ── auto: pnpm check 에 배선된 자동 게이트 ─────────── */
  {
    id: "typecheck",
    name: "타입 체크",
    status: "auto",
    script: null,
    pipeline: "typecheck",
    invariant:
      "`tsc --noEmit` — export 타입 변경, prop 불일치, imports 맵에 없는 경로 감지.",
    prevents: "빌드는 통과하는 타입 오류 · exports 맵에 없는 import 경로",
  },
  {
    id: "raw-token-guard",
    name: "소스 내 raw 값 가드",
    status: "auto",
    script: "scripts/lint-src-tokens.mjs",
    pipeline: null,
    invariant:
      "src/ 하위 TSX 의 inline hex·raw px 유입 차단. raw-color/raw-font/raw-radius/raw-shadow/raw-spacing 5규칙. baseline ratchet (신규만 차단).",
    prevents: "토큰 우회 raw color · raw 값 유입 · 다크에서만 깨지는 컴포넌트",
  },
  {
    id: "docstring-standard",
    name: "docstring 4섹션 표준",
    status: "auto",
    script: "scripts/check-docstrings.mjs",
    pipeline: null,
    invariant:
      "컴포넌트 docstring = Purpose / When to use / When NOT to use / Composition rules + @example. Do/Don't 는 금지형 문장에서 자동 유도. 판정 대상은 docs/components.json (파싱 단일화).",
    prevents: "컴포넌트 오선택 · 사용 가이드 부재 · 규칙이 소스에만 있고 배달되지 않는 상태",
  },
  {
    id: "catalog-coverage",
    name: "공개 export 카탈로그 등재",
    status: "auto",
    script: "scripts/check-catalog-coverage.mjs",
    pipeline: null,
    invariant:
      "index.ts 로 공개 export 되는 컴포넌트는 story 또는 components.json 에 등재 필수. 타입 전용 export·상수·Provider/Context·아이콘은 제외.",
    prevents:
      "story 없어 docstring lint·시각 스냅샷·Chromatic 에서 동시에 빠지는 컴포넌트",
  },
  {
    id: "unit-test",
    name: "렌더 + 스냅샷 테스트",
    status: "auto",
    script: null,
    pipeline: "test",
    invariant:
      "Vitest — 컴포넌트 렌더 에러 + 의도치 않은 마크업 변경 감지.",
    prevents: "컴포넌트 렌더 깨짐 · 마크업 회귀",
  },

  {
    id: "token-docs",
    name: "토큰 의미 커버리지",
    status: "auto",
    script: "scripts/check-token-docs.mjs",
    pipeline: null,
    invariant:
      "tokens.css 의 모든 토큰 선언은 @role 주석 필수. @use/@avoid 선택, @group-role 상속. 판정 대상은 docs/tokens.json (파싱 단일화).",
    prevents: "설명 없는 토큰 — 도구가 용도를 답할 수 없어 소비자가 hex 를 적게 되는 상태",
  },

  /* ── auto: pnpm check 바깥이지만 자동 실행 ─────────── */
  {
    id: "token-single-source",
    name: "토큰 단일 출처",
    status: "auto",
    script: null,
    pipeline: "check:tokens",
    invariant:
      "tokens.css 가 유일한 출처. _tokens.ts 는 generate-tokens.mjs 로 자동 생성. check:tokens 로 drift 감지.",
    prevents: "토큰 분산/누락 · _tokens.ts 와 tokens.css 불일치",
  },
  {
    id: "catalog-build",
    name: "카탈로그 합본 생성",
    status: "auto",
    script: null,
    pipeline: "build:design",
    invariant:
      "build:design 이 components.json + DESIGN.md 자동 생성. storybook/build-storybook 직전 자동 실행.",
    prevents: "오래된 합본 · AI 컨텍스트 stale",
  },

  /* ── auto: 시각 회귀 ────────────────────────────────── */
  {
    id: "visual-regression",
    name: "시각 회귀",
    status: "auto",
    script: null,
    pipeline: "chromatic",
    invariant:
      "Chromatic — 픽셀 수준 UI 변경 감지. pnpm chromatic 으로 실행.",
    prevents: "색·표면·레이아웃 변경이 만든 시각 회귀",
  },

  /* ── policy: 사람 검토 / 구조적 보장 ────────────────── */
  {
    id: "no-tailwind",
    name: "Tailwind 미사용 · 일반 CSS",
    status: "policy",
    script: null,
    pipeline: null,
    justification:
      "denyx-ds.css 에 @layer·--tw-*·@property·escape 클래스명 없음. 의존성에 tailwind 없음. CLAUDE.md 가 Tailwind 재도입 금지를 명시.",
    invariant:
      "런타임 스타일은 외부 CSS 프레임워크 의존 없는 일반 CSS. Tailwind 흔적 0.",
    prevents: "Tailwind 재도입 · CSS 내 프레임워크 흔적",
  },
  {
    id: "ds-immutable",
    name: "DS 불변 정책 (역방향 수정 금지)",
    status: "policy",
    script: null,
    pipeline: null,
    justification:
      "소비 측 ds-override-guard.mjs + DsReadOnlyNotice 모달로 2중 시행. CLAUDE.md 불변 정책 섹션.",
    invariant:
      "모든 수정은 본 repo 에서만. 소비 측 override·재정의·monkey-patch·CSS 덮어쓰기 금지.",
    prevents: "소비자의 DS 컴포넌트/토큰 override",
  },
  {
    id: "inline-structure",
    name: "인라인 구조 금지 (컴포넌트 추출)",
    status: "policy",
    script: null,
    pipeline: null,
    justification:
      "CLAUDE.md 글로벌 정책. 23종 Parts 추출 완료. 코드 리뷰에서 시행.",
    invariant:
      "반복·의미 단위 구조는 컴포넌트로 추출. map 내 인라인 JSX 금지.",
    prevents: "인라인 구조 분산 · 재사용 불가 · story/docstring 누락",
  },
  {
    id: "chart-text-unit",
    name: "SVG 텍스트 단위 필수",
    status: "policy",
    script: null,
    pipeline: null,
    justification:
      "CLAUDE.md 정책. SVG <text fontSize> 에 px/pt 단위 명시. 코드 리뷰에서 시행.",
    invariant:
      "SVG text fontSize 는 '9px' 처럼 단위 명시 (unitless 금지).",
    prevents: "화면별 차트 텍스트 크기 변동",
  },
];
