# Tokens

> 원본: `src/widget/_tokens.ts` (위젯 Tone 토큰). 색·타입 등 메인 토큰의 단일 출처는 `src/tokens.css` 의 `:root` (순수 CSS, Tailwind 없음).

위젯 안에서 분류/상태 색상이 필요한 **모든** 컴포넌트는 이 토큰을 사용합니다. 인라인 색상 리터럴(`#E53935` 등)을 컴포넌트 내부에 적지 마세요 — 토큰을 추가하거나 기존 톤을 재사용하세요.

## Tone

분류/심각도/우선순위를 표현하는 5단계 시맨틱 토큰입니다.

```ts
export type Tone = "high" | "mid" | "low" | "idle" | "neutral";
```

| Tone | 의미 | 한국어 라벨 (`TONE_LABEL`) | 도트 (`TONE_DOT`) | 배경 (`TONE_BG`) |
|---|---|---|---|---|
| `high` | 고활용 / 위험 / 즉시 조치 | 고활용 | `#E53935` | `#ffe8e8` |
| `mid` | 활용 / 경고 | 활용 | `#F0B400` | `#fff7e0` |
| `low` | 저활용 / 정보 / 권장 | 저활용 | `#296CF2` | `#e8f4ff` |
| `idle` | 완전 유휴 / 비활성 | 완전 유휴 | `#757575` | `#f1f2f4` |
| `neutral` | 분류 없음 (라벨 비표시) | _(빈 문자열)_ | `#757575` | `#f1f2f4` |

**언제 어떤 톤?**

- `high` — 사용자에게 행동을 요구하는 경우 (잘못된 인덱스, 절감 대상 GPU, 알람 위반)
- `mid` — 모니터링 가치는 있지만 즉시 조치 불필요
- `low` — 분류상 "낮은" 그룹, 또는 정보/링크
- `idle` — "쓰지 않는" 자원의 정량적 표현
- `neutral` — 분류 자체가 의미 없는 행(합계, 캡션 행)

## Typography

타이포그래피 토큰은 `tokens.font.*` 네임스페이스 — **11 size · 3 weight · 6 line-height · 4 tracking · 10 named pattern** + family 2종.

### 폰트 패밀리

```ts
tokens.font.family.korean.value   // 'Noto Sans', 'Noto Sans KR', sans-serif
tokens.font.family.numeric.value  // Roboto, 'Noto Sans', sans-serif
```

- `korean` — 위젯 본문, 헤딩, 라벨 (한국어 + 영문 혼합)
- `numeric` — 숫자 강조 (지표값, 비용, 카운트). 가독성을 위해 의도적으로 라틴 폰트 사용.

**`font-korean` 유틸에만 의존하지 말고 `style={{ fontFamily: tokens.font.family.korean.value }}`를 명시하세요.** 기본 sans 스택은 OS 폰트에 의존하므로 macOS와 Windows에서 다르게 보입니다. 위젯의 일관성을 위해 토큰을 직접 주입합니다.

> `WIDGET_FONT_KO`/`WIDGET_FONT_NUM` 은 `@deprecated` alias 로 backward-compat 유지.

### Type Scale (Hybrid — Dense 1px + Display 2배수 인접)

| 토큰 | 크기 | 영역 | 의도·용도 |
|---|---:|---|---|
| `chart` | 9px | Dense | SVG 차트 텍스트 (axis · peak 라벨, 단위 명시 필수) |
| `xs` | 10px | Dense | DataTable compact 헤더, AiToneBadge 텍스트, dim 메타 |
| `sm` | 11px | Dense | AiCaption (uppercase), compact 테이블 셀, sidebar 보조 |
| `base` | 12px | Dense | 본문 default — 가장 흔한 본문 사이즈 (117 회) ⭐ |
| `md` | 13px | Dense | AiSectionHeading, DataTable default, Toast, AiUserBubble |
| `lg` | 14px | Dense | AiCard 큰 헤더, LiveTimerCompact digit |
| `xl` | 16px | Display | Sub-display, marketing 타이틀 보조 |
| `2xl` | 20px | Display | PageHeader title — 사실상 페이지 레벨 표준 |
| `3xl` | 24px | Display | Stage 슬라이드 헤딩, marketing 데모 화면 강조 |
| `4xl` | 32px | Display | Stage 대형 메시지, 풀스크린 디스플레이 강조 |
| `5xl` | 48px | Display | Stage 풀스크린 hero, marketing 최대 강조 |

Dense(9~14)는 1px 정밀로 정보 밀도 보존, Display(16+)는 4~16px 간격으로 인접 2배수에 가까운 통합.

