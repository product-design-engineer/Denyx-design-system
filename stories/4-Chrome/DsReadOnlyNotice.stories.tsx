import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import DsReadOnlyNotice from "../../src/DsReadOnlyNotice";

/**
 * **DsReadOnlyNotice** — 디자인 시스템 불변 정책 안내 모달.
 *
 * 소비자(엔지니어)가 UI 작업 레이어에서 토큰·컴포넌트·Atom·위젯을
 * 역으로 수정하려 할 때 표시합니다. 예외 없는 불변 정책.
 */
const meta: Meta<typeof DsReadOnlyNotice> = {
  title: "Primitives/DsReadOnlyNotice",
  component: DsReadOnlyNotice,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof DsReadOnlyNotice>;

/** 기본 — 열기 버튼 클릭으로 안내 모달 확인. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            borderRadius: 6,
            border: "1px solid #eaeaea",
            cursor: "pointer",
            backgroundColor: "#fff",
            fontFamily: "var(--font-family-korean, sans-serif)",
          }}
        >
          DS 수정 시도 (테스트)
        </button>
        <DsReadOnlyNotice open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
};

/** 시도된 작업 설명 포함. */
export const WithAttemptedAction: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            borderRadius: 6,
            border: "1px solid #eaeaea",
            cursor: "pointer",
            backgroundColor: "#fff",
            fontFamily: "var(--font-family-korean, sans-serif)",
          }}
        >
          토큰 override 시도 (테스트)
        </button>
        <DsReadOnlyNotice
          open={open}
          onClose={() => setOpen(false)}
          attemptedAction="--color-primary 값을 #FF0000으로 override 시도"
        />
      </>
    );
  },
};

/** 항상 열린 상태 (Storybook 프리뷰용). */
export const AlwaysOpen: Story = {
  args: {
    open: true,
    onClose: () => {},
    attemptedAction: "Button 컴포넌트 border-radius를 inline style로 변경 시도",
  },
};
