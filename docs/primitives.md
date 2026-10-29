# Primitives — 29 컴포넌트 (General)

> 원본: `src/` (product-design-engineer/Denyx-design-system)

가장 작은 단위의 재사용 컴포넌트들. **새 화면을 만들 때 인라인 form/feedback UI 를 새로 짜지 마세요. 이들을 조립하세요.**

- **General (29)** — 페이지·다이얼로그 어디서나 — ActionMenuItem · Autocomplete · Breadcrumb · Button · CardHead · Checkbox · Chip · ConfirmDialog · DataTable · DateTimePicker · Disclosure · EmptyState · ListRow · LiveTimerCompact · MiniLineChart · Modal · Notice · Pagination · RadioGroup · Select · Slider · StatCard · Switch · Tabs · TextField · ThemeToggle · TimeChip · Toast · Tooltip

> **AI 카드 빌딩 블록(AiCard · AiCaption · AiSectionHeading · AiToneBadge · AiBulletList)은 Primitives 가 아니라 `Denyx AI` 카테고리**입니다 (Storybook `Denyx AI/Primitives`). 카탈로그: [widget-components.md](./widget-components.md). 아래 "AI 카드 빌딩 블록" 상세는 참고용으로 유지.

모든 컴포넌트는 [`tokens.md`](./tokens.md) 의 색·타입 토큰을 사용하며 직접 hex 리터럴 금지.

---

# A. 일반 폼/표시 Primitives (9)

## Checkbox

3 상태 체크박스 — 체크/언체크/indeterminate. 라벨 옆 박스 클릭 또는 키보드 Space.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `checked` | `boolean` | — | controlled 체크 상태 |
| `indeterminate` | `boolean` | `false` | 트리/그룹 일부 선택 — `checked` 와 독립 |
| `disabled` | `boolean` | `false` | 비활성 |
| `size` | `"sm" \| "md"` | `"md"` | sm=14px / md=16px |
| `onChange` | `(next: boolean) => void` | — | 변경 콜백 |
| `label` / `children` | `ReactNode` | — | 라벨. 둘 다 있으면 children 우선 |
| `aria-label` | `string` | — | label/children 없을 때 a11y 필수 |

```tsx
<Checkbox checked={enabled} onChange={setEnabled}>알림 활성</Checkbox>
<Checkbox checked={false} indeterminate onChange={...}>일부 선택</Checkbox>
```

## Tooltip

hover/focus 시 짧은 설명 표시. 트리거 1개를 wrap (cloneElement) 해서 ARIA 자동 주입.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `content` | `ReactNode` | — | 1-2 문장 권장 |
| `children` | `ReactElement` | — | 트리거 1개 |
| `placement` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | 배치 |
| `hoverDelayMs` | `number` | `200` | hover 지연. focus 는 즉시 |
| `open` | `boolean` | _auto_ | 강제 표시 (디버그·Storybook) |
| `disabled` | `boolean` | `false` | — |

```tsx
<Tooltip content="이 항목은 읽기 전용입니다">
  <IconLock />
</Tooltip>
```

## Chip

라벨/태그/메타데이터 표시 — 작은 컬러 칩. 인라인 `<span>` 으로 직접 색 칠하지 말 것.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `variant` | `"solid" \| "soft" \| "outline"` | `"soft"` | 시각 강도 |
| `tone` | `"primary" \| "warning" \| "critical" \| "success" \| "neutral"` | `"neutral"` | 색 테마 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm=18 / md=20 / lg=28px (h/2 pill) |
| `leadingIcon` | `ReactNode` | — | 도트·아이콘 |
| `closable` | `boolean` | `false` | 우측 × 버튼 |
| `onClose` | `() => void` | — | × 콜백 |

```tsx
<Chip tone="critical" variant="soft">Critical</Chip>
<Chip tone="neutral" variant="outline" leadingIcon="●">Disk</Chip>
<Chip tone="primary" closable onClose={...}>Disk</Chip>
```

> **interactive 필터 칩 (클릭 토글)** 은 `FilterChip` — `Chip` 은 정적 라벨 전용.

## FilterChip

