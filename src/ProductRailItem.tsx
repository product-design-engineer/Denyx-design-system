/**
 * ProductRailItem — Chrome / Foundation. [[Sidebar]] 좌측 40px 제품 레일의 한 항목(40px 정사각).
 *
 * ## Purpose
 * 제품 레일(40px 폭)의 단일 제품 아이콘 칸을 렌더. 40px 정사각 + 24px 아이콘,
 * `active` 면 라이트블루 배경(`--color-primary-bg`)으로 강조.
 * collapsed/펼침 무관하게 항상 40px — 사이드바의 유일한 상시 가시 요소.
 *
 * ## When to use
 * - [[Sidebar]] 가 `PRODUCT_ICONS.map` 으로 제품마다 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바 밖에서 **동일한 제품 아이콘 칸**이 필요한 경우 (예: 제품 전환 팝오버, 모바일 네비).
 * - collapsed(40px) · 펼침(240px) **양쪽 모두** 표시 — 이 컴포넌트 자체는 상태 불변.
 *
 * ## When NOT to use
 * - **사이드바 본문 메뉴 행** (아이콘+라벨+caret) → [[SidebarMenuItem]].
 * - **레일 하단 유틸 아이콘** (32px 높이, active 강조 없음) → [[BottomRailItem]].
 * - **조직/프로젝트 스위처** → [[SidebarOrgSwitcher]] / [[SidebarProjectSwitcher]].
 * - `hideProductRail=true` 화면 (관리 콘솔 등 제품 네비 불필요) — Sidebar 가 레일 전체를 숨김.
 *
 * ## Composition rules
 * - 아이콘 파일명(`name`)만 주입 — 칸 크기(40px)/active 강조는 이 컴포넌트가 책임.
 * - 강조 배경은 토큰 (`--color-primary-bg`) — 인라인 hex 금지.
 * - hover 는 `hover-bg-surface-100` 토큰.
 * - 아이콘은 표준 경로(`/icons/*`).
 *
 * @example
 * ```tsx
 * {PRODUCT_ICONS.map((name) => {
 *   const key = name.replace("product-", "").replace(".svg", "");
 *   return <ProductRailItem key={name} name={name} active={key === activeProduct} />;
 * })}
 * ```
 */

const icon = (name: string) => `/icons/${name}`;

export default function ProductRailItem({
  name,
  active = false,
  onClick,
}: {
  /** 제품 아이콘 파일명 (e.g. "product-gpu.svg"). 표준 경로(`/icons/*`)로 참조. */
  name: string;
  /** active 강조 (라이트블루 배경). 기본 false. */
  active?: boolean;
  /** 클릭 핸들러(제품 전환). 미지정 시 정적. */
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-center shrink-0 size-40px cursor-pointer hover-bg-surface-100"
      style={
        active
          ? { backgroundColor: "var(--color-primary-bg)" }
          : undefined
      }
    >
      <img alt="" className="size-24px" src={icon(name)} />
    </div>
  );
}
