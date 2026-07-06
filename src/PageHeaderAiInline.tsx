/**
 * PageHeaderAiInline — 48px 페이지 헤더의 AI inline variant.
 *
 * ## Purpose
 * 기존 [[PageHeader]] 의 Denyx AI 토글 버튼 자리를 [[AiInlinePrompt]] 로 대체.
 * AI 위젯 호출 trigger 가 인라인 prompt 의 송신으로 이동 — 별도 토글 entry 없음.
 * 48px 높이 invariant 유지. 좌측 타이틀 + 중앙 inline prompt(max 480px) + 우측 chrome(고객지원/벨/아바타).
 *
 * ## 차이 (vs PageHeader)
 * - ❌ AiAssistantButton (Denyx AI 토글) — 제거
 * - ✅ AiInlinePrompt — 중앙, flex-grow + max-w-[480px]
 * - 좌측 그룹: Title + Docs — Docs 는 Title 바로 우측에 인접 배치
 * - 우측 chrome: 고객지원 / 🔔 / Avatar — Docs 제외, 유지
 *
 * ## When to use
 * - inline prompt 가 AI 위젯 호출 entry 인 페이지 (위젯 토글 별도 entry 불필요).
 * - PageHeader 의 가용 공간이 prompt 를 수용할 만큼 wide 한 페이지.
 *
 * ## When NOT to use
 * - 위젯 토글 entry 가 필요한 페이지 → [[PageHeader]] (기존, AI 버튼 포함).
 *
 * ## Composition rules
 * - inline prompt 는 [[feedback_page_header_invariant]] 정책 따라 `max-w-480px` cap, w-full 100% 강제 금지.
 * - 우측 chrome 잠식 금지 — `flex-1 + max-width` 컨테이너로 가용 공간만 흡수.
 * - 48px height invariant 유지 — inline prompt 자체가 ~32px 이라 안전하게 들어감.
 *
 * @example
 * ```tsx
 * <PageHeaderAiInline
 *   title="K8s-GPU / GPU 트렌드"
 *   promptPlaceholder="GPU 트렌드에 대해 질문..."
 *   promptSuggestions={GPU_SUGGESTIONS}
 *   onPromptSubmit={(v) => askAi(v)}
 * />
 * ```
 */
import AiInlinePrompt, {
  type AiPromptSuggestion,
} from "./widget/AiInlinePrompt";
import HeaderPillButton from "./HeaderPillButton";
import { IcDocs, IcSupport } from "./icons/HeaderIcons";

export type PageHeaderAiInlineProps = {
  /** "K8s-GPU / GPU 트렌드"와 같은 페이지 제목. */
  title: string;
  /** inline prompt placeholder. `promptPlaceholders` 미주입 시 정적 1개. */
  promptPlaceholder?: string;
  /** 롤링 placeholder (옵션) — 제품별 핵심 prompt 배열. 입력 비어 있을 때 세로 순환. 미주입이면 `promptPlaceholder` 정적. */
  promptPlaceholders?: string[];
  /** 롤링 dwell 간격(ms) — 한 항목 머무는 시간. 미지정 시 AiInlinePrompt 기본(2800). */
  promptRollingIntervalMs?: number;
  /** 롤링 슬라이드(transition) 시간(ms). 미지정 시 기본(450). */
  promptRollingTransitionMs?: number;
  /** inline prompt chip suggestions — 페이지 컨텍스트별 카탈로그. */
  promptSuggestions?: AiPromptSuggestion[];
  /** prompt 송신 콜백 (Enter 또는 ⬆ 클릭). */
  onPromptSubmit?: (v: string) => void;
  /** prompt suggestion chip 선택 콜백. */
  onPromptSelectSuggestion?: (s: AiPromptSuggestion) => void;
  /** Storybook / 시연용 — 마운트 시 dropdown 강제 펼침. */
  promptDefaultOpen?: boolean;
};

export default function PageHeaderAiInline({
  title,
  promptPlaceholder = "어떤 작업을 함께 할까요?",
  promptPlaceholders,
  promptRollingIntervalMs,
  promptRollingTransitionMs,
  promptSuggestions,
  onPromptSubmit,
  onPromptSelectSuggestion,
  promptDefaultOpen = false,
}: PageHeaderAiInlineProps) {
  return (
    <div className="flex items-center h-48px box-border px-8px gap-16px bg-card border-b border-color-var-color-border-strong shrink-0">
      {/* 좌측: 타이틀 + Docs — shrink 허용, 타이틀 max-width + ellipsis로 inline prompt 영역 보호 */}
      <div className="flex items-center gap-24px shrink min-w-0">
        <p
          className="text-2xl text-primary tracking-display whitespace-nowrap leading-normal overflow-hidden text-ellipsis"
          style={{
            fontFamily: "var(--font-family-korean)",
            fontWeight: "var(--font-weight-medium)",
            maxWidth: 320,
          }}
        >
          {title}
        </p>
        <HeaderPillButton icon={<IcDocs />}>Docs</HeaderPillButton>
      </div>

      {/* 중앙: inline prompt (flex-grow + max/min-width cap, 좌측 타이틀·우측 chrome 잠식 방지) */}
      <div className="flex-1 flex justify-center min-w-0" style={{ minWidth: 280 }}>
        <div className="w-full max-w-480px">
          <AiInlinePrompt
            placeholder={promptPlaceholder}
            rollingPlaceholders={promptPlaceholders}
            rollingIntervalMs={promptRollingIntervalMs}
            rollingTransitionMs={promptRollingTransitionMs}
            suggestions={promptSuggestions}
            onSubmit={onPromptSubmit}
            onSelectSuggestion={onPromptSelectSuggestion}
            defaultOpen={promptDefaultOpen}
          />
        </div>
      </div>

      {/* 우측 chrome: 고객지원 + 알림 + 아바타 (Docs 는 좌측 그룹) */}
      <div className="flex items-center gap-16px h-full shrink-0">
        <HeaderPillButton icon={<IcSupport />}>고객지원</HeaderPillButton>
        <div className="flex items-center gap-16px">
          <div className="shrink-0 size-24px flex items-center justify-center cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10V14L20 16V17H4V16L6 14V10Z"
                stroke="var(--color-text-secondary)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M10 19.5C10 20.6 10.9 21.5 12 21.5C13.1 21.5 14 20.6 14 19.5"
                stroke="var(--color-text-secondary)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="shrink-0 size-24px cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="avatar-grad-ai-inline" x1="0" y1="0" x2="24" y2="24">
                  <stop stopColor="var(--color-palette-4fc3f7)" />
                  <stop offset="1" stopColor="var(--color-primary)" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="12" fill="url(#avatar-grad-ai-inline)" />
              <text
                x="12"
                y="17"
                textAnchor="middle"
                fontSize="13px"
                fontWeight="700"
                fill="#fff"
                fontFamily="Roboto, sans-serif"
              >
                S
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
