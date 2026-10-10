import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Autocomplete } from "@denyx/design-system";

/**
 * Stories for [[Autocomplete]] — 자동완성 검색 입력 (Primitive).
 *
 * 대량 옵션에서 타이핑으로 필터링하여 선택. TextField + 드롭다운 리스트 조합.
 */
const meta: Meta<typeof Autocomplete> = {
  title: "Primitives/Autocomplete",
  component: Autocomplete,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Autocomplete>;

const MEMBER_OPTIONS = [
  { value: "kim", label: "김민수", description: "kim.minsu@denyx.io" },
  { value: "lee", label: "이서연", description: "lee.seoyeon@denyx.io" },
  { value: "park", label: "박지훈", description: "park.jihun@denyx.io" },
  { value: "choi", label: "최유진", description: "choi.yujin@denyx.io" },
  { value: "jung", label: "정하윤", description: "jung.hayun@denyx.io" },
  { value: "kang", label: "강도현", description: "kang.dohyun@denyx.io" },
  { value: "yoon", label: "윤서아", description: "yoon.seoa@denyx.io" },
];

/** controlled — 팀 멤버 검색. */
export const Default: Story = {
  render: (args) => {
    const Demo = () => {
      const [query, setQuery] = useState("");
      const [selected, setSelected] = useState("");
      return (
        <div style={{ width: 280 }}>
          <Autocomplete
            {...args}
            value={query}
            onChange={setQuery}
            options={MEMBER_OPTIONS}
            onSelect={(opt) => { setSelected(opt.label); setQuery(opt.label); }}
            placeholder="이름 또는 이메일 검색"
            label="담당자"
          />
          {selected && (
            <span className="text-sm text-tertiary" style={{ display: "block", marginTop: 8 }}>
              선택: {selected}
            </span>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};

/** 비활성 + disabled 항목. */
export const WithDisabledOptions: Story = {
  render: () => {
    const Demo = () => {
      const [query, setQuery] = useState("");
      return (
        <div style={{ width: 280 }}>
          <Autocomplete
            value={query}
            onChange={setQuery}
            options={[
              { value: "a", label: "프로덕션 클러스터", description: "ap-northeast-2" },
              { value: "b", label: "스테이징 클러스터", description: "ap-northeast-2", disabled: true },
              { value: "c", label: "개발 클러스터", description: "us-west-2" },
            ]}
            onSelect={() => {}}
            placeholder="클러스터 검색"
            label="대상 클러스터"
          />
        </div>
      );
    };
    return <Demo />;
  },
};
