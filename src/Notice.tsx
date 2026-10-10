/**
 * Notice — Primitives layer.
 *
 * ## Purpose
 * 페이지 흐름 안에서 상태를 알리는 알림 카드. 좌측 3px 컬러 바로 tone 표시.
 * Toast(자동 소멸)와 달리 영구 표시 — 사용자가 닫거나 상태가 변할 때까지 유지.
 *
 * ## When to use
 * - 인라인 안내/경고/에러 메시지 (폼 상단, 페이지 안내 등).
 * - 상태 알림이 페이지에 고정되어야 할 때.
 *
 * ## When NOT to use
 * - 일시적 피드백 → [[Toast]] 사용.
 * - 모달 차단 → [[Modal]] 사용.
 * - 되돌릴 수 없는 동작 확인 → [[ConfirmDialog]] 사용.
 *
 * ## Composition rules
 * - 좌측 bar 색 = tone 토큰. 인라인 hex 금지.
 * - `variant="card"` (독립 카드) / `"bare"` (다른 카드 안에서 보더 없이).
 * - `action` 슬롯에 Button 전달 가능.
 *
 * @example
 * ```tsx
 * <Notice tone="warning" title="인스턴스 3대 미응답" description="최근 5분간 heartbeat 없음" />
 * <Notice tone="critical" variant="bare" title="삭제된 데이터는 복구할 수 없습니다" />
 * ```
 */
import type { ReactNode } from "react";

export type NoticeTone = "primary" | "warning" | "critical" | "success" | "neutral";
export type NoticeVariant = "card" | "bare";

export type NoticeProps = {
  tone?: NoticeTone;
  variant?: NoticeVariant;
  /** 사실 한 줄. */
  title: ReactNode;
  /** 보조 한 줄. */
  description?: ReactNode;
  /** 우측 끝 행동 (Button 등). */
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

const BAR_COLOR: Record<NoticeTone, string> = {
  primary: "var(--color-primary)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-error)",
  success: "var(--color-status-success)",
  neutral: "var(--color-border-strong)",
};

const BG_COLOR: Record<NoticeTone, string> = {
  primary: "var(--color-primary-bg)",
  warning: "var(--color-surface-warning)",
  critical: "var(--color-surface-critical)",
  success: "var(--color-surface-50)",
  neutral: "var(--color-surface-100)",
};

export default function Notice({
  tone = "neutral",
  variant = "card",
  title,
  description,
  action,
  children,
  className,
}: NoticeProps) {
  const isCard = variant === "card";

  return (
    <div
      role="status"
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "var(--spacing-xl)",
        flexWrap: "wrap",
        padding: isCard ? "12px 16px" : "10px 12px",
        borderRadius: isCard ? "var(--radius-lg)" : 0,
        border: isCard ? "1px solid var(--color-border-default)" : "none",
        borderLeft: `3px solid ${BAR_COLOR[tone]}`,
        background: BG_COLOR[tone],
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)", flex: 1, minWidth: 0 }}>
        <span className="text-base font-medium text-primary">{title}</span>
        {description && <span className="text-base text-tertiary">{description}</span>}
        {children}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
