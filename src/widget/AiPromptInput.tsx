/**
 * AiPromptInput — 사용자 자연어 입력 영역 (위젯 인풋 chrome 통째).
 *
 * Figma: 27087:3416 (Common 파일).
 *
 * ## Purpose
 * `DenyxAiWidget` 의 텍스트 입력 + 첨부 chip + 토큰 pill + 송신 버튼 + 하단 caption 을 묶은 단일
 * 단위. 위젯이 호출처별로 다른 입력 chrome 을 가져선 안 되며, 다른 페이지·시나리오 (검색 prompt /
 * 명령창 등) 에서 같은 입력 UX 가 필요하면 본 컴포넌트를 그대로 import.
 *
 * ## Composition (Figma 27087:3416 verbatim)
 * ```
 * ┌─ ai-input-wrapper (2px border, conditional var(--color-primary-bg-subtle) / var(--color-primary)) ─┐
 * │ [첨부 chips 행 — attachments prop 있을 때만]                    │
 * │                                                                  │
 * │ <textarea>  placeholder 또는 입력 텍스트                         │
 * │                                                                  │
 * │ [+ attach] [토큰 입력 N · 출력 M]              [⬆ AiSendButton] │
 * └────────────────────────────────────────────────────────────────┘
 * AI 응답은 정확하지 않을 수 있습니다. 중요한 결정은 반드시 확인해 주세요.  ← 하단 caption
 * ```
 *
 * ## When to use
 * - `DenyxAiWidget` 내부 입력 영역 (현재 인라인 마크업의 추출 대상).
 * - 외부에서 AI 자연어 입력 UX 가 필요한 경우 (예: 인라인 검색 prompt, fullscreen 명령창).
 *
 * ## When NOT to use
 * - 일반 form text input → 표준 `<input>` 또는 `<textarea>` 사용.
 * - 한 줄 검색창 → 별도 search input (multi-line, 첨부, 토큰 pill 불필요).
 *
 * ## Controlled vs Editable mode
 * - `value` 가 정의되면 controlled (parent 가 텍스트 통제) — onChange 필수.
 * - `value` 가 `undefined` 면 editable mode (내부 typed state).
 * - 시연 시나리오에서 placeholder 만 보여주려면 controlled 로 빈 문자열 고정 + readOnly 효과.
 *
 * ## Composition rules
 * - 토큰 pill (`tokenInput` / `tokenOutput`) 는 [[TokenUsageBadge]] (Figma 29424:19317) — pill 형 inline.
 * - 송신 버튼은 [[AiSendButton]] (24×24 squared) — input 텍스트 있으면 활성 자동 전환.
 * - 첨부 chip 행은 `attachments` prop 있을 때만 노출. mime 미지정 시 "CSV" 로 fallback.
 * - 캡션 "AI 응답은 정확하지 않을 수 있습니다…" 는 prototype 전역 정책 — 임의로 제거하지 말 것.
 *
 * @example
 * ```tsx
 * const [text, setText] = useState("");
 * <AiPromptInput
 *   value={text}
 *   onChange={setText}
 *   onSubmit={(v) => sendToAi(v)}
 *   placeholder="어떤 작업을 함께 할까요?"
 *   tokenInput={3395}
 *   tokenOutput={181}
 * />
 * ```
 */
import { useState, type KeyboardEvent, type ReactNode } from "react";
import AiSendButton from "./AiSendButton";

export type AiPromptAttachment = {
  /** 파일 이름 (truncate 처리됨). */
  name: string;
  /** MIME 타입 라벨 (미지정 시 "CSV" 표시). */
  mime?: string;
};

export type AiPromptInputProps = {
  /** Controlled value. undefined → editable mode (내부 state). */
  value?: string;
  /** value 변경 콜백 — controlled mode 에서 필수. */
  onChange?: (v: string) => void;
  /** Enter 또는 송신 버튼 클릭 시 호출. value.trim() 비어있으면 호출 안 됨. */
  onSubmit?: (v: string) => void;
  /** placeholder 문구. 기본 "어떤 작업을 함께 할까요?". */
  placeholder?: string;
  /** 입력 영역 위에 노출할 첨부 chip. */
  attachments?: AiPromptAttachment[];
  /** 토큰 입력 카운트 (Figma 29424:19317 pill). */
  tokenInput?: number;
  /** 토큰 출력 카운트. */
  tokenOutput?: number;
  /** 송신 버튼 위에 시연용 자동 클릭 ripple 표시. */
  showSendCursor?: boolean;
  /** 송신 버튼 클릭에 사용자 정의 핸들러 (시연용 onClick 직접 트리거). 없으면 textarea value 로 onSubmit. */
  onSendClick?: () => void;
  /** 하단 caption 텍스트. 정책상 default 유지 권장. */
  caption?: ReactNode;
  /** 첨부 추가 버튼 클릭 핸들러. */
  onAttachClick?: () => void;
  /** disabled — 전체 입력 차단 (AI 응답 진행 중 등). */
  disabled?: boolean;
};

const DEFAULT_CAPTION = "AI 응답은 정확하지 않을 수 있습니다. 중요한 결정은 반드시 확인해 주세요.";