### Font Weight — 3 단계

```ts
tokens.font.weight.regular.value  // 400 — 본문 default (109+ callsite)
tokens.font.weight.medium.value   // 500 — 강조 (PageHeader · LIVE · AiToneBadge)
tokens.font.weight.bold.value     // 700 — 강한 강조 (Caption · SectionHeading · metric)
```

### Line-Height — 6 단계

| 토큰 | 값 | 사용 |
|---|---:|---|
| `none` | 1.0 | 단일 라인 (배지 · 헤딩 · 카드 헤더) — 175+ 회, 가장 흔함 ⭐ |
| `tight` | 1.2 | 매우 압축된 본문 |
| `snug` | 1.3 | compact 테이블 row, 옵션바 |
| `normal` | 1.4 | default 본문, 섹션 헤딩 본문 |
| `relaxed` | 1.5 | AiBulletList small, sub-section 본문 |
| `loose` | 1.6 | 긴 본문 단락 |

### Tracking (Letter-Spacing) — 4 단계

| 토큰 | 값 | 사용 |
|---|---:|---|
| `display` | -0.3px | 대형 페이지 타이틀 20px+ |
| `metric` | -0.2px | Roboto numeric digit (LiveTimer 등) |
| `default` | -0.1px | 한국어 본문 사실상 표준 — 159+ callsite ⭐ |
| `caps` | 0.3px | uppercase caption (REASONING 등) |

> 한국어 디자인 시스템에서 `-0.1px` 가 default 인 이유는 Noto Sans KR 의 letter-spacing 이 살짝 넓어 한국어가 분리되어 보이는 현상을 보정하기 위함.

### Named Typography Patterns — 10 종

자주 사용되는 family/size/weight/lineHeight/tracking 조합을 named pattern 으로 토큰화. AI agent 가 의도 명시된 lookup 가능.

| 패턴 | 조합 | 사용 위치 |
|---|---|---|
| `pageTitle` | korean · 2xl(20px) · medium · none · display | PageHeader title |
| `sectionHeading` | korean · md(13px) · bold · normal · default | AiSectionHeading |
| `caption` | korean · sm(11px) · bold · none · caps · uppercase | AiCaption |
| `body` | korean · md(13px) · regular · normal · default | AiBulletList md · AiUserBubble |
| `bodySmall` | korean · base(12px) · regular · relaxed · default | AiBulletList sm · dim 본문 |
| `label` | korean · xs(10px) · medium · none · default | AiToneBadge text |
| `metric` | **numeric** · lg(14px) · bold · none · metric | LiveTimer digit · AiMigPlan total · KPI |
| `chartLabel` | **numeric** · chart(9px) · regular · none · default | MiniLineChart axis · peak |
| `tableHeaderCompact` | korean · xs(10px) · bold · none · default | DataTable compact 헤더 |
| `tableCellCompact` | korean · sm(11px) · regular · snug · default | DataTable compact 셀 |

### Korean vs Numeric 폰트 선택 가이드

| Context | family | 이유 |
|---|---|---|
| 한국어 본문, 라벨, 헤딩 | `korean` | 한국어 + Latin 혼용 시 baseline 일치 |
| Mixed 한국어 + 영문 텍스트 | `korean` | Noto Sans 가 Latin glyph 도 처리 |
| SVG 차트 axis · peak 라벨 | `numeric` | 숫자 가독성 + 등폭 비례 우수 |
| DataTable numeric 컬럼 | `numeric` | 자릿수 정렬 정확 |
| 시계 · 타이머 digit (LIVE) | `numeric` | 모노스페이스 느낌, digit 흔들림 없음 |
| 큰 metric 숫자 (₩, %, count) | `numeric` | AiMigPlan total · KPI 카드 |
| ISO date · hex 색상 코드 | `numeric` | 한국어 텍스트와 시각 구분 |

## Text Color Hierarchy

`tokens.color.text.*` — 텍스트 시각 위계 4 단계.

```ts
tokens.color.text.primary.value    // #222    — 본문 default, 헤딩 (154 회) ⭐
tokens.color.text.secondary.value  // #4c4c4c — 보조 본문, dim 텍스트 (75 회)
tokens.color.text.tertiary.value   // #757575 — 라벨, 메타, placeholder (63 회)
tokens.color.text.disabled.value   // #adadad — 비활성 상태 텍스트 (6 회)
```

본문이 압도적으로 흔하므로 `primary` 가 다른 색을 합친 것보다 많이 쓰임 — 위계 4 단계로 충분.

## Primary · Accent (Semantic) — 일반 작명 리네이밍 (2026-07-06)

