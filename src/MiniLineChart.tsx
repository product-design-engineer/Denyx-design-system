/**
 * MiniLineChart — 카드형 미니 line chart (모니터링 지표 요약).
 *
 * ## Purpose
 * DB/APM/GPU 등 모든 모니터링 페이지에서 재활용하는 작은 line chart 카드.
 * 헤더(타이틀 + ⓘ + 옵션 Top Stat + ⋮) + plot 영역 + peak ▼ 라벨로 구성.
 * 카드 폭에 맞춰 line/area 는 수평 확장하되 stroke 1px·글자 크기는 고정.
 *
 * ## When to use
 * - 지표 한 개의 시계열 추이를 작은 카드로 나열 (대시보드 grid, 사이드 패널)
 * - peak 값과 시간대만 빠르게 확인하면 되는 요약 view
 *
 * ## When NOT to use
 * - 요일×시간 같은 격자형 빈도 표현 → [[WeekHourMatrix]]
 * - 진행 단계 표시 → [[DashboardBuildingProgress]]
 * - 정밀한 인터랙션(zoom·tooltip·다중 시리즈)이 필요한 본격 차트 → 전용 차트 라이브러리
 *
 * ## Composition rules
 * - **SVG font-size 단위 정책 (feedback-svg-text-units)**: SVG 내부에는 텍스트를
 *   두지 않음. Y축/X축/peak 값은 모두 SVG 밖 HTML overlay 로 px 고정 — `preserveAspectRatio="none"`
 *   로 가로 stretch 되는 SVG 안에 글자를 넣으면 폭에 따라 늘어나기 때문.
 * - **좌표 정합 (feedback-chart-peak-alignment)**: viewBox 는 plot 사각형과 동일 비율
 *   (`1000 × PLOT_H_PX`), SVG 는 plot 영역(`PAD_LEFT`/`PAD_RIGHT`/패딩)에만 absolute 배치.
 *   peak ▼/라벨은 동일 좌표계(`peakXRatio`/`peakYRatio`)로 찍어 폭과 무관하게 1:1 일치.
 * - stroke 는 `vectorEffect="non-scaling-stroke"` 로 1px 유지, area fill 은 color + alpha.
 * - 색은 토큰 (`color` 기본 `--color-primary-soft`), 축선은 `--color-border-divider`.
 * - `delay` 지정 시에만 stagger 진입 애니메이션 적용.
 *
 * @example
 * ```tsx
 * <MiniLineChart
 *   title="CPU 사용률"
 *   values={[12, 30, 22, 80, 45, 60, 38]}
 *   unit="%"
 *   showTopStat
 *   delay={120}
 * />
 * ```
 */
import type { CSSProperties } from "react";

const CHART_HEIGHT = 96;
const PAD_LEFT = 28;
const PAD_RIGHT = 8;
const PAD_TOP_PX = 14;
const PAD_BOTTOM_PX = 16;
const PLOT_H_PX = CHART_HEIGHT - PAD_TOP_PX - PAD_BOTTOM_PX;

