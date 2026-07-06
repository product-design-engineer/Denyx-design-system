import AiClickCursor from "./AiClickCursor";

/**
 * AiOptionButton — Part / Widget. 선택 옵션 버튼.
 *
 * ## Purpose
 * 선택 CTA 한 개. 상태(selected / dimmed / pending)에 따라 filled blue 강조,
 * dim, 자동 클릭 손 인디케이터를 표현한다.
 *
 * ## When to use
 * - 옵션 목록에서 항목마다 렌더.
 *
 * ## When NOT to use
 * - 정보성 tone 행(비-인터랙티브) → [[AiToneRow]].
 * - 일반 2지선다 CTA → [[AiChoiceButtons]].
 *
 * ## Composition rules
 * - 선택 잠금/상태 계산(`selected`/`dimmed`/`pending`/`locked`)은 부모가 결정해 props 로 주입 — 버튼은 표현용.
 * - 색은 토큰(`--color-primary`) 사용 — 인라인 hex 신규 추가 금지.
 * - `pending` 일 때 우측 상단에 [[AiClickCursor]] 손 인디케이터 표시.
 *
 * @example
 * ```tsx
 * {options.map((o) => {
 *   const isSelected = selectedKey === o.key;
 *   const isDimmed = selectedKey !== null && !isSelected;
 *   const isPending = pendingPick === o.key && !selectedKey;
 *   return (
 *     <AiOptionButton
 *       key={o.key}
 *       label={o.label}
 *       selected={isSelected}
 *       dimmed={isDimmed}
 *       pending={isPending}
 *       locked={selectedKey !== null}
 *       onClick={() => handleClick(o.key)}
 *     />
 *   );
 * })}
 * ```
 */
export default function AiOptionButton({
  label,
  selected,
  dimmed,
  pending,
  locked,
  onClick,
}: {
  label: string;
  /** filled blue 강조 (선택됨) */
  selected: boolean;
  /** 다른 옵션이 선택되어 흐려짐 */
  dimmed: boolean;
  /** 자동 클릭 직전 — 손 인디케이터 표시 */
  pending: boolean;
  /** 선택 확정 후 잠금 (disabled + pointer-events none) */
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={locked}
        className="flex items-center justify-center h-32px px-12px rounded-6px text-base tracking-default border cursor-pointer whitespace-nowrap"
        style={{
          fontFamily: "var(--font-family-korean)",
          fontWeight: "var(--font-weight-medium)",
          background: selected ? "var(--color-primary)" : "#fff",
          color: selected ? "#fff" : "var(--color-primary)",
          borderColor: selected ? "var(--color-primary)" : "var(--color-primary)",
          opacity: dimmed ? 0.4 : 1,
          pointerEvents: locked ? "none" : "auto",
          transition: "background 180ms, color 180ms, opacity 180ms, transform 120ms",
          transform: selected ? "scale(1.02)" : "scale(1)",
          boxShadow: selected ? "0 2px 8px rgba(41,108,242,0.25)" : "none",
        }}
      >
        {label}
      </button>
      {pending && <AiClickCursor style={{ right: -16, top: 10 }} />}
    </div>
  );
}
