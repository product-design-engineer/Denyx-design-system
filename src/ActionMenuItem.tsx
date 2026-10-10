/**
 * ActionMenuItem — Primitives layer.
 *
 * ## Purpose
 * 액션 메뉴 패널의 한 행. 액션을 시작(navigate/execute)하는 목적이며 값 선택이 아님.
 * 체크마크 없음 — 라벨은 동사형("삭제", "복제", "내보내기").
 *
 * ## When to use
 * - 테이블 행·카드의 ⋯ 컨텍스트 메뉴 항목.
 * - 드롭다운 액션 목록.
 *
 * ## When NOT to use
 * - 값 선택 → [[Select]] 또는 [[FilterDropdown]] 사용.
 * - 네비게이션 메뉴 → [[SidebarMenuItem]] 사용.
 *
 * ## Composition rules
 * - `tone="critical"` 이면 라벨 빨간색 (삭제 등 위험 동작).
 * - 한 메뉴 안에서 아이콘은 전부 넣거나 전부 뺌 — 혼합 금지.
 * - 색은 토큰만 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <ActionMenuItem label="복제" icon={<CopyIcon />} onSelect={handleDuplicate} />
 * <ActionMenuItem label="삭제" tone="critical" onSelect={handleDelete} />
 * ```
 */
import type { ReactNode } from "react";

export type ActionMenuItemTone = "default" | "critical";

export type ActionMenuItemProps = {
  /** 동사형 라벨 ("삭제", "복제" 등). */
  label: ReactNode;
  /** 보조 한 줄. */
  description?: ReactNode;
  /** 좌측 아이콘. */
  icon?: ReactNode;
  onSelect?: () => void;
  tone?: ActionMenuItemTone;
  disabled?: boolean;
  className?: string;
};

export default function ActionMenuItem({
  label,
  description,
  icon,
  onSelect,
  tone = "default",
  disabled,
  className,
}: ActionMenuItemProps) {
  const labelColor = disabled
    ? "var(--color-text-disabled)"
    : tone === "critical"
      ? "var(--color-status-error)"
      : "var(--color-text-primary)";

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => !disabled && onSelect?.()}
      disabled={disabled}
      className={className}
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--spacing-md)",
        padding: "8px 12px",
        border: "none",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLElement).style.background = "var(--color-surface-100)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {icon && (
        <span style={{ marginTop: "1px", color: labelColor, flexShrink: 0 }}>{icon}</span>
      )}
      <span style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xs)", minWidth: 0 }}>
        <span className="text-base font-medium" style={{ color: labelColor }}>
          {label}
        </span>
        {description && (
          <span className="text-sm text-tertiary">{description}</span>
        )}
      </span>
    </button>
  );
}
