/**
 * AiInlinePrompt — 한 줄 inline 자연어 입력창.
 *
 * Figma: 27087:3416 의 single-row variant.
 *
 * ## Purpose
 * 모든 구성요소가 **단일 행**으로 배열되는 압축형 prompt 입력. height 고정 (~32px).
 * 배열 순서: `[chip…] [input grow] [+ attach] [⬆ send]` — 정보 → 입력 → 액션 흐름.
 * PageHeader 우측, 카드 헤더, 모달 푸터 등 세로 공간이 한정된 자리에 사용.
 *
 * ## 차이 (vs AiPromptInput)
 * - ❌ TokenUsageBadge (토큰 입력/출력 pill)
 * - ❌ 하단 caption
 * - ❌ 첨부 chip **행** (별도 row 없음, 같은 행에 인라인 compact chip 으로 들어감)
 * - ❌ multi-line textarea — 단일 라인 `<input>` 으로 축소
 * - ✅ 첨부 버튼 (+ icon)
 * - ✅ 첨부 chip — 같은 행 안에 compact (max-w-[120px] · truncate · xs font)
 * - ✅ 송신 버튼 ([[AiSendButton]])
 *
 * ## When to use
 * - PageHeader 우측 inline prompt — chrome 48px 안에 들어가야 함.
 * - 카드 / 모달 / sub-section 의 빠른 질문 입력.
 *
 * ## When NOT to use
 * - 위젯 본체 입력 → [[AiPromptInput]] (token pill · caption · multi-line · 첨부 chip 행 full chrome).
 * - 여러 줄 prompt / 다수 첨부가 자주 들어가는 자리 → [[AiPromptInput]].
 *
 * ## Composition rules
 * - 단일 row, height 고정 (~32px) — `flex-row items-center`.
 * - 첨부 chip 는 같은 행에 inline 으로 들어감. 다수 첨부 시 가로 스크롤이 아니라 chip 자체가 truncate.
 * - 송신 버튼은 [[AiSendButton]] 채택, 입력값 유무로 active 자동 전환.
 * - border 색은 토큰 binding (`--color-primary` / `--color-primary-bg-subtle`) — 인라인 hex 금지.
 *
 * ## Suggestions channel (선택)
 * `suggestions` prop 으로 페이지 컨텍스트에 특화된 chip 제안을 input focus 시 input 아래로
 * floating dropdown 으로 펼침. **한 줄 invariant 는 보존** — chip 들은 inline row 가 아닌
 * 별도 floating panel 에 위치.
 * - chip 클릭 → input value = `suggestion.query`, focus 유지. 송신은 사용자 액션 (⬆ 또는 Enter).
 * - dropdown 폭 = input 폭 anchor 100% (typeahead 표준 패턴).
 *
 * ## Rolling placeholder (옵션)
 * `rollingPlaceholders` (제품별 핵심 prompt 배열) 주입 시, 입력이 비어 있을 때
 * placeholder 가 세로로 롤링(순환)됨. **미주입이면 종전대로 정적 1개** (`placeholder`).
 * 기본 동작 불변 — 롤링은 opt-in. a11y: 네이티브 placeholder 는 비우고 `aria-label`
 * 로 힌트 유지, 롤링 텍스트는 `aria-hidden` 데코레이션.
 *
 * **송신 버튼은 롤링 중에도 비활성 유지** (`hasInput` 기준 그대로). 근거: 롤링 텍스트는
 * placeholder(힌트)일 뿐 실제 입력값이 아니므로(`placeholder ≠ value`), 빈 입력에서 버튼을
 * 활성화하면 사용자가 입력하지 않은 prompt 가 전송되는 오발송이 됨. "클릭→입력" 빠른 진입은
 * `suggestions` chip 채널이 담당하고, placeholder 는 영감/예시 역할로 분리.
 *
 * @example
 * ```tsx
 * <AiInlinePrompt
 *   onSubmit={(v) => askAi(v)}
 *   placeholder="Denyx AI 에게 질문..."
 *   suggestions={[
 *     { id: "spike", label: "Spike 분석", query: "지금 spike 원인을 분석해줘" },
 *     { id: "top",   label: "TOP SQL",  query: "가장 느린 SQL 5개" },
 *   ]}
 * />
 * ```
 */
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import AiSendButton from "./AiSendButton";

export type AiInlineAttachment = {
  /** 파일 이름 (truncate). */
  name: string;
  /** MIME 라벨 (미지정 시 "CSV"). */
  mime?: string;
};

export type AiPromptSuggestion = {
  /** 안정적 key. */
  id: string;
  /** chip 에 표시할 짧은 라벨. */
  label: string;
  /** 선택 시 input 에 채워질 full query. */
  query: string;
  /** chip 좌측 작은 아이콘 (선택). */
  icon?: ReactNode;
};

