# @denyx/design-system — 컴포넌트·디자인 시스템 정책

본 패키지는 Denyx-AI-Assistant 의 단일 컴포넌트 출처. Storybook 카탈로그 + tokens.css 단일 출처 + `exports` 로 `.` (Chrome) · `./widget` (AI 위젯) 분리.

## 디렉토리 구성

- `src/` — 컴포넌트 소스 + `tokens.css` + `widget/` (AI 컴포넌트)
- `stories/` — Storybook 카탈로그 (Foundation / Tokens / Primitives / Composite / Shell)
- `docs/` — markdown 카탈로그 (단일 출처 문서)
  - `SKILL.md` — 본 디자인 시스템 사용 절차
  - `primitives.md` / `chrome-components.md` / `widget-components.md` — 컴포넌트 카탈로그 (텍스트 형태)
  - `tokens.md` — 토큰 정의 (CSS 변수 ↔ 디자인 의미)
  - `patterns.md` — 합성 패턴 (페이지 레벨 컴포지션)
  - `STORIES_ROADMAP.md` — Storybook 카탈로그 추가 작업 목록

## 컴포넌트 계층 — Primitives → Composite → Shell

단일 축(Design Theory) 계층. **조합 깊이**가 유일한 분류 기준.

```
Primitives ──→ Composite ──→ Shell
(자립 렌더)    (1단계 조합)    (최종 조립)
```

| 계층 | 정의 | import 규칙 | 판별 기준 |
|---|---|---|---|
| **Primitives** | 다른 DS 컴포넌트를 import 하지 않고 **자립 렌더**하는 최소 단위. HTML 원소 + 토큰만으로 구성. **3계층 중 유일하게 독립 생성 가능.** | DS import 없음. 토큰·React만 사용 | "이 컴포넌트에서 다른 DS 컴포넌트 import가 있는가?" → 없으면 Primitives |
| **Composite** | Primitives를 **1단계 조합**하여 의미 있는 UI 단위를 구성. 독립 생성 불가 — 반드시 Primitives에 의존. | Primitives만 import. **Composite 끼리 import 금지** | "Primitives만 조합했는가?" → 맞으면 Composite |
| **Shell** | Composite + Primitives를 **최종 조립**하는 앱 진입점. 독립 생성 불가 — 반드시 Composite + Primitives에 의존. | 모든 계층 import 가능 | "Composite를 포함하여 전체 화면을 조립하는가?" → 맞으면 Shell |

**계층 승격 규칙:** Composite가 다른 Composite를 import하면 → Shell로 승격하거나 구조를 분리.

### 토큰 2계층

| Tier | 역할 | 명명 규칙 | 예 |
|---|---|---|---|
| **Global** | 원시 팔레트 · 스케일 · 시스템 값 | 값 자체가 이름 | `--color-gray-50`, `--text-xs`, `--spacing`, `--radius-md` |
| **Semantic** | 의미 · 역할 · 의도 | 용도가 이름 | `--color-brand-blue`, `--color-text-primary`, `--color-status-error`, `--color-bg` |

- UI 컴포넌트는 **Semantic 토큰만 참조**. Global 직접 참조 금지.
- Component 토큰(3계층)은 variant×tone 조합이 복잡한 것만 선택 도입 (`--wds-btn-*`).
- `--color-palette-*` (hex suffix) 는 차트 시리즈 전용 Global. 컴포넌트에서 직접 참조 가능 (차트 한정).

### 토큰 Addon 구조 (2026-10-10 신설)

컬러 토큰은 4파일 Addon 구조. Core는 그레이스케일(중립색)만 보유, Brand/Status/Chart Addon이 색을 주입.

```
src/tokens/
  core.css    ── 그레이스케일 23색 + 구조 66 = 89 tokens + gray fallback
  brand.css   ── primary·accent·gradient 9 tokens (제품 아이덴티티)
  status.css  ── status·indicator·surface-intent 12 tokens (상태 표현)
  chart.css   ── palette 36 tokens (차트 전용, 테마 불변)

src/tokens.css  ── @import 합본 (하위호환)
                ──→ scripts/generate-tokens.mjs → src/widget/_tokens.ts (자동 생성)
                ──→ scripts/build-tokens-json.mjs → docs/tokens.json (자동 생성)
```

