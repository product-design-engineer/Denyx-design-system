import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "@denyx/design-system";

/**
 * Stories for [[RadioGroup]] — 상호 배타적 단일 선택 (Primitive).
 *
 * 2~5개 옵션을 모두 펼쳐 보여줌. 네이티브 radio 기반 키보드·접근성 지원.
 */
const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

/** controlled — 주기 선택. */
export const Default: Story = {
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState("daily");
      return (
        <RadioGroup
          {...args}
          items={[
            { value: "daily", label: "일별" },
            { value: "weekly", label: "주별" },
            { value: "monthly", label: "월별" },
          ]}
          value={value}
          onChange={setValue}
          label="집계 주기"
        />
      );
    };
    return <Demo />;
  },
};

/** 수평 배치. */
export const Horizontal: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("light");
      return (
        <RadioGroup
          items={[
            { value: "light", label: "라이트" },
            { value: "dark", label: "다크" },
            { value: "system", label: "시스템" },
          ]}
          value={value}
          onChange={setValue}
          direction="horizontal"
          label="테마"
        />
      );
    };
    return <Demo />;
  },
};

/** description 포함 + 부분 비활성. */
export const WithDescriptions: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("standard");
      return (
        <RadioGroup
          items={[
            { value: "standard", label: "Standard", description: "기본 요금제 · 월 ₩29,000" },
            { value: "performance", label: "Performance", description: "프로 요금제 · 월 ₩79,000" },
            { value: "enterprise", label: "Enterprise", description: "엔터프라이즈 · 별도 견적", disabled: true },
          ]}
          value={value}
          onChange={setValue}
          label="요금제 선택"
        />
      );
    };
    return <Demo />;
  },
};
