# Chrome Components — 20 컴포넌트

> 원본: `src/` (interfacedesigner/Denyx-design-system)

페이지 단위 레이아웃·도구·표시 컴포넌트. 위젯(AI Assistant) 외부의 모든 SaaS 화면 골격이 이 카탈로그 안에 있습니다.

> **Enterprise 시나리오 신규 정책/prop**(2026-06): `Sidebar`(`MenuItem.children[].onClick`, `OrgContext.badge`, 아이콘-없음 12px 스페이서) · `PageHeader`(`profileMenu`, `roleBadge`=드롭다운 헤더, `notifications` 벨 인디케이터) · `SubHeaderBar` · 토큰 색상/48px 헤더/사용자 메뉴 일원화/컨텍스트 정합성 정책 → **[`enterprise-changes.md`](./enterprise-changes.md)** 참조.

**조립 순서:** `DashboardLayout` → `Sidebar` + `header` 슬롯 (`PageHeader` 또는 `PageHeaderAiInline` + 옵션으로 `FilterBar`) + `main` 슬롯 + 자식으로 `DenyxAiWidget`

## 카탈로그 (20)

| 영역 | 컴포넌트 |
|---|---|
| 레이아웃 | DashboardLayout · Sidebar · PageHeader · PageHeaderAiInline · SubHeaderBar |
| 옵션바 (시간/인스턴스/프리셋) | OptionbarInstanceSelector · LiveTimerCompact · TimeRangeSelector · PresetSelect |
| 데이터 표시 | DataTable · FilterBar · MiniLineChart · WeekHourMatrix |
| 액션·진입 | Button · AiSymbol |
| 알림·상태 | Toast · Stage · DashboardBuildingProgress |
| 위젯 컨텍스트 | DenyxAiContext (Provider) |

---

## DashboardLayout