**소비자 import:**
```css
/* 기존 방식 (불변) */
@import '@denyx/design-system/tokens.css';

/* Addon 선택 로드 */
@import '@denyx/design-system/tokens/core.css';
@import '@denyx/design-system/tokens/brand.css';
@import '@denyx/design-system/tokens/status.css';

/* 테마 교체 — brand.css 만 다른 파일로 교체 */
@import '@denyx/design-system/tokens/core.css';
@import '@custom-product/brand.css';
```

- **Core에 gray fallback 포함** — Addon 없이도 읽을 수 있는 UI 보장. Brand/Status 로드 시 덮어씀.
- **`pnpm lint:addon`** — Core 그레이스케일 순수성 · Addon 간 변수 중복 없음 · .dark 자기 완결 검증.
- `_tokens.ts`는 **자동 생성물** — 직접 수정 금지. `node scripts/generate-tokens.mjs` 로 재생성.
- `pnpm check:tokens` — CI에서 drift 감지 (생성 후 git diff).
- `storybook` / `build-storybook` 실행 시 자동으로 `generate:tokens` 선행.

### Layout Scale 토큰 (Global) — Spacing · Radius · Shadow

`--spacing-2xs~4xl`(2~32px) · `--radius-xs~2xl/full`(2~24px) · `--shadow-sm/md/lg`. `pnpm audit:tokens` 실측 빈도 기반 (2026-07-02 신설, `docs/DS-ENHANCEMENT-PLAN.md`). 기존 유틸(`gap-6px`·`rounded-4px`)은 값 유지(비파괴) — **신규 컴포넌트의 인라인 스타일부터 토큰 참조**. 상세는 `docs/tokens.md`.

### 토큰 거버넌스 — 변경 프로세스 (2026-07-02 신설)

| 작업 | 절차 |
|---|---|
| **추가** | 실사용 **3곳 이상** 근거 (grep 첨부) + 계층(Global/Semantic) 명시 + `@role` 주석 필수 + `tokens.md` 동기 |
| **수정** | 영향 범위 분석 (전체 참조처 grep) + 시각 회귀(Chromatic) 확인 |
| **삭제** | 최소 2주 deprecation (`/* @deprecated → 대체토큰 */`) 후 제거 |

- **3곳 이상** 반복 값만 토큰화 (1~2회는 raw 허용 — 스케일 오염 방지). Global 스케일 확장은 실측(`pnpm audit:tokens`)으로 갭이 증명될 때만.
- 허용 raw 값 allowlist (0 · 1px 헤어라인 · 방향별 조합 라디우스 · 컬러 위 `#fff` 전경 · 라이브 번들 CSS 등)는 `docs/tokens.md` § 토큰 거버넌스 참조.

### 소스 내부 raw 값 가드 — `pnpm lint:src` (2026-07-02 신설)

`ds-override-guard.mjs`(소비자 방향)와 별개로, **DS 소스 자체**의 inline hex·raw px 유입을 차단하는 내부 가드 (`scripts/lint-src-tokens.mjs`).

- 규칙 5종: raw-color / raw-font / raw-radius / raw-shadow / raw-spacing (inline style 대상 — 유틸 클래스는 denyx-ds.css 소유라 제외)
- 기존 위반은 `scripts/lint-src-tokens-baseline.json`에 동결 — **baseline 초과(신규 유입)만 실패** (비파괴 ratchet). 위반을 줄였으면 `--update`.
- `pnpm check`에 포함. 적용률 측정은 `pnpm audit:tokens`(`--json` 지원).

### Primitives — 자립 렌더. DS 컴포넌트를 import 하지 않음

