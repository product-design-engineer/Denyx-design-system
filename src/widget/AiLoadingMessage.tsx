/**
 * AiLoadingMessage — AI 가 데이터를 수집/분석 중임을 알리는 로딩 안내 줄 (Figma 27110:60783).
 *
 * ## Purpose
 * 좌측 그라데이션 차트 아이콘 + 한 줄 안내 텍스트의 가벼운 진행 표시 카드. AI 응답이
 * 도착하기 전 "분석에 필요한 데이터를 수집중입니다." 같은 대기 상태를 채워 사용자에게
 * 작업이 진행 중임을 전달. 흰 배경 + `var(--color-border-default)` 보더 + 8px 라운드.
 *
 * ## When to use
 * - AI 응답 직전, 데이터 수집/분석 대기 구간의 placeholder 메시지.
 * - 결과 카드들이 도착하기 전 단일 줄로 진행 상태를 알릴 때.
 *
 * ## When NOT to use
 * - 단계별 도구 호출 진행 (✓ / spinner 타임라인) → [[AiStepsTimeline]].
 * - 결과를 담은 본문 메시지 → [[AiCard]] 기반 카드.
 *
 * ## Composition rules
 * - `text` 한 줄만 받음 — 멀티라인/마크업은 비대상.
 * - 카드 chrome 은 자체 보유 (보더/라운드/패딩) — [[AiCard]] 로 감싸지 말 것.
 * - 아이콘 그라데이션은 토큰 binding (`--color-accent-start` → `--color-accent`).
 *
 * @example
 * ```tsx
 * <AiLoadingMessage />
 * <AiLoadingMessage text="GPU 사용률 데이터를 불러오는 중입니다." />
 * ```
 */
export default function AiLoadingMessage({
  text = "분석에 필요한 데이터를 수집중입니다.",
}: {
  text?: string;
}) {
  return (
    <div
      className="flex items-center gap-8px w-full bg-white rounded-8px border border-color-var-color-border-default px-12px py-10px"
    >
      <LoadingIcon />
      <span
        className="text-md text-secondary tracking-default leading-tight"
        style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
      >
        {text}
      </span>
    </div>
  );
}

function LoadingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="ai-loading-grad" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-accent-start)" />
          <stop offset="1" stopColor="var(--color-accent)" />
        </linearGradient>
      </defs>
      <path
        d="M2 2v11.5A0.5 0.5 0 0 0 2.5 14H14"
        stroke="url(#ai-loading-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 11l2.5-3 2 2L13 5.5"
        stroke="url(#ai-loading-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
