import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterChip } from "@denyx/design-system";

/**
 * Stories for [[FilterChip]] — Primitives 필터 칩 (interactive Chip 변형).
 *
 * FilterBar 안에 다중 배치되어 다중 필터 진입점 역할. 선택 토글 + count + closable.
 */
const meta: Meta<typeof FilterChip> = {
  title: "Primitives/FilterChip",
  component: FilterChip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**Interactive 필터 칩.** Chip 의 button 변형 — selected 토글 + count + closable 지원. " +
          "정적 라벨은 `Chip` 사용. 키보드 Enter/Space 토글, Tab focus. " +
          "선택 시 primary solid, 미선택 시 surface-100 soft.",
      },
    },
  },
  argTypes: {
    selected: { description: "선택 상태.", control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    count: { description: "우측 카운트(빈도/개수).", control: "text" },
    closable: {
      description: "true && selected 일 때만 우측 × 표시.",
      control: "boolean",
    },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterChip>;

/** 기본 — 미선택 상태. */
export const Default: Story = {
  args: { selected: false, children: "Disk" },
};

/** 선택 상태. */
export const Selected: Story = {
  args: { selected: true, children: "Disk" },
};

/** count 포함 — 발생 빈도 표시. */
export const WithCount: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip selected count={12}>Disk</FilterChip>
      <FilterChip selected={false} count={4}>JVM</FilterChip>
      <FilterChip selected={false} count={211}>Process</FilterChip>
      <FilterChip selected count="9+">k8s</FilterChip>
    </div>
  ),
};

/** closable — 선택된 필터를 × 로 제거 (FilterBar 안 패턴). */
export const Closable: Story = {
  render: () => {
    const Demo = () => {
      const [filters, setFilters] = useState<Record<string, boolean>>({
        disk: true,
        jvm: true,
        k8s: true,
      });
      return (
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(filters)
            .filter(([, v]) => v)
            .map(([k]) => (
              <FilterChip
                key={k}
                selected
                closable
                onClose={() => setFilters({ ...filters, [k]: false })}
                onChange={(v) => setFilters({ ...filters, [k]: v })}
              >
                {k.toUpperCase()}
              </FilterChip>
            ))}
          {Object.values(filters).every((v) => !v) && (
            <span className="text-sm text-tertiary">모두 제거됨</span>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};

/** 사이즈 — sm(20px) / md(24px) / lg(32px). FilterChip 은 interactive 라 Chip 보다 큼 (탭 영역 확보).
    lg 는 FilterBar 의 검색 input·Button lg 와 height 정렬 (32px) — 페이지 헤더 필터 영역 통일. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip size="sm" selected={false}>sm</FilterChip>
        <FilterChip size="sm" selected>sm selected</FilterChip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip size="md" selected={false}>md</FilterChip>
        <FilterChip size="md" selected>md selected</FilterChip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip size="lg" selected={false}>lg</FilterChip>
        <FilterChip size="lg" selected>lg selected</FilterChip>
        <FilterChip size="lg" selected count={12}>lg + count</FilterChip>
      </div>
    </div>
  ),
};

/** leadingIcon — 도트/아이콘 슬롯. */
export const WithLeadingIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip selected leadingIcon={<span style={{ fontSize: 7 }}>●</span>}>Critical</FilterChip>
      <FilterChip selected={false} leadingIcon={<span style={{ fontSize: 7 }}>●</span>}>Warning</FilterChip>
      <FilterChip selected={false} leadingIcon={<span style={{ fontSize: 7 }}>●</span>}>Info</FilterChip>
    </div>
  ),
};

/** disabled. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip selected={false} disabled>비활성 (미선택)</FilterChip>
      <FilterChip selected disabled>비활성 (선택)</FilterChip>
    </div>
  ),
};

/** 다중 필터 데모 — FilterBar 안에서의 사용 패턴. */
export const FilterRow: Story = {
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<Record<string, boolean>>({
        disk: true,
        jvm: false,
        k8s: true,
        net: false,
        process: false,
      });
      const counts: Record<string, number> = { disk: 12, jvm: 43, k8s: 8, net: 2, process: 211 };
      const total = Object.entries(selected).filter(([, v]) => v).length;
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-tertiary">카테고리:</span>
            {Object.keys(selected).map((k) => (
              <FilterChip
                key={k}
                selected={selected[k]}
                count={counts[k]}
                onChange={(v) => setSelected({ ...selected, [k]: v })}
              >
                {k.toUpperCase()}
              </FilterChip>
            ))}
          </div>
          <div className="text-sm text-tertiary">
            선택됨: {total} 종 / 전체 {Object.keys(selected).length} 종
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

/** severity 토글 — 도트 + count. */
export const SeverityToggles: Story = {
  render: () => {
    const Demo = () => {
      const [sel, setSel] = useState({ critical: true, warning: true, info: false });
      return (
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            selected={sel.critical}
            count={3}
            leadingIcon={<span style={{ fontSize: 7 }}>●</span>}
            onChange={(v) => setSel({ ...sel, critical: v })}
          >
            Critical
          </FilterChip>
          <FilterChip
            selected={sel.warning}
            count={9}
            leadingIcon={<span style={{ fontSize: 7 }}>●</span>}
            onChange={(v) => setSel({ ...sel, warning: v })}
          >
            Warning
          </FilterChip>
          <FilterChip
            selected={sel.info}
            count={4}
            leadingIcon={<span style={{ fontSize: 7 }}>●</span>}
            onChange={(v) => setSel({ ...sel, info: v })}
          >
            Info
          </FilterChip>
        </div>
      );
    };
    return <Demo />;
  },
};
