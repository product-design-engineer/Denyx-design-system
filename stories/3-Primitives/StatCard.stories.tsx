import type { Meta, StoryObj } from "@storybook/react-vite";
import StatCard from "../../src/StatCard";

/**
 * Stories for [[StatCard]] — 대시보드 KPI 요약 카드 (Primitive).
 *
 * 큰 숫자 + 라벨 + 트렌드 아이콘으로 핵심 지표를 한눈에 표시.
 * 3~6개를 가로로 나열하여 대시보드 상단 요약 바 구성.
 */
const meta: Meta<typeof StatCard> = {
  title: "Primitives/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof StatCard>;

/** success + up 트렌드 — 기본 사용. */
export const Default: Story = {
  args: {
    label: "활성 사용자",
    value: "847",
    unit: "명",
    tone: "success",
    trend: "up",
  },
};

/** 전체 tone 비교 — 5개 카드 가로 배치. */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <StatCard label="총 사용자" value="1,024" unit="명" tone="info" trend="stable" />
      <StatCard label="활성 사용자" value="847" unit="명" tone="success" trend="up" />
      <StatCard label="비활성 사용자" value="165" unit="명" tone="neutral" trend="stable" />
      <StatCard label="주의 필요" value="9" unit="건" tone="warning" trend="up" />
      <StatCard label="오류 발생" value="3" unit="건" tone="critical" trend="down" />
    </div>
  ),
};
