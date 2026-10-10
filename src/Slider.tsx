/**
 * Slider — Primitives layer.
 *
 * ## Purpose
 * 단축 슬라이더 입력. 연속(min/max/step) 또는 이산(stops) 두 모드 지원.
 * 네이티브 `<input type="range">` 기반 — 키보드·접근성 자동 지원.
 *
 * ## When to use
 * - 수치 범위 선택 (임계값, 볼륨, 비율 등).
 * - 이산 값 선택 (요금제 단계, 사전 정의된 값).
 *
 * ## When NOT to use
 * - 정확한 수치 입력 → [[TextField]] type="number" 사용.
 * - 날짜/시간 범위 → [[TimeRangeSelector]] 사용.
 *
 * ## Composition rules
 * - 트랙/썸 색은 토큰만 (primary · surface-200 · card) — 인라인 hex 금지.
 * - `stops` 모드: 값 간격 무관하게 등간격 마크 표시.
 * - `markLabel` 로 눈금 아래 라벨 커스텀.
 *
 * @example
 * ```tsx
 * <Slider min={0} max={100} value={volume} onChange={setVolume} />
 * <Slider stops={[0, 10_000, 50_000, 200_000]} value={limit} onChange={setLimit}
 *   markLabel={(v) => `${(v / 10000).toFixed(0)}만`} />
 * ```
 */
import { type InputHTMLAttributes, useState } from "react";
import type { ReactNode } from "react";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "size"> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** 이산 모드 — 크기순 배열. */
  stops?: readonly number[];
  /** 눈금 아래 라벨. */
  markLabel?: (value: number) => ReactNode;
  /** aria-valuetext. */
  valueText?: (value: number) => string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Slider({
  value: controlled,
  defaultValue,
  onChange,
  min: minProp = 0,
  max: maxProp = 100,
  step: stepProp = 1,
  stops,
  markLabel,
  valueText,
  label,
  disabled,
  className,
  ...rest
}: SliderProps) {
  const [internal, setInternal] = useState(defaultValue ?? minProp);
  const current = controlled ?? internal;

  // 이산 모드: index 기반 range
  const isDiscrete = !!stops && stops.length > 1;
  const min = isDiscrete ? 0 : minProp;
  const max = isDiscrete ? stops!.length - 1 : maxProp;
  const step = isDiscrete ? 1 : stepProp;
  const toValue = (idx: number) => (isDiscrete ? stops![idx] : idx);
  const toIndex = (val: number) => (isDiscrete ? stops!.indexOf(val) : val);

  const rangeValue = isDiscrete ? toIndex(current) : current;
  const fillPct = max > min ? ((rangeValue - min) / (max - min)) * 100 : 0;

  const marks = isDiscrete ? stops! : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const val = toValue(raw);
    if (controlled === undefined) setInternal(val);
    onChange?.(val);
  };

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)", opacity: disabled ? 0.45 : 1 }}>
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        {/* Track background */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 4, borderRadius: "var(--radius-xs)",
          background: "var(--color-surface-200)",
        }} />
        {/* Track fill */}
        <div style={{
          position: "absolute", left: 0, height: 4, borderRadius: "var(--radius-xs)",
          width: `${fillPct}%`, background: "var(--color-primary)",
        }} />
        {/* Native range */}
        <input
          {...rest}
          type="range"
          min={min}
          max={max}
          step={step}
          value={rangeValue}
          onChange={handleChange}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={valueText ? valueText(current) : undefined}
          style={{
            position: "absolute", width: "100%", height: 20,
            margin: 0, opacity: 0, cursor: disabled ? "default" : "pointer", zIndex: 1,
          }}
        />
        {/* Thumb visual */}
        <div style={{
          position: "absolute",
          left: `calc(${fillPct}% - 8px)`,
          width: 16, height: 16, borderRadius: "50%",
          background: "var(--color-card)",
          border: "2px solid var(--color-primary)",
          boxShadow: "var(--shadow-sm)",
          pointerEvents: "none",
        }} />
      </div>
      {/* Marks */}
      {marks.length > 0 && markLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 6px" }}>
          {marks.map((v, i) => (
            <span key={v} className="text-xs text-tertiary" style={{ fontFamily: "var(--font-family-numeric)" }}>
              {markLabel(v)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
