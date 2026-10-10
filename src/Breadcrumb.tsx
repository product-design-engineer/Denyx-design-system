/**
 * Breadcrumb — Primitives layer.
 *
 * ## Purpose
 * 경로 탐색 네비게이션. 현재 위치의 계층 구조를 보여주고 상위로 이동 가능.
 * 마지막 항목은 현재 페이지(링크 아님).
 *
 * ## When to use
 * - 다단계 네비게이션 (목록 → 상세).
 * - 서브페이지 위치 표시.
 *
 * ## When NOT to use
 * - 홈 페이지 (계층 없음).
 * - 워크플로 단계 → 별도 Stepper 사용.
 *
 * ## Composition rules
 * - `items` 배열 빈 경우 렌더 안 함.
 * - 마지막 항목은 자동으로 현재 페이지 처리 (링크 없음, bold).
 * - `renderLink` 로 SPA 라우터 대응 (React Router Link 등).
 * - 색은 토큰만 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <Breadcrumb items={[
 *   { label: "대시보드", href: "/" },
 *   { label: "프로젝트 관리", href: "/projects" },
 *   { label: "작업 상세" },
 * ]} />
 * ```
 */
import type { ReactNode, CSSProperties } from "react";

export type BreadcrumbItem = {
  label: string;
  /** null 또는 미지정이면 현재 페이지 (링크 아님). */
  href?: string | null;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /** SPA 라우터 대응. 기본: `<a>`. */
  renderLink?: (href: string, style: CSSProperties, children: ReactNode) => ReactNode;
};

export default function Breadcrumb({ items, renderLink }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const linkStyle: CSSProperties = {
    color: "var(--color-text-tertiary)",
    textDecoration: "none",
    fontSize: "var(--text-sm)",
    whiteSpace: "nowrap",
  };

  const currentStyle: CSSProperties = {
    color: "var(--color-text-primary)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 200,
  };

  return (
    <nav
      aria-label="breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        height: 36,
        gap: "var(--spacing-sm)",
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
            {i > 0 && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--color-text-disabled)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M3.5 2L6.5 5L3.5 8" />
              </svg>
            )}
            {isLast || !item.href ? (
              <span style={isLast ? currentStyle : linkStyle} aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            ) : renderLink ? (
              renderLink(item.href, linkStyle, item.label)
            ) : (
              <a href={item.href} style={linkStyle}>{item.label}</a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
