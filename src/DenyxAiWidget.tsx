/**
 * DenyxAiWidget — AI surface. 480px 우측 슬라이드 패널형 Denyx AI 위젯.
 *
 * ## Purpose
 * 대시보드 우측에 폭 480px(닫히면 0)로 펼쳐지는 AI 어시스턴트 패널. 그라데이션
 * 40px 헤더(새 세션/전체화면/닫기) + 본문(랜딩 인사말 + 액션 칩, 또는 시나리오
 * 메시지 스택) + 하단 입력 영역(첨부 칩 행 · multi-line textarea · 첨부 버튼 ·
 * 토큰 사용량 pill · 전송 버튼)으로 구성. 마크업은 /application/slider 라이브
 * 위젯과 동일하게 재현(side-effect-free)하고 데이터는 모두 prop 으로 외부화.
 *
 * ## When to use
 * - [[DashboardLayout]] 의 `children` 슬롯에 들어가는 위젯 본체 — 세로 전체 높이를 쓰는 대화 패널.
 * - 랜딩 인사말 + 빠른 액션 칩 + 토큰 사용량 + 첨부까지 풀 chrome 이 필요한 자리.
 *
 * ## When NOT to use
 * - 세로 공간이 한정된 헤더/카드/모달의 한 줄 입력 → [[AiInlinePrompt]] (single-row).
 * - 헤더 안 AI 토글 버튼만 필요 → [[AiAssistantButton]].
 * - 라이브 vercel 위젯의 440px 변형(Beta 배지 · 모델 선택기) 재현 → [[AiWidget]].
 *
 * ## Composition rules
 * - 폭은 `open` 이 결정(480px ↔ 0), `transition: width 0.4s` 로 애니메이션. [[DashboardLayout]]
 *   에서 Sidebar collapse 와 동기화(feedback-widget-sidebar-collapse).
 * - editable mode: `inputValue` 미지정이면 내부 state 로 사용자가 직접 입력, `onSubmit`
 *   은 입력값이 있을 때만 Enter(shift 제외)/전송 버튼으로 호출. `inputValue` 지정 시 readOnly 데모.
 * - `scrollSignal` 이 바뀔 때마다 본문을 부드럽게 최하단으로 자동 스크롤(메시지 추가 후 반영).
 * - 색·경계는 토큰 binding (`--color-primary` / `--color-primary-bg-subtle` 등). 토큰 pill 은 내부 TokenUsageBadge.
 * - `showLanding=true` 일 때만 인사말+칩 렌더, `messages` 는 그 아래 시나리오 스택으로 누적.
 *
 * @example
 * ```tsx
 * <DenyxAiWidget
 *   open={aiActive}
 *   onClose={() => setAiActive(false)}
 *   onNewSession={resetSession}
 *   onFullscreen={goFullscreen}
 *   user="Wha-tap Kim"
 *   pageHighlight="GPU 트렌드"
 *   actions={["현재 상태 요약", "이상 징후 진단"]}
 *   onSubmit={(v) => askAi(v)}
 * />
 * ```
 */
import { useEffect, useRef, useState } from "react";
import AiClickCursor from "./widget/AiClickCursor";
import AiActionChip from "./widget/AiActionChip";
import AiAttachmentChip from "./widget/AiAttachmentChip";

const WIDGET_WIDTH = 480;

export type WidgetAction = string;

