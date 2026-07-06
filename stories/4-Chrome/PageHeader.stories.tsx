import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeader } from "@denyx/design-system";

/**
 * Stories for [[PageHeader]] — 48px 페이지 헤더 (invariant).
 */
const meta: Meta<typeof PageHeader> = {
  title: "Composite/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**48px 페이지 헤더 (invariant policy).** 좌: 타이틀 + Denyx AI 토글 + Docs / 우: 고객지원 + 알림 + 아바타. " +
          "**Denyx AI 위젯 토글과 무관하게 항상 동일한 레이아웃·동일한 가시 요소·동일한 크기**로 렌더링됩니다 " +
          "(feedback-page-header-invariant). 헤더에서 prop 으로 항목을 숨길 수 없음 — 의도된 제약.",
      },
    },
  },
  argTypes: {
    title: { description: "페이지 타이틀 — 'K8s-GPU / GPU 트렌드' 같은 경로.", control: "text" },
    aiActive: { description: "Denyx AI 버튼의 active 상태.", control: "boolean" },
    searchSlot: { description: "타이틀과 우측 액션 사이 중앙에 배치할 검색 UI. 미지정 시 빈 공간(기존 동작 불변)." },
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

/** 기본 — GPU 트렌드 페이지 헤더. */
export const Default: Story = {
  args: { title: "K8s-GPU / GPU 트렌드", aiActive: false },
};

/** 검색 슬롯 — 헤더 중앙에 검색 입력을 주입한 예. */
export const WithSearchSlot: Story = {
  args: {
    title: "당발송금 / 전체거래",
    hideAiToggle: true,
    searchSlot: (
      <input
        type="text"
        placeholder="거래 ID, 송금인명으로 검색 · ⌘K"
        style={{
          width: 360,
          height: 32,
          padding: "0 12px",
          borderRadius: 6,
          border: "1px solid var(--color-border-default)",
          background: "var(--color-surface-50)",
          fontSize: 13,
        }}
      />
    ),
  },
};

/** AI 위젯 활성 상태 — 버튼 강조. */
export const AiActive: Story = {
  args: { title: "K8s-GPU / GPU 트렌드", aiActive: true },
};

/** 긴 타이틀 — truncate / 폭 검사. */
export const LongTitle: Story = {
  args: { title: "K8s-GPU · prod-cluster-01 · namespace=gpu-inference / 응답 시간 분석", aiActive: false },
};

/** 인터랙티브 — AI 토글 가능. */
export const Interactive: Story = {
  args: {},
  render: () => {
    const Demo = () => {
      const [active, setActive] = useState(false);
      return <PageHeader title="DB / oracle_dnx" aiActive={active} onAiToggle={() => setActive((v) => !v)} />;
    };
    return <Demo />;
  },
};
