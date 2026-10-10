import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import Disclosure from "../../src/Disclosure";

/**
 * Stories for [[Disclosure]] — 접기/펼치기 섹션 (Primitive).
 *
 * 헤더 한 줄은 항상 보이고, 내용은 펼쳤을 때만 표시.
 * controlled(`open`) / uncontrolled(`defaultOpen`) 모두 지원.
 */
const meta: Meta<typeof Disclosure> = {
  title: "Primitives/Disclosure",
  component: Disclosure,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Disclosure>;

/** controlled 토글 — useState 로 열림 상태 관리. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Disclosure summary="고급 설정" open={open} onOpenChange={setOpen}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p className="text-sm text-primary" style={{ margin: 0 }}>타임아웃: 30초</p>
          <p className="text-sm text-tertiary" style={{ margin: 0 }}>재시도 횟수: 3회</p>
          <p className="text-sm text-tertiary" style={{ margin: 0 }}>로깅 레벨: DEBUG</p>
        </div>
      </Disclosure>
    );
  },
};

/** 기본 열림 상태 (uncontrolled). */
export const WithDefaultOpen: Story = {
  args: {
    summary: "필터 옵션",
    defaultOpen: true,
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p className="text-sm text-primary" style={{ margin: 0 }}>상태: 활성</p>
        <p className="text-sm text-tertiary" style={{ margin: 0 }}>지역: 서울</p>
      </div>
    ),
  },
};
