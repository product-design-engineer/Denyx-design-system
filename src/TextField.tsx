/**
 * TextField — Primitives layer.
 *
 * ## Purpose
 * 폼 입력 minimal building block. 룰 편집기·카탈로그 검색·임계값 input·이름 입력 등 전반.
 * 인라인 `<input>` 새로 짜지 말 것 — 색·간격·상태 일관성은 이 컴포넌트가 보장.
 *
 * ## When to use
 * - 텍스트 입력 (룰 이름, 검색어, scope 표현)
 * - 숫자 입력 (임계값, 지속 시간)
 * - 검색 (좌측 검색 아이콘 + 입력, FilterBar 내부)
 *
 * ## When NOT to use
 * - AI 위젯 사용자 입력 (대화) → `AiPromptInput` (multiline, send 버튼 통합)
 * - 단위 선택이 끝 → `Select`
 * - 여러 줄 본문 → `Textarea` (추후 추가, multiline=true 옵션으로 검토)
 *
 * ## Composition rules
 * - 색·테두리는 토큰 (border-default · brand-blue focus · status-error invalid)
 * - 사이즈 sm(24px) / md(28px) / lg(32px) — 다른 form primitives 와 정렬
 * - 좌/우 슬롯(아이콘, 단위) — leadingIcon / trailingNode
 * - helper / error 메시지 — helperText + invalid
 * - controlled 우선 (value + onChange). uncontrolled 도 지원 (defaultValue)
 *
 * @example
 * ```tsx
 * <TextField label="룰 이름" placeholder="disk-usage-95-prod-var-log" />
 * <TextField
 *   label="임계값"
 *   type="number"
 *   value={threshold}
 *   onChange={setThreshold}
 *   trailingNode={<span className="text-sm text-tertiary">%</span>}
 * />
 * <TextField
 *   placeholder="제목, 메시지, 프로젝트, 에이전트"
 *   leadingIcon={<SearchIcon />}
 *   size="sm"
 * />
 * <TextField label="이메일" invalid helperText="유효한 이메일이 아닙니다" />
 * ```
 */
import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export type TextFieldSize = "sm" | "md" | "lg";

export type TextFieldProps = {
  /** 상단 라벨. 미입력 시 라벨 영역 생략. */
  label?: ReactNode;
  /**
   * 사이즈 — sm=24px / md=28px / **lg=32px (default)**.
   *
   * 페이지 헤더의 FilterBar 검색 input 이 가장 흔한 사용처라 lg 가 default.
   * Modal 안의 dense form 필드라면 `size="md"` 를 명시.
   */
  size?: TextFieldSize;
  /** 좌측 슬롯 — 검색 아이콘 등 작은 ReactNode. */
  leadingIcon?: ReactNode;
  /** 우측 슬롯 — 단위·아이콘 등. clearable 과 공존 시 [× clear] [trailingNode] 순서. */
  trailingNode?: ReactNode;
  /** 에러 상태 — 보더·focus 색이 critical 로 전환. */
  invalid?: boolean;
  /** 하단 helper/error 텍스트. invalid=true 면 critical 색. */
  helperText?: ReactNode;
  /** 전체 폭 채우기 — 컨테이너 폭 = 100%. */
  fullWidth?: boolean;
  /** controlled value. */
  value?: string;
  /** controlled change — string 그대로. */
  onChange?: (next: string) => void;
  /**
   * value 있을 때 우측 × 버튼 표시 → 클릭 시 onChange("") + onClear 호출.
   * trailingNode 와 공존 가능 ([× clear] [trailingNode] 순서).
   * disabled 시 자동 비활성.
   */
  clearable?: boolean;
  /** clear 클릭 콜백 (선택). onChange("") 외 추가 동작 필요할 때. */
  onClear?: () => void;
  /** 외부 className — outer wrapper. */
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "onChange">;

const SIZE = {
  sm: { h: 24, padX: 8, gap: 6, text: "text-sm" },
  md: { h: 28, padX: 10, gap: 8, text: "text-base" },
  lg: { h: 32, padX: 12, gap: 8, text: "text-md" },
} as const;

const CLEAR_ICON_SIZE: Record<TextFieldSize, number> = { sm: 10, md: 12, lg: 12 };

export default function TextField({
  label,
  size = "lg",
  leadingIcon,
  trailingNode,
  invalid = false,
  helperText,
  fullWidth = false,
  value,
  onChange,
  clearable = false,
  onClear,
  className = "",
  disabled,
  id,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const spec = SIZE[size];
  const helperId = helperText ? `${inputId}-helper` : undefined;

  const borderColor = disabled
    ? "var(--color-border-default)"
    : invalid
    ? "var(--color-status-error)"
    : "var(--color-border-strong)";
  const focusBorder = invalid ? "var(--color-status-error)" : "var(--color-primary)";

  return (
    <div
      className={`inline-flex flex-col gap-1_5 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {label !== undefined && label !== null && (
        <label
          htmlFor={inputId}
          className={`${spec.text} font-medium ${disabled ? "text-tertiary" : "text-primary"}`}
        >
          {label}
        </label>
      )}
      <div
        className={`relative inline-flex items-center rounded-md bg-card transition-colors`}
        style={{
          height: spec.h,
          paddingInline: spec.padX,
          gap: spec.gap,
          border: `1px solid ${borderColor}`,
          opacity: disabled ? 0.6 : 1,
        }}
        data-tf-focus-border={focusBorder}
      >
        {leadingIcon !== undefined && leadingIcon !== null && (
          <span className="inline-flex shrink-0 items-center text-tertiary" aria-hidden>
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helperId}
          className={`min-w-0 flex-1 border-0 bg-transparent p-0 outline-none ${spec.text} text-primary placeholder:text-tertiary`}
          {...rest}
        />
        {clearable && !disabled && value !== undefined && value !== "" && (
          <button
            type="button"
            aria-label="입력 지우기"
            onMouseDown={(e) => e.preventDefault()} // input blur 방지
            onClick={() => {
              onChange?.("");
              onClear?.();
            }}
            // subtle 톤 — 보조 액션이라 약함. hover 시에만 색 진해짐, 배경 변화 없음.
            className="inline-flex shrink-0 cursor-pointer items-center justify-center text-color-var-color-text-disabled transition-colors hover-text-color-var-color-text-secondary"
            style={{
              width: CLEAR_ICON_SIZE[size] + 4,
              height: CLEAR_ICON_SIZE[size] + 4,
              padding: 0,
              border: 0,
              backgroundColor: "transparent",
            }}
          >
            <svg
              viewBox="0 0 10 10"
              width={CLEAR_ICON_SIZE[size]}
              height={CLEAR_ICON_SIZE[size]}
              aria-hidden
            >
              <path
                d="M2 2 L8 8 M8 2 L2 8"
                stroke="currentColor"
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        {trailingNode !== undefined && trailingNode !== null && (
          <span className="inline-flex shrink-0 items-center text-tertiary">{trailingNode}</span>
        )}
      </div>
      {helperText && (
        <span
          id={helperId}
          className={`${size === "sm" ? "text-xs" : "text-sm"} ${
            invalid ? "text-color-var-color-status-error" : "text-tertiary"
          }`}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
