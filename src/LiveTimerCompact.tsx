/**
 * LiveTimerCompact — LIVE/중지 타이머.
 *
 * ## Purpose
 * 라이브 모드: 현재 시각(YYYY-MM-DD HH:MM:SS) + polling progress + pause 버튼.
 * 중지 모드: 시작~종료 범위를 세그먼트 블록으로 표시. 각 블록 클릭 → DateTimePicker.
 * 중지 기본값 = 중지 시점(종료) + 5분 전(시작).
 *
 * ## When to use
 * - 옵션바에서 LIVE 현재 시각 + polling cycle 을 compact 하게 보여줄 때.
 * - 중지 후 시작~종료 범위를 편집해야 할 때.
 *
 * ## When NOT to use
 * - 기간 프리셋만 필요 → [[TimeRangeSelector]].
 * - 옵션바 전체 행 → [[OptionbarPage]].
 *
 * ## Composition rules
 * - 높이 36px, pause(좌) + timer(우) chained 보더.
 * - 라이브: 녹색 LIVE 배지 + 날짜·시각 세그먼트 + polling progress.
 * - 중지: 시작/종료 각각 세그먼트 블록. 클릭 → DateTimePicker 팝오버.
 * - 색은 토큰만 — 인라인 hex 금지.
 *
 * @example
 * ```tsx
 * <LiveTimerCompact paused={paused} onTogglePause={togglePause} />
 * <LiveTimerCompact paused onRangeChange={({ start, end }) => setRange({ start, end })} />
 * ```
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import DateTimePicker from "./DateTimePicker";

const pad = (n: number) => n.toString().padStart(2, "0");

/** 로컬 타임존 약어 (e.g., "KST", "JST", "UTC"). */
function getTimezoneAbbr() {
  const str = Intl.DateTimeFormat("en", { timeZoneName: "short" }).format(new Date());
  return str.split(" ").pop() ?? "UTC";
}

/** 주요 타임존 목록. */
const TIMEZONE_OPTIONS = [
  { label: "KST", offset: "+09:00", iana: "Asia/Seoul" },
  { label: "JST", offset: "+09:00", iana: "Asia/Tokyo" },
  { label: "CST", offset: "+08:00", iana: "Asia/Shanghai" },
  { label: "IST", offset: "+05:30", iana: "Asia/Kolkata" },
  { label: "CET", offset: "+01:00", iana: "Europe/Berlin" },
  { label: "GMT", offset: "+00:00", iana: "Europe/London" },
  { label: "UTC", offset: "+00:00", iana: "UTC" },
  { label: "EST", offset: "-05:00", iana: "America/New_York" },
  { label: "CST", offset: "-06:00", iana: "America/Chicago" },
  { label: "PST", offset: "-08:00", iana: "America/Los_Angeles" },
];

export type LiveTimerRange = { start: Date; end: Date };

/* ── 세그먼트 블록 ─────────────────────────────────────── */

function DateSegment({ date, label, active, onClick, tz, onTzSelect }: {
  date: Date; label: string; active: boolean; onClick: () => void; tz: string;
  onTzSelect?: (iana: string, label: string) => void;
}) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{
        display: "flex", alignItems: "center", gap: "var(--spacing-xs)",
        padding: "0 var(--spacing-md)", height: 28, cursor: "pointer",
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--color-primary-bg)" : "var(--color-surface-50)",
        border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border-default)",
        transition: "all 0.15s",
      }}
    >
      <span className="text-xs text-tertiary" style={{ fontFamily: "var(--font-family-korean)", whiteSpace: "nowrap" }}>{label}</span>
      {/* 날짜 */}
      <span style={{ display: "flex", alignItems: "center", gap: "1px", fontFamily: "var(--font-family-numeric)" }}>
        <Seg value={`${y}`} />
        <Sep />
        <Seg value={m} />
        <Sep />
        <Seg value={d} />
      </span>
      {/* 시각 */}
      <span style={{ display: "flex", alignItems: "center", gap: "1px", fontFamily: "var(--font-family-numeric)" }}>
        <Seg value={hh} bold />
        <Colon />
        <Seg value={mm} bold />
        <Colon />
        <Seg value={ss} bold />
      </span>
      {/* 타임존 */}
      <TzBadge tz={tz} onSelect={onTzSelect} />
    </div>
  );
}

