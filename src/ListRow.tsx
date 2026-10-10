/**
 * ListRow — Primitives layer.
 *
 * ## Purpose
 * 리스트의 한 행. 제목 + 뱃지 + 설명 + 우측 메타 구성.
 * 전체 행 클릭으로 상세 진입. 테이블과 달리 컬럼 정렬 없음.
 *
 * ## When to use
 * - 가변 길이 목록 (리포트·예약·알림 목록).
 * - 클릭 → 상세 패턴.
 *
 * ## When NOT to use
 * - 컬럼 비교 → [[DataTable]] 사용.
 * - 사이드바 네비게이션 → [[SidebarMenuItem]] 사용.
 * - 액션 메뉴 → [[ActionMenuItem]] 사용.
 *
 * ## Composition rules
 * - `title`은 이름만 (상태 표시 금지 — `badge` 사용).
 * - `description` 1줄 truncate.
 * - `selected` 시 primary-bg 배경 + primary 보더.
 * - 색은 토큰만 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <ListRow
 *   title="월간 매출 리포트"
 *   badge={<Chip variant="soft" tone="primary" size="sm">신규</Chip>}
 *   description="2026-10-10 생성 · 항목 12건"
 *   meta="3분 전"
 *   onClick={() => navigate(`/reports/${id}`)}
 * />
 * ```
 */
import type { ReactNode } from "react";

export type ListRowProps = {
  title: ReactNode;
  /** 제목 우측 뱃지. */
  badge?: ReactNode;
  /** 1줄 보조 텍스트. */
  description?: ReactNode;
  /** 우측 메타 (시각·상태 등). */
  meta?: ReactNode;
  /** 좌측 아이콘/아바타. */
  leading?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
};

export default function ListRow({
  title,
  badge,
  description,
  meta,
  leading,
  onClick,
  selected,
  className,
}: ListRowProps) {
  const clickable = typeof onClick === "function";

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => { if (clickable && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick?.(); } }}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-lg)",
        padding: "12px 14px",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${selected ? "var(--color-primary)" : "var(--color-border-default)"}`,
        background: selected ? "var(--color-primary-bg)" : "var(--color-card)",
        cursor: clickable ? "pointer" : "default",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {leading && <div style={{ flexShrink: 0 }}>{leading}</div>}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--spacing-2xs)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
          <span className="text-base font-medium text-primary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </span>
          {badge}
        </div>
        {description && (
          <span className="text-sm text-tertiary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {description}
          </span>
        )}
      </div>
      {meta && (
        <div className="text-sm text-tertiary" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
          {meta}
        </div>
      )}
    </div>
  );
}
