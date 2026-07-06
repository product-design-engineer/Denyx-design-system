import AiSymbol from "./AiSymbol";
import AiQuickActionChip from "./AiQuickActionChip";

interface AiWidgetProps {
  open?: boolean;
  variant?: "slide" | "overlap";
  onClose?: () => void;
}

const QUICK_ACTIONS = ["현재 상태 요약", "슬로우 트랜잭션 분석", "이상 징후 진단"];

/**
 * AiWidget — AI surface. 440px Denyx AI 위젯, denyx-ai-assistant.vercel.app 재현.
 *
 * ## Purpose
 * 라이브 vercel 위젯을 그대로 옮긴 440px AI 패널(폭은 라이브 번들에서 추출).
 * 헤더(Denyx AI + Beta 배지 · 새 세션/너비조정/닫기) + 본문(환영 메시지 +
 * 빠른 액션 칩) + 푸터(첨부 버튼 · 입력창 · "Claude Opus 4" 모델 선택기 · 보내기).
 * `variant` 로 두 가지 배치를 제공:
 *  - `slide`   — 우측 full-height 패널, 우→좌 translate 슬라이드(컨텐츠를 밀지 않고 overlay).
 *  - `overlap` — 우하단 floating 카드(440×640), 컨텐츠 위에 떠 있음.
 *
 * ## When to use
 * - vercel 데모와 동일한 룩앤필(Beta 배지 · 모델 선택기 pill)을 그대로 보여줄 때.
 * - overlay 슬라이드/floating 카드 형태의 가벼운 AI 패널이 필요할 때.
 *
 * ## When NOT to use
 * - 프로덕션 대시보드의 위젯 본체(480px · prop 외부화 · 토큰 사용량 · 첨부 칩 · 자동 스크롤)
 *   → [[DenyxAiWidget]].
 * - 헤더/카드/모달의 한 줄 inline 입력 → [[AiInlinePrompt]].
 * - 헤더 안 AI 토글 버튼만 → [[AiAssistantButton]].
 *
 * ## Composition rules
 * - 색·그라데이션·경계는 토큰 binding (`--color-primary` / `--color-primary-strong` /
 *   `--color-border-*` 등). 환영 메시지/입력 영역은 정적 마크업(prop 외부화 없음).
 * - 빠른 액션은 모듈 상수 `QUICK_ACTIONS` 로 고정, `{userName}`/`{dashboardName}` 은 플레이스홀더 텍스트.
 * - `open` 으로 가시성 제어 — slide 는 `translate-x`, overlap 은 `opacity`/`pointer-events` 로 전환.
 *
 * @example
 * ```tsx
 * <AiWidget open={aiOpen} variant="slide" onClose={() => setAiOpen(false)} />
 * <AiWidget open={aiOpen} variant="overlap" onClose={() => setAiOpen(false)} />
 * ```
 */
export default function AiWidget({ open = true, variant = "slide", onClose }: AiWidgetProps) {
  const containerClass =
    variant === "slide"
      ? `absolute top-0 right-0 bottom-0 w-440px bg-card flex flex-col z-50 transition-transform duration-300 ease-cubic-bezier-0_4-0-0_2-1 ${
          open ? "translate-x-0" : "translate-x-full"
        }`
      : `absolute bottom-5 right-5 w-440px h-640px bg-card rounded-lg flex flex-col z-50 overflow-hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`;

  const containerStyle: React.CSSProperties =
    variant === "slide"
      ? { borderLeft: "1px solid var(--color-border-default)", boxShadow: "-10px 0 30px rgba(0,0,0,0.06)" }
      : { border: "1px solid var(--color-border-default)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" };

  return (
    <div className={containerClass} style={containerStyle}>
      {/* Header */}
      <div className="flex items-center justify-between h-47px px-2 shrink-0 bg-card border-b" style={{ borderColor: "var(--color-border-default)" }}>
        <div className="flex items-center gap-2 pl-1_5">
          <div className="ai-symbol-anim flex items-center justify-center w-6 h-6 rounded-md" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-strong))" }}>
            <AiSymbol size={14} />
          </div>
          <span className="text-md font-bold" style={{ color: "var(--color-text-primary)" }}>Denyx AI</span>
          <span className="px-1_5 py-0_5 rounded text-chart font-semibold tracking-wider" style={{ background: "var(--color-primary-bg)", color: "var(--color-primary-strong)" }}>
            Beta
          </span>
        </div>
        <div className="flex gap-1 items-center">
          <button className="size-5 flex items-center justify-center cursor-pointer rounded hover-bg-gray-100" style={{ color: "var(--color-text-secondary)" }} aria-label="새로운 세션">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button className="size-5 flex items-center justify-center cursor-pointer rounded hover-bg-gray-100" style={{ color: "var(--color-text-secondary)" }} aria-label="패널 너비 조정">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5" />
            </svg>
          </button>
          <button onClick={onClose} className="size-5 flex items-center justify-center cursor-pointer rounded hover-bg-gray-100" style={{ color: "var(--color-text-secondary)" }} aria-label="닫기">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4 bg-card">
        {/* AI welcome message */}
        <div className="flex gap-2_5 mb-4">
          <div className="size-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-0_2px_8px_rgba-41-108-242-0_25" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-strong))" }}>
            <AiSymbol size={14} />
          </div>
          <div className="flex-1 text-md leading-loose" style={{ color: "var(--color-text-body)" }}>
            <b style={{ color: "var(--color-text-primary)" }}>{"{userName}"}</b>님, 안녕하세요. Denyx AI 어시스턴트입니다.<br />
            <b style={{ color: "var(--color-text-primary)" }}>{"{dashboardName}"}</b> 분석을 함께 하겠습니다. 무엇부터 살펴볼까요?
          </div>
        </div>

        {/* Quick action chips */}
        <div className="flex flex-wrap gap-2 pl-38px">
          {QUICK_ACTIONS.map((label) => (
            <AiQuickActionChip key={label} label={label} />
          ))}
        </div>
      </div>

      {/* Footer — input area */}
      <div className="px-3 pt-2 pb-2_5 bg-card border-t" style={{ borderColor: "var(--color-border-soft)" }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card mb-2"
          style={{ border: "1px solid var(--color-border-divider)" }}
        >
          <button className="size-5 flex items-center justify-center cursor-pointer" style={{ color: "var(--color-text-tertiary)" }} aria-label="파일 또는 이미지 추가">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            className="flex-1 text-md outline-none bg-transparent"
            style={{ color: "var(--color-text-primary)" }}
            placeholder="어떤 작업을 함께 할까요?"
          />
          <div className="flex items-center gap-1 px-1_5 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            <span style={{ color: "var(--color-primary)" }}>✦</span>
            <span>Claude Opus 4</span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <button
            className="size-7 rounded-md flex items-center justify-center text-white cursor-pointer"
            style={{ background: "var(--color-primary)" }}
            aria-label="보내기"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="text-center text-xs leading-snug" style={{ color: "var(--color-text-tertiary)" }}>
          AI 응답은 정확하지 않을 수 있습니다. 중요한 결정은 반드시 확인해 주세요.
        </div>
      </div>
    </div>
  );
}