도메인명(`denyx`)·색상값(`blue`)이 토큰명에 노출되던 것을 일반(General) 작명으로 전환. 값 변경 없음(비파괴) — 구명은 `var()` alias 로 유지 (`/* @deprecated */`, 최소 2주 후 제거).

| 신규 (표준) | 값 (light) | 구명 (@deprecated alias) | 용도 |
|---|---|---|---|
| `--color-primary` | `#296CF2` | `--color-brand-blue` | 주요 강조 — AI 버튼 · 링크 · 강조 |
| `--color-primary-strong` | `#1B5CD9` | `--color-brand-blue-deep` | hover 강조 (dark: `#7FB0FF`) |
| `--color-primary-soft` | `#3DA9FF` | `--color-brand-blue-soft` | 옅은 강조 — MiniLineChart 기본 라인 |
| `--color-primary-bg` | `#D6E1FF` | `--color-brand-blue-bg` | 강조 배경 — active 카드 (dark: `#1C2A46`) |
| `--color-primary-bg-subtle` | `#C2D5FC` | `--color-brand-blue-bg-2` | 강조 배경 변형 (dark: `#233357`) |
| `--color-accent-start` | `#004BE0` | `--color-denyx-blue` | AI 그라데이션 시작 |
| `--color-accent` | `#8B52FF` | `--color-denyx-purple` | AI 그라데이션 중간 — pinwheel 강조 |
| `--color-accent-deep` | `#4F5BD5` | `--color-denyx-purple-deep` | AI 그라데이션 deep variant |

- 신규 코드는 **신규 토큰명만** 참조. 구명 신규 사용 금지.
- 유틸 클래스명(`text-brand-blue`·`bg-var-color-brand-blue-bg` 등)은 소비자 API 이므로 유지 — 내부 정의만 신규 토큰을 참조. (`text-primary` 는 텍스트 위계 클래스와 충돌하므로 클래스 리네이밍 불가)
- `--gradient-brand` 는 `var(--color-primary) → var(--color-accent)` 조합으로 갱신.
- `.dark` 오버라이드는 신규 토큰명 기준 — 구명 alias 는 `var()` 체인으로 자동 추종.

## Layout Scale — Spacing · Radius · Shadow (Global tier)

2026-07-02 신설 (`docs/DS-ENHANCEMENT-PLAN.md` §2.1~2.3). `pnpm audit:tokens` 실측 빈도 기반.
기존 유틸 클래스(`gap-6px`·`rounded-4px` 등)는 값 유지(비파괴) — **신규 컴포넌트의 인라인 스타일부터 토큰 참조**.

### Spacing — 9 단계

| 토큰 | 값 | 실측 빈도 |
|---|---:|---:|
| `--spacing-2xs` | 2px | ×20 |
| `--spacing-xs` | 4px | ×49 |
| `--spacing-sm` | 6px | ×57 ⭐ |
| `--spacing-md` | 8px | ×54 |
| `--spacing-lg` | 12px | ×16 |
| `--spacing-xl` | 16px | ×23 |
| `--spacing-2xl` | 20px | — |
| `--spacing-3xl` | 24px | — |
| `--spacing-4xl` | 32px | — |

10px(×11)·14px(×5)는 스케일 외 실측값 — 기존 유틸은 유지하되 신규 사용 시 인접 스케일 우선.

### Radius — 6 단계 + full

| 토큰 | 값 | 용도 |
|---|---:|---|
| `--radius-xs` | 2px | 마이크로 요소 (인디케이터·미니 칩) |
| `--radius-sm` | 4px | 버튼·칩·입력 등 기본 컨트롤 ⭐ (×22) |
| `--radius-md` | 6px | 카드 내부 블록 (구 `0.375rem` 과 동치) |
| `--radius-lg` | 8px | 카드·패널·드롭다운 (구 `0.5rem` 과 동치) |
| `--radius-xl` | 12px | 대형 패널 (구 `0.75rem` 과 동치) |
| `--radius-2xl` | 24px | 위젯 셸·풀 라운드 컨테이너 |
| `--radius-full` | 9999px | pill·원형 |

3px 등 스케일 사이 미세값은 토큰화하지 않음 — allowlist (거버넌스 §3.3 참조).

### Shadow / Elevation — 3 단계

| 토큰 | 값 | 용도 |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.25)` | 컨트롤 (Switch thumb 등) |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.12)` | 드롭다운·팝오버·토스트 |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | 모달·다이얼로그 |

유틸: `rounded-xs/sm/md/lg/xl/2xl/full` · `shadow-sm/md/lg` (denyx-ds.css). 인라인은 `var(--radius-*)` / `var(--shadow-*)`.