General: ActionMenuItem, Autocomplete, Breadcrumb, Button, CardHead, Checkbox, Chip, ConfirmDialog, DataTable, DateTimePicker, Disclosure, EmptyState, ListRow, LiveTimerCompact, MiniLineChart, Modal, Notice, Pagination, RadioGroup, Select, Slider, StatCard, Switch, Tabs, TextField, ThemeToggle, TimeChip, Toast, Tooltip

Parts (Chrome): AiSymbol, BottomRailItem, DashboardBuildingProgress, DataTableRow, DateTimeBlock, WeekHourMatrix, FilterChipItem, FilterDropdownOptionItem, HeaderPillButton, OptionbarInstanceSelector, OptionbarItem, OptionbarValueDisplay, PageHeaderNotificationItem, PageHeaderProfileMenuItem, PresetSelect, ProductRailItem, SidebarCopyright, SidebarLogoHeader, SidebarMenuItem, SidebarOrgSwitcher, SidebarProjectSwitcher, Stage, SubHeaderBar, TabButton, TimeRangeSelector

Parts (AI): AiCard, AiCaption, AiSectionHeading, AiToneBadge, AiBulletList, AiActionChip, AiAttachmentChip, AiQuickActionChip, AiSendButton, AiAssistantButton, ReasoningStep, TimelineStepItem, AiSeverityRow, AiToneRow, AiOptionButton, AiKeyValuePreview

### Composite — Primitives 만 1단계 조합. Composite 끼리 import 금지

Chrome: PageHeader, PageHeaderAiInline, FilterBar, FilterChip, FilterDropdown, Sidebar

AI: AiInlinePrompt, AiChatExchange, AiPromptInput, AiReasoning, AiProposalCard, ProposalSection

### Shell — 모든 계층 조합. 앱 진입점 (2개)

DashboardLayout, DenyxAiWidget

**신규 컴포넌트 추가 시 반드시 계층을 명시.**

**AI 영역 ↔ 일반 영역 분리 원칙** (계층과 무관한 네이밍 규칙)

- AI 진입점·AI 응답 UI 는 **`Ai...` 접두사** 사용 (AiInlinePrompt / AiSendButton / AiAssistantButton)
- 일반 폼/검색은 TextField·Button
- 페이지의 AI 진입점은 **버튼 대신 AiInlinePrompt 직접 주입 (2-step → 1-step)**

### 🔒 글로벌 정책 — 구조는 인라인 금지 (컴포넌트로 추출)

**모든 컴포넌트/위젯의 구조는 인라인 JSX 로 흩어 두지 않는다.** 반복되거나 의미 단위가 분명한 구조(목록 행·카드·셀·항목 등)는 `map` 내부에 인라인으로 펼치지 말고 **독립 컴포넌트로 추출**한다. (예: Sidebar 의 메뉴 행 → [[SidebarMenuItem]] Foundation 으로 분리.)

- 새 구조 단위를 인라인으로 만들기 전에 **컴포넌트로 추출 가능한지 먼저 검토** — 추출이 기본.
- 추출된 컴포넌트는 계층 명시 + docstring(4섹션) + story + `index.ts` export + 카탈로그 동기.
- 인라인 허용은 **재사용 없는 1회성 레이아웃 래퍼**(flex 컨테이너 등)에 한함.
- **적용 현황(2026-06-17):** 반복 인라인 구조 23종을 Primitives Parts 로 추출 완료 — `index.ts` export + story. 테이블 행·스텝·칩·메뉴 항목 등.

### Docstring 4섹션 표준 + components.json (2026-10-10 신설)

모든 컴포넌트 docstring 은 **4섹션 필수**: `## Purpose` / `## When to use` / `## When NOT to use` / `## Composition rules` + `@example`. `pnpm lint:docstrings` 게이트가 강제.

