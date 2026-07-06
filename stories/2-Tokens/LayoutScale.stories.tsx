import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "Tokens/Layout Scale",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**Layout Scale 토큰 — Spacing · Radius · Shadow (Global tier).**\n\n" +
          "2026-07-02 신설 (DS-ENHANCEMENT-PLAN §2.1~2.3). `pnpm audit:tokens` 실측 빈도 기반 스케일. " +
          "기존 유틸 클래스(`gap-6px`·`rounded-4px` 등)는 값 유지(비파괴) — 신규 컴포넌트의 인라인 스타일부터 " +
          "`var(--spacing-*)` / `var(--radius-*)` / `var(--shadow-*)` 참조. " +
          "유틸: `rounded-xs/sm/md/lg/xl/2xl/full` · `shadow-sm/md/lg`.",
      },
    },
  },
};
export default meta;

const FONT = "'Noto Sans', 'Noto Sans KR', sans-serif";

const SPACING = [
  { key: "2xs", px: 2, freq: "×20" },
  { key: "xs", px: 4, freq: "×49" },
  { key: "sm", px: 6, freq: "×57 ⭐" },
  { key: "md", px: 8, freq: "×54" },
  { key: "lg", px: 12, freq: "×16" },
  { key: "xl", px: 16, freq: "×23" },
  { key: "2xl", px: 20, freq: "—" },
  { key: "3xl", px: 24, freq: "—" },
  { key: "4xl", px: 32, freq: "—" },
];

export const Spacing: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 720, fontFamily: FONT }}>
      {SPACING.map((s) => (
        <div key={s.key} style={{ display: "grid", gridTemplateColumns: "130px 50px 60px 1fr", gap: 16, alignItems: "center", padding: "8px 16px", borderBottom: "1px solid #f5f5f5" }}>
          <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "#222" }}>--spacing-{s.key}</code>
          <span style={{ fontSize: 12, color: "#4c4c4c" }}>{s.px}px</span>
          <span style={{ fontSize: 11, color: "#757575" }}>{s.freq}</span>
          <div style={{ width: `var(--spacing-${s.key})`, height: 16, background: "var(--color-primary)", borderRadius: 2 }} />
        </div>
      ))}
      <p style={{ fontSize: 11, color: "#757575", margin: "8px 16px 0" }}>
        빈도 = src 실측 (pnpm audit:tokens). 10px(×11)·14px(×5)는 스케일 외 실측값 — 신규 사용 시 인접 스케일 우선.
      </p>
    </div>
  ),
};

const RADIUS = [
  { key: "xs", px: "2px", use: "마이크로 요소 (인디케이터·미니 칩)" },
  { key: "sm", px: "4px", use: "버튼·칩·입력 등 기본 컨트롤 ⭐" },
  { key: "md", px: "6px", use: "카드 내부 블록" },
  { key: "lg", px: "8px", use: "카드·패널·드롭다운" },
  { key: "xl", px: "12px", use: "대형 패널" },
  { key: "2xl", px: "24px", use: "위젯 셸·풀 라운드 컨테이너" },
  { key: "full", px: "9999px", use: "pill·원형" },
];

export const Radius: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 720, fontFamily: FONT }}>
      {RADIUS.map((r) => (
        <div key={r.key} style={{ display: "grid", gridTemplateColumns: "130px 60px 72px 1fr", gap: 16, alignItems: "center", padding: "8px 16px", borderBottom: "1px solid #f5f5f5" }}>
          <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "#222" }}>--radius-{r.key}</code>
          <span style={{ fontSize: 12, color: "#4c4c4c" }}>{r.px}</span>
          <div style={{ width: 56, height: 40, background: "var(--color-primary-bg)", border: "1px solid var(--color-primary)", borderRadius: `var(--radius-${r.key})` }} />
          <span style={{ fontSize: 12, color: "#4c4c4c" }}>{r.use}</span>
        </div>
      ))}
      <p style={{ fontSize: 11, color: "#757575", margin: "8px 16px 0" }}>
        3px 등 스케일 사이 미세값은 토큰화하지 않음 — allowlist (docs/tokens.md § 토큰 거버넌스).
      </p>
    </div>
  ),
};

const SHADOWS = [
  { key: "sm", use: "컨트롤 (Switch thumb 등)" },
  { key: "md", use: "드롭다운·팝오버·토스트" },
  { key: "lg", use: "모달·다이얼로그" },
];

export const Shadow: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: 40, padding: 24, fontFamily: FONT }}>
      {SHADOWS.map((s) => (
        <div key={s.key} style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <div style={{ width: 120, height: 80, background: "var(--color-card)", borderRadius: "var(--radius-lg)", boxShadow: `var(--shadow-${s.key})` }} />
          <code style={{ fontFamily: "Roboto, monospace", fontSize: 12, color: "#222" }}>--shadow-{s.key}</code>
          <span style={{ fontSize: 11, color: "#757575", textAlign: "center", maxWidth: 140 }}>{s.use}</span>
        </div>
      ))}
    </div>
  ),
};
