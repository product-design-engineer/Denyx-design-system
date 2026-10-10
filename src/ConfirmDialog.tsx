/**
 * ConfirmDialog — Primitives layer.
 *
 * ## Purpose
 * 되돌릴 수 없는 동작(삭제·적용·배포) 전 확인 다이얼로그.
 * 본문에 **무엇을**(target) + **결과**(outcomes)를 보여줌.
 *
 * ## When to use
 * - 데이터 삭제, 설정 적용 등 되돌릴 수 없는 동작 전.
 * - 사용자가 결과를 인지해야 하는 중요 액션.
 *
 * ## When NOT to use
 * - 가벼운 확인 → Toast actionLabel 사용.
 * - 폼 입력이 필요 → [[Modal]] 직접 사용.
 * - 정보 전달만 → [[Notice]] 사용.
 *
 * ## Composition rules
 * - `confirmLabel`은 동사("삭제", "적용") — "확인" 금지.
 * - `tone="critical"` 이면 확인 버튼이 빨간색.
 * - Modal + Button 조합이지만 DS 컴포넌트를 import 하지 않고 인라인 구현 (Primitives 계층).
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={showConfirm}
 *   title="플랜에서 제외"
 *   target="GPU-A100 인스턴스 3대"
 *   outcomes={[{ text: "모니터링 데이터가 삭제됩니다", tone: "critical" }]}
 *   confirmLabel="제외"
 *   tone="critical"
 *   onConfirm={handleExclude}
 *   onClose={() => setShowConfirm(false)}
 * />
 * ```
 */
import type { ReactNode } from "react";

export type ConfirmDialogTone = "critical" | "primary";

export type ConfirmDialogOutcome = {
  text: ReactNode;
  /** critical = 되돌릴 수 없는 결과. */
  tone?: "default" | "critical";
};

export type ConfirmDialogProps = {
  open: boolean;
  /** 실행 이름 (e.g., "플랜에서 제외"). */
  title: ReactNode;
  /** 무엇을 (대상). */
  target?: ReactNode;
  /** 결과 목록. */
  outcomes?: ConfirmDialogOutcome[];
  children?: ReactNode;
  /** 확인 버튼 라벨 — 동사 ("삭제", "적용"). "확인" 금지. */
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  /** 실행 중 로딩. */
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  target,
  outcomes,
  children,
  confirmLabel,
  cancelLabel = "취소",
  tone = "critical",
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmColor = tone === "critical" ? "var(--color-status-error)" : "var(--color-primary)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)", // raw-color-ok: modal backdrop
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        style={{
          background: "var(--color-card)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "var(--spacing-3xl)",
          maxWidth: 400,
          width: "90vw",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-lg)",
        }}
      >
        <h2 className="text-lg font-bold text-primary" style={{ margin: 0 }}>{title}</h2>

        {target && <p className="text-base text-primary" style={{ margin: 0 }}>{target}</p>}

        {children}

        {outcomes && outcomes.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: "var(--spacing-xl)", display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
            {outcomes.map((o, i) => (
              <li
                key={i}
                className="text-base"
                style={{ color: o.tone === "critical" ? "var(--color-status-error)" : "var(--color-text-secondary)" }}
              >
                {o.text}
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-md)", marginTop: "var(--spacing-md)" }}>
          <button
            type="button"
            onClick={onClose}
            className="text-md"
            style={{
              height: 32,
              padding: "0 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-default)",
              background: "var(--color-card)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="text-md font-bold"
            style={{
              height: 32,
              padding: "0 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: confirmColor,
              color: "#fff",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
