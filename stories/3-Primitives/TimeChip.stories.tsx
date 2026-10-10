import type { Meta, StoryObj } from "@storybook/react-vite";
import TimeChip from "../../src/TimeChip";

/**
 * Stories for [[TimeChip]] — 시간 값 표시 칩 (Primitive).
 *
 * 라벨 + 값 + 노트를 일관된 시각으로 보여줌.
 * 수치는 numeric 폰트, 텍스트는 korean 폰트 자동 적용.
 */
const meta: Meta<typeof TimeChip> = {
  title: "Primitives/TimeChip",
  component: TimeChip,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof TimeChip>;

/** neutral — 라벨 + 값 기본 형태. */
export const Default: Story = {
  args: {
    label: "기준",
    value: "2026-10-10 14:30",
    tone: "neutral",
  },
};

/** warning — stale 타임스탬프 경고. */
export const Warning: Story = {
  args: {
    value: "5분 전",
    tone: "warning",
    note: "stale",
  },
};
