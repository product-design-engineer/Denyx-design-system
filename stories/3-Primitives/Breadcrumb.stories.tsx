import type { Meta, StoryObj } from "@storybook/react-vite";
import Breadcrumb from "../../src/Breadcrumb";

/**
 * Stories for [[Breadcrumb]] — 경로 탐색 네비게이션 (Primitive).
 *
 * 현재 위치의 계층 구조를 보여주고 상위로 이동 가능.
 * 마지막 항목은 현재 페이지(링크 아님, bold).
 */
const meta: Meta<typeof Breadcrumb> = {
  title: "Primitives/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/** 3단계 경로 — 대시보드 > 프로젝트 관리 > 작업 상세. */
export const Default: Story = {
  args: {
    items: [
      { label: "대시보드", href: "/" },
      { label: "프로젝트 관리", href: "/projects" },
      { label: "작업 상세" },
    ],
  },
};

/** 2단계 경로 — 설정 > 알림 규칙. */
export const TwoLevels: Story = {
  args: {
    items: [
      { label: "설정", href: "/settings" },
      { label: "알림 규칙" },
    ],
  },
};
