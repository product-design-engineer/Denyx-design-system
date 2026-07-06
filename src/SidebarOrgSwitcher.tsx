import type { OrgContext } from "./Sidebar";

/**
 * SidebarOrgSwitcher — Chrome / Foundation. [[Sidebar]] 상단 40px 조직 스위처 행.
 *
 * ## Purpose
 * 사이드바 상단(로고 헤더 바로 아래)의 40px 조직 컨텍스트 스위처를 렌더.
 * 심볼 아이콘(24px, 옵션) + 조직 라벨(13px bold) + 뱃지(옵션, 엔터프라이즈 등) + chevron(16px).
 * `collapsed=true` 면 40px 정사각에 심볼 아이콘만 표시. 아이콘 없으면 null.
 *
 * ## When to use
 * - [[Sidebar]] 가 `org` prop 으로 렌더하는 **기본 용법**. 보통 단독 사용하지 않음.
 * - 사이드바 밖에서 **동일한 조직 스위처 외형**이 필요한 경우 (예: 모바일 드로어, 설정 페이지).
 * - 조직 컨텍스트가 **있는** 화면에서만 노출 — `org={null}` 이면 Sidebar 가 숨김.
 *
 * ## When NOT to use
 * - **프로젝트 스위처** → [[SidebarProjectSwitcher]] (44px, 그룹+프로젝트 2줄).
 * - **조직 컨텍스트가 없는 화면** (엔터프라이즈 활성화 전, 계정/관리 영역) — `org={null}` 로 숨김.
 * - **조직 목록 드롭다운 본체** — 이 컴포넌트는 트리거(행)만 담당.
 * - **본문 메뉴 항목** → [[SidebarMenuItem]].
 *
 * ## Composition rules
 * - 데이터(`OrgContext`)만 주입 — 행 외형(높이 40px · 보더 · 배경 · 타이포)은 이 컴포넌트가 책임.
 * - 색은 토큰 (`text-secondary` · `bg-card` · `--color-primary-bg` 뱃지) — 인라인 hex 금지.
 * - `icon` 생략 시 좌측은 **12px 스페이서** (빈 40px 박스 금지).
 * - `badge` 는 토큰 칩으로 렌더 — `bg-var-color-brand-blue-bg` + `text-color-var-color-brand-blue`.
 * - `collapsed=true` 면 아이콘만 40px 정사각으로 표시. `icon` 없으면 null 렌더.
 *
 * @example
 * ```tsx
 * <SidebarOrgSwitcher org={{ label: "[조직] Denyx", icon: "denyx-symbol.svg" }} onClick={openOrgPicker} />
 * ```
 */

const icon = (name: string) => `/icons/${name}`;
const NOTO_SANS = "'Noto Sans', 'Noto Sans KR', sans-serif";

export default function SidebarOrgSwitcher({
  org,
  onClick,
  collapsed = false,
}: {
  org: OrgContext;
  onClick?: () => void;
  /** true면 40px 정사각 — 심볼 아이콘만 표시. */
  collapsed?: boolean;
}) {
  if (collapsed) {
    return org.icon ? (
      <button onClick={onClick} className="flex items-center justify-center shrink-0 size-40px cursor-pointer bg-card border-r border-b border-color-var-color-border-default">
        <img alt="" className="size-24px" src={icon(org.icon)} />
      </button>
    ) : null;
  }

  return (
    <button onClick={onClick} className="flex h-40px items-start w-full shrink-0 cursor-pointer">
      <div className="flex flex-col h-full items-start justify-center pr-8px w-240px bg-card border-r border-b border-color-var-color-border-default">
        <div className="flex items-center justify-between w-full">
          {org.icon ? (
            <div className="flex items-center justify-center shrink-0 size-40px">
              <img alt="" className="size-24px" src={icon(org.icon)} />
            </div>
          ) : (
            <div className="w-12px shrink-0" />
          )}
          <p
            className="flex-1 min-w-0 overflow-hidden text-md font-bold text-secondary text-left tracking-default whitespace-nowrap text-ellipsis leading-none"
            style={{ fontFamily: NOTO_SANS }}
          >
            {org.label}
          </p>
          {org.badge && (
            <span
              className="shrink-0 inline-flex items-center h-18px px-6px mr-6px rounded-4px text-xs font-bold whitespace-nowrap bg-var-color-brand-blue-bg text-color-var-color-brand-blue"
              style={{ fontFamily: NOTO_SANS }}
            >
              {org.badge}
            </span>
          )}
          <div className="shrink-0 size-16px flex items-center justify-center">
            <img alt="" className="size-16px" src={icon("chevron-right.svg")} />
          </div>
        </div>
      </div>
    </button>
  );
}
