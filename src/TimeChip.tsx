/**
 * TimeChip — Primitives layer.
 *
 * ## Purpose
 * 시간 값 표시 칩. 라벨 + 값 + 노트를 일관된 시각으로 보여줌.
 * 수치는 numeric 폰트, 텍스트는 korean 폰트 자동 적용.
 *
 * ## When to use
 * - 독립 시간 값 표시 (분석 기준 시각, 차트 범위, 이벤트 시각).
 * - stale 타임스탬프 경고 (tone="warning").
 *
 * ## When NOT to use
 * - 인라인 텍스트 ("03:20에 시작") → 일반 텍스트.
 * - 시간 입력/선택 → [[TimeRangeSelector]] 사용.
 *
 * ## Composition rules
 * - 사이즈 고정 20px (Chip md 정렬).
 * - value 는 numeric 폰트 + medium weight.
 * - 색은 토큰만 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <TimeChip label="기준" value="2026-10-10 14:30" />
 * <TimeChip value="5분 전" tone="warning" note="stale" />
 * ```
 */
import type { ReactNode } from "react";

export type TimeChipTone = "neutral" | "warning";

export type TimeChipProps = {
  /** 값 앞 라벨 (e.g., "기준", "분석 범위"). */
  label?: string;
  /** 시간 값 (numeric 폰트 적용). */
  value: string;
  /** 값 뒤 보조 (e.g., "KST", "stale"). */
  note?: string;
  tone?: TimeChipTone;
  /** 좌측 아이콘. */
  leadingIcon?: ReactNode;
  className?: string;
};

const TONE_BG: Record<TimeChipTone, string> = {
  neutral: "var(--color-surface-100)",
  warning: "var(--color-surface-warning)",
};

const TONE_BORDER: Record<TimeChipTone, string> = {
  neutral: "var(--color-border-default)",
  warning: "var(--color-status-warning)",
};

export default function TimeChip({
  label,
  value,
  note,
  tone = "neutral",
  leadingIcon,
  className,
}: TimeChipProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-xs)",
        height: 20,
        padding: "0 var(--spacing-md)",
        borderRadius: "var(--radius-full)",
        background: TONE_BG[tone],
        border: `1px solid ${TONE_BORDER[tone]}`,
        fontSize: "var(--text-sm)",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {leadingIcon && <span style={{ flexShrink: 0, display: "inline-flex" }}>{leadingIcon}</span>}
      {label && (
        <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-family-korean)" }}>
          {label}
        </span>
      )}
      <span style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-family-numeric)", fontWeight: 500 }}>
        {value}
      </span>
      {note && (
        <span style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-family-korean)" }}>
          {note}
        </span>
      )}
    </span>
  );
}
