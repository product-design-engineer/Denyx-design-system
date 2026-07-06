import type { TimelineStep } from "./AiStepsTimeline";

/**
 * TimelineStepItem — [[AiStepsTimeline]] 의 단일 타임라인 단계 행.
 *
 * ## Purpose
 * 단계 한 건을 한 줄 카드로 렌더 — 상태 마커(완료 ✓ / 진행 spinner) · 라벨(truncate) · 우측 화살표.
 * `AiStepsTimeline` 의 `steps.map(...)` 안에 인라인되어 있던 행 마크업을 그대로 추출한 것.
 *
 * ## When to use
 * - [[AiStepsTimeline]] 가 `steps.map` 으로 단계마다 렌더 (기본 용법). 보통 단독 사용하지 않음.
 *
 * ## When NOT to use
 * - 헤더(`N steps`)·접기/펼치기·등장 애니메이션 → 부모 [[AiStepsTimeline]] 가 책임.
 * - 단계가 아닌 다른 목록 항목 → 해당 위젯의 행 컴포넌트 사용.
 *
 * ## Composition rules
 * - 데이터(`label` · `running`)만 주입 — 행 외형/마커/화살표는 이 컴포넌트가 책임 (표현용).
 * - 마커 색은 토큰만 사용 (완료 `--color-status-success` / 진행 `--color-primary`) — 인라인 hex 금지.
 * - 진행 중(`running: true`)이면 회전 spinner, 아니면 status-success 체크.
 *
 * @example
 * ```tsx
 * {steps.map((s, i) => (
 *   <TimelineStepItem key={i} label={s.label} running={s.running} />
 * ))}
 * ```
 */
export default function TimelineStepItem({
  label,
  running = false,
}: {
  /** 단계 라벨. 예: "지표 수집" */
  label: TimelineStep["label"];
  /** true면 spinner, false면 ✓ */
  running?: TimelineStep["running"];
}) {
  return (
    <div
      className="flex items-center justify-between gap-8px bg-white border border-color-var-color-border-default rounded-6px px-12px h-36px cursor-pointer hover-bg-gray-50"
    >
      <div className="flex items-center gap-8px min-w-0">
        {running ? (
          <span
            className="size-14px rounded-full border-1_5px border-color-var-color-brand-blue border-t-transparent shrink-0"
            style={{ animation: "aiSymbolRotateSlow 0.9s linear infinite" }}
          />
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <circle cx="7" cy="7" r="6.5" fill="var(--color-status-success)" />
            <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span
          className="text-md text-primary tracking-default leading-normal truncate"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {label}
        </span>
      </div>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
        <path d="M4 2l4 4-4 4" stroke="var(--color-border-divider)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