- `docs/components.json` — **기계 판독 컴포넌트 카탈로그(자동 생성 · 직접 편집 금지).** 컴포넌트별 name · layer · purpose · whenToUse · whenNotToUse · compositionRules · example · dont. `scripts/build-components-json.mjs` 가 소스 docstring + barrel export 에서 유도.
- `pnpm build:components-json` 으로 재생성. `pnpm build:design` 이 자동 선행.
- Do/Don't 는 `When NOT to use` + `Composition rules` 의 금지형 문장에서 자동 유도 — 별도 작성 불필요.
- Baseline ratchet: 기존 위반은 `docstring-baseline.json` 에 동결, 신규 유입만 차단. 해소 시 `--update`.

## 스타일 — 일반 CSS (Tailwind 미사용 · 흔적 0)

런타임 스타일은 외부 CSS 프레임워크 흔적이 0인 **자체 소유 일반 CSS** `src/denyx-ds.css` (= export `./style.css`·`./denyx-ds.css`). 내부에 `@layer`·`--tw-*`·`@property`·`.foo-\[…\]`(escape 클래스명) 없음. 유틸 클래스명은 escape 없는 일반 식별자(`gap-4px`·`hover-opacity-70` 등).

- **소비자:** 진입점에서 `import "@denyx/design-system/style.css"` 한 줄. Tailwind·`@source`·PostCSS 불필요. 토큰만 필요하면 `tokens.css`(참조용 `:root`).
- **`denyx-ds.css` 는 생성물 — 손으로 늘리지 말 것.** 컴포넌트 className/토큰 변경 시 `node scripts/detailwind.mjs generate` 로 **(1) denyx-ds.css 재생성 + (2) tsx className 코드모드(escape 토큰→일반 식별자)**. 진실 원본 `scripts/frozen-denyx-ds.css`(구 빌드 1회 스냅샷, 미배포). self-contained(:root 토큰 + preflight + utilities + 전역/keyframes/.dark 포함).
- **동적 색**(variant×tone)은 정적 유틸로 불가 → Button 처럼 inline CSS custom property(`--wds-btn-*`).
- **다크 대응 (테마 적응 표면 유틸):** 페이지/패널 배경에 `bg-white`·인라인 `#fff` **금지** — 테마 토큰으로:
  `bg-bg`(앱 셸 = `--color-bg`) · `bg-card`(헤더/사이드바/카드/입력/드롭다운 = `--color-card`) · `bg-surface-50/100/200` · `hover-bg-surface-100/200`. `.dark` 가 토큰만 재매핑하므로 라이트/다크 자동 전환. **흰색 전경**(컬러 위 텍스트·아이콘: `--wds-btn-fg`, `stroke/fill "#fff"`)은 그대로 유지.
- **⚠️ `detailwind generate` 는 원본(escaped className) tsx 에서만 실행** — 이미 codemod된 트리에서 재실행하면 유틸이 누락됨(가드가 중단시킴). 증분 변경은 `src/denyx-ds.css` 직접 편집(+ EXTRAS 유틸은 스크립트에도 반영).
- **Tailwind 재도입 금지** — 의존성·빌드·런타임·CSS 산출물 어디에도 없음. (Storybook Guardrails: `no-tailwind-plain-css`)

## 타이포그래피 위계 — `font-weight` 평탄화 금지

| 사이즈 | weight 기준 | 용도 |
|---|---|---|
| `text-lg+` (14px+) | `font-bold` | 페이지 타이틀·섹션 헤더 |
| `text-md` (13px) | `font-bold` / 강조 시 medium | 카드 헤더·테이블 row 강조 |
| `text-base` (12px) | `font-medium` | 라벨·메타·dropdown 항목 |
| `text-sm` (11px) | `font-medium` 또는 regular | 보조 메타·캡션 |
| `text-xs` (10px) | regular | 마이크로 캡션·인디케이터 |

본문 (running text) 만 regular. 같은 사이즈에서 weight 만 평탄화하면 위계 손실 — 사이즈 + weight 둘 다 조합.

## DataTable 종합 정책

### Density — 기본 `default`