function Seg({ value, bold }: { value: string; bold?: boolean }) {
  return (
    <span
      className="text-sm text-primary"
      style={{
        fontWeight: bold ? 700 : 500,
        letterSpacing: "-0.02em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </span>
  );
}

function Sep() {
  return <span className="text-xs text-disabled" style={{ margin: "0 0.5px" }}>-</span>;
}

function Colon() {
  return <span className="text-xs text-tertiary" style={{ margin: "0 0.5px" }}>:</span>;
}

function TzBadge({ tz, onSelect }: { tz: string; onSelect?: (iana: string, label: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); if (onSelect) setOpen(!open); }}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && onSelect) { e.preventDefault(); setOpen(!open); } }}
        className="text-xs cursor-pointer"
        style={{
          fontFamily: "var(--font-family-numeric)", fontWeight: 600,
          letterSpacing: "0.02em", whiteSpace: "nowrap",
          color: "var(--color-text-tertiary)",
          padding: "1px var(--spacing-xs)",
          borderRadius: "var(--radius-xs)",
          background: open ? "var(--color-surface-100)" : "transparent",
          transition: "background 0.1s",
        }}
        title="타임존 변경"
      >
        {tz}
      </span>
      {open && onSelect && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute", top: 20, right: 0, zIndex: 99,
              background: "var(--color-card)", border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-md)",
              padding: "var(--spacing-xs) 0", minWidth: 140,
            }}
          >
            {TIMEZONE_OPTIONS.map((opt) => (
              <div
                key={opt.iana}
                role="option"
                aria-selected={opt.label === tz}
                onClick={(e) => { e.stopPropagation(); onSelect(opt.iana, opt.label); setOpen(false); }}
                className="text-sm cursor-pointer"
                style={{
                  padding: "var(--spacing-xs) var(--spacing-md)",
                  display: "flex", justifyContent: "space-between", gap: "var(--spacing-lg)",
                  background: opt.label === tz ? "var(--color-primary-bg)" : "transparent",
                  color: opt.label === tz ? "var(--color-primary)" : "var(--color-text-primary)",
                  fontFamily: "var(--font-family-numeric)",
                  fontWeight: opt.label === tz ? 600 : 400,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = opt.label === tz ? "var(--color-primary-bg)" : "var(--color-surface-50)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = opt.label === tz ? "var(--color-primary-bg)" : "transparent"; }}
              >
                <span>{opt.label}</span>
                <span className="text-tertiary">{opt.offset}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </span>
  );
}

function LiveBadge() {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        height: 18, padding: "0 var(--spacing-sm)",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-status-success)",
        color: "#fff", // raw-color-ok: badge white text on status color
        fontSize: "var(--text-xs)", fontWeight: 700,
        fontFamily: "var(--font-family-numeric)",
        letterSpacing: "0.05em",
        lineHeight: 1,
      }}
    >
      LIVE
    </span>
  );
}

/* ── 메인 컴포넌트 ─────────────────────────────────────── */

