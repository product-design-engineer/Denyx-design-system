import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionMenuItem } from "@denyx/design-system";

/**
 * Stories for [[ActionMenuItem]] — 액션 메뉴 항목 (Primitive).
 *
 * 컨텍스트 메뉴·드롭다운 액션 목록의 한 행. 라벨은 동사형.
 * tone="critical" 이면 빨간색 (삭제 등 위험 동작).
 */
const meta: Meta<typeof ActionMenuItem> = {
  title: "Primitives/ActionMenuItem",
  component: ActionMenuItem,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ActionMenuItem>;

/** 기본 항목. */
export const Default: Story = {
  args: {
    label: "복제",
    onSelect: () => {},
  },
  decorators: [(Story) => (
    <div style={{ width: 200, border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-card)", padding: "4px 0" }}>
      <Story />
    </div>
  )],
};

/** 메뉴 목록 — 아이콘 포함 + critical tone. */
export const MenuList: Story = {
  render: () => {
    const iconStyle = { width: 16, height: 16, stroke: "currentColor", fill: "none", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    return (
      <div style={{ width: 200, border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-card)", padding: "4px 0" }}>
        <ActionMenuItem
          label="편집"
          icon={<svg {...iconStyle} viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
          onSelect={() => {}}
        />
        <ActionMenuItem
          label="복제"
          icon={<svg {...iconStyle} viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>}
          onSelect={() => {}}
        />
        <ActionMenuItem
          label="내보내기"
          description="CSV 형식으로 다운로드"
          icon={<svg {...iconStyle} viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
          onSelect={() => {}}
        />
        <ActionMenuItem
          label="삭제"
          tone="critical"
          icon={<svg {...iconStyle} viewBox="0 0 24 24" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>}
          onSelect={() => {}}
        />
      </div>
    );
  },
};

/** 비활성 항목. */
export const Disabled: Story = {
  args: {
    label: "배포",
    description: "권한이 필요합니다",
    disabled: true,
    onSelect: () => {},
  },
  decorators: [(Story) => (
    <div style={{ width: 200, border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)", background: "var(--color-card)", padding: "4px 0" }}>
      <Story />
    </div>
  )],
};