- **`default`** (모든 새 페이지 채택) — header `text-base` 12px bold · row `text-md` 13px regular · padding 12/10
- **`compact`** — header `text-xs` 10px bold · row `text-sm` 11px regular · padding 8/6. 100+ 행 raw log 등 극단적 dense 데이터 전용. 채택 시 별도 근거 필요.

### 정렬 (alignment)

- 문자 → **left**
- 숫자 (`numeric: true`) → **right** (자릿수 세로 정렬)
- header `"No"` 컬럼 → **center** (별도 align 없이 자동)
- 명시 `align` prop 이 최우선 override.

### 너비 (width)

- 정형 컬럼 (No 52 · 시각 150 · 상태 96 · 액션) → **`width`(px 고정)**
- 가변 컬럼 (이름 · 메시지) → **`flex`(fr)**, 정보량 많은 쪽에 더 큰 비율

### 셀 내 inline 폰트 — DataTable tokens 와 정합

DataTable wrapping span 이 `tokens.rowText` 자동 적용. 셀 안 `<span>` override 시:

| 컨텐츠 | className |
|---|---|
| 주 텍스트 (강조 없음) | **override 안 함** (자동 `text-md text-primary`) |
| 메인 식별자 강조 | `text-md font-medium text-primary` 또는 `font-bold` |
| 보조/부 텍스트 (이메일·라벨) | `text-base text-tertiary` |
| 수치 | `text-md font-numeric tabular-nums` |

**금지:** default density 셀 안에 `text-sm`/`text-xs` — compact 시절 잔재. 한 단계 작은 부 텍스트는 `text-base` (12px).

### 셀 내 컴포넌트 사이즈

row height ≈ 33-36px 기준:

| 컴포넌트 | size |
|---|---|
| `<Chip>` | `md` (20px) |
| `<FilterChip>` | `md` (24px) |
| `<Button>` | `sm` (~24px) |
| inline pill (span) | `text-sm h-[20-24px] px-[8px]` |
| status dot | 6-8px |
| `<Checkbox>` | `sm` (14-16px) |

lg(28-32px) 는 row 를 압도하므로 금지.

## Widget primitives + Tone 토큰

AI 위젯 영역의 모든 컴포넌트는 다음 primitive 를 **반드시 composition**:

- `<AiCard>` / `<AiCaption>` / `<AiSectionHeading>` / `<AiToneBadge>` / `<AiBulletList>`
- `Tone` 토큰 (`_tokens.ts`, `_primitives.tsx`) — info / success / warning / critical / neutral

**금지:** inline 색 리터럴 (`#FF...`, `style={{ background: ... }}`), inline card 스타일링. 모두 primitive 의 `tone` prop 으로 표현.

## 공통 컴포넌트 카탈로그

- Chrome·Widget·Primitives **재사용 가능 컴포넌트는 본 패키지에만 거주**
- 새 페이지는 prop 으로 조합. inline 복사·재정의 금지.
- 페이지 dogfooding 중 발견된 gap 은 본 패키지에 새 컴포넌트로 추가 (페이지 안에서 해결 X)

### 🔒 불변 정책 — DS repo에서만 수정 가능 · 역방향 수정 금지

> **이 정책은 불변(immutable)입니다. 예외 없음.**

모든 토큰 · 컴포넌트 · 위젯의 추가 · 변경 · 삭제는 **본 repo(`Denyx-design-system`)에서만** 수행한다.

- 본 패키지는 **단일 출처(single source of truth)**.
- 소비 측 — 프로토타입 · 시나리오 · 제품 코드 (`Denyx-AI-Assistant/prototypes/*`, `Denyx_Scenarios/`, 기타 소비 앱) — 은 등록된 토큰·컴포넌트·위젯을 **prop 조합으로만 소비**한다.
- 소비 레이어에서의 **override · 재정의 · monkey-patch · CSS 덮어쓰기 · 토큰 값 변경** 모두 금지.
- 소비 측 CLAUDE.md 에도 동일 명시.

**위반 감지 및 경고 (2중):**

