import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "@denyx/design-system";

/**
 * Stories for [[Pagination]] — 페이지 네비게이션 컨트롤 (Primitive).
 *
 * DataTable 하단에 배치. 좌측 요약 + 우측 이전/페이지/다음 네비게이션.
 * 8페이지 초과 시 ellipsis 축약.
 */
const meta: Meta<typeof Pagination> = {
  title: "Primitives/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

/** controlled — 페이지 전환. */
export const Default: Story = {
  render: (args) => {
    const Demo = () => {
      const [page, setPage] = useState(1);
      return (
        <Pagination
          {...args}
          page={page}
          totalPages={12}
          pageSize={20}
          total={235}
          onChange={setPage}
        />
      );
    };
    return <Demo />;
  },
};

/** ellipsis — 12페이지 중 7페이지 선택. 앞뒤 축약 표시. */
export const MidPage: Story = {
  render: () => {
    const Demo = () => {
      const [page, setPage] = useState(7);
      return (
        <Pagination
          page={page}
          totalPages={12}
          pageSize={20}
          total={235}
          onChange={setPage}
        />
      );
    };
    return <Demo />;
  },
};

/** 단일 페이지 — 이전/다음 비활성. */
export const SinglePage: Story = {
  args: {
    page: 1,
    totalPages: 1,
    pageSize: 20,
    total: 8,
    onChange: () => {},
  },
};

/** 요약 숨김. */
export const HideSummary: Story = {
  render: () => {
    const Demo = () => {
      const [page, setPage] = useState(3);
      return (
        <Pagination
          page={page}
          totalPages={5}
          pageSize={50}
          total={230}
          hideSummary
          onChange={setPage}
        />
      );
    };
    return <Demo />;
  },
};
