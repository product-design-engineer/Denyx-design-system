/**
 * AiMessageActions — AI 응답 하단의 like/dislike/copy 피드백 toolbar (Figma 27598:4604).
 *
 * ## Purpose
 * AI 응답에 대한 사용자 반응을 받는 우측 정렬 3-아이콘 바: 👍 like / 👎 dislike / 📋 copy.
 * like·dislike 는 토글(같은 버튼 재클릭 시 해제, 상호 배타) 상태를 내부에서 관리하고,
 * copy 는 클릭 후 약 1.4초간 체크 아이콘으로 전환. 각 동작은 `onLike`/`onDislike`/`onCopy` 로 전달.
 *
 * ## When to use
 * - AI 응답 메시지 하단에 좋아요/싫어요/복사 피드백 컨트롤이 필요할 때.
 * - 응답 카드 본문과 시각적으로 분리하고 싶을 때 `divider` 로 상단 구분선 추가.
 *
 * ## When NOT to use
 * - 복사/재시도만 필요한 단순 교환 → [[AiChatExchange]] 의 내장 toolbar (like/dislike 없음).
 * - prompt 전송 액션 → [[AiSendButton]].
 *
 * ## Composition rules
 * - 응답 본문 아래에 붙여 배치, 우측 정렬(`justify-end`)·gap 8px(spacing_xs) 유지.
 * - 아이콘 색·구분선은 토큰만 사용(tertiary stroke, like=brand-blue, dislike=indicator-critical, copy 완료=status-success) — 인라인 hex 금지.
 * - like/dislike/copy 상태는 컴포넌트가 자체 관리, 외부 콜백은 부수효과(서버 전송 등)에만 사용.
 *
 * @example
 * ```tsx
 * <AiMessageActions
 *   divider
 *   onLike={() => logFeedback("like")}
 *   onDislike={() => logFeedback("dislike")}
 *   onCopy={() => navigator.clipboard.writeText(answer)}
 * />
 * ```
 */
import { useState } from "react";

type Reaction = "like" | "dislike" | null;

export default function AiMessageActions({
  divider = false,
  onLike,
  onDislike,
  onCopy,
}: {
  /** 위쪽 var(--color-border-default) 디바이더 표시 여부 */
  divider?: boolean;
  onLike?: () => void;
  onDislike?: () => void;
  onCopy?: () => void;
}) {
  const [reaction, setReaction] = useState<Reaction>(null);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    setReaction((r) => (r === "like" ? null : "like"));
    onLike?.();
  };
  const handleDislike = () => {
    setReaction((r) => (r === "dislike" ? null : "dislike"));
    onDislike?.();
  };
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
    onCopy?.();
  };

  return (
    <div
      className="flex items-center justify-end gap-8px w-full"
      style={{
        paddingTop: divider ? 8 : 0,
        borderTop: divider ? "1px solid var(--color-border-default)" : "none",
      }}
    >
      <ActionBtn ariaLabel="도움이 됐어요" active={reaction === "like"} onClick={handleLike}>
        <ThumbUpIcon filled={reaction === "like"} />
      </ActionBtn>
      <ActionBtn ariaLabel="도움이 되지 않았어요" active={reaction === "dislike"} onClick={handleDislike}>
        <ThumbDownIcon filled={reaction === "dislike"} />
      </ActionBtn>
      <ActionBtn ariaLabel={copied ? "복사 완료" : "복사"} active={copied} onClick={handleCopy}>
        {copied ? <CopiedCheckIcon /> : <CopyIcon />}
      </ActionBtn>
    </div>
  );
}

function ActionBtn({
  ariaLabel,
  active,
  onClick,
  children,
}: {
  ariaLabel: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex items-center justify-center size-20px rounded-4px cursor-pointer transition-colors"
      style={{
        background: active ? "rgba(41,108,242,0.08)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

/* ─── icons ─────────────────────────────────────────────── */
function ThumbUpIcon({ filled }: { filled?: boolean }) {
  const stroke = filled ? "var(--color-primary)" : "var(--color-text-tertiary)";
  const fill = filled ? "var(--color-primary)" : "none";
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.5 14V7.5 M5.5 7.5l2.2-4.5a1 1 0 0 1 1.95.3v3.2H13a1 1 0 0 1 1 1.2l-1 5a1 1 0 0 1-1 .8H5.5z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity={filled ? 0.15 : 1}
      />
      <path
        d="M2.5 7.5h3V14h-3a.5.5 0 0 1-.5-.5v-5.5a.5.5 0 0 1 .5-.5z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity={filled ? 0.15 : 1}
      />
    </svg>
  );
}
function ThumbDownIcon({ filled }: { filled?: boolean }) {
  const stroke = filled ? "var(--color-indicator-critical)" : "var(--color-text-tertiary)";
  const fill = filled ? "var(--color-indicator-critical)" : "none";
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10.5 2v6.5 M10.5 8.5l-2.2 4.5a1 1 0 0 1-1.95-.3V9.5H3a1 1 0 0 1-1-1.2l1-5a1 1 0 0 1 1-.8h6.5z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity={filled ? 0.15 : 1}
      />
      <path
        d="M13.5 8.5h-3V2h3a.5.5 0 0 1 .5.5v5.5a.5.5 0 0 1-.5.5z"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity={filled ? 0.15 : 1}
      />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.2" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
      <path d="M5.5 1.5h7c.55 0 1 .45 1 1v7" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function CopiedCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7l3 3 6-6.5"
        stroke="var(--color-status-success)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