`Chip` 의 **interactive 변형**. 다중 필터 진입점 — 클릭 토글, 우측 count, 닫기 가능.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `selected` | `boolean` | — | 선택 상태 (controlled) |
| `onChange` | `(next: boolean) => void` | — | 토글 콜백 |
| `disabled` | `boolean` | `false` | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm=20 / md=24 / lg=32px |
| `leadingIcon` | `ReactNode` | — | 도트 등 |
| `count` | `number \| string` | — | 우측 카운트 (예: `12`, `"9+"`) |
| `closable` | `boolean` | `false` | true && selected 일 때만 × 표시 |
| `onClose` | `() => void` | — | × 콜백 |

```tsx
<FilterChip selected={isDisk} onChange={setDisk}>Disk</FilterChip>
<FilterChip selected count={12}>Critical</FilterChip>
<FilterChip selected closable onClose={() => removeFilter("disk")}>Disk</FilterChip>
```

> **단일 옵션 드롭다운** = `FilterDropdown`. **강제 단일 선택 (segmented)** = `Tabs variant="segmented"`.

## TextField

라벨 + 입력 + helper text 의 완전한 폼 필드. clearable(× 버튼) · invalid · leading/trailing 슬롯.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `label` | `ReactNode` | — | 상단 라벨 (생략 시 미표시) |
| `size` | `"sm" \| "md" \| "lg"` | `"lg"` | sm=24 / md=28 / **lg=32px (default)** — 페이지 헤더·FilterBar 검색이 가장 흔한 사용처. Modal dense form 은 `size="md"` 명시 |
| `leadingIcon` | `ReactNode` | — | 좌측 슬롯 (검색 아이콘 등) |
| `trailingNode` | `ReactNode` | — | 우측 슬롯 (단위·아이콘) |
| `invalid` | `boolean` | `false` | 보더·focus critical |
| `helperText` | `ReactNode` | — | 하단 helper/error. invalid 시 critical |
| `fullWidth` | `boolean` | `false` | 컨테이너 폭 100% |
| `value` / `onChange` | `string` / `(next: string) => void` | — | controlled |
| `clearable` | `boolean` | `false` | value 있을 때 × 버튼 (clear) |
| `onClear` | `() => void` | — | clear 콜백 |
| ...HTML input attrs | — | — | type · placeholder · maxLength 등 |

```tsx
<TextField
  label="이메일"
  size="md"
  value={email}
  onChange={setEmail}
  invalid={!valid}
  helperText={!valid ? "이메일 형식이 올바르지 않습니다" : undefined}
  fullWidth
  clearable
/>
```

## Select

native `<select>` 기반 드롭다운 + 통일된 보더·사이즈. TextField 와 height 일치.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `label` | `ReactNode` | — | 상단 라벨 |
| `options` | `SelectOption[]` | — | `{ value, label }` 배열 |
| `value` / `onChange` | `string` / `(next: string) => void` | — | controlled |
| `size` | `"sm" \| "md" \| "lg"` | `"lg"` | **lg=32px (default)** — TextField 와 height 정렬. Modal dense form 은 `size="md"` 명시 |
| `placeholder` | `string` | — | value="" 일 때 표시 |
| `leadingIcon` | `ReactNode` | — | — |
| `invalid` / `helperText` | — | — | TextField 와 동일 |
| `fullWidth` | `boolean` | `false` | — |
| `clearable` / `onClear` | — | — | chevron 옆 × 버튼 |

```tsx
<Select
  label="심각도"
  options={[
    { value: "critical", label: "Critical" },
    { value: "warning",  label: "Warning" },
  ]}
  value={sev}
  onChange={setSev}
  placeholder="선택하세요"
/>
```

## Tabs

탭 그룹. variant = `"large"` (페이지 탭) / `"segmented"` (작은 토글). 키보드 ←/→ 이동.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `items` | `TabsItem[]` | — | `{ value, label, count?, disabled? }` |
| `value` / `onChange` | `string` / `(next: string) => void` | — | controlled |
| `variant` | `"large" \| "segmented"` | `"large"` | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm=24 / md=32 / lg=40px |
| `fullWidth` | `boolean` | `false` | true 면 균등 분배 |
| `aria-label` | `string` | — | 페이지에 다중 Tabs 있을 때 필수 |

