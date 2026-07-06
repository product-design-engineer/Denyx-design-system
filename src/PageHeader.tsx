/**
 * PageHeader — Chrome layer. 48px 페이지 최상단 헤더.
 *
 * ## Purpose
 * 페이지 상단 48px 고정 바. 좌측은 페이지 타이틀 + Denyx AI 토글([[AiAssistantButton]])
 * + Docs 버튼, 우측은 고객지원 버튼 + 알림 벨(드롭다운) + 프로필 아바타(드롭다운).
 * [[Sidebar]] 의 48px 로고 헤더와 동일 높이로 chrome 의 최상단 행을 정렬.
 *
 * ## When to use
 * - [[DashboardLayout]] 의 `header` 슬롯에 들어가는 주 페이지 헤더.
 * - 페이지 타이틀과 Denyx AI 진입점이 함께 필요한 모든 화면.
 *
 * ## When NOT to use
 * - 뒤로가기/브레드크럼 등 보조 네비 행 → [[SubHeaderBar]] (48px 아래 40px 행).
 * - 시간/프리셋 등 데이터 필터 옵션 → `OptionbarPage` / `FilterBar`.
 *
 * ## Composition rules
 * - 공통 정책(feedback-page-header-invariant): Denyx AI 위젯 토글과 무관하게 항상
 *   동일한 레이아웃·가시 요소·크기로 렌더. 내부 항목을 숨기거나 줄이는 prop 은
 *   의도적으로 제공하지 않음.
 * - Denyx AI 토글은 인라인 마크업이 아니라 [[AiAssistantButton]] 채택 (토큰 binding dogfooding).
 * - 높이 48px 고정(`box-border`) — 페이지에서 inline `<div>` 로 재구현 금지.
 * - 배경/경계/텍스트 색은 토큰 (`--color-border-strong` · `--color-text-*` · `--color-primary-bg`).
 * - `notifications` 1건 이상이면 벨에 빨간 점 + 클릭 시 목록, `profileMenu` 있으면 아바타가 드롭다운.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="K8s-GPU / GPU 트렌드"
 *   aiActive={aiActive}
 *   onAiToggle={() => setAiActive((v) => !v)}
 *   roleBadge="OWNER"
 *   profileMenu={[{ label: "엔터프라이즈 관리", onClick: goAdmin }]}
 *   notifications={[{ label: "임계값 초과: disk-usage" }]}
 * />
 * ```
 */
import { useState } from "react";
import AiAssistantButton from "./widget/AiAssistantButton";
import HeaderPillButton from "./HeaderPillButton";
import { IcDocs, IcSupport } from "./icons/HeaderIcons";
import PageHeaderNotificationItem from "./PageHeaderNotificationItem";
import PageHeaderProfileMenuItem from "./PageHeaderProfileMenuItem";

export type ProfileMenuItem = { label: string; onClick?: () => void };
export type NotificationItem = { label: string; onClick?: () => void };

export default function PageHeader({
  title,
  aiActive = false,
  onAiToggle,
  profileMenu,
  roleBadge,
  notifications,
}: {
  title: string;
  aiActive?: boolean;
  onAiToggle?: () => void;
  /** 우상단 아바타 클릭 시 드롭다운 메뉴(예: 엔터프라이즈 관리). 미지정이면 정적 아바타. */
  profileMenu?: ProfileMenuItem[];
  /** 프로필(아바타) 드롭다운 헤더에 표시할 역할(예: "OWNER"). 미지정이면 헤더 숨김. */
  roleBadge?: string;
  /** 알림(벨) 드롭다운. 1건 이상이면 벨에 빨간 점 표시 + 클릭 시 목록. */
  notifications?: NotificationItem[];
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const hasNotify = !!notifications && notifications.length > 0;
  return (
    <div className="flex items-center justify-between h-48px box-border px-8px bg-card border-b border-color-var-color-border-strong shrink-0">
      {/* 좌측: 타이틀 + AI/Docs */}
      <div className="flex items-center gap-24px shrink-0">
        <p
          className="text-2xl text-primary tracking-display whitespace-nowrap leading-normal"
          style={{
            fontFamily: "var(--font-family-korean)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          {title}
        </p>
        <div className="flex items-center gap-8px">
          <AiAssistantButton aiActive={aiActive} onClick={onAiToggle} />
          <HeaderPillButton icon={<IcDocs />}>Docs</HeaderPillButton>
        </div>
      </div>

      {/* 우측: 고객지원 + 알림 + 아바타 */}
      <div className="flex items-center gap-16px h-full shrink-0">
        <HeaderPillButton icon={<IcSupport />}>고객지원</HeaderPillButton>
        <div className="flex items-center gap-16px">
          <div className="relative shrink-0 size-24px">
            <button
              type="button"
              className="size-24px flex items-center justify-center cursor-pointer relative"
              onClick={() => hasNotify && setNotifyOpen((o) => !o)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10V14L20 16V17H4V16L6 14V10Z"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 19.5C10 20.6 10.9 21.5 12 21.5C13.1 21.5 14 20.6 14 19.5"
                  stroke="var(--color-text-secondary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {hasNotify && (
                <span className="absolute top-1px right-1px size-7px rounded-full bg-ce5484d border border-white" />
              )}
            </button>
            {hasNotify && notifyOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifyOpen(false)} />
                <div className="absolute right-0 top-32px z-50 min-w-260px rounded-8px border border-color-var-color-border-default bg-card py-4px shadow-0_4px_16px_rgba-0-0-0-0_12">
                  <div className="px-14px py-6px text-xs text-tertiary" style={{ fontFamily: "var(--font-family-korean)" }}>알림</div>
                  {notifications!.map((n) => (
                    <PageHeaderNotificationItem
                      key={n.label}
                      item={n}
                      onClick={() => { setNotifyOpen(false); n.onClick?.(); }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="relative shrink-0 size-24px">
            <button
              type="button"
              className="size-24px cursor-pointer block"
              onClick={() => profileMenu && profileMenu.length > 0 && setProfileOpen((o) => !o)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="avatar-grad" x1="0" y1="0" x2="24" y2="24">
                    <stop stopColor="var(--color-palette-4fc3f7)" />
                    <stop offset="1" stopColor="var(--color-primary)" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="12" fill="url(#avatar-grad)" />
                <text x="12" y="17" textAnchor="middle" fontSize="13px" fontWeight="700" fill="#fff" fontFamily="Roboto, sans-serif">S</text>
              </svg>
            </button>
            {profileMenu && profileMenu.length > 0 && profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-32px z-50 min-w-200px rounded-8px border border-color-var-color-border-default bg-card py-4px shadow-0_4px_16px_rgba-0-0-0-0_12">
                  {roleBadge && (
                    <div className="flex items-center gap-6px px-14px pt-8px pb-8px mb-2px border-b border-color-var-color-border-soft">
                      <span className="inline-flex items-center h-18px px-6px rounded-4px text-xs font-bold bg-var-color-brand-blue-bg text-color-var-color-brand-blue" style={{ fontFamily: "var(--font-family-korean)" }}>{roleBadge}</span>
                      <span className="text-sm text-tertiary" style={{ fontFamily: "var(--font-family-korean)" }}>내 계정</span>
                    </div>
                  )}
                  {profileMenu.map((it) => (
                    <PageHeaderProfileMenuItem
                      key={it.label}
                      item={it}
                      onClick={() => { setProfileOpen(false); it.onClick?.(); }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