export type AiInlinePromptProps = {
  /** Controlled value. undefined → editable mode. */
  value?: string;
  /** value 변경 콜백 — controlled mode 에서 필수. */
  onChange?: (v: string) => void;
  /** Enter 또는 송신 버튼 클릭. value.trim() 비어있으면 호출 안 됨. */
  onSubmit?: (v: string) => void;
  /** placeholder. 기본 "어떤 작업을 함께 할까요?". `rollingPlaceholders` 미주입 시 정적 1개. */
  placeholder?: string;
  /**
   * 롤링 placeholder (옵션) — 제품별 핵심 prompt 배열. 2개 이상 + 입력이 비어 있을 때
   * 세로 순환. 미주입이면 `placeholder` 로 정적 동작(기존과 동일).
   */
  rollingPlaceholders?: string[];
  /** 롤링 dwell 간격(ms) — 한 항목이 머무는 시간. 기본 2800. */
  rollingIntervalMs?: number;
  /** 롤링 슬라이드(transition) 시간(ms) — 다음 항목으로 넘어가는 애니메이션. 기본 450. */
  rollingTransitionMs?: number;
  /** 같은 행에 inline 으로 노출할 첨부 chip. */
  attachments?: AiInlineAttachment[];
  /** focus 시 input 아래로 펼쳐지는 chip 제안. 페이지 컨텍스트별 카탈로그를 주입. */
  suggestions?: AiPromptSuggestion[];
  /** suggestion chip 선택 시 콜백 (input 채우기는 자동, 송신은 사용자 액션). */
  onSelectSuggestion?: (s: AiPromptSuggestion) => void;
  /** Storybook / 시연용 — 마운트 시 dropdown 강제 펼침. */
  defaultOpen?: boolean;
  /** 송신 버튼 위에 시연용 자동 클릭 ripple. */
  showSendCursor?: boolean;
  /** 송신 버튼 클릭에 사용자 정의 핸들러. 없으면 input value 로 onSubmit. */
  onSendClick?: () => void;
  /** 첨부 추가 버튼 클릭 핸들러 (외부 파일 picker 등). */
  onAttachClick?: () => void;
  /** disabled — 입력 차단. */
  disabled?: boolean;
};

