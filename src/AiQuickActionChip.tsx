interface AiQuickActionChipProps {
  label: string;
  onClick?: () => void;
}

/**
 * AiQuickActionChip — AI surface. [[AiWidget]] 본문의 빠른 액션 칩(pill 버튼) 한 개.
 *
 * ## Purpose
 * AI 위젯 환영 메시지 아래 늘어서는 "현재 상태 요약" 등 빠른 액션 칩 하나를 렌더.
 * 인라인으로 흩어져 있던 `QUICK_ACTIONS.map` 의 버튼 마크업을 한 곳으로 모은 것 —
 * pill 형태(rounded-full · border · 브랜드 블루 텍스트) + hover 시 배경이
 * `--color-primary-bg` 로 채워지는 인라인 핸들러를 그대로 보유.
 *
 * ## When to use
 * - [[AiWidget]] 가 `QUICK_ACTIONS.map` 으로 칩마다 렌더 (기본 용법).
 * - AI 패널과 동일한 외형의 빠른 액션 pill 이 필요한 다른 표면.
 *
 * ## When NOT to use
 * - 일반 폼/툴바의 버튼 → 표준 버튼 컴포넌트.
 * - 헤더 안 AI 토글 버튼 → [[AiAssistantButton]].
 *
 * ## Composition rules
 * - `label` 텍스트만 주입 — pill 외형/hover 전환은 이 컴포넌트가 책임.
 * - 색·배경은 토큰 binding (`--color-card` · `--color-primary-strong` · `--color-primary-bg`) — 인라인 hex 금지.
 * - hover 배경 전환은 표현용 인라인 핸들러로 처리(상태 비보유).
 *
 * @example
 * ```tsx
 * {QUICK_ACTIONS.map((label) => <AiQuickActionChip key={label} label={label} />)}
 * ```
 */
export default function AiQuickActionChip({ label, onClick }: AiQuickActionChipProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 h-7 rounded-full text-base font-medium border cursor-pointer transition-colors"
      style={{
        background: "var(--color-card)",
        color: "var(--color-primary-strong)",
        borderColor: "var(--color-primary-bg)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-primary-bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--color-card)";
      }}
    >
      {label}
    </button>
  );
}