```tsx
<Tabs
  items={[
    { value: "all",  label: "전체", count: 42 },
    { value: "open", label: "열린 항목", count: 12 },
    { value: "closed", label: "닫힘" },
  ]}
  value={tab}
  onChange={setTab}
/>
```

## Modal

dialog — backdrop · panel · footer · 3 채널 닫기 (× / ESC / backdrop). React Portal.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `open` | `boolean` | — | controlled |
| `onClose` | `() => void` | — | 3 채널 모두 호출 |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | width sm=400 / md=560 / lg=720px |
| `title` / `description` | `ReactNode` | — | 헤더 (description 은 선택) |
| `children` | `ReactNode` | — | 본문 |
| `footer` | `ReactNode` | — | 액션 영역 (보통 우측 정렬 버튼 1-2개) |
| `hideCloseButton` | `boolean` | `false` | × 숨김 |
| `disableBackdropClose` | `boolean` | `false` | — |
| `disableEscClose` | `boolean` | `false` | — |
| `container` | `HTMLElement` | `document.body` | Portal mount target |

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  size="md"
  title="삭제 확인"
  description="이 작업은 되돌릴 수 없습니다."
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
      <Button tone="critical" onClick={handleDelete}>삭제</Button>
    </>
  }
>
  3 개의 알림 규칙이 영구 삭제됩니다.
</Modal>
```

## FilterDropdown

트리거 + 펼침 패널 (Checkbox 묶음 또는 자유 children) + footer slot. outside-click/ESC 닫기.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `trigger` | `ReactElement` | — | Button / FilterChip 등. onClick 자동 주입 |
| `title` | `ReactNode` | — | 패널 상단 타이틀 |
| `options` | `FilterDropdownOption[]` | — | Checkbox 자동 모드 |
| `value` / `onChange` | `string[]` / `(next: string[]) => void` | — | options 모드 controlled |
| `children` | `ReactNode` | — | 자유 모드 — options 무시하고 본문 직접 |
| `footer` | `ReactNode` | — | Apply/Cancel 영역 |
| `placement` | `"bottom-start" \| "bottom-end"` 등 | `"bottom-start"` | 펼침 위치 |
| `width` | `number` | `240` | 패널 width(px) |
| `open` / `onOpenChange` | — | — | controlled (선택). 미지정 시 internal |
| `disableOutsideClick` / `disableEscClose` | — | — | — |
| `disabled` | `boolean` | `false` | — |

```tsx
<FilterDropdown
  trigger={<FilterChip selected={picked.length > 0}>카테고리 {picked.length || ""}</FilterChip>}
  title="카테고리 선택"
  options={[
    { value: "disk", label: "Disk" },
    { value: "jvm",  label: "JVM" },
    { value: "k8s",  label: "Kubernetes" },
  ]}
  value={picked}
  onChange={setPicked}
  footer={<Button size="sm" fullWidth onClick={apply}>적용</Button>}
/>
```

---

# B. AI 카드 빌딩 블록 Primitives (5)

위젯 콘텐츠 메시지 컴포넌트가 반복 사용하는 wrapper/heading/badge. `<DenyxAiWidget>` 안의 모든 카드형 메시지는 이 5개로 조립합니다.

## AiCard

흰 배경 + `#eaeaea` 보더 + 8px 라운드 + 기본 패딩 카드 + 진입 애니메이션(`.ai-anim-in` + `animationDelay`).

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `children` | `ReactNode` | — | 카드 본문 |
| `delay` | `number` | `0` | 진입 애니메이션 지연 (ms). 메시지 stagger |
| `padding` | `number` | `12` | 안쪽 패딩 (px) |
| `gap` | `number` | `8` | 자식 간 세로 갭 (px). `0` 이면 미적용 |
| `className` | `string` | `""` | 추가 클래스 |

```tsx
<AiCard delay={120}>
  <AiSectionHeading tone="high">즉시 조치 권장</AiSectionHeading>
  <AiBulletList items={["고활용 GPU 2대 식별", "비용 절감 가능 ₩320,000/월"]} />
</AiCard>
```

