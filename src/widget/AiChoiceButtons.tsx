/**
 * AiChoiceButtons — 사용자 선택 CTA 한 쌍.
 *
 * ## Purpose
 * AI 흐름에서 다음 행동을 사용자가 고르게 하는 2지선다 버튼. Primary(filled blue)와
 * Secondary(아웃라인) 두 옵션으로, 각 라벨과 선택 hint(예: "(98%)")는 prop 으로 주입하고
 * 진입 시 페이드인합니다. 제안/미리보기 카드 **아래**에 두어 승인·진행·취소 등 결정을 받습니다.
 *
 * ## When to use
 * - 제안/미리보기 카드 다음의 "진행 / 취소", "등록 / 수정" 같은 2지선다 결정.
 * - primary 강조 + secondary 보조의 위계가 분명한 한 쌍의 액션.
 *
 * ## When NOT to use
 * - 3개 이상의 기준 중 택1 + 근거 설명 → [[AiCriteriaSelection]].
 * - 결정 없이 정보만 제시 → [[AiProposalCard]] / [[AiKeyValuePreview]] (카드 자체에 버튼 금지).
 * - 자유 입력 / 자연어 응답 → [[AiInlinePrompt]] / [[AiPromptInput]].
 *
 * ## Composition rules
 * - 이 컴포넌트는 카드가 아님 — 버튼 한 쌍만 렌더하며, 위 메시지 [[AiCard]] 와 형제로 배치.
 * - 색은 토큰 (`--color-primary` · `--color-primary-strong` · `--color-primary-bg`) — 인라인 hex 금지.
 * - 실제 결정 로직은 부모가 `onClick` 으로 소유 — 버튼은 트리거만.
 *
 * @example
 * ```tsx
 * <AiChoiceButtons
 *   primary={{ label: "이 구성으로 진행", onClick: confirm }}
 *   secondary={{ label: "다시 제안받기", onClick: retry }}
 * />
 * ```
 */
export type Choice = {
  label: string;
  /** 보조 라벨 (선택, "(98%)" 등) */
  hint?: string;
  onClick?: () => void;
};

export default function AiChoiceButtons({
  primary,
  secondary,
  delay = 0,
}: {
  primary: Choice;
  secondary: Choice;
  delay?: number;
}) {
  return (
    <div
      className="ai-anim-in flex flex-col gap-8px w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={primary.onClick}
        className="flex items-center justify-center h-36px px-16px rounded-6px bg-color-var-color-brand-blue text-white text-md tracking-default cursor-pointer transition-colors hover-bg-color-var-color-brand-blue-deep"
        style={{
          fontFamily: "var(--font-family-korean)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {primary.label}
        {primary.hint && <span className="ml-4px opacity-90">{primary.hint}</span>}
      </button>
      <button
        onClick={secondary.onClick}
        className="flex items-center justify-center h-36px px-16px rounded-6px bg-white text-brand-blue text-md tracking-default border border-color-var-color-brand-blue cursor-pointer transition-colors hover-bg-color-var-color-brand-blue-bg"
        style={{
          fontFamily: "var(--font-family-korean)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {secondary.label}
        {secondary.hint && <span className="ml-4px opacity-80">{secondary.hint}</span>}
      </button>
    </div>
  );
}
