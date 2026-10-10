/**
 * RadioGroup — Primitives layer.
 *
 * ## Purpose
 * 상호 배타적 단일 선택 라디오 그룹. 2~5개 옵션을 모두 펼쳐 보여줌.
 * 네이티브 `<input type="radio">` 기반 — 키보드(←→↑↓), 스크린리더 자동 지원.
 *
 * ## When to use
 * - 상호 배타적 선택이 필요하고 옵션이 2~5개일 때.
 * - 모든 옵션을 한눈에 비교해야 할 때.
 *
 * ## When NOT to use
 * - 6개 이상 옵션 → [[Select]] 사용.
 * - 복수 선택 → [[Checkbox]] 사용.
 * - 토글(on/off 2개) → [[Switch]] 사용.
 *
 * ## Composition rules
 * - 색은 토큰만 (primary · border-strong · card) — 인라인 hex 금지.
 * - `name` prop으로 같은 화면의 다른 RadioGroup과 구분.
 * - `description`은 짧은 한 줄 보조 텍스트.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   items={[
 *     { value: "daily", label: "일별" },
 *     { value: "weekly", label: "주별" },
 *     { value: "monthly", label: "월별" },
 *   ]}
 *   value={period}
 *   onChange={setPeriod}
 * />
 * ```
 */
import { type ReactNode, useId, useState } from "react";

export type RadioGroupDirection = "vertical" | "horizontal";

export interface RadioGroupItem<V extends string = string> {
  value: V;
  /** 짧은 명사구. */
  label: ReactNode;
  /** 라벨 아래 보조 한 줄. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string = string> {
  items: RadioGroupItem<V>[];
  /** controlled 값. */
  value?: V;
  /** uncontrolled 초기값. */
  defaultValue?: V;
  onChange?: (value: V) => void;
  /** 가로/세로 배치. default vertical. */
  direction?: RadioGroupDirection;
  /** 묶음 전체 비활성. */
  disabled?: boolean;
  /** 접근성 라벨. */
  label?: string;
  name?: string;
  className?: string;
}

export default function RadioGroup<V extends string = string>({
  items,
  value: controlled,
  defaultValue,
  onChange,
  direction = "vertical",
  disabled,
  label,
  name,
  className,
}: RadioGroupProps<V>) {
  const autoName = useId();
  const groupName = name ?? autoName;
  const [internal, setInternal] = useState(defaultValue);
  const current = controlled ?? internal;

  const handleChange = (v: V) => {
    if (controlled === undefined) setInternal(v);
    onChange?.(v);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={className}
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "row" : "column",
        gap: direction === "horizontal" ? "var(--spacing-xl)" : "var(--spacing-md)",
      }}
    >
      {items.map((item) => {
        const checked = current === item.value;
        const isDisabled = disabled || item.disabled;
        return (
          <label
            key={item.value}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--spacing-md)",
              cursor: isDisabled ? "default" : "pointer",
              opacity: isDisabled ? 0.45 : 1,
            }}
          >
            <input
              type="radio"
              name={groupName}
              value={item.value}
              checked={checked}
              disabled={isDisabled}
              onChange={() => handleChange(item.value)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                marginTop: "1px",
                borderRadius: "50%",
                border: `2px solid ${checked ? "var(--color-primary)" : "var(--color-border-strong)"}`,
                background: "var(--color-card)",
                transition: "border-color 0.15s",
                flexShrink: 0,
              }}
            >
              {checked && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                  }}
                />
              )}
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2xs)" }}>
              <span className="text-base text-primary">{item.label}</span>
              {item.description && (
                <span className="text-sm text-tertiary">{item.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
