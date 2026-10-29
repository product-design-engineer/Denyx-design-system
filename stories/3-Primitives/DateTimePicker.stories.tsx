import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import DateTimePicker from "../../src/DateTimePicker";

const meta: Meta<typeof DateTimePicker> = {
  title: "Primitives/DateTimePicker",
  component: DateTimePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**날짜 + 시각 동시 선택 팝오버.**\n\n" +
          "월간 캘린더 그리드 + 시:분:초 입력. LiveTimerCompact 중지 모드에서 범위 편집에 사용.\n" +
          "오늘 = primary 테두리, 선택일 = primary 배경.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DateTimePicker>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState(new Date());
      return (
        <div>
          <p className="text-sm text-tertiary" style={{ marginBottom: "var(--spacing-md)" }}>
            선택: {value.toLocaleString("ko-KR")}
          </p>
          <DateTimePicker value={value} onChange={setValue} onClose={() => {}} />
        </div>
      );
    };
    return <Demo />;
  },
};
