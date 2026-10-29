/**
 * DateTimePicker — Primitives layer.
 *
 * ## Purpose
 * 날짜 + 시각을 함께 선택하는 팝오버. 월간 캘린더 그리드 + 시:분:초 입력.
 * LiveTimerCompact 중지 모드에서 시작/종료 시각 편집에 사용.
 *
 * ## When to use
 * - 날짜와 시각을 동시에 선택해야 할 때.
 * - LiveTimerCompact 의 paused 모드에서 범위 편집.
 *
 * ## When NOT to use
 * - 날짜만 선택 → 별도 DatePicker (추후).
 * - 기간 프리셋 (최근 1시간 등) → [[TimeRangeSelector]] 사용.
 *
 * ## Composition rules
 * - 색은 토큰만 — 인라인 hex 금지.
 * - 팝오버 위치는 호출측이 absolute 컨테이너로 제어.
 * - 오늘 날짜 = primary 강조. 선택 날짜 = primary 배경.
 *
 * @example
 * ```tsx
 * <DateTimePicker value={new Date()} onChange={setDate} onClose={() => setOpen(false)} />
 * ```
 */
import { useState, useMemo } from "react";

export type DateTimePickerProps = {
  value: Date;
  onChange: (next: Date) => void;
  onClose: () => void;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => n.toString().padStart(2, "0");

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = startDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });
  return cells;
}

export default function DateTimePicker({ value, onChange, onClose }: DateTimePickerProps) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const [hour, setHour] = useState(pad(value.getHours()));
  const [minute, setMinute] = useState(pad(value.getMinutes()));
  const [second, setSecond] = useState(pad(value.getSeconds()));

  const today = useMemo(() => new Date(), []);
  const cells = getCalendarDays(viewYear, viewMonth);

  const selectedDay = value.getFullYear() === viewYear && value.getMonth() === viewMonth ? value.getDate() : -1;
  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth ? today.getDate() : -1;

  const selectDay = (day: number, current: boolean) => {
    if (!current) return;
    const next = new Date(viewYear, viewMonth, day, parseInt(hour) || 0, parseInt(minute) || 0, parseInt(second) || 0);
    onChange(next);
  };

  const applyTime = () => {
    const next = new Date(value);
    next.setHours(parseInt(hour) || 0, parseInt(minute) || 0, parseInt(second) || 0);
    onChange(next);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const numStyle: React.CSSProperties = {
    width: 36, height: 28, textAlign: "center", border: "1px solid var(--color-border-default)",
    borderRadius: "var(--radius-sm)", background: "var(--color-card)", color: "var(--color-text-primary)",
    fontFamily: "var(--font-family-numeric)", fontSize: "var(--text-base)",
  };

  return (
    <div
      style={{
        background: "var(--color-card)", border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", padding: "var(--spacing-lg)",
        width: 280, display: "flex", flexDirection: "column", gap: "var(--spacing-md)",
        fontFamily: "var(--font-family-korean)", fontSize: "var(--text-sm)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: 월 네비게이션 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button type="button" onClick={prevMonth} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "var(--text-md)" }}>‹</button>
        <span className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-family-numeric)" }}>
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button type="button" onClick={nextMonth} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "var(--text-md)" }}>›</button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "var(--spacing-2xs)", textAlign: "center" }}>
        {DAYS.map((d) => (
          <span key={d} className="text-xs text-tertiary" style={{ padding: "var(--spacing-2xs) 0" }}>{d}</span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "var(--spacing-2xs)" }}>
        {cells.map((c, i) => {
          const isSelected = c.current && c.day === selectedDay;
          const isToday = c.current && c.day === todayDay;
          return (
            <button
              key={i}
              type="button"
              onClick={() => selectDay(c.day, c.current)}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "var(--radius-sm)", border: isToday && !isSelected ? "1px solid var(--color-primary)" : "1px solid transparent",
                background: isSelected ? "var(--color-primary)" : "transparent",
                color: isSelected ? "#fff" : c.current ? "var(--color-text-primary)" : "var(--color-text-disabled)", // raw-color-ok: selected day white text
                cursor: c.current ? "pointer" : "default",
                fontFamily: "var(--font-family-numeric)", fontSize: "var(--text-sm)", fontWeight: isSelected || isToday ? 600 : 400,
              }}
            >
              {c.day}
            </button>
          );
        })}
      </div>

      {/* 시:분:초 입력 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--spacing-xs)" }}>
        <input type="text" value={hour} onChange={(e) => setHour(e.target.value.replace(/\D/g, "").slice(0, 2))} onBlur={applyTime} style={numStyle} maxLength={2} aria-label="시" />
        <span className="text-base text-tertiary">:</span>
        <input type="text" value={minute} onChange={(e) => setMinute(e.target.value.replace(/\D/g, "").slice(0, 2))} onBlur={applyTime} style={numStyle} maxLength={2} aria-label="분" />
        <span className="text-base text-tertiary">:</span>
        <input type="text" value={second} onChange={(e) => setSecond(e.target.value.replace(/\D/g, "").slice(0, 2))} onBlur={applyTime} style={numStyle} maxLength={2} aria-label="초" />
      </div>

      {/* 하단 액션 */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-md)" }}>
        <button type="button" onClick={onClose} className="text-sm" style={{
          height: 28, padding: "0 var(--spacing-lg)", borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border-default)", background: "var(--color-card)",
          color: "var(--color-text-primary)", cursor: "pointer",
        }}>닫기</button>
      </div>
    </div>
  );
}
