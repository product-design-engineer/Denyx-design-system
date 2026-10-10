/**
 * CardHead — Primitives layer.
 *
 * ## Purpose
 * 카드/위젯 상단 헤더. 제목(좌) + 탭(중앙, 선택) + 메타(우) 한 줄 구성.
 * 대시보드 위젯·패널의 공통 헤더 패턴.
 *
 * ## When to use
 * - 위젯/패널 상단에 제목 + 탭 전환 + 메타 정보가 필요할 때.
 * - 카드 안에서 뷰를 전환할 때 (차트 종류, 기간 등).
 *
 * ## When NOT to use
 * - 페이지 헤더 → [[PageHeader]] 사용.
 * - 독립 탭 네비게이션 → [[Tabs]] 사용.
 *
 * ## Composition rules
 * - 제목 + 탭 + 메타 모두 한 줄에 맞아야 함 — 줄바꿈 금지.
 * - 탭이 크면(underline 등) 제목 아래 별도 행으로 분리.
 * - 색은 토큰만 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <CardHead
 *   title="GPU 사용량"
 *   tabs={{ items: [{ value: "chart", label: "차트" }, { value: "table", label: "테이블" }], value: view, onChange: setView }}
 *   meta={<TimeChip value="최근 1시간" />}
 * />
 * ```
 */
import type { ReactNode } from "react";

export type CardHeadTab = {
  value: string;
  label: ReactNode;
};

export type CardHeadTabs = {
  items: CardHeadTab[];
  value: string;
  onChange: (next: string) => void;
};

export type CardHeadProps = {
  title: string;
  /** 중앙 탭 (선택). */
  tabs?: CardHeadTabs;
  /** 우측 메타 (TimeChip, 버튼 등). */
  meta?: ReactNode;
};

export default function CardHead({ title, tabs, meta }: CardHeadProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--spacing-xl)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)", minWidth: 0 }}>
        <span
          className="text-md font-bold text-primary"
          style={{ whiteSpace: "nowrap" }}
        >
          {title}
        </span>
        {tabs && (
          <div style={{ display: "flex", gap: "var(--spacing-2xs)" }}>
            {tabs.items.map((tab) => {
              const active = tab.value === tabs.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => tabs.onChange(tab.value)}
                  className="text-sm"
                  style={{
                    height: 24,
                    padding: "0 var(--spacing-md)",
                    borderRadius: "var(--radius-sm)",
                    border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border-default)",
                    background: active ? "var(--color-primary-bg)" : "transparent",
                    color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {meta && (
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
          {meta}
        </div>
      )}
    </div>
  );
}
