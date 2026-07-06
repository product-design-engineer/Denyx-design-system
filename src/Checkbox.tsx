/**
 * Checkbox — Primitives layer.
 *
 * ## Purpose
 * 폼·필터·룰 편집기·카탈로그 ON/OFF 등 전반의 boolean 입력 building block.
 * 인라인 `<input type="checkbox">` 새로 짜지 말 것 — 토큰·상태 일관성은 이 컴포넌트가 보장.
 *
 * ## When to use
 * - 다중 선택 필터 (FilterDropdown 내부, 카탈로그 카테고리 선택)
 * - 폼의 boolean 입력 (룰 활성/비활성, 동의 체크)
 * - DataTable 행 다중 선택
 *
 * ## When NOT to use
 * - 단일 ON/OFF 토글 → 추후 `Switch` (다른 의미 — 즉시 적용 vs 폼 제출)
 * - 양자택일 → `Radio`
 *
 * ## Composition rules
 * - label 은 옆 텍스트 (children 또는 `label` prop) — 클릭 영역이 input + label 모두
 * - indeterminate 는 부분 선택 상태 (트리 선택 시) — checked 와 별개 boolean
 * - 색·간격은 토큰만 (brand-blue · text-primary · border-strong)
 *
 * @example
 * ```tsx
 * <Checkbox checked={isOn} onChange={setOn}>알림 활성화</Checkbox>
 * <Checkbox checked={false} indeterminate>전체 선택 (부분)</Checkbox>
 * <Checkbox checked={true} disabled>읽기 전용</Checkbox>
 * ```
 */
import { useEffect, useRef, type ReactNode } from "react";

export type CheckboxSize = "sm" | "md";

export type CheckboxProps = {
  /** 체크 상태. controlled. */
  checked: boolean;
  /** 부분 선택 상태 — 트리/그룹 선택 시. checked 와 독립. */
  indeterminate?: boolean;
  /** 비활성. */
  disabled?: boolean;
  /** 사이즈 — sm(14px) / md(16px, default). */
  size?: CheckboxSize;
  /** 변경 콜백 — `(nextChecked) => void`. */
  onChange?: (next: boolean) => void;
  /** 라벨 (children 우선, 둘 다 있으면 children). */
  label?: string;
  /** 라벨 영역 children. */
  children?: ReactNode;
  /** 접근성: aria-label. children/label 없을 때 필수. */
  "aria-label"?: string;
  /** 외부 className — wrapper label 에 추가. */
  className?: string;
};

const SIZE = {
  sm: { box: 14, gap: "gap-6px", text: "text-sm" },
  md: { box: 16, gap: "gap-8px", text: "text-base" },
} as const;

export default function Checkbox({
  checked,
  indeterminate = false,
  disabled = false,
  size = "md",
  onChange,
  label,
  children,
  "aria-label": ariaLabel,
  className = "",
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const spec = SIZE[size];

  // indeterminate 는 HTML attribute 가 아니라 DOM property — ref 로 설정
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  const labelText = children ?? label;
  const interactive = !disabled;

  return (
    <label
      className={`inline-flex items-center ${spec.gap} ${spec.text} ${
        disabled
          ? "cursor-not-allowed text-tertiary"
          : "cursor-pointer text-primary hover:text-secondary"
      } ${className}`}
    >
      <span
        className="relative inline-flex shrink-0 items-center justify-center rounded-3px border transition-colors"
        style={{
          width: spec.box,
          height: spec.box,
          backgroundColor:
            checked || indeterminate ? "var(--color-primary)" : "var(--color-card)",
          borderColor:
            checked || indeterminate
              ? "var(--color-primary)"
              : disabled
              ? "var(--color-border-default)"
              : "var(--color-border-strong)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* checked: V 체크 SVG */}
        {checked && !indeterminate && (
          <svg
            viewBox="0 0 16 16"
            width={spec.box - 4}
            height={spec.box - 4}
            fill="none"
            stroke="#fff"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
          </svg>
        )}
        {/* indeterminate: 가로 막대 */}
        {indeterminate && !checked && (
          <span
            className="block rounded-1_5px bg-white"
            style={{ width: spec.box - 6, height: 2 }}
            aria-hidden
          />
        )}
        <input
          ref={inputRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => interactive && onChange?.(e.target.checked)}
          aria-label={ariaLabel}
          className="absolute inset-0 cursor-inherit appearance-none opacity-0"
        />
      </span>
      {labelText !== undefined && labelText !== null && <span>{labelText}</span>}
    </label>
  );
}
