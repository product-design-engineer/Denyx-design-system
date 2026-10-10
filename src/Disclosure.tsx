/**
 * Disclosure — Primitives layer.
 *
 * ## Purpose
 * 접기/펼치기 섹션. 헤더 한 줄은 항상 보이고, 내용은 펼쳤을 때만 표시.
 * 네이티브 `aria-expanded` + 키보드(Enter/Space) 자동 지원.
 *
 * ## When to use
 * - 고급 설정·필터 옵션 접기.
 * - 카드 안 상세 정보 토글.
 * - FAQ 아코디언.
 *
 * ## When NOT to use
 * - 상호 배타적 섹션 → [[Tabs]] 사용.
 * - 오버레이 → [[Modal]] 사용.
 * - 1-2줄 짧은 설명 → [[Tooltip]] 사용.
 *
 * ## Composition rules
 * - 헤더에 "보기/숨기기" 텍스트 금지 — 화살표 + aria-expanded 가 처리.
 * - 색은 토큰만 — 인라인 hex 금지.
 * - controlled(`open`) / uncontrolled(`defaultOpen`) 모두 지원.
 *
 * @example
 * ```tsx
 * <Disclosure summary="고급 설정">
 *   <p>타임아웃: 30초</p>
 * </Disclosure>
 * ```
 */
import { type ReactNode, useState, useId } from "react";

export type DisclosureSize = "sm" | "md";

export type DisclosureProps = {
  /** 헤더 텍스트 (항상 표시). */
  summary: ReactNode;
  children: ReactNode;
  /** controlled 열림 상태. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: DisclosureSize;
  disabled?: boolean;
  className?: string;
};

export default function Disclosure({
  summary,
  children,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  size = "md",
  disabled,
  className,
}: DisclosureProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = controlled ?? internal;
  const panelId = useId();

  const toggle = () => {
    if (disabled) return;
    const next = !isOpen;
    if (controlled === undefined) setInternal(next);
    onOpenChange?.(next);
  };

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
        disabled={disabled}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--spacing-xs)",
          padding: size === "sm" ? "4px 0" : "6px 0",
          border: "none",
          background: "transparent",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.45 : 1,
          userSelect: "none",
          color: "var(--color-text-primary)",
          fontSize: size === "sm" ? "var(--text-sm)" : "var(--text-base)",
          fontWeight: 500,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "transform 0.15s",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <path d="M4.5 2.5L7.5 6L4.5 9.5" />
        </svg>
        {summary}
      </button>
      {isOpen && (
        <div id={panelId} role="region" style={{ paddingLeft: "var(--spacing-xl)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
