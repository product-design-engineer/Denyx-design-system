import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfirmDialog } from "@denyx/design-system";

/**
 * Stories for [[ConfirmDialog]] — 되돌릴 수 없는 동작 확인 다이얼로그 (Primitive).
 *
 * target(대상) + outcomes(결과 목록) + confirmLabel(동사) 조합.
 * tone="critical" 이면 확인 버튼 빨간색.
 */
const meta: Meta<typeof ConfirmDialog> = {
  title: "Primitives/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

/** critical — 삭제 확인. 버튼 클릭으로 열기/닫기. */
export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-default)",
              background: "var(--color-card)",
              cursor: "pointer",
            }}
          >
            다이얼로그 열기
          </button>
          <ConfirmDialog
            open={open}
            title="플랜에서 제외"
            target="GPU-A100 인스턴스 3대"
            outcomes={[
              { text: "모니터링 데이터가 삭제됩니다", tone: "critical" },
              { text: "과금이 즉시 중단됩니다" },
            ]}
            confirmLabel="제외"
            tone="critical"
            onConfirm={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        </>
      );
    };
    return <Demo />;
  },
};

/** primary — 설정 적용. */
export const PrimaryTone: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-default)",
              background: "var(--color-card)",
              cursor: "pointer",
            }}
          >
            다이얼로그 열기
          </button>
          <ConfirmDialog
            open={open}
            title="알림 설정 적용"
            target="전체 프로젝트 멤버 12명"
            outcomes={[{ text: "변경된 알림 규칙이 즉시 적용됩니다" }]}
            confirmLabel="적용"
            tone="primary"
            onConfirm={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        </>
      );
    };
    return <Demo />;
  },
};

/** loading — 처리 중 상태. */
export const Loading: Story = {
  args: {
    open: true,
    title: "인스턴스 삭제",
    target: "dev-worker-04",
    outcomes: [{ text: "연결된 볼륨 데이터가 영구 삭제됩니다", tone: "critical" as const }],
    confirmLabel: "삭제",
    tone: "critical",
    loading: true,
    onConfirm: () => {},
    onClose: () => {},
  },
};
