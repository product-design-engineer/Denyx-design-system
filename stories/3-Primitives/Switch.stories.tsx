import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@denyx/design-system";

/**
 * Stories for [[Switch]] — 즉시 적용 ON/OFF 토글 (Primitive).
 *
 * 색·치수·radius·shadow 는 tokens.css CSS 변수 참조 (Tailwind 유틸 미사용, inline style).
 * controlled/uncontrolled · sm/md · disabled · knobContent 지원.
 */
const meta: Meta<typeof Switch> = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: { type: "radio" }, options: ["sm", "md"] },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Switch>;

/** controlled — Space/Enter·클릭 토글. */
export const Default: Story = {
  render: (args) => {
    const Demo = () => {
      const [on, setOn] = useState(false);
      return <Switch {...args} checked={on} onChange={setOn} />;
    };
    return <Demo />;
  },
};

/** uncontrolled — defaultChecked. */
export const Uncontrolled: Story = { args: { defaultChecked: true } };

/** 크기 — sm(40×22) / md(52×28). */
export const Sizes: Story = {
  render: () => {
    const Demo = () => {
      const [a, setA] = useState(true);
      const [b, setB] = useState(true);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Switch size="sm" checked={a} onChange={setA} aria-label="sm" />
          <Switch size="md" checked={b} onChange={setB} aria-label="md" />
        </div>
      );
    };
    return <Demo />;
  },
};

/** 상태 — off / on / disabled. */
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <Switch checked={false} aria-label="off" />
      <Switch checked aria-label="on" />
      <Switch checked disabled aria-label="disabled on" />
      <Switch checked={false} disabled aria-label="disabled off" />
    </div>
  ),
};

/** 시각 라벨. */
export const WithLabel: Story = {
  render: () => {
    const Demo = () => {
      const [on, setOn] = useState(true);
      return <Switch checked={on} onChange={setOn} label="알림 활성화" />;
    };
    return <Demo />;
  },
};

/** knobContent — 노브 안 아이콘/텍스트 ([[ThemeToggle]] 가 해/달 주입). */
export const WithKnobContent: Story = {
  render: () => {
    const Demo = () => {
      const [on, setOn] = useState(true);
      return (
        <Switch
          checked={on}
          onChange={setOn}
          aria-label="knob content"
          knobContent={
            <span style={{ fontSize: 10, color: "var(--color-primary)" }}>{on ? "✓" : ""}</span>
          }
        />
      );
    };
    return <Demo />;
  },
};
