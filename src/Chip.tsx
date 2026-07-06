/**
 * Chip — Primitives layer.
 *
 * ## Purpose
 * 짧은 라벨·태그·메타데이터 표시. severity 칩, 카테고리 라벨, 상태 표시 등 전반.
 * 인라인 `<span>` 으로 직접 색 칠하지 말 것 — 톤 일관성은 이 컴포넌트가 보장.
 *
 * ## When to use
 * - Severity 라벨 (Critical / Warning / Info)
 * - 카테고리 태그 (Disk / JVM / Kubernetes)
 * - 상태 표시 (Active / Pending / Closed)
 * - 닫기 가능한 선택 항목 (다중 선택 결과)
 *
 * ## When NOT to use
 * - 클릭 시 필터 토글 → `FilterChip` (interactive 변형)
 * - 본문 텍스트 강조 → 인라인 `<strong>` / 색 utility
 * - 버튼 → `Button`
 *
 * ## Composition rules
 * - 색은 토큰 (brand-blue / status-warning / status-error / surface-100 등) — 직접 hex 금지
 * - variant: solid(채움) · soft(연한 배경) · outline(보더만)
 * - tone: primary · warning · critical · neutral
 * - size: sm(18px) · md(20px)
 * - closable=true → 우측 × 버튼 + onClose 콜백
 *
 * @example
 * ```tsx
 * <Chip tone="critical" variant="soft">Critical</Chip>
 * <Chip tone="neutral" variant="outline" leadingIcon="●">Disk</Chip>
 * <Chip tone="primary" closable onClose={() => removeFilter("disk")}>Disk</Chip>
 * ```
 */
import type { CSSProperties, ReactNode } from "react";

export type ChipVariant = "solid" | "soft" | "outline";
export type ChipTone = "primary" | "warning" | "critical" | "neutral" | "success";
export type ChipSize = "sm" | "md" | "lg";

export type ChipProps = {
  /** 시각 강도. solid(채움 + 흰 글씨) / soft(연한 배경 + 컬러 글씨) / outline(테두리). */
  variant?: ChipVariant;
  /** 톤 — 색 테마. */
  tone?: ChipTone;
  /** 사이즈 — 높이 sm=18px / md=20px. */
  size?: ChipSize;
  /** 좌측 슬롯 — 아이콘/도트 등 작은 ReactNode. */
  leadingIcon?: ReactNode;
  /** 닫기 가능 — true 면 우측 × 버튼 표시. */
  closable?: boolean;
  /** 닫기 클릭 콜백. closable=true 일 때 사용. */
  onClose?: () => void;
  /** 라벨 본문. */
  children: ReactNode;
  /** 외부 className 추가. */
  className?: string;
};

/* ─── style maps ─────────────────────────────────────── */

const SIZE = {
  sm: { h: 18, padX: 6, gap: 4, text: "text-xs" },
  md: { h: 20, padX: 8, gap: 4, text: "text-sm" },
  lg: { h: 28, padX: 12, gap: 6, text: "text-base" },
} as const;

const TONE_COLORS: Record<ChipTone, { main: string; soft: string; fgSoft: string }> = {
  primary:  { main: "var(--color-primary)",     soft: "var(--color-primary-bg)", fgSoft: "var(--color-primary-strong)" },
  warning:  { main: "var(--color-indicator-warning)", soft: "#FFF4E5",                  fgSoft: "#9A6B00" },
  critical: { main: "var(--color-indicator-critical)", soft: "#FDECEC",                 fgSoft: "#B5302A" },
  success:  { main: "var(--color-status-success)", soft: "#E4F7EC",                    fgSoft: "#007030" },
  neutral:  { main: "var(--color-text-tertiary)",  soft: "var(--color-surface-100)",   fgSoft: "var(--color-text-secondary)" },
};

function variantStyle(variant: ChipVariant, tone: ChipTone): CSSProperties {
  const c = TONE_COLORS[tone];
  if (variant === "solid") {
    return { backgroundColor: c.main, color: "#fff", border: "1px solid transparent" };
  }
  if (variant === "outline") {
    return { backgroundColor: "transparent", color: c.main, border: `1px solid ${c.main}` };
  }
  // soft
  return { backgroundColor: c.soft, color: c.fgSoft, border: "1px solid transparent" };
}

export default function Chip({
  variant = "soft",
  tone = "neutral",
  size = "md",
  leadingIcon,
  closable = false,
  onClose,
  children,
  className = "",
}: ChipProps) {
  const spec = SIZE[size];

  return (
    <span
      className={`inline-flex items-center font-medium ${spec.text} ${className}`}
      style={{
        height: spec.h,
        paddingInline: spec.padX,
        gap: spec.gap,
        lineHeight: 1,
        // Pill 비례 — 사이즈에 따라 h/2 자동. sm 9 / md 10 / lg 14.
        borderRadius: spec.h / 2,
        ...variantStyle(variant, tone),
      }}
    >
      {leadingIcon !== undefined && leadingIcon !== null && (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden>
          {leadingIcon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {closable && (
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full opacity-70 hover-opacity-100"
          style={{
            width: spec.h - 8,
            height: spec.h - 8,
            marginInlineStart: 2,
            backgroundColor: "transparent",
            border: 0,
            color: "currentColor",
            padding: 0,
          }}
        >
          <svg viewBox="0 0 10 10" width={spec.h - 12} height={spec.h - 12} aria-hidden>
            <path
              d="M2 2 L8 8 M8 2 L2 8"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
