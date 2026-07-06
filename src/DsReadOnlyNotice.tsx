/**
 * DsReadOnlyNotice — 디자인 시스템 수정 불가 안내 모달.
 *
 * ## Purpose
 * 소비자(엔지니어)가 UI 작업 레이어에서 토큰·컴포넌트·Atom·위젯을
 * 역으로 수정하려 할 때 표시하는 불변 정책 안내 창.
 *
 * ## 불변 정책 (Immutable Policy)
 * 소비 레이어에서의 override · 재정의 · CSS 덮어쓰기 · 토큰 값 변경은
 * 예외 없이 금지. 변경은 디자인 시스템 repo에서만 수행.
 *
 * ## When to use
 * - 소비 앱에서 DS 컴포넌트 prop 외의 스타일 override 시도 시.
 * - DevTools 에서 DS 토큰 값 변경 시도 시 (optional).
 * - 컴포넌트 소스 수정 시도를 감지했을 때.
 *
 * ## When NOT to use
 * - **디자인 시스템 repo 내부** 작업 — 이 모달은 소비자(엔지니어) 방향 전용. DS 작업자는 대상이 아님.
 * - **일반 확인/경고 모달** → [[Modal]].
 * - **토스트 알림** (비파괴적 안내) → [[Toast]].
 *
 * ## Composition rules
 * - [[Modal]] 기반 — 동일한 portal · backdrop · ESC 닫기 동작.
 * - 불변 정책 텍스트는 하드코딩 — 정책 내용은 이 컴포넌트가 단일 출처.
 * - `attemptedAction` prop 으로 어떤 시도가 차단되었는지 맥락 표시.
 * - 색은 토큰 (`text-primary` · `text-secondary` · `bg-card`) — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <DsReadOnlyNotice
 *   open={showNotice}
 *   onClose={() => setShowNotice(false)}
 *   attemptedAction="토큰 --color-primary 값 변경"
 * />
 * ```
 */
import { useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";

export type DsReadOnlyNoticeProps = {
  /** 모달 표시 여부. */
  open: boolean;
  /** 닫기 콜백. */
  onClose: () => void;
  /** 시도된 수정 액션 설명 (선택). 표시하면 사용자가 무엇이 차단되었는지 이해 가능. */
  attemptedAction?: string;
  /** Portal mount target. default = document.body. */
  container?: HTMLElement | null;
};

const REPO_URL = "https://github.com/interfacedesigner/Denyx-design-system";
const STORYBOOK_URL = "https://denyx-design-system-storybook.vercel.app";

export default function DsReadOnlyNotice({
  open,
  onClose,
  attemptedAction,
  container,
}: DsReadOnlyNoticeProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  if (!target) return null;

  const backdrop: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    animation: "dsNoticeBackdropIn 120ms ease",
  };

  const panel: CSSProperties = {
    backgroundColor: "var(--color-card)",
    borderRadius: 12,
    border: "1px solid var(--color-border-default, #eaeaea)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: 440,
    overflow: "hidden",
    animation: "dsNoticePanelIn 180ms ease",
  };

  return createPortal(
    <div
      role="presentation"
      style={backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes dsNoticeBackdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dsNoticePanelIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div role="alertdialog" aria-modal="true" aria-labelledby="ds-readonly-title" style={panel}>
        {/* Header — 경고 배너 */}
        <div style={{
          backgroundColor: "#FFF3E0",
          borderBottom: "1px solid #FFE0B2",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" fill="#E65100"/>
          </svg>
          <h2
            id="ds-readonly-title"
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: "#BF360C",
              lineHeight: 1.3,
              fontFamily: "var(--font-family-korean, 'Noto Sans KR', sans-serif)",
            }}
          >
            수정 불가 — 디자인 시스템 불변 정책
          </h2>
        </div>

        {/* Body */}
        <div style={{
          padding: "16px 20px",
          fontFamily: "var(--font-family-korean, 'Noto Sans KR', sans-serif)",
          fontSize: 13,
          lineHeight: 1.6,
          color: "var(--color-text-primary, #222)",
        }}>
          {attemptedAction && (
            <div style={{
              backgroundColor: "var(--color-surface-50, #f5f5f5)",
              borderRadius: 6,
              padding: "8px 12px",
              marginBottom: 12,
              fontSize: 12,
              color: "var(--color-text-secondary, #4c4c4c)",
              border: "1px solid var(--color-border-default, #eaeaea)",
            }}>
              <strong>시도된 작업:</strong> {attemptedAction}
            </div>
          )}

          <p style={{ margin: "0 0 10px" }}>
            <strong>토큰 · 컴포넌트 · Atom · 위젯</strong>은 소비 레이어(UI 작업)에서 역으로 수정할 수 없습니다.
          </p>

          <ul style={{
            margin: "0 0 12px",
            paddingLeft: 18,
            listStyleType: "disc",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 12,
            color: "var(--color-text-secondary, #4c4c4c)",
          }}>
            <li>CSS override · 재정의 · 토큰 값 변경 금지</li>
            <li>monkey-patch · <code>!important</code> 덮어쓰기 금지</li>
            <li>변경이 필요하면 <strong>디자인 시스템 repo</strong>에서 요청</li>
            <li>소비 측은 <strong>prop 조합으로만</strong> 사용</li>
          </ul>

          <div style={{
            backgroundColor: "#E3F2FD",
            borderRadius: 6,
            padding: "10px 12px",
            fontSize: 12,
            lineHeight: 1.5,
            color: "#1565C0",
          }}>
            변경 요청은 디자인 시스템 repo에 Issue를 등록하거나 담당 디자이너에게 문의하세요.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px 16px",
          borderTop: "1px solid var(--color-border-soft, #f0f0f0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}>
          <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--color-primary, #296CF2)",
                textDecoration: "none",
                fontFamily: "var(--font-family-korean, sans-serif)",
              }}
            >
              DS Repo
            </a>
            <a
              href={STORYBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--color-primary, #296CF2)",
                textDecoration: "none",
                fontFamily: "var(--font-family-korean, sans-serif)",
              }}
            >
              Storybook
            </a>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: "var(--color-primary, #296CF2)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-family-korean, 'Noto Sans KR', sans-serif)",
              lineHeight: 1.4,
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    target,
  );
}
