import type { Meta, StoryObj } from "@storybook/react-vite";
import ListRow from "../../src/ListRow";
import Chip from "../../src/Chip";

/**
 * Stories for [[ListRow]] — 리스트 행 (Primitive).
 *
 * 제목 + 뱃지 + 설명 + 우측 메타 구성. 클릭 → 상세 진입 패턴.
 * 테이블과 달리 컬럼 정렬 없이 가변 길이 목록에 사용.
 */
const meta: Meta<typeof ListRow> = {
  title: "Primitives/ListRow",
  component: ListRow,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ListRow>;

/** 뱃지 + 설명 + 메타 — 전체 슬롯 사용. */
export const Default: Story = {
  args: {
    title: "월간 매출 리포트",
    badge: <Chip variant="soft" tone="primary" size="sm">신규</Chip>,
    description: "2026-10-10 생성 \u00b7 항목 12건",
    meta: "3분 전",
    onClick: () => {},
  },
};

/** 선택 상태 — primary-bg 배경 + primary 보더. */
export const Selected: Story = {
  args: {
    title: "장애 알림 설정",
    badge: <Chip variant="soft" tone="critical" size="sm">긴급</Chip>,
    description: "임계값 초과 시 Slack 채널로 알림 전송",
    meta: "12분 전",
    selected: true,
    onClick: () => {},
  },
};

/** 좌측 아이콘 — leading 슬롯에 아이콘 배치. */
export const WithLeading: Story = {
  args: {
    leading: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    title: "주간 운영 보고서",
    description: "2026-10-07 ~ 2026-10-13 기간 운영 요약",
    meta: "1시간 전",
    onClick: () => {},
  },
};
