/**
 * AiSendButton — AI 위젯 입력창 송신 버튼.
 *
 * ## Purpose
 * `DenyxAiWidget` / `<AiPromptInput>` 의 텍스트 입력 영역 우하단 송신 trigger.
 * input 텍스트 유무에 따라 활성(파랑 채움) / 비활성(회색 채움) 자동 전환.
 *
 * ## Spec (실 위젯 마크업 1:1)
 * - 24×24, `rounded-4px` (squared) — 위젯 인라인 spec 그대로
 * - active:   배경 `var(--color-primary)` (var(--color-primary)) + 같은 색 1px 보더 + 흰 화살표
 * - inactive: 배경 `var(--color-surface-50)` (var(--color-surface-50)) + #d3d3d3 1px 보더 + 회색 화살표
 * - icon: 8→4/12 의 상향 화살표 (위로 올리는 송신)
 *
 * ## When to use
 * - `<AiPromptInput>` 내부 — 자체 채택.
 * - `DenyxAiWidget` 의 직접 송신 trigger (인라인 마크업 교체 시).
 *
 * ## When NOT to use
 * - 일반 form submit → [[Button]] (variant=contained · tone=primary · type=submit).
 * - AI 위젯 토글 → [[AiAssistantButton]].
 * - 페이지 헤더의 AI 진입 → [[AiInlinePrompt]] (내부에서 AiSendButton 을 자동 사용).
 *
 * ## Composition rules
 * - 24×24px, `rounded-4px` — 위젯 인라인 spec 1:1.
 * - active 색은 토큰 (`--color-primary` 배경, 흰 화살표) — 인라인 hex 금지.
 * - inactive 색은 토큰 (`--color-surface-50` 배경, `#d3d3d3` 보더) — 보더만 예외적 hex(토큰화 대상).
 * - `showCursor` 는 시연 전용 — 프로덕션에서 사용 금지.
 * - [[AiPromptInput]] · [[AiInlinePrompt]] 가 내부에서 자동 렌더 — 단독 import 는 시연 시나리오 한정.
 *
 * @example
 * ```tsx
 * <AiSendButton active={input.trim().length > 0} onClick={() => onSubmit?.(input)} />
 * ```
 */
import type { ButtonHTMLAttributes } from "react";
import AiClickCursor from "./AiClickCursor";

export type AiSendButtonProps = {
  /** true 면 활성 (파랑 채움). false 면 비활성 (회색 채움, disabled). */
  active?: boolean;
  /** 시연용 자동 클릭 ripple (시연 시나리오 전용). */
  showCursor?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function AiSendButton({
  active = false,
  showCursor = false,
  className = "",
  ...rest
}: AiSendButtonProps) {
  const isDisabled = !active || rest.disabled;
  return (
    <div className="relative shrink-0">
      <button
        type={rest.type ?? "submit"}
        aria-label="전송"
        disabled={isDisabled}
        className={`ai-send-btn flex items-center justify-center rounded-4px shrink-0 size-24px transition-colors ${
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
        style={{
          backgroundColor: active ? "var(--color-primary)" : "var(--color-surface-50)",
          border: active ? "1px solid var(--color-primary)" : "1px solid #d3d3d3",
        }}
        {...rest}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 12V4M8 4L4 8M8 4L12 8"
            stroke={active ? "#fff" : "var(--color-text-disabled)"}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {showCursor && <AiClickCursor style={{ right: -18, top: 6 }} />}
    </div>
  );
}