1. **런타임 UI 경고** — 소비자 앱에서 DS 컴포넌트 override 시도 시 `<DsReadOnlyNotice>` 모달로 불변 정책 안내. 시도된 작업 내용 표시.
2. **빌드/lint 경고** — 소비자 repo에 `scripts/ds-override-guard.mjs` 설치. DS 토큰·컴포넌트에 대한 CSS override (`!important`, `--color-*` 재정의, DS 클래스명 직접 스타일링) 감지 시 빌드 경고 출력.

## 안정화 체크리스트 — npm 퍼블리시 전 게이트

안정화 = 소비자가 업데이트 없이 안정적으로 사용할 수 있는 상태. 아래 항목을 **모두 충족**해야 npm 퍼블리시 진행.

- [ ] 컴포넌트 prop(이름·타입·필수 여부) 변경 빈도 < 주 1회 (2주 이상 유지)
- [ ] 토큰 값(`tokens.css` `:root` 변수) 변경 없이 2주 이상 유지
- [ ] 컴포넌트 추가·삭제·리네이밍 없이 2주 이상 유지
- [ ] dogfooding 프로젝트에서 DS override 0건 (ds-override-guard 통과)
- [ ] Storybook 전 컴포넌트 story + autodocs 완비
- [ ] `tsup` 빌드 산출물(dist/) 안정 출력 — 소비자가 번들 import 가능
- [ ] 소비자 2개 이상 프로젝트에서 DS 변경 없이 정상 동작 확인

**현재 상태: 안정화 전** — 계층 구조 변경, 심볼 교체, 도메인 컴포넌트 정리 진행 중.

## 회귀 안전망 (Regression Safety Net)

7중 안전망으로 DS 변경 시 기존 소비자가 깨지지 않는지 자동 검증.

| 레이어 | 도구 | 명령어 | 감지 대상 |
|---|---|---|---|
| 1. 렌더 테스트 | Vitest | `pnpm test` | 컴포넌트 렌더 에러 |
| 2. 스냅샷 테스트 | Vitest snapshot | `pnpm test` | 의도치 않은 마크업 변경 |
| 3. 타입 체크 | TypeScript `tsc --noEmit` | `pnpm typecheck` | export 타입 변경, prop 불일치 |
| 4. Docstring 표준 | check-docstrings.mjs | `pnpm lint:docstrings` | 4섹션 docstring 누락 (Purpose / When to use / When NOT to use / Composition rules + @example) |
| 5. 카탈로그 커버리지 | check-catalog-coverage.mjs | `pnpm lint:coverage` | 공개 export 컴포넌트의 story 누락 |
| 6. 토큰 의미 커버리지 | check-token-docs.mjs | `pnpm lint:token-docs` | @role 주석 없는 토큰 |
| 7. Addon 구조 무결성 | check-token-addon.mjs | `pnpm lint:addon` | Core 그레이스케일 순수성·Addon 간 변수 중복·.dark 자기 완결 |
| 8. Gate roster 검산 | check-gates.mjs | `pnpm lint:gates` | 게이트 배선 누락·스크립트 미등록·justification 부재 |
| 9. 시각 회귀 | Chromatic | `pnpm chromatic` | 픽셀 수준 UI 변경 |

**통합 검증:** `pnpm check` (typecheck + lint:src + lint:docstrings + lint:coverage + lint:token-docs + lint:addon + lint:gates + test)

### Gate roster — 게이트 명부 단일 원천 (2026-10-10 신설)

`scripts/gate-roster.mjs` — 모든 가드레일의 단일 원천. auto(자동)/policy(사람 검토) 상태 관리.

- **auto 게이트**는 `script`(검사 스크립트) 또는 `pipeline`(pnpm 스크립트명) 또는 `justification`(구조적 보장 근거) 중 하나 필수.
- `check-gates.mjs` 가 roster ↔ 실제 배선 정합성을 검산: 스크립트 존재 여부 · pnpm 배선 · 새 check-*.mjs 의 roster 등록 여부.
- **새 게이트 추가 시**: check-*.mjs 작성 → roster 등록 → package.json 배선 → check 체인 추가. roster 미등록 시 `lint:gates` 실패.

