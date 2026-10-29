import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LiveTimerCompact } from "@denyx/design-system";

/**
 * Stories for [[LiveTimerCompact]] — 32px LIVE/범위 시계.
 */
const meta: Meta<typeof LiveTimerCompact> = {
  title: "Primitives/LiveTimerCompact",
  component: LiveTimerCompact,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "surface-muted" },
    docs: {
      description: {
        component:
          "**LIVE 시계 + 중지 시 시작~종료 범위 편집 (32px 높이).**\n\n" +
          "- **LIVE 모드**: 현재 시각(YYYY-MM-DD HH:MM:SS) + polling progress fill.\n" +
          "- **중지 모드**: 시작~종료 범위 표시. 각 날짜/시각 클릭 → DateTimePicker 팝오버.\n" +
          "- 중지 기본값: 종료=중지 시점, 시작=5분 전.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof LiveTimerCompact>;

/** 기본 — LIVE 모드. 시스템 시각 자동, 5s polling. */
export const Default: Story = {
  args: {},
};

/** 중지 — 시작~종료 범위 표시. 날짜/시각 클릭으로 DateTimePicker 편집. */
export const PausedRange: Story = {
  render: () => {
    const Demo = () => {
      const [paused, setPaused] = useState(true);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)", alignItems: "flex-start" }}>
          <LiveTimerCompact
            paused={paused}
            onTogglePause={() => setPaused((p) => !p)}
            onRangeChange={(r) => console.log("range:", r)}
          />
          <span className="text-sm text-tertiary">
            상태: <strong>{paused ? "중지 (범위 편집)" : "LIVE"}</strong> · 좌측 ▶/▌▌ 클릭으로 토글 · 날짜 클릭 → 캘린더
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

/** durationLabel 표시 — 캘린더 자리에 녹색 알약 ('10분'). */
export const WithDurationLabel: Story = {
  args: { durationLabel: "10분" },
};

/** 시각 고정 — 시연 / 스크린샷용. */
export const FixedTime: Story = {
  args: { time: "2026-10-28 12:01:35" },
};

/** 인터랙티브 — pause↔play 전환 + 범위 편집 풀 데모. */
export const Interactive: Story = {
  render: () => {
    const Demo = () => {
      const [paused, setPaused] = useState(false);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)", alignItems: "flex-start" }}>
          <LiveTimerCompact
            paused={paused}
            onTogglePause={() => setPaused((p) => !p)}
            onRangeChange={(r) => console.log("range:", r)}
          />
          <span className="text-sm text-tertiary">
            {paused
              ? "중지 모드 — 시작/종료 날짜를 클릭하면 캘린더+시간 편집 팝오버가 열립니다"
              : "LIVE 모드 — ▌▌ 클릭으로 중지하면 시작~종료 범위가 표시됩니다"}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};
