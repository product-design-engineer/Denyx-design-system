import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokens, type SemanticIntent } from "@denyx/design-system/widget";

const meta: Meta = {
  title: "Tokens/Color",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**Color 토큰 전체 카탈로그.**\n\n" +
          "단일 출처: `src/tokens.css` 의 `:root` 블록. 파생 utility class 는 `denyx-ds.css` 에 일반 CSS 로 정의 (Tailwind 없음).\n\n" +
          "구성:\n" +
          "- **Surface (Intent)** — `tokens.color.surface.*` 5 톤 위젯 카드 배경\n" +
          "- **Indicator (Intent)** — `tokens.color.indicator.*` 5 톤 도트/스트로크\n" +
          "- **Tone Pairing** — 5 톤별 surface + indicator + label 조합\n" +
          "- **Text Hierarchy** — primary / secondary / tertiary / disabled\n" +
          "- **Primary** — primary 5 변형 (구 brand-blue 계열, 구명 @deprecated alias 유지)\n" +
          "- **Status** — success / warning / error\n" +
          "- **Surface Generic** — surface-50 / 100 / 200\n" +
          "- **Border** — default / soft / strong / divider\n" +
          "- **Accent Gradient** — accent-start / accent / accent-deep (AI symbol/위젯 그라데이션 · 구 denyx-* 계열)\n" +
          "- **Extended Gray** — gray-mid / soft / pale (text 4계층 외 UI 회색)\n" +
          "- **Extended Palette** — 40 chart/brand ad-hoc 색 (hex-suffix 토큰)",
      },
    },
  },
};
export default meta;

/* ─── 공통 ────────────────────────────────────────── */

function Swatch({
  color,
  label,
  hex,
  description,
  border,
}: {
  color: string;
  label: string;
  hex: string;
  description?: string;
  border?: boolean;
}) {
  return (
    <div className="flex items-stretch gap-3 p-3 border border-ceaeaea rounded-lg bg-white" style={{ fontFamily: "var(--font-family-korean)" }}>
      <div
        className="rounded-md flex-shrink-0"
        style={{
          width: 80,
          height: 56,
          background: color,
          border: border ? "1px dashed #ccc" : undefined,
        }}
      />
      <div className="flex flex-col justify-center gap-0_5 min-w-0">
        <div className="text-base font-bold text-primary tracking-default leading-none">{label}</div>
        <div className="text-xs text-tertiary leading-none" style={{ fontFamily: "var(--font-family-numeric)" }}>{hex}</div>
        {description && (
          <div className="text-xs text-secondary leading-normal mt-1">{description}</div>
        )}
      </div>
    </div>
  );
}