## AiCaption

위젯 내 섹션 헤더용 작은 라벨. 11px bold uppercase. **REASONING / COST ANALYSIS / RESULT** 같은 영문 영역 구분자 전용.

| Prop | Type |
|---|---|
| `children` | `ReactNode` |

```tsx
<AiCaption>Reasoning</AiCaption>
```

한국어 헤딩은 `AiSectionHeading`.

## AiSectionHeading

컬러 도트(또는 emoji) + 굵은 한국어 헤딩 — **카드 내부의 "● 제목" 패턴**.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `tone` | `Tone` | — | 좌측 도트 톤 (생략 시 도트 없음) |
| `emoji` | `string` | — | 도트 대신 이모지. `tone` 보다 우선 |
| `children` | `ReactNode` | — | 헤딩 텍스트 |

```tsx
<AiSectionHeading tone="high">즉시 조치 (3건)</AiSectionHeading>
<AiSectionHeading emoji="📊">사용량 추이</AiSectionHeading>
<AiSectionHeading>일반 분석</AiSectionHeading>
```

## AiToneBadge

분류 결과를 작은 컬러 칩으로 표시 — `●` + 라벨.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `tone` | `Tone` | — | 필수. 배경/도트/라벨 모두 토큰 |
| `label` | `string` | `TONE_LABEL[tone]` | 기본 라벨 오버라이드 |

```tsx
<AiToneBadge tone="high" />              {/* ● 고활용 */}
<AiToneBadge tone="low" label="추천" />  {/* ● 추천 */}
```

## AiBulletList

위젯 본문의 ul/li 통일.

| Prop | Type | Default | 설명 |
|---|---|---|---|
| `items` | `string[]` | — | 각 줄 텍스트 |
| `size` | `"sm" \| "md"` | `"sm"` | sm=12px/`#4c4c4c` · md=13px/`#222` |

```tsx
<AiBulletList items={[
  "ORACLE: 평균 응답시간 38ms",
  "MySQL: 평균 응답시간 12ms",
]} />
```

복잡한 줄(굵게/링크/인라인 배지)은 `AiBulletList` 로 표현 불가 — 직접 `<ul>` 작성하되 색/사이즈 토큰만 맞출 것.

---

# 합성 예시 — 가장 흔한 위젯 카드

위젯 메시지의 70% 가 이 구조:

```tsx
<AiCard delay={delay}>
  <AiSectionHeading tone="high">고활용 GPU 분석</AiSectionHeading>
  <AiToneBadge tone="high" />
  <p style={{ fontFamily: tokens.font.family.korean.value, fontSize: 12, color: "#4c4c4c" }}>
    A100 2대가 96시간 이상 80% 이상 점유 중입니다.
  </p>
  <AiBulletList items={["GPU-04: 평균 92%", "GPU-07: 평균 88%"]} />
</AiCard>
```

# Do / Don't

✅ **Do**

- 새 form/feedback UI 를 만들기 전에 **위 14개로 조립 가능한지 확인**
- size 토큰만 사용 (sm/md/lg) — 임의 px 지정 금지
- TextField/Select/Tabs 등의 `helperText` + `invalid` 로 에러 표시 — 별도 에러 컴포넌트 만들지 말 것
- 위젯 카드는 무조건 `<AiCard>` 로 감싸기
- AI 진입점은 [`ai-entry.md`](./ai-entry.md) 의 `AiInlinePrompt` 사용 (Button 대신)

❌ **Don't**

- `<div className="bg-white border …">` 카드 새로 작성 — `AiCard` 와 1px 라도 어긋남
- `<input type="text">` 직접 작성 — `TextField` 의 라벨/error/clearable 누락
- `Chip` 으로 클릭 토글 만들기 — `FilterChip` 사용
- `Tabs variant="large"` 를 좁은 공간에 — `variant="segmented"` 사용
- `Modal` 안에 또 `Modal` — 흐름 끊김
- Tone 을 6단계 이상으로 확장 — 합칠 수 있는지 먼저 검토
