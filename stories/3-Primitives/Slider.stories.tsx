import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "@denyx/design-system";

/**
 * Stories for [[Slider]] — 연속/이산 슬라이더 입력 (Primitive).
 *
 * 연속 모드(min/max/step) · 이산 모드(stops) 지원. 네이티브 range 기반.
 */
const meta: Meta<typeof Slider> = {
  title: "Primitives/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Slider>;

/** 연속 — 0~100 볼륨. */
export const Default: Story = {
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState(40);
      return (
        <div style={{ width: 280 }}>
          <Slider {...args} min={0} max={100} value={value} onChange={setValue} label="알림 볼륨" />
          <span className="text-sm text-tertiary" style={{ marginTop: 8, display: "block" }}>
            현재: {value}%
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

/** 이산 모드 — stops + markLabel. */
export const DiscreteStops: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState(50000);
      return (
        <div style={{ width: 320 }}>
          <Slider
            stops={[0, 10000, 50000, 200000, 500000]}
            value={value}
            onChange={setValue}
            markLabel={(v) => (v === 0 ? "0" : `${(v / 10000).toFixed(0)}만`)}
            label="월 사용량 한도"
          />
          <span className="text-sm text-tertiary" style={{ marginTop: 8, display: "block" }}>
            선택: {value.toLocaleString()}건
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

/** 비활성. */
export const Disabled: Story = {
  args: {
    min: 0,
    max: 100,
    value: 60,
    disabled: true,
    label: "비활성 슬라이더",
  },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};