export default function DenyxAiWidget({
  open,
  onClose,
  onNewSession,
  onFullscreen,
  user = "Wha-tap Kim",
  pageHighlight = "애플리케이션 대시보드",
  actions = ["현재 상태 요약", "이상 징후 진단", "슬로우 트랜잭션 분석"],
  messages,
  inputValue,
  showLanding = true,
  attachments,
  scrollSignal,
  showSendCursor = false,
  onSubmit,
  inputPlaceholder = "어떤 작업을 함께 할까요?",
  tokenInput = 3395,
  tokenOutput = 181,
}: {
  open: boolean;
  onClose?: () => void;
  onNewSession?: () => void;
  onFullscreen?: () => void;
  user?: string;
  pageHighlight?: string;
  actions?: WidgetAction[];
  /** 토큰 사용량 표시 (Figma 29424:19317) — 모델 선택기 대체 */
  tokenInput?: number;
  tokenOutput?: number;
  messages?: import("react").ReactNode;
  inputValue?: string;
  showLanding?: boolean;
  /** 입력 영역 위에 노출할 첨부 파일 칩들 (Figma 27087:3416). */
  attachments?: { name: string; mime?: string }[];
  /**
   * 값이 변할 때마다 콘텐츠 영역을 부드럽게 최하단으로 자동 스크롤.
   * 시나리오 stage 같은 progress signal을 그대로 전달하면 됨.
   */
  scrollSignal?: unknown;
  /** true면 송신 버튼 위에 자동 클릭 손 커서 표시(데모용). */
  showSendCursor?: boolean;
  /**
   * 사용자가 input 에 입력 후 Enter 또는 send 버튼 클릭 시 호출.
   * inputValue 가 undefined 일 때만 활성 (editable mode).
   */
  onSubmit?: (value: string) => void;
  /** 입력창 placeholder 문구. 시나리오별 시작 prompt 안내에 사용. */
  inputPlaceholder?: string;
}) {
  // editable mode: parent 가 inputValue 를 지정하지 않으면 사용자가 직접 입력.
  const editable = inputValue === undefined;
  const [typed, setTyped] = useState("");
  const effectiveValue = editable ? typed : inputValue ?? "";
  const hasInput = effectiveValue.trim().length > 0;

  const handleSubmit = () => {
    if (!hasInput || !onSubmit) return;
    onSubmit(effectiveValue);
    setTyped("");
  };
  const handleKey = (e: import("react").KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!scrollRef.current) return;
    // 다음 paint 시점에 스크롤(새로 추가된 콘텐츠 높이 반영 후).
    const id = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [scrollSignal]);
  return (
    <div
      className="shrink-0 overflow-hidden relative"
      style={{
        width: open ? WIDGET_WIDTH : 0,
        transition: "width 0.4s ease-in-out",
      }}
    >
      {/* 좌측 리사이즈 핸들 */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center"
        style={{ width: 6, cursor: "col-resize" }}
      >
        <div
          className="rounded-full transition-colors duration-150"
          style={{ width: 3, height: 32, backgroundColor: "rgba(0,0,0,0.12)" }}
        />
      </div>

      <div
        className="flex flex-col h-full bg-card border-l border-color-var-color-border-default"
        style={{ width: WIDGET_WIDTH }}
      >
        {/* 헤더 (40px, 그라데이션) */}
        <div
          className="flex h-40px items-center px-16px py-8px shrink-0 w-full relative overflow-visible z-10"
          style={{
            background:
              "linear-gradient(138.94deg, rgb(0, 75, 224) 2.33%, rgb(139, 82, 255) 107.07%)",
          }}
        >
          <div className="flex flex-1 items-center justify-between min-w-0">
            <div className="flex gap-4px items-center shrink-0">
              <img alt="" className="size-16px" src="/icons/ai-header-symbol.svg" />
              <span
                className="text-lg font-bold text-white tracking-default leading-px-20 whitespace-nowrap"
                style={{ fontFamily: "var(--font-family-korean)" }}
              >
                Denyx AI
              </span>
            </div>
            <div className="flex gap-8px items-center shrink-0">
              <button
                type="button"
                onClick={onNewSession}
                aria-label="새로운 세션 추가"
                className="shrink-0 size-20px cursor-pointer hover-opacity-80 transition-opacity flex items-center justify-center relative"
              >
                <img alt="새로운 세션추가" src="/icons/ai-header-plus.svg" style={{ height: 14 }} />
              </button>
              <button
                type="button"
                onClick={onFullscreen}
                aria-label="전체 크기"
                className="shrink-0 size-20px cursor-pointer hover-opacity-80 transition-opacity flex items-center justify-center relative"
              >
                <img
                  alt="전체 크기"
                  src="/icons/ai-header-fullscreen.svg"
                  style={{ width: 16, height: 16 }}
                />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="shrink-0 size-20px cursor-pointer hover-opacity-80 transition-opacity flex items-center justify-center relative"
              >
                <img alt="닫기" src="/icons/ai-header-close.svg" style={{ height: 14 }} />
              </button>
            </div>
          </div>
        </div>

        {/* 본문 — 인사말 + 액션 칩 (showLanding=true일 때만). ref → scrollSignal 변경 시 자동 스크롤 */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 flex flex-col items-center gap-16px overflow-y-auto overflow-x-hidden w-full pt-16px pb-8px px-16px"
        >
          {showLanding && (
          // key={open}로 위젯을 열 때마다 인사말 영역이 remount되어 entrance animation 재생
          <div key={open ? "open" : "closed"} className="bg-card flex flex-col items-start justify-center relative w-full">
            {/* AI 심볼 (호흡 + 회전) — 진입 시 fade-in이 한 번 추가로 재생 */}
            <div className="ai-anim-in mb-12px" style={{ animationDelay: "0ms" }}>
              <div
                className="relative shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  animation:
                    "aiSymbolBreathing 3s ease-in-out infinite, aiSymbolRotateSlow 25s linear infinite",
                }}
              >
                <img alt="" className="w-full h-full" src="/icons/ai-symbol-gradient.svg" />
              </div>
            </div>

            <div className="flex flex-col gap-16px items-start w-full">
              <div className="flex flex-1 flex-col gap-16px items-start justify-center min-w-0">
                <p
                  className="ai-anim-in text-md text-primary tracking-default w-full whitespace-pre-wrap leading-normal"
                  style={{
                    fontFamily: "var(--font-family-korean)",
                    fontWeight: "var(--font-weight-regular)",
                    animationDelay: "150ms",
                  }}
                >
                  <span
                    className="font-bold text-lg tracking-default leading-none"
                    style={{ fontFamily: "var(--font-family-korean)" }}
                  >
                    {user}
                  </span>
                  <span className="text-md leading-normal whitespace-pre-wrap">
                    님, 안녕하세요. Denyx AI입니다.{"\n"}
                  </span>
                  <span
                    className="font-bold text-lg tracking-default leading-none"
                    style={{ fontFamily: "var(--font-family-korean)" }}
                  >
                    {pageHighlight}
                  </span>
                  <span className="text-md leading-normal whitespace-pre-wrap">
                    {" "}분석을 함께 하겠습니다. 무엇부터 살펴볼까요?
                  </span>
                </p>

                {/* 액션 칩 */}
                <div className="flex flex-wrap gap-6px items-start w-full">
                  {actions.map((label, i) => (
                    <AiActionChip key={label} label={label} index={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* 시나리오 메시지 스택 */}
          {messages && (
            <div className="flex flex-col gap-16px w-full">{messages}</div>
          )}
        </div>

        {/* Input 영역 */}
        <div className="flex flex-col items-center justify-center px-16px shrink-0 w-full">
          <div
            className="ai-input-wrapper relative bg-card flex flex-col gap-4px items-center justify-center p-12px shrink-0 rounded-8px transition-all duration-200 w-full"
            style={{ border: hasInput ? "2px solid var(--color-primary)" : "2px solid var(--color-primary-bg-subtle)" }}
          >
            {/* 첨부 파일 칩 행 (Figma 27087:3416) */}
            {attachments && attachments.length > 0 && (
              <div className="flex gap-6px items-center w-full overflow-x-auto pb-4px">
                {attachments.map((a, i) => (
                  <AiAttachmentChip key={i} name={a.name} mime={a.mime} />
                ))}
              </div>
            )}
            <div className="flex gap-0 items-center p-2px w-full">
              <textarea
                placeholder={inputPlaceholder}
                rows={1}
                value={effectiveValue}
                readOnly={!editable}
                onChange={editable ? (e) => setTyped(e.target.value) : undefined}
                onKeyDown={editable ? handleKey : undefined}
                className="ai-input-textarea w-full text-lg text-primary tracking-default leading-normal resize-none outline-none border-0 bg-transparent placeholder:text-disabled"
                style={{
                  fontFamily: "var(--font-family-korean)",
                  fontWeight: "var(--font-weight-regular)",
                  minHeight: 20,
                  maxHeight: 120,
                }}
              />
            </div>
            <div className="flex items-center justify-between p-0 w-full">
              <div className="flex gap-8px items-center shrink-0">
                <input
                  multiple
                  accept=".csv,.pdf,.txt,.json,.log,image/*"
                  type="file"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  aria-label="파일 또는 이미지 추가"
                  className="group-plus flex items-center justify-center p-2px rounded-4px shrink-0 size-20px cursor-pointer border-0 bg-card hover-bg-black transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-colors">
                    <line x1="8" y1="3.33" x2="8" y2="12.67" className="stroke-color-var-color-text-secondary group-hover-plus-stroke-white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3.33" y1="8" x2="12.67" y2="8" className="stroke-color-var-color-text-secondary group-hover-plus-stroke-white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {/* 토큰 입출력 정보 (Figma 29424:19317) — plus 버튼 옆 pill */}
                <TokenUsageBadge inputTokens={tokenInput} outputTokens={tokenOutput} />
              </div>
              <div className="flex gap-8px items-center shrink-0">
                {/* 전송 버튼 — input에 텍스트가 있으면 활성(blue) */}
                <div className="relative shrink-0">
                <button
                  type="button"
                  disabled={!hasInput}
                  onClick={handleSubmit}
                  className="ai-send-btn flex items-center justify-center rounded-4px shrink-0 size-24px cursor-pointer transition-colors disabled-cursor-not-allowed"
                  style={{
                    backgroundColor: hasInput ? "var(--color-primary)" : "var(--color-surface-50)",
                    border: hasInput ? "1px solid var(--color-primary)" : "1px solid #d3d3d3",
                  }}
                  aria-label="전송"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 12V4M8 4L4 8M8 4L12 8"
                      stroke={hasInput ? "#fff" : "var(--color-border-divider)"}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {showSendCursor && (
                  <AiClickCursor style={{ right: -18, top: 6 }} />
                )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-0 items-center justify-end px-0 py-4px shrink-0 w-full">
            <p
              className="text-base text-disabled tracking-normal leading-none whitespace-nowrap"
              style={{ fontFamily: "var(--font-family-korean)", fontWeight: "var(--font-weight-regular)" }}
            >
              AI 응답은 정확하지 않을 수 있습니다. 중요한 결정은 반드시 확인해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TokenUsageBadge — AI 입출력 토큰 사용량 pill (Figma 29424:19317).
 *
 * "토큰 입력 3,395 · 출력 181" 형태. bg var(--color-surface-50) / radius 24px / px 8 / py 4 / 10px text,
 * 숫자만 bold. 모델 선택기 (Claude Opus 4) 자리에 대체 표시.
 */
function TokenUsageBadge({ inputTokens, outputTokens }: { inputTokens: number; outputTokens: number }) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  return (
    <div
      className="inline-flex items-center px-8px py-4px rounded-24px shrink-0"
      style={{ backgroundColor: "var(--color-surface-50)" }}
      data-node-id="29424:19317"
    >
      <span
        className="text-xs leading-none text-black whitespace-nowrap"
        style={{ fontFamily: "var(--font-family-korean-inter)", fontWeight: "var(--font-weight-regular)" }}
      >
        토큰 입력 <strong style={{ fontWeight: "var(--font-weight-bold)" }}>{fmt(inputTokens)}</strong> · 출력{" "}
        <strong style={{ fontWeight: "var(--font-weight-bold)" }}>{fmt(outputTokens)}</strong>
      </span>
    </div>
  );
}
