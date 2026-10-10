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
    label: "활성 GPU",
    value: "847",
    unit: "대",
    tone: "success",
    trend: "up",
  },
};

/** 전체 tone 비교 — 5개 카드 가로 배치. */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <StatCard label="총 GPU" value="1,024" unit="대" tone="info" trend="stable" />
      <StatCard label="활성 GPU" value="847" unit="대" tone="success" trend="up" />
      <StatCard label="유휴 GPU" value="165" unit="대" tone="neutral" trend="stable" />
      <StatCard label="경고 GPU" value="9" unit="대" tone="warning" trend="up" />
      <StatCard label="장애 GPU" value="3" unit="대" tone="critical" trend="down" />
    </div>
  ),
};