export default function LiveTimerCompact({
  time,
  paused = false,
  onTogglePause,
  refreshIntervalMs = 5000,
  onOpenCalendar,
  durationLabel,
  showCalendar,
  onRangeChange,
  range,
  timezoneLabel,
  onTimezoneChange,
}: {
  time?: string;
  paused?: boolean;
  onTogglePause?: () => void;
  refreshIntervalMs?: number;
  onOpenCalendar?: () => void;
  durationLabel?: string;
  showCalendar?: boolean;
  onRangeChange?: (range: LiveTimerRange) => void;
  range?: LiveTimerRange;
  /** 타임존 IANA (e.g., "Asia/Seoul"). 미지정 시 로컬. */
  timezone?: string;
  /** 타임존 약어 표시 (e.g., "KST"). 미지정 시 자동 감지. */
  timezoneLabel?: string;
  onTimezoneChange?: (iana: string, label: string) => void;
}) {
  const calendarVisible = showCalendar ?? !durationLabel;
  const [now, setNow] = useState(() => new Date());
  const [progress, setProgress] = useState(0);
  const lastTickRef = useRef<number>(Date.now());

  // 중지 모드 범위
  const [internalRange, setInternalRange] = useState<LiveTimerRange>(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 5 * 60 * 1000);
    return { start, end };
  });

  const wasPausedRef = useRef(paused);
  useEffect(() => {
    if (paused && !wasPausedRef.current) {
      const end = new Date();
      const start = new Date(end.getTime() - 5 * 60 * 1000);
      setInternalRange({ start, end });
    }
    wasPausedRef.current = paused;
  }, [paused]);

  const currentRange = range ?? internalRange;
  const updateRange = (next: LiveTimerRange) => {
    setInternalRange(next);
    onRangeChange?.(next);
  };

  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(null);

  // LIVE tick
  useEffect(() => {
    if (paused) { lastTickRef.current = Date.now(); return; }
    const TICK_MS = 60;
    const id = setInterval(() => {
      const nowMs = Date.now();
      const delta = nowMs - lastTickRef.current;
      lastTickRef.current = nowMs;
      setNow(new Date());
      setProgress((p) => { const next = p + delta / refreshIntervalMs; return next >= 1 ? 0 : next; });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [paused, refreshIntervalMs]);

  const tz = timezoneLabel ?? getTimezoneAbbr();
  const handleTzSelect = onTimezoneChange ?? undefined;
  const borderColor = "var(--color-border-divider)";

  // LIVE 모드 날짜/시각 세그먼트
  const liveDate = time ? null : now;
  const liveTimeStr = time;

  return (
    <div className="flex shrink-0 items-center" style={{ position: "relative" }}>
      {/* ── Pause/Play 버튼 ─────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        onClick={onTogglePause}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTogglePause?.(); } }}
        aria-label={paused ? "재생" : "일시정지"}
        className="flex items-center justify-center bg-card cursor-pointer"
        style={{
          width: 36, height: 36,
          border: `1px solid ${borderColor}`, borderRight: "none",
          borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
        }}
      >
        {paused ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M5 3l11 6-11 6V3z" fill="var(--color-status-success)" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="4" y="2.5" width="3" height="13" rx="0.75" fill="var(--color-status-success)" />
            <rect x="11" y="2.5" width="3" height="13" rx="0.75" fill="var(--color-status-success)" />
          </svg>
        )}
      </div>

      {/* ── Timer 영역 ──────────────────────────── */}
      <div
        className="flex items-center bg-card relative overflow-hidden"
        style={{
          height: 36, padding: "0 var(--spacing-lg)",
          border: `1px solid ${borderColor}`,
          borderRadius: "0 var(--radius-md) var(--radius-md) 0",
          gap: "var(--spacing-md)",
        }}
      >
        {paused ? (
          /* ── 중지 모드: 시작 ~ 종료 세그먼트 ──── */
          <>
            <DateSegment
              date={currentRange.start}
              label="시작"
              active={pickerTarget === "start"}
              onClick={() => setPickerTarget(pickerTarget === "start" ? null : "start")}
              tz={tz}
              onTzSelect={handleTzSelect}
            />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M2 6h8M7 3l3 3-3 3" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <DateSegment
              date={currentRange.end}
              label="종료"
              active={pickerTarget === "end"}
              onClick={() => setPickerTarget(pickerTarget === "end" ? null : "end")}
              tz={tz}
              onTzSelect={handleTzSelect}
            />
          </>
        ) : (
          /* ── LIVE 모드 ────────────────────────── */
          <>
            {/* Progress fill */}
            <div
              className="absolute top-0 bottom-0 left-0 pointer-events-none"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: "var(--color-status-success)",
                opacity: 0.12,
                transition: "width 16ms linear",
              }}
            />
            <div className="flex items-center gap-6px relative">
              <LiveBadge />
              {liveDate ? (
                <span style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", fontFamily: "var(--font-family-numeric)" }}>
                  {/* 날짜 */}
                  <span style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                    <Seg value={`${liveDate.getFullYear()}`} />
                    <Sep />
                    <Seg value={pad(liveDate.getMonth() + 1)} />
                    <Sep />
                    <Seg value={pad(liveDate.getDate())} />
                  </span>
                  {/* 시각 */}
                  <span style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                    <Seg value={pad(liveDate.getHours())} bold />
                    <Colon />
                    <Seg value={pad(liveDate.getMinutes())} bold />
                    <Colon />
                    <Seg value={pad(liveDate.getSeconds())} bold />
                  </span>
                </span>
              ) : (
                <span
                  className="text-md font-bold text-primary leading-none tracking-metric whitespace-nowrap"
                  style={{ fontFamily: "var(--font-family-numeric)" }}
                >
                  {liveTimeStr}
                </span>
              )}
              <TzBadge tz={tz} onSelect={handleTzSelect} />
              {durationLabel && (
                <span
                  className="inline-flex items-center justify-center px-5px rounded-2px whitespace-nowrap shrink-0"
                  style={{
                    background: "var(--color-status-success)",
                    color: "#fff", // raw-color-ok: duration badge white text
                    height: 16,
                    fontFamily: "var(--font-family-numeric)",
                    fontSize: "var(--text-xs)", fontWeight: 700, lineHeight: 1,
                  }}
                >
                  {durationLabel}
                </span>
              )}
              {calendarVisible && (
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  className="shrink-0 cursor-pointer" onClick={onOpenCalendar} aria-hidden="true"
                >
                  <rect x="2.5" y="3" width="11" height="11" rx="1" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
                  <line x1="5.5" y1="2" x2="5.5" y2="4" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="10.5" y1="2" x2="10.5" y2="4" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="2.5" y1="6.5" x2="13.5" y2="6.5" stroke="var(--color-text-tertiary)" strokeWidth="1" />
                </svg>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── DateTimePicker 팝오버 ───────────────── */}
      {pickerTarget && (
        <>
          {/* backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setPickerTarget(null)}
          />
          <div style={{
            position: "absolute", top: 40,
            left: pickerTarget === "start" ? 36 : "auto",
            right: pickerTarget === "end" ? 0 : "auto",
            zIndex: 100,
          }}>
            <DateTimePicker
              value={pickerTarget === "start" ? currentRange.start : currentRange.end}
              onChange={(next) => {
                if (pickerTarget === "start") updateRange({ ...currentRange, start: next });
                else updateRange({ ...currentRange, end: next });
              }}
              onClose={() => setPickerTarget(null)}
            />
          </div>
        </>
      )}
    </div>
  );
}
