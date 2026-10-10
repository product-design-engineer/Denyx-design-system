import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "@denyx/design-system";

/**
 * Stories for [[TextField]] — Primitives 폼 입력.
 *
 * 룰 편집기·카탈로그 검색·임계값 input·이름 입력 등 전반의 building block.
 */
const meta: Meta<typeof TextField> = {
  title: "Primitives/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component:
          "**폼 텍스트 입력 primitive.** 3 size (sm=24px / md=28px / lg=32px) + leading/trailing 슬롯 + invalid 상태 + helper text. " +
          "AI 위젯 대화 입력은 별개(`AiPromptInput`) — 본 컴포넌트는 페이지·폼 일반용.",
      },
    },
  },
  argTypes: {
    label: { description: "상단 라벨.", control: "text" },
    placeholder: { control: "text" },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    invalid: { control: "boolean" },
    helperText: { control: "text" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    clearable: {
      description: "value 있을 때 우측 × 버튼 노출. trailingNode 와 공존 가능.",
      control: "boolean",
    },
    type: {
      control: { type: "select" },
      options: ["text", "number", "search", "email", "password"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

/** 기본 — md 사이즈 + 라벨. */
export const Default: Story = {
  args: { label: "룰 이름", placeholder: "disk-usage-95-prod-var-log" },
};

/** 사이즈 비교. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 320 }}>
      <TextField size="sm" label="sm (24px)" placeholder="dense 옵션바·인라인" />
      <TextField size="md" label="md (28px)" placeholder="Modal 안 dense form" />
      <TextField size="lg" label="lg (32px, default)" placeholder="페이지 헤더·FilterBar 검색" />
    </div>
  ),
};

/** leadingIcon — 검색 패턴. */
export const WithLeadingIcon: Story = {
  args: {
    placeholder: "제목, 내용, 태그",
    size: "sm",
    leadingIcon: (
      <svg viewBox="0 0 16 16" width={12} height={12} fill="none" aria-hidden>
        <circle cx={7} cy={7} r={5} stroke="currentColor" strokeWidth={1.5} />
        <path d="M11 11 L14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    ),
  },
};

/** trailingNode — 단위(%) 표시. */
export const WithTrailingUnit: Story = {
  args: {
    label: "임계값",
    type: "number",
    placeholder: "95",
    trailingNode: <span className="text-sm">%</span>,
  },
};

/** invalid — 에러 상태. */
export const Invalid: Story = {
  args: {
    label: "이메일",
    value: "not-an-email",
    invalid: true,
    helperText: "유효한 이메일이 아닙니다",
  },
};

/** helperText — 도움말. */
export const WithHelper: Story = {
  args: {
    label: "룰 scope",
    placeholder: "host=server-prod-* mount=/var/log",
    helperText: "와일드카드(*)와 AND 조합으로 입력. 예: host=prod-* AND mount=/var/log",
  },
};

/** disabled. */
export const Disabled: Story = {
  args: { label: "읽기 전용", value: "변경 불가 (권한 없음)", disabled: true },
};

/** fullWidth + 인터랙티브 — 검색 데모. */
export const SearchInteractive: Story = {
  render: () => {
    const Demo = () => {
      const [q, setQ] = useState("");
      return (
        <div style={{ width: 400 }}>
          <TextField
            size="sm"
            fullWidth
            value={q}
            onChange={setQ}
            placeholder="검색…"
            leadingIcon={
              <svg viewBox="0 0 16 16" width={12} height={12} fill="none" aria-hidden>
                <circle cx={7} cy={7} r={5} stroke="currentColor" strokeWidth={1.5} />
                <path d="M11 11 L14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            }
            helperText={q ? `입력: "${q}"` : "타이핑하여 검색"}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** Clearable — value 있을 때 우측 × 버튼. 클릭 시 onChange("") + onClear 호출. */
export const Clearable: Story = {
  render: () => {
    const Demo = () => {
      const [q, setQ] = useState("server-prod-01");
      return (
        <div className="flex flex-col gap-3" style={{ width: 360 }}>
          <TextField
            label="룰 이름"
            fullWidth
            value={q}
            onChange={setQ}
            clearable
            placeholder="비어있을 땐 × 안 보임"
          />
          <span className="text-sm text-tertiary">현재 값: {q || "(비어있음)"}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

/** Clearable + 검색 — FilterBar 안 사용 케이스. */
export const ClearableSearch: Story = {
  render: () => {
    const Demo = () => {
      const [q, setQ] = useState("disk usage");
      return (
        <div style={{ width: 400 }}>
          <TextField
            size="sm"
            fullWidth
            value={q}
            onChange={setQ}
            clearable
            placeholder="제목, 내용, 태그"
            leadingIcon={
              <svg viewBox="0 0 16 16" width={12} height={12} fill="none" aria-hidden>
                <circle cx={7} cy={7} r={5} stroke="currentColor" strokeWidth={1.5} />
                <path d="M11 11 L14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** Clearable + trailingNode 공존 — 단위 표시와 × 동시. */
export const ClearableWithUnit: Story = {
  render: () => {
    const Demo = () => {
      const [v, setV] = useState("95");
      return (
        <div style={{ width: 320 }}>
          <TextField
            label="임계값"
            fullWidth
            type="number"
            value={v}
            onChange={setV}
            clearable
            trailingNode={<span className="text-sm">%</span>}
            helperText="× 와 % 가 함께 표시됨 — 순서: [×] [%]"
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/** 폼 묶음 — 실제 사용 패턴 (룰 편집기 가정). */
export const FormSet: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: 400 }}>
      <TextField label="룰 이름" fullWidth placeholder="disk-usage-95-prod-var-log" />
      <TextField
        label="임계값"
        type="number"
        fullWidth
        placeholder="95"
        trailingNode={<span className="text-sm">%</span>}
      />
      <TextField
        label="지속 시간"
        type="number"
        fullWidth
        placeholder="5"
        trailingNode={<span className="text-sm">분</span>}
        helperText="임계값 초과가 이 시간 이상 지속되어야 알림 발생"
      />
    </div>
  ),
};