스냅샷이 의도적 변경이면 `pnpm test -- -u` 로 업데이트.

### 🔒 토큰 적용률 감사 — 항상 적용 (불변 규칙, 2026-07-06 신설)

**토큰 또는 컴포넌트 스타일을 건드리는 모든 작업은 `pnpm audit:tokens` 를 검증 단계에 반드시 포함한다.** 예외 없음 — 값 변경이 없어 보이는 작업(리네이밍·리팩터링 포함)도 실측으로 증명한다.

- **전후 비교**: 변경 전 기준 커밋에서 `git worktree add /tmp/<dir> <커밋>` 후 `node scripts/audit-tokens.mjs` 실행 → 변경 후 결과와 카테고리별 적용률(token refs / raw values / adoption %) 비교.
- **회귀 판정**: 적용률 하락 또는 raw 값 증가 = 회귀 — 원인 해소 전 머지 금지.
- **보고**: 비교 결과를 PR/검증 보고에 포함 (`--json` 으로 기계 비교 가능).

## Sidebar — 프로젝트 스위처 노출 규칙

상단 프로젝트/조직 스위처(`productIcon` + `groupLabel` + `projectLabel` + chevron)는 **프로젝트 컨텍스트가 있을 때만 노출**한다.

- 컨텍스트가 없는 화면(엔터프라이즈 활성화 전 — 표시 이름 미설정, 계정/관리 영역 등)은 `hideProjectSwitcher`(프로젝트 스위처)·`org={null}`(조직 스위처)로 숨긴다.
- **빈 라벨/기본값(default 프로젝트·조직명) 노출 금지** — 잘못된 정보 노출 방지.
- 비파괴 원칙: 기본값 `hideProjectSwitcher=false` / `org=DEFAULT_ORG` 이므로 기존 호출처 동작 불변. `DashboardLayout` 이 두 prop 을 Sidebar 로 passthrough.

## 아이콘 — Lucide 셋 · 2D 솔리드 컬러 (2026-07-07 신설)

UI·문서(Storybook MDX 포함)의 아이콘은 **Lucide 아이콘 셋**을 사용하고, **2D 솔리드 컬러(단색) 스타일**로 렌더한다.

- 이모지(🧱💡🔒 등)를 UI/문서 아이콘으로 사용 금지 — Lucide SVG 로 대체.
- 단색 원칙: `stroke="currentColor"` (또는 단일 토큰 색) — 그라데이션·멀티톤·3D 스타일 금지. 색은 토큰 참조 (`var(--color-primary)` 등).
- 예외: AI 심볼/브랜드 그라데이션(AiSymbol 등 기존 브랜드 자산)은 본 정책 대상 아님.
- 인라인 SVG 시 `aria-hidden="true"` + 24 viewBox + `strokeWidth 2` (Lucide 기본) 유지.

## SVG 텍스트 — font-size 단위 필수

`<text fontSize="9">` (unitless = user-space units, viewBox 와 함께 scale) **금지**.

→ 항상 `fontSize="9px"` 또는 `fontSize="9pt"` 명시. 일관된 렌더링 보장.

## 차트 peak / ▼ 라벨 — line max 픽셀 1:1 매칭

SVG 차트의 peak 라벨/마커는 **plot 영역 absolute 배치 + HTML overlay 가 같은 plot 좌표계 사용**. line max 픽셀 좌표와 1:1 매칭되도록 좌표 계산.

→ 별개 좌표계로 그리면 시각 위치 어긋남.

## 라이브 디자인시스템 CSS 소스

`.ai-assistant-btn` 등 라이브 디자인시스템 클래스를 dogfooding 할 때:

1. `curl https://service.denyx.io/.../design-system.css` 로 live 번들 fetch
2. 해당 규칙 grep
3. **그대로 paste**. 즉흥 작성 금지.

라이브와의 픽셀 일치 보장이 본 정책의 핵심.