function SwatchGrid({ children, minColumn = 320 }: { children: React.ReactNode; minColumn?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${minColumn}px, 1fr))`, gap: 8, maxWidth: 1200 }}>
      {children}
    </div>
  );
}

function CompactSwatch({ token, hex }: { token: string; hex: string }) {
  return (
    <div className="flex flex-col items-stretch gap-1 p-2 border border-ceaeaea rounded-md bg-white" style={{ fontFamily: "var(--font-family-numeric)" }}>
      <div className="rounded h-12" style={{ background: hex }} />
      <div className="text-chart text-tertiary leading-none truncate" style={{ fontFamily: "var(--font-family-numeric)" }}>{token}</div>
      <div className="text-chart text-tertiary leading-none">{hex}</div>
    </div>
  );
}

const INTENTS: SemanticIntent[] = ["critical", "warning", "info", "muted", "neutral"];

/* ─── 1) Surface (Intent) ─────────────────────────── */

/** **`tokens.color.surface.<intent>`** — 카드/패널 배경 5종. */
export const Surface: StoryObj = {
  render: () => (
    <SwatchGrid>
      {INTENTS.map((intent) => {
        const t = tokens.color.surface[intent];
        return <Swatch key={intent} color={t.value} label={`surface.${intent}`} hex={t.value} description={t.description} />;
      })}
    </SwatchGrid>
  ),
};

/* ─── 2) Indicator (Intent) ────────────────────────── */

/** **`tokens.color.indicator.<intent>`** — 도트/스트로크/강조선 5종. */
export const Indicator: StoryObj = {
  render: () => (
    <SwatchGrid>
      {INTENTS.map((intent) => {
        const t = tokens.color.indicator[intent];
        return <Swatch key={intent} color={t.value} label={`indicator.${intent}`} hex={t.value} description={t.description} />;
      })}
    </SwatchGrid>
  ),
};

/* ─── 3) Tone Pairing ──────────────────────────────── */

/** **Surface + Indicator pairing** — 한 톤이 실제로 어떻게 보이는지 (배지 형태). */
export const TonePairing: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-2xl">
      {INTENTS.map((intent) => {
        const surface = tokens.color.surface[intent];
        const indicator = tokens.color.indicator[intent];
        const label = tokens.label[intent];
        return (
          <div key={intent} className="flex items-center gap-4 p-3 border border-ceaeaea rounded-lg" style={{ background: surface.value, fontFamily: "var(--font-family-korean)" }}>
            <div className="flex items-center gap-1_5 px-2 py-1 rounded-xl" style={{ background: "rgba(255,255,255,0.6)" }}>
              <div className="rounded-full" style={{ width: 6, height: 6, background: indicator.value }} />
              <span className="text-xs leading-none" style={{ color: indicator.value, fontWeight: 500 }}>
                {label.value || `(${intent})`}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0_5" style={{ fontFamily: "var(--font-family-numeric)" }}>
              <div className="text-sm text-primary font-bold">{intent}</div>
              <div className="text-chart text-tertiary">
                surface {surface.value} · indicator {indicator.value} · label "{label.value}"
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ),
};

/* ─── 4) Text Hierarchy ────────────────────────────── */

/** **`--color-text-{primary/secondary/tertiary/disabled}`** — 4 단계 텍스트 위계. */
export const TextHierarchy: StoryObj = {
  render: () => (
    <SwatchGrid>
      <Swatch color="#222"     label="text-primary"   hex="#222"     description="본문 default · 헤딩 · 강조 텍스트 (154 회)" />
      <Swatch color="#4c4c4c"  label="text-secondary" hex="#4c4c4c"  description="보조 본문 · dim 텍스트 (75 회)" />
      <Swatch color="#757575"  label="text-tertiary"  hex="#757575"  description="라벨 · 메타 · placeholder (63 회)" />
      <Swatch color="#adadad"  label="text-disabled"  hex="#adadad"  description="비활성 상태 텍스트 (6 회)" />
    </SwatchGrid>
  ),
};

/* ─── 5) Primary ───────────────────────────────────── */

/** **`--color-primary-*`** — 주요 강조색 5종 (구 `brand-blue` 계열 → 일반 작명 리네이밍, 구명은 @deprecated alias 로 유지). */
export const Primary: StoryObj = {
  render: () => (
    <SwatchGrid>
      <Swatch color="#296CF2" label="color-primary"           hex="#296CF2" description="주요 강조 컬러 — AI 버튼 / 링크 / 강조 (구 brand-blue)" />
      <Swatch color="#1B5CD9" label="color-primary-strong"    hex="#1B5CD9" description="강조 강화 — hover 강조 (구 brand-blue-deep)" />
      <Swatch color="#3DA9FF" label="color-primary-soft"      hex="#3DA9FF" description="옅은 강조 — MiniLineChart 기본 라인 (구 brand-blue-soft)" />
      <Swatch color="#D6E1FF" label="color-primary-bg"        hex="#D6E1FF" description="강조 배경 — active 카드 강조 (구 brand-blue-bg)" />
      <Swatch color="#C2D5FC" label="color-primary-bg-subtle" hex="#C2D5FC" description="강조 배경 변형 (구 brand-blue-bg-2)" />
    </SwatchGrid>
  ),
};

/* ─── 6) Status ────────────────────────────────────── */

/** **`--color-status-*`** — 운영 상태 신호 3색. */
export const Status: StoryObj = {
  render: () => (
    <SwatchGrid>
      <Swatch color="#00B442" label="color-status-success" hex="#00B442" description="정상 · 완료 — Toast success, LIVE 타이머 ▌▌, 체크 마크" />
      <Swatch color="#FFA012" label="color-status-warning" hex="#FFA012" description="주의 · 경고 — 알림 카드, 모니터링 권장 상태" />
      <Swatch color="#f34646" label="color-status-error"   hex="#f34646" description="오류 · 실패 — 실패 메시지, 에러 토스트" />
    </SwatchGrid>
  ),
};

/* ─── 7) Surface (Generic) ─────────────────────────── */

/** **`--color-surface-{50/100/200}`** — 일반 표면 회색 단계. */
export const SurfaceGeneric: StoryObj = {
  render: () => (
    <SwatchGrid>
      <Swatch color="#F5F5F5" label="color-surface-50"  hex="#F5F5F5" description="가장 옅은 표면 — AiUserBubble 배경, hover 영역" border />
      <Swatch color="#F1F2F4" label="color-surface-100" hex="#F1F2F4" description="dashboard 본문 영역 배경, sub-card 배경" />
      <Swatch color="#EAEAEA" label="color-surface-200" hex="#EAEAEA" description="카드 보더, divider — 살짝 진한 표면" />
    </SwatchGrid>
  ),
};

/* ─── 8) Border ────────────────────────────────────── */

/** **`--color-border-*`** — 라인/보더 4 단계. */
export const Border: StoryObj = {
  render: () => (
    <SwatchGrid>
      <Swatch color="#EAEAEA" label="color-border-default"  hex="#EAEAEA" description="AiCard 보더 등 위젯 표준 보더" border />
      <Swatch color="#F0F0F0" label="color-border-soft"     hex="#F0F0F0" description="더 옅은 구분선 — chart grid line" border />
      <Swatch color="#E6E6E6" label="color-border-strong"   hex="#E6E6E6" description="강조 보더 — PageHeader 하단 라인" border />
      <Swatch color="#ADADAD" label="color-border-divider"  hex="#ADADAD" description="더 진한 구분선 — LiveTimerCompact 보더" />
    </SwatchGrid>
  ),
};

/* ─── 9) Accent Gradient ──────────────────────────── */

/** **`--color-accent-*`** — AI 심볼·위젯 그라데이션 stops (구 `denyx-*` 계열 → 일반 작명 리네이밍, 구명은 @deprecated alias 로 유지). */
export const AccentGradient: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-3xl">
      <SwatchGrid>
        <Swatch color="#004BE0" label="color-accent-start" hex="#004BE0" description="AI 그라데이션 시작 (구 denyx-blue)" />
        <Swatch color="#8B52FF" label="color-accent"       hex="#8B52FF" description="AI 그라데이션 중간 — pinwheel 강조 (구 denyx-purple)" />
        <Swatch color="#4F5BD5" label="color-accent-deep"  hex="#4F5BD5" description="AI 그라데이션 deep variant (구 denyx-purple-deep)" />
      </SwatchGrid>
      <div className="text-md text-secondary mt-2" style={{ fontFamily: "var(--font-family-korean)" }}>
        그라데이션 미리보기 — <code className="text-chart text-tertiary" style={{ fontFamily: "var(--font-family-numeric)" }}>linear-gradient(110deg, #004BE0, #8B52FF, #004BE0)</code>
      </div>
      <div
        className="rounded-lg h-12"
        style={{
          background: "linear-gradient(110.34deg, #004BE0, #8B52FF, #004BE0, #8B52FF, #004BE0) 0 0 / 300% 100%",
        }}
      />
      <div className="text-md text-secondary mt-2" style={{ fontFamily: "var(--font-family-korean)" }}>
        AI 심볼 conic-gradient — <code className="text-chart text-tertiary" style={{ fontFamily: "var(--font-family-numeric)" }}>conic-gradient(from 90deg, #004BE0, #8B52FF, #004BE0)</code>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="rounded-full"
          style={{
            width: 48,
            height: 48,
            background: "conic-gradient(from 90deg, #004BE0, #8B52FF, #004BE0)",
          }}
        />
        <div className="text-md text-secondary" style={{ fontFamily: "var(--font-family-korean)" }}>DashboardBuildingProgress 의 spinner</div>
      </div>
    </div>
  ),
};

/* ─── 10) Extended Gray ────────────────────────────── */

/** **`--color-gray-{mid/soft/pale}`** — text 4단계 외 UI 회색 (ad-hoc 1-5 callsite). */
export const ExtendedGray: StoryObj = {
  render: () => (
    <SwatchGrid>
      <Swatch color="#8b8b8b" label="color-gray-mid"  hex="#8b8b8b" description="중간 회색 — 5 callsite (special UI text)" />
      <Swatch color="#a0a3a6" label="color-gray-soft" hex="#a0a3a6" description="부드러운 회색 — 1 callsite" />
      <Swatch color="#bdbdbd" label="color-gray-pale" hex="#bdbdbd" description="옅은 회색 — 1 callsite" />
    </SwatchGrid>
  ),
};

/* ─── 11) Extended Palette ─────────────────────────── */

/** **`--color-palette-{hex}`** — Chart series / brand ad-hoc 색 (36종, hex-suffix).
 *
 * 원래 40종이었으나 의미적 매칭 4 색은 semantic 토큰으로 collapse 됨:
 * - `palette-e53935` → `indicator-critical` (×4 callsite)
 * - `palette-f0b400` → `indicator-warning` (×2)
 * - `palette-f5f5f5` → `surface-50` (×1)
 * - `palette-2d2d2d` → `text-body` (×1)
 */
export const ExtendedPalette: StoryObj = {
  render: () => {
    const PALETTE = [
      "0078dc", "00beb8", "10b981", "1b9bd0", "1f3c88",          "2ec4b6", "3c4ec1",
      "4f65b5", "4fc3f7", "57ca7e", "5cc97d", "71df8b", "81c784", "85c2fa", "a0a65a",
      "a8d8ff", "b7dbff", "ba68c8", "c44cd8", "d4f0e5", "dcefff", "e040b8", "e0d6f5",
                "e5564e", "e8d6f0",           "f34747", "f5c84a",           "fb88e1",
      "ff8800", "ff8c2d", "ffa1a1", "ffb74d", "ffc300", "ffc771", "ffe4cc", "fff176",
    ];
    return (
      <>
        <div className="text-md text-secondary mb-3 max-w-2xl" style={{ fontFamily: "var(--font-family-korean)" }}>
          Chart series + brand ad-hoc 색 <strong>36 종</strong>. (40 → 36, semantic 매칭 4 색 collapse 됨.)
          inline <code className="text-chart" style={{ fontFamily: "var(--font-family-numeric)" }}>color: "#hex"</code> 잔재 제거를 위한 hex-suffix 토큰 binding.
          향후 chart series 의미가 명확해지면 semantic naming (chart-blue-deep, chart-magenta 등) 으로 점진 collapse 가능.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6, maxWidth: 1200 }}>
          {PALETTE.map((h) => (
            <CompactSwatch key={h} token={`palette-${h}`} hex={`#${h}`} />
          ))}
        </div>
      </>
    );
  },
};
