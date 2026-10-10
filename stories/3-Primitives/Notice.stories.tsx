import type { Meta, StoryObj } from "@storybook/react-vite";
import { Notice } from "@denyx/design-system";

/**
 * Stories for [[Notice]] — 인라인 알림 카드 (Primitive).
 *
 * 좌측 3px 컬러 바로 tone 표시. Toast와 달리 영구 표시.
 * variant="card"(독립) / "bare"(다른 카드 안).
 */
const meta: Meta<typeof Notice> = {
  title: "Primitives/Notice",
  component: Notice,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Notice>;

/** warning — 기본 카드 형태. */
export const Default: Story = {
  args: {
    tone: "warning",
    title: "결제 수단 만료 예정",
    description: "등록된 카드가 10일 후 만료됩니다. 결제 설정에서 갱신하세요.",
  },
};

/** 전체 tone 비교. */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
      <Notice tone="primary" title="새 버전 배포 완료" description="v2.4.1 이 프로덕션에 적용되었습니다." />
      <Notice tone="success" title="백업 완료" description="마지막 백업: 오늘 14:32" />
      <Notice tone="warning" title="디스크 사용률 85%" description="자동 정리 정책을 확인하세요." />
      <Notice tone="critical" title="인증서 만료 임박" description="SSL 인증서가 3일 후 만료됩니다." />
      <Notice tone="neutral" title="점검 예정" description="10월 15일 02:00~04:00 정기 점검이 예정되어 있습니다." />
    </div>
  ),
};

/** bare variant — 다른 카드 안에서 보더 없이. */
export const BareVariant: Story = {
  render: () => (
    <div
      style={{
        padding: 16,
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border-default)",
        background: "var(--color-card)",
        maxWidth: 480,
      }}
    >
      <p className="text-md font-bold text-primary" style={{ margin: "0 0 12px" }}>설정 변경</p>
      <Notice
        tone="critical"
        variant="bare"
        title="삭제된 데이터는 복구할 수 없습니다"
      />
    </div>
  ),
};
