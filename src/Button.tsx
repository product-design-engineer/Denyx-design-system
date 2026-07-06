/**
 * Button — 공통 (chrome) 버튼 primitive.
 *
 * ## Purpose
 * Denyx 디자인 시스템의 표준 버튼. 모든 click trigger 가 이 컴포넌트로 통일되어야 함 — 인라인
 * `<button className="...">` 새로 짜지 말 것. 색/사이즈/상태 일관성은 이 컴포넌트가 보장.
 *
 * Spec: @denyx/wds Button-specs.md 기반 (Figma 5701-33519). 3 variant × 4 size × 3 tone +
 * disabled / loading / fullWidth.
 *
 * ## 구현 노트 — 동적 variant×tone 색은 CSS custom property 로
 * runtime 에 조립되는 variant×tone 색은 정적 유틸 클래스로 표현할 수 없으므로,
 * **inline CSS custom property** 로 전달 (`--wds-btn-bg`, `--wds-btn-fg`, `--wds-btn-border`,
 * `--wds-btn-bg-hover`). `tokens.css` 의 `.wds-btn` 규칙이 이 변수들을 적용 — hover 까지 정상.
 *
 * ## When to use
 * - 사용자 액션 trigger (제출 / 적용 / 닫기 / 등록 등).
 * - Primary CTA, Secondary action, 위험 동작 (delete 등).
 *
 * ## When NOT to use
 * - 링크 이동 → `<a>` 사용.
 * - AI 토글 그라데이션 → [[AiAssistantButton]].
 * - AI 위젯 송신 → [[AiSendButton]].
 * - icon-only 압축 버튼 (size 16-20px) → 인라인 OK.
 *
 * ## Composition rules
 * - 모든 색은 토큰 (`var(--color-primary)` 등) — 인라인 hex 금지.
 * - 사이즈는 spec 4 단계만 — custom px 금지.
 * - loading=true → 자동 disabled + spinner overlay.
 *
 * @example
 * ```tsx
 * <Button variant="contained" tone="primary" size="lg" onClick={onApply}>
 *   네, 적용하고 트렌드 보기
 * </Button>
 * <Button variant="outline" tone="critical" size="md" disabled>
 *   삭제 (권한 없음)
 * </Button>
 * ```
 */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type ButtonVariant = "basic" | "contained" | "outline";
export type ButtonSize = "xl" | "lg" | "md" | "sm";
export type ButtonTone = "primary" | "warning" | "critical";

export type ButtonProps = {
  /** 시각 variant — basic(텍스트만) / contained(채움) / outline(보더). */
  variant?: ButtonVariant;
  /** 사이즈 (높이 px) — xl=36 · lg=32 · md=24 · sm=20. */
  size?: ButtonSize;
  /** 톤 (색 테마) — primary(blue) · warning(orange) · critical(red). */
  tone?: ButtonTone;
  /** 로딩 상태 — true 면 자동 disabled + spinner. */
  loading?: boolean;
  /** 전체 폭 채우기. */
  fullWidth?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/* ─── style maps ────────────────────────────────────── */

const SIZE_CLASS: Record<ButtonSize, string> = {
  // denyx-ds.css 에 정의된 일반 유틸 클래스 (h-36px/px-16px 등 — escape 없는 식별자).
  xl: "h-36px px-16px text-md gap-8px",
  lg: "h-32px px-14px text-md gap-6px",
  md: "h-24px px-10px text-base gap-4px",
  sm: "h-20px px-8px text-sm gap-4px",
};

/** tone → CSS color (main / hover / soft surface). */
const TONE_COLORS: Record<ButtonTone, { main: string; hover: string; soft: string }> = {
  primary:  { main: "var(--color-primary)",     hover: "var(--color-primary-strong)", soft: "var(--color-primary-bg)" },
  warning:  { main: "var(--color-status-warning)", hover: "#E08A0E",                       soft: "#FFF4E5" },
  critical: { main: "var(--color-status-error)",   hover: "#D03333",                       soft: "#FDECEC" },
};

/** variant × tone → inline CSS custom property set (button 색 전체 결정). */
function toneStyle(variant: ButtonVariant, tone: ButtonTone): CSSProperties {
  const c = TONE_COLORS[tone];
  if (variant === "contained") {
    return {
      "--wds-btn-bg": c.main,
      "--wds-btn-bg-hover": c.hover,
      "--wds-btn-fg": "#fff",
      "--wds-btn-border": "transparent",
    } as CSSProperties;
  }
  if (variant === "outline") {
    return {
      "--wds-btn-bg": "var(--color-card)",
      "--wds-btn-bg-hover": c.soft,
      "--wds-btn-fg": c.main,
      "--wds-btn-border": c.main,
    } as CSSProperties;
  }
  // basic — text-only, hover 시만 soft 배경
  return {
    "--wds-btn-bg": "transparent",
    "--wds-btn-bg-hover": c.soft,
    "--wds-btn-fg": c.main,
    "--wds-btn-border": "transparent",
  } as CSSProperties;
}

/* ─── 컴포넌트 ──────────────────────────────────────── */

export default function Button({
  variant = "contained",
  size = "md",
  tone = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  style,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={rest.type ?? "button"}
      disabled={isDisabled}
      className={[
        "wds-btn",
        "inline-flex items-center justify-center rounded-4px border whitespace-nowrap select-none relative overflow-hidden",
        "transition-colors duration-150",
        "tracking-default font-medium",
        SIZE_CLASS[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
      style={{
        fontFamily: "var(--font-family-korean)",
        ...toneStyle(variant, tone),
        ...style, // 사용자 override
      }}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(1px)" }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "1.5px solid currentColor",
              borderTopColor: "transparent",
              animation: "aiSymbolRotateSlow 0.9s linear infinite",
            }}
          />
        </span>
      )}
      <span className={loading ? "invisible" : "inline-flex items-center gap-inherit"}>
        {children}
      </span>
    </button>
  );
}
