/**
 * StatCard — Primitives layer.
 *
 * ## Purpose
 * 대시보드 KPI 요약 카드. 큰 숫자 + 라벨 + 트렌드 아이콘으로 핵심 지표를 한눈에 표시.
 * 3~6개를 가로로 나열하여 대시보드 상단 요약 바 구성.
 *
 * ## When to use
 * - 대시보드 상단 KPI 요약 (총 GPU, 활성, 유휴 등).
 * - 3~6개 카드를 가로 배치.
 *
 * ## When NOT to use
 * - 시계열 트렌드 → [[MiniLineChart]] 사용.
 * - 카테고리 분포 → 차트 사용.
 * - 상세 데이터 → [[DataTable]] 사용.
 *
 * ## Composition rules
 * - tone 으로 좌측 인디케이터 색 결정.
 * - value 는 numeric 폰트 + bold. unit 은 tertiary.
 * - trend 는 ▲(success) / ▼(error) / ─(tertiary).
 * - 색은 토큰만 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <StatCard label="활성 GPU" value="847" unit="대" tone="success" trend="up" />
 * <StatCard label="유휴 GPU" value="12" unit="대" tone="warning" trend="down" />
 * ```
 */

export type StatCardTone = "neutral" | "success" | "warning" | "critical" | "info";
export type StatCardTrend = "up" | "down" | "stable";

export type StatCardProps = {
  /** KPI 라벨. */
  label: string;
  /** KPI 값 (numeric 폰트). */
  value: string;
  /** 단위 (e.g., "대", "%", "ms"). */
  unit?: string;
  tone?: StatCardTone;
  trend?: StatCardTrend;
  /** 진입 애니메이션 딜레이 (ms). */
  delay?: number;
};

const TONE_COLOR: Record<StatCardTone, string> = {
  neutral: "var(--color-text-tertiary)",
  success: "var(--color-status-success)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
  info: "var(--color-primary)",
};

const TREND_SYMBOL: Record<StatCardTrend, string> = { up: "▲", down: "▼", stable: "─" };
const TREND_COLOR: Record<StatCardTrend, string> = {
  up: "var(--color-status-success)",
  down: "var(--color-status-error)",
  stable: "var(--color-text-tertiary)",
};

export default function StatCard({
  label,
  value,
  unit,
  tone = "neutral",
  trend,
  delay,
}: StatCardProps) {
  return (
    <div
      className="ai-anim-in"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-md)",
        background: "var(--color-card)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--spacing-md) var(--spacing-lg)",
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {/* Tone indicator */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: TONE_COLOR[tone],
          flexShrink: 0,
        }}
      />
      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xs)", minWidth: 0 }}>
        <span
          className="text-sm text-tertiary"
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-xs)" }}>
          <span
            className="font-bold text-primary"
            style={{ fontSize: "var(--text-xl)", fontFamily: "var(--font-family-numeric)" }}
          >
            {value}
          </span>
          {unit && <span className="text-sm text-tertiary">{unit}</span>}
          {trend && (
            <span className="text-xs" style={{ color: TREND_COLOR[trend] }}>
              {TREND_SYMBOL[trend]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
