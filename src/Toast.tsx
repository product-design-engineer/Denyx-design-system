/**
 * Toast — 시스템 수준 알림 (상단 중앙 fixed, 자동 dismiss).
 *
 * ## Purpose
 * 화면 상단 중앙에 띄우는 짧은 결과 알림. `createPortal` 로 `document.body` 에
 * 렌더되어 어떤 레이아웃 위에도 떠 있고, `durationMs` 후 자동으로 닫힘.
 * variant(success/info/warning/error) 별 색 도트 + 한 줄 메시지 + 선택 action.
 *
 * ## When to use
 * - 액션 완료의 가벼운 확인 (알림 규칙 등록 완료, 저장됨 등)
 * - 위젯 안 결과가 표시된 뒤 위젯 밖에서 한 번 더 시각 확인이 필요할 때
 *
 * ## When NOT to use
 * - 사용자의 확인/선택을 강제로 막아야 하는 흐름 → [[Modal]]
 * - 길고 상세한 결과·설명 → 위젯 본체에 표시 (toast 는 한 줄만)
 * - 마우스 hover 시 보조 설명 → [[Tooltip]]
 *
 * ## Composition rules
 * - **정책 feedback-decision-priorities**: 위젯 메시지와 정보 중복을 피해 toast 는
 *   짧은 한 줄 + 선택적 action 한 개만. 상세는 위젯에 둠.
 * - controlled: `open` 으로 표시 제어, `onClose` 로 닫힘 반영(자동/수동/action 공통).
 * - `durationMs=0` 이면 자동 dismiss 없이 수동 닫기(× / action)만.
 * - action 클릭 시 `onAction` 후 자동으로 `onClose` 호출.
 * - `role="status"` + `aria-live="polite"` 로 스크린리더 알림.
 *
 * @example
 * ```tsx
 * <Toast
 *   open={saved}
 *   variant="success"
 *   message="알림 규칙이 등록되었습니다"
 *   actionLabel="보기"
 *   onAction={goToRule}
 *   onClose={() => setSaved(false)}
 * />
 * ```
 */
import { useEffect } from "react";
import { createPortal } from "react-dom";

export type ToastVariant = "success" | "info" | "warning" | "error";

const VARIANT_COLOR: Record<ToastVariant, { dot: string; bg: string }> = {
  success: { dot: "var(--color-status-success)", bg: "#E8F8EE" },
  info:    { dot: "var(--color-primary)", bg: "#E8F0FE" },
  warning: { dot: "#FF8800", bg: "#FFF4E5" },
  error:   { dot: "#F34747", bg: "#FDECEC" },
};

export default function Toast({
  open,
  variant = "success",
  message,
  actionLabel,
  onAction,
  onClose,
  durationMs = 4500,
}: {
  open: boolean;
  variant?: ToastVariant;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  /** 자동 dismiss 시간 (ms). 0이면 수동 닫기만. */
  durationMs?: number;
}) {
  useEffect(() => {
    if (!open || durationMs === 0) return;
    const id = setTimeout(() => onClose?.(), durationMs);
    return () => clearTimeout(id);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  const { dot } = VARIANT_COLOR[variant];

  const toastNode = (
    <div
      className="fixed top-20px left-1-2 z-9999"
      style={{
        animation: "toastSlideDown 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        transform: "translate(-50%, 0)",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-12px bg-card border border-color-var-color-border-default rounded-8px px-16px py-10px"
        style={{
          boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
          fontFamily: "var(--font-family-korean)",
        }}
      >
        {/* variant dot/icon */}
        <span
          className="flex items-center justify-center size-18px rounded-full shrink-0"
          style={{ background: dot }}
        >
          {variant === "success" && (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </span>
        <span className="text-md font-bold text-primary tracking-default leading-normal whitespace-nowrap">
          {message}
        </span>
        {actionLabel && (
          <button
            type="button"
            onClick={() => {
              onAction?.();
              onClose?.();
            }}
            className="text-md text-brand-blue tracking-default leading-none cursor-pointer hover:underline shrink-0"
            style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-medium)" }}
          >
            {actionLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex items-center justify-center size-16px cursor-pointer hover-opacity-70 shrink-0"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M1 1l8 8M9 1l-8 8" stroke="var(--color-text-tertiary)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(toastNode, document.body);
}
