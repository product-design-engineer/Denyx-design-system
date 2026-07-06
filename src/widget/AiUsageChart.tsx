/**
 * AiUsageChart — 시간대별 GPU 사용률 막대 차트 카드.
 *
 * ## Purpose
 * 24개 시간 슬롯(0–23시)의 사용률(%)을 막대로 표시하는 미니 차트. `highlightThreshold`
 * 이상인 막대는 짙은 색으로 강조하고, `null` 슬롯은 데이터 없음(회색)으로 표현. 진입 시
 * 각 막대가 하단에서 순차 성장(35ms 스태거)하는 애니메이션. 흰 카드 chrome 자체 보유.
 *
 * ## When to use
 * - 하루(24시간) 사용률의 시간대별 패턴/피크를 한눈에 보여줄 때.
 * - 임계값을 넘는 구간을 색으로 강조해 부하 집중 시간대를 알릴 때.
 *
 * ## When NOT to use
 * - 행 단위 통계/분류 표 → [[AiClassificationTable]].
 * - 비용 비교/분해 → [[AiCostTable]] · [[AiCostBreakdown]].
 * - 24슬롯이 아닌 임의 시계열/다계열 차트 → 전용 차트 컴포넌트 검토.
 *
 * ## Composition rules
 * - 자체 카드 chrome(흰 배경/보더/라운드/패딩)을 보유 — [[AiCard]] 로 감싸지 않음.
 * - `values` 는 0~100 또는 `null`(데이터 없음) 배열. 통상 길이 24.
 * - 강조 막대 색은 토큰(`--color-primary-soft`, `--color-surface-100`) 사용. 단,
 *   비강조 막대는 인라인 hex(`#b7dbff`)가 남아 있어 토큰화는 차후 정리 대상.
 * - `caption` 은 상단 uppercase 라벨([[AiCaption]] 격).
 * - `delay` 는 부모 메시지 시퀀스의 stagger 지연(ms)이며 막대 스태거의 기준점.
 *
 * @example
 * ```tsx
 * <AiUsageChart
 *   caption="Hourly GPU Utilization"
 *   values={[12, 18, 9, null, 44, 61, 73, 88, 95, 82, ...]}
 *   highlightThreshold={50}
 * />
 * ```
 */
export default function AiUsageChart({
  caption = "Hourly GPU Utilization",
  values,
  highlightThreshold = 50,
  delay = 0,
}: {
  caption?: string;
  /** 24개 hourly 사용률 (0~100). null이면 데이터 없음 */
  values: (number | null)[];
  /** 이 값을 넘으면 짙은 색 강조 */
  highlightThreshold?: number;
  delay?: number;
}) {
  const HEIGHT = 96;
  return (
    <div
      className="ai-anim-in flex flex-col gap-8px w-full bg-white border border-color-var-color-border-default rounded-8px p-12px"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-bold text-tertiary tracking-caps uppercase leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {caption}
        </span>
        <span
          className="text-xs text-disabled tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          0–23시
        </span>
      </div>
      <div
        className="flex items-end gap-2px w-full"
        style={{ height: HEIGHT }}
      >
        {values.map((v, i) => {
          const h = v === null ? 0 : Math.max(2, (v / 100) * HEIGHT);
          const isHigh = (v ?? 0) >= highlightThreshold;
          const barDelay = delay + 100 + i * 35;
          return (
            <div
              key={i}
              className="ai-anim-bar flex-1 min-w-0 rounded-2px"
              style={{
                height: h,
                background: v === null
                  ? "var(--color-surface-100)"
                  : isHigh
                    ? "var(--color-primary-soft)"
                    : "#b7dbff",
                animationDelay: `${barDelay}ms`,
              }}
              title={v === null ? "" : `${i}시 · ${v.toFixed(1)}%`}
            />
          );
        })}
      </div>
    </div>
  );
}