## 토큰 거버넌스

토큰 추가·수정·삭제의 명문화된 절차 (DS-ENHANCEMENT-PLAN §3). 기존 🔒 불변 정책(DS repo에서만 수정)의 보강 레이어.

### 변경 프로세스

| 작업 | 절차 |
|---|---|
| **추가** | 실사용 **3곳 이상** 근거 (grep 결과 첨부) + 계층(Global/Semantic) 명시 + 본 문서 동기 |
| **수정** | 영향 범위 분석 (`grep` 전체 참조처) 첨부 + 시각 회귀(Chromatic) 확인 |
| **삭제** | 최소 2주 deprecation — 주석 `/* @deprecated → 대체토큰 */` 유지 후 제거 |

### 토큰화 기준

- **3곳 이상** 반복되는 값만 토큰화. 1~2회 값은 raw 허용 (스케일 오염 방지).
- 신규 토큰은 Semantic 우선 — Global 스케일 확장은 스케일 갭이 실측(`pnpm audit:tokens`)으로 증명될 때만.

### 허용 Raw 값 (Allowlist) — `pnpm lint:src` 예외

| 패턴 | 사유 |
|---|---|
| `0`, `"0 auto"`, `%`, `100vh/vw` | 제로·레이아웃 값 |
| `1px` 헤어라인 | 마이크로 조정 |
| 방향별 개별 라디우스 (`"20px 20px 0 0"`) | 조합 값 |
| 차트 palette (`--color-palette-*` 참조) | 시리즈 전용 Global (기존 정책) |
| 컬러 배경 위 `#fff` 전경 | 테마 무관 (기존 정책) |
| 라이브 번들 추출 CSS (`.ai-assistant-btn` 등) | 픽셀 일치 정책 (기존 정책) |

### 도구

| 명령 | 역할 |
|---|---|
| `pnpm audit:tokens` | 카테고리별 토큰 적용률 + raw 값 빈도 측정 (`--json` 지원) |
| `pnpm lint:src` | DS 소스 raw 값 유입 가드 — baseline(`scripts/lint-src-tokens-baseline.json`) 초과분만 실패. `pnpm check`에 포함 |

## 색상 — 토큰 외 hard-coded

토큰화되지 않은 색상은 거의 모두 chrome / 카드 외형에 한정됩니다. 자주 등장하는 것:

| 색 | 용도 |
|---|---|
| `#eaeaea` | AiCard 보더 (위젯 카드 공통) |
| `#f5f5f5` | AiUserBubble 배경 |
| `#222` | AiSectionHeading 텍스트 (제목) |
| `#4c4c4c` | AiBulletList 본문 텍스트 (sm) |
| `#757575` | AiCaption 텍스트, idle/neutral 도트 |
| `#3DA9FF` | MiniLineChart 기본 라인 색상 |

새 컴포넌트에서 이 회색들을 또 쓸 일이 자주 생긴다면 — `_tokens.ts`에 `NEUTRAL_*` 같은 토큰을 추가할 때입니다. 아직은 사용처가 적어 토큰화하지 않았습니다.

## 사용 예

```ts
import { TONE_BG, TONE_DOT, TONE_LABEL, WIDGET_FONT_KO, type Tone } from "@denyx/design-system/widget";

function Pill({ tone }: { tone: Tone }) {
  return (
    <span
      style={{ background: TONE_BG[tone], color: TONE_DOT[tone], fontFamily: WIDGET_FONT_KO }}
    >
      {TONE_LABEL[tone]}
    </span>
  );
}
```

대부분의 경우 직접 `TONE_*`를 import하기보다 [`primitives.md`](./primitives.md)의 `<AiToneBadge tone="high" />`나 `<AiSectionHeading tone="high">…</AiSectionHeading>`을 쓰면 됩니다. 토큰은 그 안에서 이미 적용됩니다.

## Do / Don't

✅ **Do**

- 새 색이 필요하면 `_tokens.ts`에 먼저 추가하고 컴포넌트에서 import
- 분류/상태 의미가 있다면 `Tone` 5단계 안에서 표현
- 한국어 화면이라도 숫자는 `WIDGET_FONT_NUM`

❌ **Don't**

- `style={{ color: "#E53935" }}` — 토큰의 우회
- `Tone`을 6단계 이상으로 확장 — 의미가 흐려져 디자인 결정이 어려워짐. 늘리기 전에 합칠 수 있는지 검토
- `TONE_BG['high']`를 도트로, `TONE_DOT['high']`를 배경으로 — 의미가 뒤바뀜
