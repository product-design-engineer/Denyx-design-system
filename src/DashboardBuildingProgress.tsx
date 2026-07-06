/**
 * DashboardBuildingProgress — 대시보드 구성/적용 중 노출되는 공용 로딩 화면.
 *
 * ## Purpose
 * gradient ring spinner + 제목/부제 + 단계별 ✓ progress 리스트로 "지금 구성 중"
 * 상태를 보여주는 로딩 화면. `intervalMs` 간격으로 단계가 하나씩 완료(✓)된다.
 *
 * ## When to use
 * - 대시보드/위젯 grid 를 만들어 보여주기 직전의 준비 단계 화면
 *   (예: /db RAC 대시보드 구성, /flex-board 진입 직후 위젯 grid 구성)
 * - 여러 단계가 순차 진행됨을 사용자에게 알려야 하는 짧은 대기 구간
 *
 * ## When NOT to use
 * - 단발 액션 결과 알림 → [[Toast]]
 * - 단순 스피너 한 개만 필요 → 인라인 spinner (단계 리스트 불필요)
 * - 진행률 막대(%) 가 명확한 결정적 작업 → 별도 progress bar
 *
 * ## Composition rules
 * - **정책 feedback-common-components-catalog**: chrome-level 공용 컴포넌트로 재구현 금지.
 * - 단계 진행은 컴포넌트 내부 타이머가 자동 구동 — 전체 시간 ≈ `steps.length × intervalMs`.
 * - `card=true` → 흰색 카드 chrome(border+radius), `false` → 콘텐츠만(부모 배경 위, `flex-1`).
 * - `background` 미지정 + `card=false` 면 부모 배경을 그대로 둠.
 *
 * @example
 * ```tsx
 * <DashboardBuildingProgress
 *   title="대시보드를 구성하고 있어요"
 *   steps={["지표 수집", "위젯 배치", "임계값 적용", "렌더링"]}
 *   intervalMs={380}
 *   card
 * />
 * ```
 */
import { useEffect, useState } from "react";

export type DashboardBuildingProgressProps = {
  /** 단계별 라벨. 길이 만큼 progress 가 진행. */
  steps: string[];
  /** 메인 제목 (굵게). */
  title: string;
  /** 보조 한 줄 (회색). */
  subtitle?: string;
  /** 단계별 ✓ 전환 간격 (ms). 전체 시간 = steps.length × intervalMs. */
  intervalMs?: number;
  /** true → 흰색 카드 chrome (border + radius). false → 콘텐츠만 (배경 그대로). */
  card?: boolean;
  /** 외곽 컨테이너 추가 className. */
  className?: string;
  /** 카드 / 컨테이너 배경색. card=false 일 때 부모 배경 그대로 두려면 미지정. */
  background?: string;
};

export default function DashboardBuildingProgress({
  steps,
  title,
  subtitle = "잠시만 기다려 주세요",
  intervalMs = 380,
  card = false,
  className = "",
  background,
}: DashboardBuildingProgressProps) {
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setStepIdx((i) => Math.min(i + 1, steps.length)),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [steps.length, intervalMs]);

  const cardStyles = card
    ? { background: background ?? "var(--color-card)", border: "1px solid var(--color-border-default)", borderRadius: 6 }
    : background
      ? { background }
      : {};

  return (
    <div
      className={`flex flex-col items-center justify-center gap-16px py-60px px-40px ${
        card ? "" : "flex-1 overflow-hidden"
      } ${className}`}
      style={cardStyles}
    >
      {/* gradient ring spinner */}
      <div
        className="size-36px rounded-full"
        style={{
          background: "conic-gradient(from 90deg, var(--color-accent-start), var(--color-accent), var(--color-accent-start))",
          mask: "radial-gradient(circle 15px at center, transparent 98%, #000 100%)",
          WebkitMask: "radial-gradient(circle 15px at center, transparent 98%, #000 100%)",
          animation: "aiSymbolRotateSlow 1s linear infinite",
        }}
      />
      {/* title + subtitle */}
      <div className="flex flex-col gap-6px items-center">
        <p
          className="text-lg font-bold text-primary tracking-default leading-none"
          style={{ fontFamily: "var(--font-family-korean)" }}
        >
          {title}
        </p>
        <p
          className="text-base text-tertiary tracking-default"
          style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
        >
          {subtitle}
        </p>
      </div>
      {/* step list */}
      <ul className="flex flex-col gap-5px mt-4px">
        {steps.map((s, i) => (
          <li
            key={s}
            className="flex items-center gap-8px text-base"
            style={{
              fontFamily: "var(--font-family-korean)",
              color: i < stepIdx ? "var(--color-text-secondary)" : "var(--color-border-divider)",
              opacity: i <= stepIdx ? 1 : 0.5,
              transition: "opacity 200ms, color 200ms",
            }}
          >
            {i < stepIdx ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" fill="var(--color-status-success)" />
                <path
                  d="M4 7l2 2 4-4"
                  stroke="#fff"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : i === stepIdx ? (
              <span
                className="size-12px rounded-full border-1_5px border-color-var-color-brand-blue border-t-transparent"
                style={{ animation: "aiSymbolRotateSlow 0.9s linear infinite" }}
              />
            ) : (
              <span className="size-12px rounded-full border border-cd3d3d3" />
            )}
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
