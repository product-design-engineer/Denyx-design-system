import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import Button from "../../src/Button";
import Chip from "../../src/Chip";
import TextField from "../../src/TextField";
import Toast from "../../src/Toast";

/**
 * AddonTheme — 컬러 토큰 Addon 구조 데모.
 *
 * ## Purpose
 * DS Core(그레이스케일) + Brand/Status Addon 분리 구조를 시각적으로 보여주는 데모.
 * Brand Addon을 교체하면 CTA·포커스·AI 그라데이션 색이 한꺼번에 바뀌는 것을 확인.
 *
 * ## When to use
 * - 테마 교체 가능성을 확인할 때.
 * - Addon 구조를 이해할 때.
 *
 * ## When NOT to use
 * - 토큰 값 참조 목적 → Color story 사용.
 *
 * ## Composition rules
 * - Core 토큰만으로 그레이스케일 UI 가 렌더 가능한지 증명하는 데모.
 * - Brand Addon 교체 시 컴포넌트 코드 변경 없이 색만 바뀜.
 *
 * @example
 * ```tsx
 * <AddonThemeDemo />
 * ```
 */

const meta: Meta = {
  title: "Tokens/Addon Theme",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**컬러 토큰 Addon 구조 데모.**\n\n" +
          "DS Core는 그레이스케일(중립색)만 보유. Brand·Status·Chart Addon이 색을 주입.\n\n" +
          "- **Core only** — gray fallback으로 렌더. 읽을 수 있지만 브랜드 아이덴티티 없음.\n" +
          "- **Core + Denyx Brand** — 현재 Denyx 정본 (primary=#296CF2, accent=#8B52FF).\n" +
          "- **Core + Alt Brand** — 다른 Brand Addon 예시 (primary=#10B981, accent=#F59E0B).\n\n" +
          "핵심: **컴포넌트 코드 변경 없이 CSS 변수만 교체.**\n\n" +
          "파일 구조: `src/tokens/core.css` + `src/tokens/brand.css` + `src/tokens/status.css` + `src/tokens/chart.css`",
      },
    },
  },
};
export default meta;

/* ── Brand 프리셋 ───────────────────────────────────────── */

const BRANDS = {
  core: {
    label: "Core Only (Gray Fallback)",
    vars: {
      "--color-primary": "#757575",
      "--color-primary-strong": "#616161",
      "--color-primary-soft": "#9e9e9e",
      "--color-primary-bg": "#f1f2f4",
      "--color-primary-bg-subtle": "#e8e8e8",
      "--color-accent-start": "#616161",
      "--color-accent": "#757575",
      "--color-accent-deep": "#616161",
      "--gradient-brand": "linear-gradient(90deg, #757575, #9e9e9e)",
    },
  },
  denyx: {
    label: "Denyx Brand (정본)",
    vars: {
      "--color-primary": "#296CF2",
      "--color-primary-strong": "#1B5CD9",
      "--color-primary-soft": "#3DA9FF",
      "--color-primary-bg": "#D6E1FF",
      "--color-primary-bg-subtle": "#C2D5FC",
      "--color-accent-start": "#004BE0",
      "--color-accent": "#8B52FF",
      "--color-accent-deep": "#4F5BD5",
      "--gradient-brand": "linear-gradient(90deg, #296CF2, #8B52FF)",
    },
  },
  alt: {
    label: "Alt Brand (Emerald + Amber)",
    vars: {
      "--color-primary": "#10B981",
      "--color-primary-strong": "#059669",
      "--color-primary-soft": "#34D399",
      "--color-primary-bg": "#D1FAE5",
      "--color-primary-bg-subtle": "#A7F3D0",
      "--color-accent-start": "#F59E0B",
      "--color-accent": "#D97706",
      "--color-accent-deep": "#B45309",
      "--gradient-brand": "linear-gradient(90deg, #10B981, #F59E0B)",
    },
  },
} as const;

type BrandKey = keyof typeof BRANDS;

/* ── 데모 컴포넌트 ──────────────────────────────────────── */

function ThemeDemo() {
  const [brand, setBrand] = useState<BrandKey>("denyx");
  const current = BRANDS[brand];

  return (
    <div style={current.vars as React.CSSProperties}>
      {/* Brand 선택 */}
      <div className="flex gap-8px" style={{ marginBottom: 24 }}>
        {(Object.keys(BRANDS) as BrandKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setBrand(key)}
            className="px-12px h-32px rounded-6px text-md cursor-pointer transition-colors"
            style={{
              background: key === brand ? "var(--color-primary)" : "var(--color-surface-100)",
              color: key === brand ? "#fff" : "var(--color-text-primary)",
              border: key === brand ? "1px solid var(--color-primary)" : "1px solid var(--color-border-default)",
            }}
          >
            {BRANDS[key].label}
          </button>
        ))}
      </div>

      {/* 토큰 값 미리보기 */}
      <div className="flex gap-8px flex-wrap" style={{ marginBottom: 24 }}>
        {Object.entries(current.vars).map(([name, value]) => (
          <div key={name} className="flex items-center gap-6px px-8px h-28px rounded-4px bg-surface-50 text-sm">
            <div
              style={{
                width: 14, height: 14, borderRadius: 3,
                background: value.startsWith("linear") ? value : value,
                border: "1px solid var(--color-border-default)",
              }}
            />
            <span className="text-tertiary">{name.replace("--color-", "")}</span>
            <span className="font-numeric text-secondary">{value.startsWith("linear") ? "gradient" : value}</span>
          </div>
        ))}
      </div>

      {/* 컴포넌트 렌더 — 코드 변경 없이 색만 바뀜 */}
      <div className="flex flex-col gap-16px">
        <section>
          <h3 className="text-md font-bold text-primary" style={{ marginBottom: 8 }}>Button</h3>
          <div className="flex gap-8px items-center">
            <Button variant="contained" tone="primary" size="lg">Primary CTA</Button>
            <Button variant="outline" tone="primary" size="md">Outline</Button>
            <Button variant="basic" tone="primary" size="md">Basic</Button>
            <Button variant="contained" tone="primary" size="sm" disabled>Disabled</Button>
          </div>
        </section>

        <section>
          <h3 className="text-md font-bold text-primary" style={{ marginBottom: 8 }}>Chip</h3>
          <div className="flex gap-8px items-center">
            <Chip variant="solid" tone="primary" size="md">Primary Solid</Chip>
            <Chip variant="soft" tone="primary" size="md">Primary Soft</Chip>
            <Chip variant="outline" tone="primary" size="md">Primary Outline</Chip>
            <Chip variant="solid" tone="warning" size="md">Warning</Chip>
            <Chip variant="solid" tone="critical" size="md">Critical</Chip>
          </div>
        </section>

        <section>
          <h3 className="text-md font-bold text-primary" style={{ marginBottom: 8 }}>TextField</h3>
          <div style={{ maxWidth: 320 }}>
            <TextField size="md" placeholder="포커스하면 primary 보더" />
          </div>
        </section>

        <section>
          <h3 className="text-md font-bold text-primary" style={{ marginBottom: 8 }}>Gradient Brand</h3>
          <div
            style={{
              height: 40,
              borderRadius: 8,
              background: "var(--gradient-brand)",
              maxWidth: 320,
            }}
          />
        </section>
      </div>
    </div>
  );
}

export const Demo: StoryObj = {
  render: () => <ThemeDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Brand 버튼을 눌러 테마를 전환합니다. 컴포넌트 코드는 동일 — CSS 변수만 교체.",
      },
    },
  },
};
