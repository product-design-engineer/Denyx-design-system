/**
 * EmptyState — Primitives layer.
 *
 * ## Purpose
 * 빈 목록/테이블/패널 플레이스홀더. "아직 없음"(생성 유도)과 "필터 결과 없음"(확장 유도)을 구분.
 * 중앙 정렬, 수직 패딩으로 빈 공간을 의미 있게 채움.
 *
 * ## When to use
 * - DataTable 검색 결과 0건.
 * - 아직 데이터가 없는 초기 상태.
 * - 패널/카드 안 빈 상태.
 *
 * ## When NOT to use
 * - 로딩 중 → 스피너/스켈레톤 사용.
 * - 에러 → [[Notice]] tone="critical" 사용.
 *
 * ## Composition rules
 * - 아이콘 기본 없음 — 필요 시 `icon` prop 전달.
 * - `action` 슬롯에 Button 전달 (CTA).
 * - 보더 없음 — 수직 패딩만으로 빈 공간 표현.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="등록된 항목이 없습니다"
 *   description="새 항목을 추가하여 시작하세요"
 *   action={<Button variant="contained" tone="primary" size="md">항목 추가</Button>}
 * />
 * ```
 */
import type { ReactNode } from "react";

export type EmptyStateSize = "sm" | "md";

export type EmptyStateProps = {
  /** 위에 서는 그림 — 기본 없음. */
  icon?: ReactNode;
  /** 사실 한 줄. */
  title: ReactNode;
  /** 그래서 무엇을 하면 되는가. */
  description?: ReactNode;
  /** 아래 행동 (Button 등). */
  action?: ReactNode;
  size?: EmptyStateSize;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={className}
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: `${size === "sm" ? 24 : 48}px 16px`,
        gap: "var(--spacing-lg)",
      }}
    >
      {icon && (
        <div style={{ color: "var(--color-text-tertiary)", marginBottom: "var(--spacing-xs)" }}>{icon}</div>
      )}
      <span className="text-md font-medium text-secondary">{title}</span>
      {description && <span className="text-base text-tertiary">{description}</span>}
      {action && <div style={{ marginTop: "var(--spacing-xs)" }}>{action}</div>}
    </div>
  );
}