export default function AiPromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "어떤 작업을 함께 할까요?",
  attachments,
  tokenInput = 3395,
  tokenOutput = 181,
  showSendCursor = false,
  onSendClick,
  caption = DEFAULT_CAPTION,
  onAttachClick,
  disabled = false,
}: AiPromptInputProps) {
  const editable = value === undefined;
  const [typed, setTyped] = useState("");
  const effectiveValue = editable ? typed : value;
  const hasInput = effectiveValue.trim().length > 0;

  const submit = () => {
    if (!hasInput || disabled) return;
    if (onSendClick) {
      onSendClick();
    } else if (onSubmit) {
      onSubmit(effectiveValue);
      if (editable) setTyped("");
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        className="ai-input-wrapper relative bg-white flex flex-col gap-4px items-center justify-center p-12px shrink-0 rounded-8px transition-all duration-200 w-full"
        style={{ border: hasInput ? "2px solid var(--color-primary)" : "2px solid var(--color-primary-bg-subtle)" }}
      >
        {/* 첨부 chip 행 — Figma 27087:3416 */}
        {attachments && attachments.length > 0 && (
          <div className="flex gap-6px items-center w-full overflow-x-auto pb-4px">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="flex flex-col gap-4px bg-white border border-cd3d3d3 rounded-6px px-8px py-6px shrink-0"
                style={{ width: 100 }}
              >
                <p
                  className="text-base font-bold text-primary tracking-default leading-normal truncate"
                  style={{ fontFamily: "var(--font-family-korean)" }}
                  title={a.name}
                >
                  {a.name}
                </p>
                <span
                  className="self-start text-xs text-tertiary bg-rgba-0-0-0-0_05 rounded-3px px-4px py-1px uppercase"
                  style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
                >
                  {a.mime ?? "CSV"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* textarea */}
        <div className="flex gap-0 items-center p-2px w-full">
          <textarea
            placeholder={placeholder}
            rows={1}
            value={effectiveValue}
            readOnly={!editable}
            disabled={disabled}
            onChange={
              editable
                ? (e) => setTyped(e.target.value)
                : onChange
                  ? (e) => onChange(e.target.value)
                  : undefined
            }
            onKeyDown={editable || onChange ? handleKey : undefined}
            className="ai-input-textarea w-full text-lg text-primary tracking-default leading-normal resize-none outline-none border-0 bg-transparent placeholder:text-disabled"
            style={{
              fontFamily: "var(--font-family-korean)",
              fontWeight: "var(--font-weight-regular)",
              minHeight: 20,
              maxHeight: 120,
            }}
          />
        </div>

        {/* 하단 row: [+ attach] [token pill] ... [send button] */}
        <div className="flex items-center justify-between p-0 w-full">
          <div className="flex gap-8px items-center shrink-0">
            <button
              type="button"
              aria-label="파일 또는 이미지 추가"
              onClick={onAttachClick}
              disabled={disabled}
              className="group-plus flex items-center justify-center p-2px rounded-4px shrink-0 size-20px cursor-pointer border-0 bg-white hover-bg-black transition-colors disabled-opacity-50 disabled-cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-colors">
                <line x1="8" y1="3.33" x2="8" y2="12.67" className="stroke-color-var-color-text-secondary group-hover-plus-stroke-white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3.33" y1="8" x2="12.67" y2="8" className="stroke-color-var-color-text-secondary group-hover-plus-stroke-white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <TokenUsageBadge inputTokens={tokenInput} outputTokens={tokenOutput} />
          </div>
          <div className="flex gap-8px items-center shrink-0">
            <AiSendButton
              active={hasInput && !disabled}
              onClick={submit}
              showCursor={showSendCursor}
            />
          </div>
        </div>
      </div>

      {/* 하단 caption */}
      {caption && (
        <div className="flex gap-0 items-center justify-end px-0 py-4px shrink-0 w-full">
          <p
            className="text-base text-disabled tracking-normal leading-none whitespace-nowrap"
            style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
          >
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * TokenUsageBadge — AI 입출력 토큰 사용량 pill (Figma 29424:19317).
 *
 * "토큰 입력 N · 출력 M" 형태. bg var(--color-surface-50) / radius 24px / px 8 / py 4 / 10px text, 숫자 bold.
 * AiPromptInput 의 내부 sub-component.
 */
function TokenUsageBadge({ inputTokens, outputTokens }: { inputTokens: number; outputTokens: number }) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  return (
    <div
      className="inline-flex items-center px-8px py-4px rounded-24px shrink-0"
      style={{ backgroundColor: "var(--color-surface-50)" }}
      data-node-id="29424:19317"
    >
      <span
        className="text-xs leading-none text-black whitespace-nowrap"
        style={{ fontFamily: "Inter, 'Noto Sans KR', sans-serif", fontWeight: "var(--font-weight-regular)" }}
      >
        토큰 입력 <strong style={{ fontWeight: "var(--font-weight-bold)" }}>{fmt(inputTokens)}</strong>
        {" · 출력 "}
        <strong style={{ fontWeight: "var(--font-weight-bold)" }}>{fmt(outputTokens)}</strong>
      </span>
    </div>
  );
}
