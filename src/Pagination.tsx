/**
 * Pagination — Primitives layer.
 *
 * ## Purpose
 * 페이지 네비게이션 컨트롤. DataTable 하단에 배치하여 대량 데이터를 페이지 단위로 탐색.
 * 좌측 요약("총 N건 · 페이지당 M건") + 우측 네비게이션(이전/페이지번호/다음).
 *
 * ## When to use
 * - DataTable 100+ 행에서 페이지 분할이 필요할 때.
 * - 서버 사이드 페이지네이션 UI.
 *
 * ## When NOT to use
 * - 무한 스크롤 → 스크롤 이벤트 직접 처리.
 * - 5건 이하 목록 → 페이지 분할 불필요.
 *
 * ## Composition rules
 * - 항상 표시 — 단일 페이지여도 컨트롤 노출 (이전/다음 비활성, 1페이지 활성).
 * - 8페이지 초과 시 ellipsis 축약 (앞 5 + ... + 마지막).
 * - 색은 토큰만 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <Pagination page={3} totalPages={12} pageSize={20} total={235} onChange={setPage} />
 * ```
 */
import type { ReactNode } from "react";

export type PaginationProps = {
  /** 현재 페이지 (1-base). */
  page: number;
  /** 전체 페이지 수. */
  totalPages: number;
  /** 페이지당 행 수. */
  pageSize: number;
  /** 전체 건수. */
  total: number;
  /** 페이지 변경 콜백. */
  onChange: (page: number) => void;
  /** 좌측 요약 문구 숨김. */
  hideSummary?: boolean;
};

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 8) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 5) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function Pagination({
  page,
  totalPages,
  pageSize,
  total,
  onChange,
  hideSummary,
}: PaginationProps) {
  const pages = pageRange(page, totalPages);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pillStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    height: 32,
    padding: "0 6px",
    borderRadius: "var(--radius-md)",
    border: active ? "1px solid var(--color-primary)" : "1px solid transparent",
    background: active ? "var(--color-primary-bg)" : "transparent",
    color: active ? "var(--color-primary)" : "var(--color-text-primary)",
    fontWeight: active ? 700 : 400,
    fontSize: "var(--text-sm)",
    fontFamily: "var(--font-family-numeric)",
    cursor: active ? "default" : "pointer",
    transition: "background 0.15s, border-color 0.15s",
  });

  const navStyle = (enabled: boolean): React.CSSProperties => ({
    ...pillStyle(false),
    color: enabled ? "var(--color-text-primary)" : "var(--color-text-disabled)",
    cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.4,
    pointerEvents: enabled ? "auto" : "none",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        gap: "var(--spacing-lg)",
      }}
    >
      {!hideSummary && (
        <span
          className="text-sm text-tertiary"
          style={{ fontFamily: "var(--font-family-numeric)" }}
        >
          총 {total.toLocaleString()}건 · 페이지당 {pageSize}건
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
        <button type="button" style={navStyle(canPrev)} onClick={() => canPrev && onChange(page - 1)} aria-label="이전 페이지">
          ‹
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} style={{ ...pillStyle(false), cursor: "default", color: "var(--color-text-tertiary)" }}>
              …
            </span>
          ) : (
            <button key={p} type="button" style={pillStyle(p === page)} onClick={() => p !== page && onChange(p)} aria-current={p === page ? "page" : undefined}>
              {p}
            </button>
          ),
        )}
        <button type="button" style={navStyle(canNext)} onClick={() => canNext && onChange(page + 1)} aria-label="다음 페이지">
          ›
        </button>
      </div>
    </div>
  );
}