240px Sidebar + 우측 콘텐츠 2컬럼 레이아웃. AI 위젯이 열리면 사이드바를 40px 레일로 자동 축소합니다.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `children` | `ReactNode` | — | 보통 `<DenyxAiWidget>` 등 floating 자식 |
| `header` | `ReactNode` | — | 상단 헤더 슬롯 (`PageHeader`) |
| `main` | `ReactNode` | — | 본문 슬롯 |
| `widgetOpen` | `boolean` | `false` | true면 사이드바가 40px 레일로 축소 ([patterns.md](./patterns.md#2-sidebar-collapse-on-widget-open)) |
| `activeProduct` | `string` | — | 현재 활성 제품 (사이드바 강조용) |
| `project` | `ProjectContext` | `DEFAULT_PROJECT` | 조직/프로젝트 컨텍스트 |
| `menu` | `MenuItem[]` | `K8S_GPU_MENU` | 사이드바 메뉴 트리 |

---

## Sidebar

240px (collapsed 시 40px) Denyx 사이드바. 로고 + 조직/프로젝트 스위처 + 메뉴 트리 + 우측 제품 레일.

```ts
export type MenuItem = {
  icon: string;
  label: string;
  children?: { label: string; active?: boolean; onClick?: () => void }[]; // onClick: 하위 항목 네비게이션
  expanded?: boolean;
  active?: boolean;        // 단일 항목 active 강조
  onClick?: () => void;    // 단일 항목 클릭
};

export type ProjectContext = {
  productIcon?: string;    // 미지정 시 12px 스페이서(빈 영역 금지)
  groupLabel: string;
  projectLabel: string;
};

export type OrgContext = { label: string; icon?: string; badge?: string }; // badge: 컨텍스트 칩(예: "엔터프라이즈")
```

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `activeProduct` | `string` | `"gpu"` | 제품 레일 강조 |
| `project` | `ProjectContext` | `DEFAULT_PROJECT` | 프로젝트 스위처 컨텍스트 |
| `menu` | `MenuItem[]` | `K8S_GPU_MENU` | 메뉴 트리 |
| `collapsed` | `boolean` | `false` | 제품 레일만 남기고 축소 |
| `hideProjectSwitcher` | `boolean` | `false` | 상단 프로젝트 스위처(productIcon + group/project 라벨 + chevron) 숨김 |
| `org` | `OrgContext \| null` | `DEFAULT_ORG` | 상단 조직 스위처. `null`이면 숨김. `badge`로 컨텍스트 칩(예: "엔터프라이즈") |
| `onOrgClick` | `() => void` | — | 조직 스위처 클릭(엔터프라이즈 선택/전환 등) |
| `hideProductRail` | `boolean` | `false` | 우측 제품 레일 숨김(테넌트 상위·계정 영역) |

**메뉴 하위 항목 네비게이션:** `MenuItem.children[].onClick`으로 그룹(예: "관리 ▾") 하위 항목도 라우팅 진입점이 된다(`expanded: true` + 각 child `onClick`).
**스위처 컨텍스트 뱃지:** `org.badge`는 **토큰** 칩으로 렌더 — `bg-[var(--color-primary-bg)] text-[color:var(--color-primary)]`(하드코딩 hex 금지). `org.icon` 미지정 시 라벨 좌측은 **12px 스페이서**(빈 40px 박스 금지).

`collapsed=true`일 때 사이드바는 제품 레일만 남기고 다 숨깁니다. AI 위젯이 열렸을 때의 표준 동작 — 보통 `DashboardLayout`이 자동으로 이 prop을 전달합니다.

**프로젝트 스위처 노출 규칙:** 상단 프로젝트/조직 스위처는 **프로젝트 컨텍스트가 있을 때만** 노출합니다. 컨텍스트가 없는 화면(엔터프라이즈 활성화 전, 계정/관리 영역 등)은 `hideProjectSwitcher`(프로젝트)·`org={null}`(조직)로 숨겨 **빈 라벨/기본값 노출을 금지**합니다. 기본값(`false` / `DEFAULT_ORG`)이라 기존 호출처 동작은 불변. `DashboardLayout`도 두 prop을 passthrough 합니다.

---

## SubHeaderBar

페이지 헤더(48px) 아래 **고정 40px** 보조 네비 행. 뒤로가기·브레드크럼·보조 액션 컨테이너. 사이드바 조직 스위처(40px)와 동일 높이라 좌/우 컬럼 2행이 정렬됩니다(헤더 48 → 보조 40 chrome 스케일).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `children` | `ReactNode` | — | 좌측 내용 — 백 버튼(`<Button variant="basic" size="md">`) + 브레드크럼 |
| `right` | `ReactNode` | — | 우측 정렬 보조 액션(선택) |
| `className` | `string` | `""` | 루트 바 className 병합 |

**높이 정책:** `h-[40px] box-border` 고정 — padding/border 가 높이를 부풀리지 않음. 페이지에서 `px py border-b` inline `<div>` 로 보조 행을 **재구현 금지**, 본 컴포넌트로 조립. (조직 스위처 40px 와 행 정렬 보장)

---

## PageHeader

48px 우측 컬럼 헤더. **AI 위젯 토글의 단일 진입점**입니다. 위젯이 열려도 이 헤더의 구성요소는 **하나도 사라지지 않습니다** ([patterns.md](./patterns.md#1-page-header-invariant)).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `title` | `string` | — | 좌측 페이지 타이틀 |
| `aiActive` | `boolean` | `false` | AI 위젯 활성 상태 (버튼 시각적 강조용) |
| `onAiToggle` | `() => void` | — | AI 버튼 클릭 콜백 |
| `profileMenu` | `ProfileMenuItem[]` | — | 우상단 **아바타 클릭 드롭다운**(계정 정보·엔터프라이즈 관리·전환·로그아웃 등). 미지정 시 정적 아바타 |
| `roleBadge` | `string` | — | 프로필 드롭다운 **헤더**에 표시할 역할(예: `"OWNER"`) → "OWNER · 내 계정". **아바타 옆 독립 칩 아님** |
| `notifications` | `NotificationItem[]` | — | **벨 빨간 점 + 드롭다운**. 1건↑일 때만 인디케이터 |

```ts
export type ProfileMenuItem = { label: string; onClick?: () => void };
export type NotificationItem = { label: string; onClick?: () => void };
```

타이틀 + AI 버튼 + Docs + 고객지원 + **bell(notifications 시 빨간 점)** + **avatar(profileMenu 드롭다운 · roleBadge 헤더)** 가 항상 한 줄에 모두 표시됩니다.

**사용자 메뉴 정책:** 우상단 사용자 영역은 **아바타 드롭다운 1개**로 일원화. 역할(`roleBadge`)은 **드롭다운 헤더**로 표시하고, 아바타 옆에 별도 역할 칩(2번째 트리거)을 두지 않는다.

---

## PageHeaderAiInline

48px `PageHeader` 의 **AI inline variant**. Denyx AI 토글 버튼 자리를 [`AiInlinePrompt`](./ai-entry.md#aiinlineprompt) 로 대체 — AI 위젯 호출 entry 가 인라인 prompt 송신으로 이동. 별도 토글 entry 없음 (2-step → 1-step UX).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `title` | `string` | — | 좌측 페이지 타이틀 |
| `promptPlaceholder` | `string` | `"어떤 작업을 함께 할까요?"` | inline prompt placeholder (`promptPlaceholders` 미주입 시 정적 1개) |
| `promptPlaceholders` | `string[]` | — | **옵션** — 제품별 핵심 prompt 배열. 입력 비어 있을 때 세로 롤링(`AiInlinePrompt.rollingPlaceholders` passthrough) |
| `promptSuggestions` | `AiPromptSuggestion[]` | — | chip suggestions — 페이지 컨텍스트별 카탈로그 |
| `onPromptSubmit` | `(v: string) => void` | — | Enter/⬆ 송신 콜백 |
| `onPromptSelectSuggestion` | `(s: AiPromptSuggestion) => void` | — | suggestion chip 선택 콜백 |
| `promptDefaultOpen` | `boolean` | `false` | Storybook/시연용 마운트 시 dropdown 강제 펼침 |

inline prompt 는 `max-w-[480px]` cap — 우측 chrome (고객지원·bell·avatar) 잠식 금지 ([patterns.md](./patterns.md#1-page-header-invariant)).

```tsx
<PageHeaderAiInline
  title="이벤트 카탈로그"
  promptPlaceholder="이벤트 카탈로그에 대해 질문..."
  promptSuggestions={CATALOG_AI_SUGGESTIONS}
  onPromptSubmit={(q) => handleAiSubmit(q)}
/>
```

**`PageHeader` vs `PageHeaderAiInline` 선택:**

- 위젯 토글 entry 가 필요 (AI 위젯이 페이지 컨텍스트와 무관하게 열리는 패턴) → `PageHeader`
- AI 진입점이 페이지 컨텍스트 prompt 인 페이지 (최근 표준) → `PageHeaderAiInline`

---

## ~~OptionbarPage~~ (삭제됨)

> `OptionbarPage`는 삭제되었습니다. 옵션바가 필요한 경우 `OptionbarInstanceSelector` + `LiveTimerCompact` + `PresetSelect`를 직접 조합하세요.

---

## OptionbarInstanceSelector

180px 인스턴스 셀렉터 드롭다운. status dot + chevron.

```ts
export type InstanceStatus = "ok" | "warn" | "error" | "idle";
```

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `"인스턴스"` |
| `width` | `number` | `180` |
| `label` | `string` | — |
| `status` | `InstanceStatus` | `"ok"` |
| `open` | `boolean` | `false` |
| `onToggle` | `() => void` | — |

---

## LiveTimerCompact

32px LIVE 타이머 + polling progress (pause/play 토글, 캘린더/duration).

| Prop | Type | Default |
|---|---|---|
| `time` | `string` | — |
| `paused` | `boolean` | `false` |
| `onTogglePause` | `() => void` | — |
| `refreshIntervalMs` | `number` | `5000` |
| `onOpenCalendar` | `() => void` | — |
| `durationLabel` | `string` | — |
| `showCalendar` | `boolean` | — |

---

## TimeRangeSelector

시간 범위 입력기. dual datetime + live 토글 + 이전/다음 + 달력.

```ts
type DateParts = { year: string; month: string; day: string; hour: string; minute: string };
```

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `"시간"` |
| `start` | `DateParts` | _(기본값 있음)_ |
| `end` | `DateParts` | _(기본값 있음)_ |
| `durationLabel` | `string` | `"10분"` |
| `onLive` | `() => void` | — |
| `onPrev` | `() => void` | — |
| `onNext` | `() => void` | — |
| `onPickDate` | `() => void` | — |

별도 시간 입력 UI가 필요한 페이지에서만 `TimeRangeSelector`를 직접 씁니다.

---

## PresetSelect

프리셋 드롭다운 (230px, 관리 버튼 포함).

| Prop | Type | Default |
|---|---|---|
| `label` | `string` | — |
| `width` | `number` | `230` |
| `onOpenList` | `() => void` | — |
| `onManage` | `() => void` | — |

---

## Stage

16:9 프로토타입 무대 (1280×720 흰색 카드, 어두운 배경). 마케팅/데모 화면 전용 — 실제 SaaS 페이지에서는 쓰지 않습니다.

| Prop | Type |
|---|---|
| `badge` | `string` |
| `children` | `ReactNode` |

---

## DataTable

Generic 재활용 데이터 테이블. CSS grid 기반, density 옵션. **전체 정책은 [`patterns.md`](./patterns.md#4-data-table-종합-정책) 참조.**

```ts
export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  flex?: number;            // 가변 트랙 (fr). width 지정 시 무시
  width?: number | string;  // 고정 트랙 (px/CSS) — 정형 컬럼
  align?: "left" | "right" | "center";
  numeric?: boolean;
  render?: (row: T, idx: number) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  density?: "compact" | "default";  // 기본 "default" (모든 새 페이지)
  onRowClick?: (row: T, idx: number) => void;
};
```

**Density — 기본은 `default`**
- `default` — header `text-base` 12px bold · row `text-md` 13px regular · padding 12/10
- `compact` — header `text-xs` 10px bold · row `text-sm` 11px regular · padding 8/6. **dense 데이터 (100+ 행) 전용. 채택 시 별도 근거 필요.**

**정렬:** 텍스트 → left, 숫자 → right (`numeric: true`), header `"No"` → center 자동. 명시 `align` 이 최우선.

**너비:** 정형 컬럼 → `width(px)`, 가변 컬럼 → `flex(fr)`.

**셀 내 inline 폰트** — wrapping span 이 `tokens.rowText` 자동 적용. override 가이드:

| 컨텐츠 | className |
|---|---|
| 주 텍스트 (강조 없음) | **override 안 함** |
| 메인 식별자 강조 | `text-md font-medium` 또는 `font-bold` |
| 보조/부 텍스트 | `text-base text-tertiary` (한 단계 작게) |
| 수치 | `text-md font-numeric tabular-nums` |

`text-sm`/`text-xs` 를 default density 셀 본문에 쓰지 말 것 (compact 시절 잔재).

**셀 내 컴포넌트 사이즈:** `Chip` md(20px) · `Button` sm(~24px) · inline pill `text-sm h-[20-24px]` · status dot 6-8px. lg(28-32px) 는 row 압도 금지.

```tsx
<DataTable
  density="default"
  columns={[
    { key: "name", header: "인스턴스", flex: 2 },
    { key: "tps",  header: "TPS", width: 96, numeric: true, render: r => r.tps.toLocaleString() },
  ]}
  rows={instances}
/>
```

---

## FilterBar

페이지 상단의 **검색·필터·액션 묶음 영역**. 통합 이벤트 목록·카탈로그·룰 목록 같은 큰 데이터 표 페이지의 헤더. Primitives 9 종(TextField/FilterChip/FilterDropdown) 의 조립체.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `search` | `ReactNode` | — | 좌측 검색 슬롯 (TextField 등) |
| `dropdowns` | `FilterBarDropdownConfig[]` | — | 중간 dropdown 묶음 — FilterChip 트리거 + FilterDropdown 자동 생성 |
| `actions` | `ReactNode` | — | 우측 actions (TimeRangeSelector · Button 등) |
| `showSelectedChips` | `boolean` | `false` | 선택된 항목을 별도 row 에 closable FilterChip 노출 |
| `showResetAll` | `boolean` | `false` | "전체 초기화" 버튼 (선택 있을 때만) |
| `onResetAll` | `() => void` | — | reset 콜백 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 내부 FilterChip 사이즈 (lg=32px 권장 페이지 헤더용) |

```tsx
<FilterBar
  size="lg"
  search={<TextField leadingIcon={<IconSearch />} clearable fullWidth placeholder="검색..." />}
  dropdowns={[
    { key: "category", label: "카테고리", options: CAT_OPTIONS, value: cat, onChange: setCat },
    { key: "severity", label: "심각도",   options: SEV_OPTIONS, value: sev, onChange: setSev },
  ]}
  actions={<Button variant="outline">고급 필터</Button>}
  showSelectedChips
  showResetAll
/>
```

---

## WeekHourMatrix

요일(7) × 시간(24) 알림 수신 매트릭스. 셀 ON = Tone "low" 배경(#e8f4ff), OFF = 회색 격자.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `weekdays` | `boolean[][]` | — | 7×24 그리드. `weekdays[d][h]` = true 면 ON |
| `onToggle` | `(day: number, hour: number, next: boolean) => void` | — | 셀 토글 (미지정이면 read-only) |
| `dayLabels` | `string[]` | `["월","화",…,"일"]` | 요일 라벨 |
| `caption` | `string` | — | 위쪽 안내 라벨 |

시간 헤더는 6시간 간격(0/6/12/18)만 표시 — 24개 다 쓰면 비좁음.

```tsx
<WeekHourMatrix
  caption="요일·시간별 알림 수신"
  weekdays={weekdays}
  onToggle={(d, h, on) => updateWeekdays(d, h, on)}
/>
```

---

## Button

표준 클릭 trigger primitive. 3 variant × 4 size × 3 tone + loading/fullWidth.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"basic" \| "contained" \| "outline"` | — | basic(텍스트만) · contained(채움) · outline(보더) |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | — | sm=20 · md=24 · lg=32 · xl=36px |
| `tone` | `"primary" \| "warning" \| "critical"` | `"primary"` | 색 테마 |
| `loading` | `boolean` | `false` | 자동 disabled + spinner |
| `fullWidth` | `boolean` | `false` | 컨테이너 폭 100% |
| `children` | `ReactNode` | — | 라벨 |
| ...HTML button attrs | — | — | onClick · type · disabled 등 |

```tsx
<Button variant="contained" tone="primary" size="md" onClick={apply}>적용</Button>
<Button variant="outline" tone="critical" size="sm" loading={deleting}>삭제</Button>
<Button variant="basic" size="sm">취소</Button>
```

**Button vs 다른 진입점:**
- 링크 이동 → `<a>` 직접
- AI 위젯 토글 (그라데이션) → [`AiAssistantButton`](./ai-entry.md#aiassistantbutton)
- AI 위젯 송신 → [`AiSendButton`](./ai-entry.md#aisendbutton)
- icon-only 압축 (size 16-20px) → 인라인 OK

---

## MiniLineChart

96px 소형 라인 차트. 모니터링 카드용. **SVG plot + HTML overlay**가 같은 좌표계로 정렬되어 peak 라벨이 line max 픽셀과 1:1 매칭됩니다 ([patterns.md](./patterns.md#5-chart-peak-alignment)).

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | — |
| `values` | `number[]` | — |
| `xLabels` | `string[]` | _(기본값 있음)_ |
| `markerAt` | `number` | `0.08` |
| `showTopStat` | `boolean` | `false` |
| `color` | `string` | `"#3DA9FF"` |
| `unit` | `string` | `""` |
| `delay` | `number` | — |

⚠️ SVG 내부 `<text fontSize>`는 **반드시 `"9px"` 형식**으로 단위 명시 ([patterns.md](./patterns.md#3-svg-text-must-include-units)).

---

## Toast

상단 중앙 고정 알림 (자동 dismiss). React Portal 사용.

```ts
export type ToastVariant = "success" | "info" | "warning" | "error";
```

| Prop | Type | Default |
|---|---|---|
| `open` | `boolean` | — |
| `variant` | `ToastVariant` | `"success"` |
| `message` | `string` | — |
| `actionLabel` | `string` | — |
| `onAction` | `() => void` | — |
| `onClose` | `() => void` | — |
| `durationMs` | `number` | `4500` |

---

## AiSymbol

Denyx AI 핀휠 그라데이션 심볼. 위젯 헤더, AI 토글 버튼, 인사말 영역 등 모든 AI 컨텍스트의 시각 표식.

| Prop | Type | Default |
|---|---|---|
| `size` | `number` | `16` |
| `className` | `string` | `""` |

---

## DashboardBuildingProgress

대시보드 구성 중 진행 로딩 화면. spinner + 단계별 체크. (AI가 "대시보드를 만들고 있어요" 상태일 때 본문 영역에 표시.)

```ts
export type DashboardBuildingProgressProps = {
  steps: string[];
  title: string;
  subtitle?: string;
  intervalMs?: number;
  card?: boolean;
  className?: string;
  background?: string;
};
```

| Prop | Default |
|---|---|
| `subtitle` | `"잠시만 기다려 주세요"` |
| `intervalMs` | `380` |
| `card` | `false` |

---

## DenyxAiContext (Provider)

페이지 트리 전체에서 AI 위젯 상태를 공유하기 위한 React Context. `useDenyxAi()` 훅으로 `aiActive` · `setAiActive` · `lastPrompt` 등 접근.

```tsx
import { DenyxAiProvider, useDenyxAi } from "@denyx/design-system";

// app root
<DenyxAiProvider>
  <App />
</DenyxAiProvider>

// any descendant
const { aiActive, setAiActive, lastPrompt } = useDenyxAi();
```

이미 `<App>` 최상단에서 한 번 wrap 되어 있으니, 페이지 컴포넌트는 hook 만 호출하면 됩니다.

---

## AiWidget (deprecated)

라이브 denyx-ai-assistant 복제 UI 패널. **`DenyxAiWidget`이 이 컴포넌트를 대체합니다.** 신규 페이지에서는 `DenyxAiWidget`을 쓰세요. `AiWidget`은 마케팅 비교용으로만 남아 있습니다.

---

## Do / Don't

✅ **Do**

- 페이지를 만들 때 **`DashboardLayout` slot 패턴**을 따르기 — header/main/children 슬롯에 컴포넌트만 꽂아넣기
- AI 위젯을 켤 때 **`DashboardLayout`의 `widgetOpen` prop** 한 곳으로 사이드바 축소 트리거 ([patterns.md](./patterns.md#2-sidebar-collapse-on-widget-open))
- `DataTable`의 `align` / `numeric`을 명시 — 휴리스틱에 의존하지 말기
- `MiniLineChart` 등 SVG 안의 `fontSize`에 반드시 `"px"` 붙이기

❌ **Don't**

- 페이지 별로 사이드바를 직접 import해서 다르게 렌더 — `DashboardLayout`에 prop으로 전달
- AI 위젯이 열렸다고 PageHeader 일부를 hide — 절대 금지 ([patterns.md](./patterns.md#1-page-header-invariant))
- `Stage` 컴포넌트를 실서비스 페이지에 사용 — 마케팅 데모 전용
