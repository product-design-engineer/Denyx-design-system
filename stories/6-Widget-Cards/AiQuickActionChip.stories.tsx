import type { Meta, StoryObj } from "@storybook/react-vite";
import AiQuickActionChip from "../../src/AiQuickActionChip";

const meta: Meta<typeof AiQuickActionChip> = {
  title: "Primitives/AiQuickActionChip",
  component: AiQuickActionChip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**[[AiWidget]] 본문의 빠른 액션 칩(pill 버튼) 한 개.** rounded-full pill + brand-blue 텍스트, " +
          "hover 시 배경이 `--color-primary-bg` 로 채워짐. 보통 AiWidget 의 `QUICK_ACTIONS.map` 안에서 렌더.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AiQuickActionChip>;

export const Default: Story = {
  args: {
    label: "현재 상태 요약",
  },
};
