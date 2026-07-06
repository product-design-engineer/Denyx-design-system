/**
 * FilterChip — Primitives layer.
 *
 * ## Purpose
 * Chip 의 **interactive 변형**. 필터 칩 — 클릭 시 선택 토글, 선택된 상태 강조,
 * 선택 해제(×) 가능. FilterBar 안에 다중 배치되어 다중 필터 진입점 역할.
 *
 * ## When to use
 * - 페이지 헤더의 다중 필터 칩 (severity / 카테고리 / 시간 윈도우)
 * - 선택된 항목의 제거 가능한 라벨
 *
 * ## When NOT to use
 * - 정적 라벨 (display only) → `Chip` (button 시맨틱 없음)
 * - 단일 옵션 펼침 드롭다운 → `FilterDropdown`
 * - 토글 버튼 그룹 (강제 단일 선택) → `Tabs (variant="segmented")`
 *
 * ## Composition rules
 * - 시각 색 정책은 Chip 과 정렬 — selected = solid brand-blue / unselected = soft neutral
 * - `closable && selected` 일 때만 우측 × 표시 (선택된 필터의 제거 의미)
 * - `count` 는 우측 숫자 — 발생 빈도/개수 표시 (예: "Disk · 9")
 * - 키보드: button 기본 (Enter/Space 토글), Tab focus
 *
 * @example
 * ```tsx
 * <FilterChip selected={isDisk} onChange={setDisk}>Disk</FilterChip>
 * <FilterChip selected count={12} onChange={...}>Critical</FilterChip>
 * <FilterChip selected closable onClose={() => removeFilter("disk")}>Disk</FilterChip>
 * ```
 */
import type { ReactNode } from "react";
import type { ChipSize } from "./Chip";

export type FilterChipProps = {
  /** 선택 상태. controlled. */
  selected: boolean;
  /** 토글 콜백 — 클릭 시 (nextSelected) => void. */
  onChange?: (next: boolean) => void;
  /** 비활성. */
  disabled?: boolean;
  /** 사이즈 — Chip 과 동일 spec. sm(20px) / md(24px). FilterChip 은 interactive 라 Chip 보다 2px 큼 (탭 영역). */
  size?: ChipSize;
  /** 좌측 슬롯 — 아이콘/도트. */
  leadingIcon?: ReactNode;
  /** 우측 카운트 — 작은 숫자/문자. (예: 12, "9+") */
  count?: number | string;
  /** 닫기 가능 — true && selected 일 때만 우측 × 표시. */
  closable?: boolean;
  /** 닫기 클릭 콜백. onClose 가 있으면 onChange(false) 와 별개로 호출. */
  onClose?: () => void;
  /** 라벨 본문. */
  children: ReactNode;
  /** 외부 className. */
  className?: string;
};

const SIZE = {
  sm: { h: 20, padX: 8, gap: 4, text: "text-xs", iconBtn: 14, iconStroke: 10 },
  md: { h: 24, padX: 10, gap: 6, text: "text-sm", iconBtn: 16, iconStroke: 12 },
  lg: { h: 32, padX: 14, gap: 8, text: "text-md", iconBtn: 20, iconStroke: 14 },
} as const;

export default function FilterChip({
  selected,
  onChange,
  disabled = false,
  size = "md",
  leadingIcon,
  count,
  closable = false,
  onClose,
  children,
  className = "",
}: FilterChipProps) {
  const spec = SIZE[size];

  // selected vs unselected 색
  const selectedStyle: React.CSSProperties = selected
    ? {
        backgroundColor: "var(--color-primary)",
        color: "#fff",
        border: "1px solid var(--color-primary)",
      }
    : {
        backgroundColor: "var(--color-surface-100)",
        color: "var(--color-text-secondary)",
        border: "1px solid var(--color-surface-100)",
      };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => onChange?.(!selected)}
      className={`inline-flex shrink-0 items-center font-medium transition-colors ${spec.text} ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : selected
          ? "cursor-pointer hover-bg-color-var-color-brand-blue-deep hover-border-color-var-color-brand-blue-deep"
          : "cursor-pointer hover-text-color-var-color-text-primary hover-border-color-var-color-border-strong"
      } ${className}`}
      style={{
        height: spec.h,
        paddingInline: spec.padX,
        gap: spec.gap,
        lineHeight: 1,
        // Pill 비례 — h/2 자동. sm 10 / md 12 / lg 16.
        borderRadius: spec.h / 2,
        ...selectedStyle,
      }}
    >
      {leadingIcon !== undefined && leadingIcon !== null && (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden>
          {leadingIcon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {count !== undefined && count !== null && (
        <span
          className="inline-flex shrink-0 items-center justify-center font-normal"
          style={{
            opacity: selected ? 0.85 : 1,
            color: selected ? "rgba(255,255,255,0.85)" : "var(--color-text-tertiary)",
            marginInlineStart: 2,
          }}
          aria-label={`개수 ${count}`}
        >
          {count}
        </span>
      )}
      {closable && selected && !disabled && (
        <span
          role="button"
          aria-label="필터 제거"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
            onChange?.(false);
          }}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center"
          style={{
            width: spec.iconBtn - 2,
            height: spec.iconBtn - 2,
            marginInlineStart: 2,
            opacity: 0.7,
          }}
          onMouseEnter={(e) => ((e.currentTarget.style.opacity = "1"))}
          onMouseLeave={(e) => ((e.currentTarget.style.opacity = "0.7"))}
        >
          <svg
            viewBox="0 0 10 10"
            width={spec.iconStroke}
            height={spec.iconStroke}
            aria-hidden
          >
            <path
              d="M2 2 L8 8 M8 2 L2 8"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