export default function MiniLineChart({
  title,
  values,
  xLabels = ["13:27", "13:28", "13:30", "13:32", "13:34", "13:36", "13"],
  markerAt = 0.08,
  showTopStat = false,
  /** line/area 색상 (기본 라이브 토큰 blue) */
  color = "var(--color-primary-soft)",
  /** Y축 및 peak 라벨에 붙는 단위 (예: "%", "K") */
  unit = "",
  /** stagger 진입 애니메이션 delay(ms). undefined면 애니메이션 없음 */
  delay,
}: {
  title: string;
  values: number[];
  xLabels?: string[];
  markerAt?: number;
  showTopStat?: boolean;
  color?: string;
  unit?: string;
  delay?: number;
}) {
  // ★ 정책 (feedback-chart-peak-alignment):
  //   SVG viewBox는 plot 영역 자체와 정확히 동일한 비율을 가짐 → 라인의 peak
  //   좌표가 카드 폭과 무관하게 HTML overlay의 peak ▼/라벨 위치와 1:1 일치.
  //   SVG는 absolute로 plot 영역 (left=PAD_LEFT, right=PAD_RIGHT, top/bottom 패딩)
  //   에만 그리고, 좌표계는 viewBox 1000 x PLOT_H_PX 로 plot 내부 비율.
  const VBW = 1000; // viewBox width — 임의 큰 값 (정밀도)
  const VBH = PLOT_H_PX;
  const max = Math.max(0, ...values);
  const yMaxNice = niceMax(max);
  const stepX = values.length > 1 ? VBW / (values.length - 1) : 0;

  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = yMaxNice > 0 ? VBH * (1 - v / yMaxNice) : VBH;
    return [x, y] as const;
  });
  const polyStr = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const areaStr =
    pts.length > 0
      ? `0,${VBH} ${polyStr} ${((pts.length - 1) * stepX).toFixed(2)},${VBH}`
      : "";

  // peak는 max에 도달하는 첫 번째 인덱스 사용 (일관성)
  let peakIdx = -1;
  for (let i = 0; i < values.length; i++) {
    if (max > 0 && values[i] === max && peakIdx === -1) peakIdx = i;
  }
  const peakXRatio = peakIdx >= 0 && values.length > 1 ? peakIdx / (values.length - 1) : 0;
  const peakYRatio = peakIdx >= 0 && yMaxNice > 0 ? 1 - values[peakIdx] / yMaxNice : 0;

  const yTicks = yMaxNice > 0 ? [1, 0.5, 0] : [0];

  return (
    <div
      className={`flex flex-col bg-card border border-color-var-color-border-default rounded-4px px-8px py-6px gap-2px min-w-0${delay !== undefined ? " ai-anim-in" : ""}`}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-6px">
        <div className="flex items-center gap-3px min-w-0">
          <span
            className="text-base font-bold text-primary tracking-default leading-none truncate"
            style={{ fontFamily: "var(--font-family-korean)" }}
            title={title}
          >
            {title}
          </span>
          <InfoIcon />
        </div>
        <div className="flex items-center gap-4px shrink-0">
          {showTopStat && (
            <button
              className="flex items-center h-18px px-6px rounded-3px bg-card border border-color-var-color-border-default text-xs text-secondary cursor-pointer hover-bg-surface-100 whitespace-nowrap"
              style={{ fontFamily: "var(--font-family-korean)" }}
            >
              Top Stat
            </button>
          )}
          <MenuDots />
        </div>
      </div>

      {/* 차트 영역 (SVG는 정확히 plot 사각형에만 absolute 배치) */}
      <div className="relative w-full" style={{ height: CHART_HEIGHT }}>
        {/* X-axis (plot 하단) */}
        <div
          className="absolute h-1px bg-color-var-color-border-divider"
          style={{ left: PAD_LEFT, right: PAD_RIGHT, top: PAD_TOP_PX + PLOT_H_PX }}
        />
        {/* Y-axis (plot 좌측) */}
        <div
          className="absolute w-1px bg-color-var-color-border-divider"
          style={{ left: PAD_LEFT, top: PAD_TOP_PX, height: PLOT_H_PX }}
        />
        {/* 중간 horizontal grid line */}
        <div
          className="absolute h-1px bg-color-var-color-border-soft"
          style={{ left: PAD_LEFT, right: PAD_RIGHT, top: PAD_TOP_PX + PLOT_H_PX * 0.5 }}
        />
        {/* 좌측 검정 점선 reference */}
        <div
          className="absolute"
          style={{
            left: `calc(${PAD_LEFT}px + (100% - ${PAD_LEFT + PAD_RIGHT}px) * ${markerAt})`,
            top: PAD_TOP_PX,
            height: PLOT_H_PX,
            width: 0,
            borderLeft: "0.8px dashed #222",
            opacity: 0.5,
          }}
        />

        {/* SVG는 plot 영역에만 그림 — viewBox는 plot 비율과 정확히 일치 */}
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
          width="100%"
          height={PLOT_H_PX}
          className="absolute"
          style={{ left: PAD_LEFT, right: PAD_RIGHT, top: PAD_TOP_PX, width: `calc(100% - ${PAD_LEFT + PAD_RIGHT}px)` }}
        >
          {areaStr && <polyline points={areaStr} fill={color + "1f"} stroke="none" />}
          <polyline
            points={polyStr}
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* HTML overlay — px 고정 텍스트 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Y축 라벨 */}
          {yTicks.map((ratio) => (
            <span
              key={ratio}
              className="absolute text-chart text-tertiary leading-none"
              style={
                {
                  fontFamily: "var(--font-family-numeric)",
                  top: `${PAD_TOP_PX + PLOT_H_PX * (1 - ratio)}px`,
                  transform: "translateY(-50%)",
                  left: 0,
                  textAlign: "right",
                  paddingRight: 4,
                  width: PAD_LEFT,
                } as CSSProperties
              }
            >
              {formatY(yMaxNice * ratio) + unit}
            </span>
          ))}

          {/* peak ▼ + 값 라벨 — SVG polyline의 peak 점과 동일 좌표계 사용
              (PAD_LEFT + plotWidth × peakXRatio, PAD_TOP_PX + PLOT_H_PX × peakYRatio).
              ▼ tip(svg path 끝점)이 peak 점에 정확히 닿도록 transform 보정. */}
          {peakIdx >= 0 && (
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: `calc(${PAD_LEFT}px + (100% - ${PAD_LEFT + PAD_RIGHT}px) * ${peakXRatio})`,
                top: `${PAD_TOP_PX + PLOT_H_PX * peakYRatio}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <span
                className="text-xs font-bold text-primary leading-none whitespace-nowrap"
                style={{ fontFamily: "var(--font-family-numeric)" }}
              >
                {formatPeak(max) + unit}
              </span>
              <svg width="8" height="5" viewBox="0 0 8 5" className="mt-1px block">
                <path d="M0 0h8L4 5z" fill={color} />
              </svg>
            </div>
          )}

          {/* X축 시간 라벨 */}
          {xLabels.map((label, i) => {
            const ratio = i / (xLabels.length - 1);
            return (
              <span
                key={i}
                className="absolute text-chart text-tertiary leading-none whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-family-numeric)",
                  left: `calc(${PAD_LEFT}px + (100% - ${PAD_LEFT + PAD_RIGHT}px) * ${ratio})`,
                  bottom: 2,
                  transform:
                    i === 0
                      ? "translateX(0)"
                      : i === xLabels.length - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function niceMax(v: number): number {
  if (v <= 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 4) nice = 4;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}
function formatY(v: number): string {
  if (v >= 1000) return Math.round(v / 100) / 10 + "K";
  if (v >= 100) return Math.round(v).toString();
  if (v === 0) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(0);
}
function formatPeak(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 10_000) return (v / 1000).toFixed(2) + "K";
  if (v >= 1000) return (v / 1000).toFixed(2) + "K";
  if (v >= 100) return Math.round(v).toString();
  if (v === 0) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
function InfoIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5.2" stroke="var(--color-border-divider)" strokeWidth="1" fill="none" />
      <line x1="6" y1="5.4" x2="6" y2="8.4" stroke="var(--color-border-divider)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6" cy="3.6" r="0.6" fill="var(--color-border-divider)" />
    </svg>
  );
}
function MenuDots() {
  return (
    <button
      type="button"
      aria-label="더보기"
      className="flex items-center justify-center size-16px rounded-2px cursor-pointer hover-bg-rgba-0-0-0-0_05 shrink-0"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="3" r="1" fill="var(--color-text-tertiary)" />
        <circle cx="7" cy="7" r="1" fill="var(--color-text-tertiary)" />
        <circle cx="7" cy="11" r="1" fill="var(--color-text-tertiary)" />
      </svg>
    </button>
  );
}
