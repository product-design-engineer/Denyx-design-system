import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "@denyx/design-system";

/**
 * Stories for [[EmptyState]] — 빈 상태 플레이스홀더 (Primitive).
 *
 * 빈 목록/테이블/패널에 "아직 없음" 또는 "결과 없음" 표시.
 * icon · action 슬롯으로 확장.
 */
const meta: Meta<typeof EmptyState> = {
  title: "Primitives/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

/** 기본 — 초기 상태 안내 + CTA. */
export const Default: Story = {
  args: {
    title: "등록된 인스턴스가 없습니다",
    description: "인스턴스를 추가하여 모니터링을 시작하세요.",
    action: (
      <button
        type="button"
        style={{
          height: 32,
          padding: "0 16px",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: "var(--color-primary)",
          color: "#fff",
          fontWeight: 700,
          fontSize: "var(--text-base)",
          cursor: "pointer",
        }}
      >
        인스턴스 추가
      </button>
    ),
  },
};

/** 검색 결과 없음. */
export const NoResults: Story = {
  args: {
    title: "검색 결과가 없습니다",
    description: "다른 키워드로 다시 검색하거나 필터를 조정해 보세요.",
    size: "sm",
  },
};

/** 아이콘 포함. */
export const WithIcon: Story = {
  args: {
    icon: (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: "배포된 서비스가 없습니다",
    description: "첫 번째 서비스를 배포하여 시작하세요.",
  },
};
