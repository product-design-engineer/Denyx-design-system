import { forwardRef, useState, type ReactNode, type ButtonHTMLAttributes } from "react";

/**
 * Switch — Primitives / Foundation. 토글 스위치 (on/off).
 *
 * ## Purpose
 * 즉시 적용되는 ON/OFF 상태 토글 (Checkbox 와 구분 — 폼 제출이 아니라 즉시 반영 의도).
 * 트랙(좌우) + 슬라이드 노브. 색·치수·radius·shadow 는 전부 tokens.css 의 CSS 변수 참조 —
 * Tailwind 유틸 클래스 미사용, 시각 스타일은 inline `style`(토큰 기반)로만.
 *
 * ## When to use
 * - 설정 즉시 반영 토글 (알림 on/off, 기능 활성화, 다크 모드 — [[ThemeToggle]]).
 * - "지금 켜고 끈다"는 의미가 분명할 때.
 *
 * ## When NOT to use
 * - 폼 제출 시 함께 보내는 다중 선택 → [[Checkbox]].
 * - 2개 이상 상호배타 옵션 → Tabs / RadioGroup.
 *
 * ## Composition rules
 * - 색/치수/radius/shadow = 토큰(`--color-primary`·`--color-surface-200`·`--radius-full`·`--shadow-sm`) — 인라인 hex 금지.
 * - controlled(`checked`) / uncontrolled(`defaultChecked`) 둘 다 지원 ([[Checkbox]] 패턴 동일).
 * - 라이트 기본 — 다크는 토큰이 자동 전환(`.dark`/`[data-theme=dark]`).
 * - 시각 라벨 없으면 `label`(=aria-label) 또는 `aria-label`/`aria-labelledby` 필수.
 *
 * @example
 * ```tsx
 * <Switch checked={on} onChange={setOn} label="알림 활성화" />
 * <Switch defaultChecked size="sm" />
 * <Switch checked={dark} onChange={...} knobContent={<MoonIcon />} aria-label="테마" />
 * ```
 */
export type SwitchSize = "sm" | "md";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  /** controlled 상태. */
  checked?: boolean;
  /** uncontrolled 초기값. */
  defaultChecked?: boolean;
  /** 토글 콜백. */
  onChange?: (checked: boolean) => void;
  /** 크기 — sm: track 40×22 / md: track 52×28. default "md". */
  size?: SwitchSize;
  disabled?: boolean;
  /** 시각 라벨(옵션). 없으면 aria-label 권장. */
  label?: string;
  /** 노브 안 콘텐츠(아이콘 등) — [[ThemeToggle]] 가 해/달 주입. */
  knobContent?: ReactNode;
  className?: string;
}

const DIMS: Record<SwitchSize, { w: number; h: number; k: number }> = {
  sm: { w: 40, h: 22, k: 16 },
  md: { w: 52, h: 28, k: 22 },
};

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked = false,
    onChange,
    size = "md",
    disabled = false,
    label,
    knobContent,
    className = "",
    ...rest
  },
  ref
) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;
  const d = DIMS[size];

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={toggle}
      className={`wds-switch ${className}`.trim()}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        width: d.w,
        height: d.h,
        padding: 0,
        borderRadius: "var(--radius-full, 9999px)",
        background: on ? "var(--color-primary)" : "var(--color-surface-200)",
        border: "1px solid var(--color-border-default)",
        transition: "background 0.2s ease",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      {...rest}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 2,
          left: on ? d.w - d.k - 3 : 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: d.k,
          height: d.k,
          borderRadius: "var(--radius-full, 9999px)",
          background: "var(--color-white, #fff)",
          boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.25))",
          transition: "left 0.2s ease",
          lineHeight: 0,
        }}
      >
        {knobContent}
      </span>
    </button>
  );
});

Switch.displayName = "Switch";

export default Switch;
