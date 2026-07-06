/**
 * ReasoningStep — [[AiReasoning]] 카드 본문의 단일 추론 단계 행.
 *
 * ## Purpose
 * reasoning 목록의 한 항목(상태 마커 + 라벨)을 렌더. `running: true` 면 회전 spinner +
 * 라벨 뒤 점 애니메이션(진행 중), false 면 brand-blue 체크 원(완료)으로 표시.
 * AiReasoning 의 `steps.map(...)` 본문에 흩어져 있던 행 마크업을 한 곳으로 모은 것.
 *
 * ## When to use
 * - [[AiReasoning]] 가 `steps.map` 으로 단계마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 *
 * ## When NOT to use
 * - 카드 전체(라벨 + 목록) → [[AiReasoning]] 를 사용.
 * - 접기/펼치기 step 타임라인 → [[AiStepsTimeline]].
 * - tool/function 호출 단위 표시 → [[AiToolCallStep]].
 *
 * ## Composition rules
 * - 데이터(상태 `running` · `label`)만 주입 — 마커/간격은 이 컴포넌트가 책임.
 * - 마커 색(완료 brand-blue / 진행 spinner)은 토큰 사용, 인라인 hex 금지.
 * - AiReasoning 카드 안에서만 사용 — 독립 카드로 감싸지 말 것.
 *
 * @example
 * ```tsx
 * {steps.map((s, i) => (
 *   <ReasoningStep key={i} index={i} label={s.label} running={s.running} />
 * ))}
 * ```
 */
export default function ReasoningStep({
  label,
  running,
}: {
  label: string;
  /** true면 점 애니메이션 진행 중, false면 완료(체크) */
  running?: boolean;
  /** steps.map 의 인덱스 (key 용도) */
  index?: number;
}) {
  return (
    <div className="flex items-center gap-8px">
      {running ? (
        <span
          className="size-10px rounded-full border-1_5px border-color-var-color-brand-blue border-t-transparent"
          style={{ animation: "aiSymbolRotateSlow 0.9s linear infinite" }}
        />
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <circle cx="6" cy="6" r="5.4" fill="var(--color-primary)" />
          <path
            d="M3.5 6.1l1.8 1.8L8.5 4.5"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span
        className="text-base text-secondary tracking-default leading-normal"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {label}
        {running && <span className="ai-reasoning-dots" />}
      </span>
    </div>
  );
}
