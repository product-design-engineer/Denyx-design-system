import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import CardHead from "../../src/CardHead";
import TimeChip from "../../src/TimeChip";

/**
 * Stories for [[CardHead]] — 카드/위젯 상단 헤더 (Primitive).
 *
 * 제목(좌) + 탭(중앙) + 메타(우) 한 줄 구성.
 * 대시보드 위젯/패널의 공통 헤더 패턴.
 */
const meta: Meta<typeof CardHead> = {
  title: "Primitives/CardHead",
  component: CardHead,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof CardHead>;

/** 제목 + 탭 + 메타 — 전체 슬롯 사용. */
export const Default: Story = {
  render: () => {
    const [view, setView] = useState("chart");
    return (
      <CardHead
        title="팀 현황"
        tabs={{
          items: [
            { value: "chart", label: "차트" },
            { value: "table", label: "테이블" },
          ],
          value: view,
          onChange: setView,
        }}
        meta={<TimeChip label="기준" value="최근 1시간" />}
      />
    );
  },
};

/** 제목만 — 탭/메타 없음. */
export const TitleOnly: Story = {
  args: {
    title: "프로젝트 현황",
  },
};