export default function AiInlinePrompt({
  value,
  onChange,
  onSubmit,
  placeholder = "어떤 작업을 함께 할까요?",
  rollingPlaceholders,
  rollingIntervalMs = 2800,
  rollingTransitionMs = 450,
  attachments,
  suggestions,
  onSelectSuggestion,
  defaultOpen = false,
  showSendCursor = false,
  onSendClick,
  onAttachClick,
  disabled = false,
}: AiInlinePromptProps) {
  const editable = value === undefined;
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(defaultOpen);
  const inputRef = useRef<HTMLInputElement>(null);
  const effectiveValue = editable ? typed : value;
  const hasInput = effectiveValue.trim().length > 0;
  const hasSuggestions = (suggestions?.length ?? 0) > 0;
  const dropdownOpen = focused && hasSuggestions && !disabled;

  // 롤링 placeholder (옵션) — 입력이 비어 있을 때만 제품별 핵심 prompt 를 세로 순환.
  const rollList =
    !hasInput && (rollingPlaceholders?.length ?? 0) > 1 ? rollingPlaceholders! : null;
  const rollLen = rollList?.length ?? 0;
  const [rollIdx, setRollIdx] = useState(0);
  const [rollAnim, setRollAnim] = useState(true);

  useEffect(() => {
    if (defaultOpen) inputRef.current?.focus();
  }, [defaultOpen]);

  // 일정 간격으로 다음 항목으로 전진 (deps 는 primitive 만 — 배열 identity 변동에 흔들리지 않음).
  useEffect(() => {
    if (!rollLen) {
      setRollIdx(0);
      setRollAnim(true);
      return;
    }
    const id = setInterval(() => setRollIdx((i) => i + 1), rollingIntervalMs);
    return () => clearInterval(id);
  }, [rollLen, rollingIntervalMs]);

  // 마지막(첫 항목 clone)에 도달하면 transition 종료 후 무애니메이션으로 0 으로 snap → seamless loop.
  useEffect(() => {
    if (!rollLen) return;
    if (rollIdx === rollLen) {
      const t = setTimeout(() => {
        setRollAnim(false);
        setRollIdx(0);
      }, rollingTransitionMs + 20);
      return () => clearTimeout(t);
    }
    if (!rollAnim) {
      const t = setTimeout(() => setRollAnim(true), 50);
      return () => clearTimeout(t);
    }
  }, [rollIdx, rollAnim, rollLen]);

  const setValueExternal = (v: string) => {
    if (editable) setTyped(v);
    else if (onChange) onChange(v);
  };

  const submit = () => {
    if (!hasInput || disabled) return;
    if (onSendClick) {
      onSendClick();
    } else if (onSubmit) {
      onSubmit(effectiveValue);
      if (editable) setTyped("");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (editable) setTyped(e.target.value);
    else if (onChange) onChange(e.target.value);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && dropdownOpen) {
      e.preventDefault();
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const handleSuggestionClick = (s: AiPromptSuggestion) => {
    setValueExternal(s.query);
    onSelectSuggestion?.(s);
    inputRef.current?.focus();
  };

  return (
    <div className="ai-inline-prompt-wrapper relative w-full">
      <div
        className="ai-inline-prompt relative bg-white flex flex-row gap-6px items-center px-8px py-6px rounded-8px transition-colors duration-200 w-full"
        style={{ border: hasInput ? "1px solid var(--color-primary)" : "1px solid var(--color-primary-bg-subtle)" }}
      >
        {/* 첨부 chip — 같은 행 안에 inline compact (input 좌측 prefix) */}
        {attachments && attachments.length > 0 && attachments.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-4px bg-var-color-surface-50 border border-cd3d3d3 rounded-4px px-6px shrink-0 h-20px max-w-120px"
            title={a.name}
          >
            <span
              className="text-xs text-primary tracking-default leading-none truncate"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {a.name}
            </span>
            <span
              className="text-10px text-tertiary uppercase leading-none shrink-0"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              {a.mime ?? "CSV"}
            </span>
          </div>
        ))}

        {/* 입력 — 단일 라인 input (multi-line 불요, height 일정) + 롤링 placeholder 오버레이(옵션) */}
        <div className="relative flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            placeholder={rollList ? "" : placeholder}
            aria-label={placeholder}
            value={effectiveValue}
            readOnly={!editable && !onChange}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={editable || onChange ? handleChange : undefined}
            onKeyDown={editable || onChange ? handleKey : undefined}
            aria-expanded={dropdownOpen}
            aria-haspopup={hasSuggestions ? "listbox" : undefined}
            className="ai-inline-prompt__input block w-full h-20px min-w-0 p-0 text-base text-primary tracking-default leading-20px outline-none border-0 bg-transparent placeholder:text-disabled disabled-cursor-not-allowed"
            style={{
              fontFamily: "var(--font-family-korean)",
              fontWeight: "var(--font-weight-regular)",
            }}
          />
          {rollList && (
            <div
              aria-hidden
              className="ai-inline-prompt__roller pointer-events-none absolute inset-0 flex items-center overflow-hidden"
            >
              <div className="w-full overflow-hidden" style={{ height: 20 }}>
                <div
                  style={{
                    transform: `translateY(${-rollIdx * 20}px)`,
                    transition: rollAnim ? `transform ${rollingTransitionMs}ms ease` : "none",
                  }}
                >
                  {[...rollList, rollList[0]].map((p, i) => (
                    <div
                      key={i}
                      className="text-base text-disabled tracking-default truncate"
                      style={{
                        height: 20,
                        lineHeight: "20px",
                        fontFamily: "var(--font-family-korean)",
                        fontWeight: "var(--font-weight-regular)",
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 첨부 버튼 (우측, 송신 앞) */}
        <button
          type="button"
          aria-label="파일 또는 이미지 추가"
          onClick={onAttachClick}
          disabled={disabled}
          className="group-plus flex items-center justify-center p-2px rounded-4px shrink-0 size-20px cursor-pointer border-0 bg-white hover-bg-black transition-colors disabled-opacity-50 disabled-cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <line x1="8" y1="3.33" x2="8" y2="12.67" className="stroke-color-var-color-text-secondary group-hover-plus-stroke-white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3.33" y1="8" x2="12.67" y2="8" className="stroke-color-var-color-text-secondary group-hover-plus-stroke-white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* 송신 */}
        <AiSendButton
          active={hasInput && !disabled}
          onClick={submit}
          showCursor={showSendCursor}
        />
      </div>

      {/* Floating suggestion dropdown — input focus 시 펼침, 한 줄 invariant 보존 */}
      {dropdownOpen && (
        <div
          role="listbox"
          aria-label="추천 질의"
          // input blur 방지: chip 의 mousedown 이 발생할 때 focus 가 input 에서 빠져나가지 않도록
          onMouseDown={(e) => e.preventDefault()}
          className="ai-inline-prompt__dropdown absolute left-0 right-0 top-calc-100pct+4px z-50 bg-white rounded-8px p-8px flex flex-wrap gap-6px"
          style={{
            border: "1px solid var(--color-border-default)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          }}
        >
          {suggestions!.map((s) => (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => handleSuggestionClick(s)}
              title={s.query}
              className="flex items-center gap-6px bg-white border rounded-16px px-10px h-24px cursor-pointer transition-colors hover-bg-var-color-brand-blue-bg-2 hover-border-var-color-brand-blue"
              style={{ borderColor: "var(--color-border-default)" }}
            >
              {s.icon && <span className="shrink-0 flex items-center">{s.icon}</span>}
              <span
                className="text-xs text-primary tracking-default leading-none whitespace-nowrap"
                style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
