import { useEffect, useState } from "react";
import Switch from "./Switch";

/**
 * ThemeToggle — Primitives. [[Switch]] 기반 라이트/다크 테마 토글 프리셋.
 *
 * ## Purpose
 * 해(light)/달(dark) 아이콘을 노브에 단 Switch. 토글 시 대상 엘리먼트에 `data-theme="dark|light"`
 * 를 세팅한다. **실제 색 전환은 다크 토큰 세트(`[data-theme=dark]`/`.dark`)가 담당** — 이 컴포넌트는
 * 속성 토글 + (옵션) localStorage 저장/복원만 책임. SSR 안전(마운트 후 적용).
 *
 * ## When to use
 * - 헤더/설정의 라이트·다크 테마 스위치.
 *
 * ## When NOT to use
 * - 일반 ON/OFF 토글 → [[Switch]] 직접 사용.
 * - 3개 이상 테마(시스템 포함) → 별도 SegmentedControl.
 *
 * ## Composition rules
 * - 색/치수는 [[Switch]] + tokens.css 토큰. 아이콘 색은 토큰(`--color-status-warning`/`--color-primary`).
 * - `applyTo` 로 `data-theme` 대상 지정(기본 `document.documentElement`). `null` 이면 속성 미세팅(소비자가 직접).
 * - controlled(`value`) / uncontrolled(`defaultValue`) 지원.
 *
 * @example
 * ```tsx
 * <ThemeToggle persistKey="wds-theme" />                 // documentElement 에 data-theme + localStorage
 * <ThemeToggle value={mode} onChange={setMode} size="sm" />
 * <ThemeToggle applyTo={null} onChange={applyMyself} />   // 속성 미세팅, 콜백만
 * ```
 */
export type ThemeMode = "light" | "dark";

export interface ThemeToggleProps {
  /** controlled 모드. */
  value?: ThemeMode;
  /** uncontrolled 초기값. default "light". */
  defaultValue?: ThemeMode;
  onChange?: (mode: ThemeMode) => void;
  /** [[Switch]] 크기. */
  size?: "sm" | "md";
  /** `data-theme` 적용 대상. "documentElement"(기본) | HTMLElement | null(미적용). */
  applyTo?: HTMLElement | "documentElement" | null;
  /** localStorage 키(옵션). 주면 저장·복원. */
  persistKey?: string;
  className?: string;
}

function SunIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 1.5v2.5M12 20v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M1.5 12h2.5M20 12h2.5M4.2 19.8l1.8-1.8M18 6l1.8-1.8" />
    </svg>
  );
}
function MoonIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function ThemeToggle({
  value,
  defaultValue = "light",
  onChange,
  size = "md",
  applyTo = "documentElement",
  persistKey,
  className,
}: ThemeToggleProps) {
  const [internal, setInternal] = useState<ThemeMode>(defaultValue);
  const mode = value ?? internal;

  // 마운트 시 localStorage 복원 (uncontrolled 한정, SSR 안전 — client 에서만).
  useEffect(() => {
    if (!persistKey) return;
    try {
      const saved = localStorage.getItem(persistKey) as ThemeMode | null;
      if ((saved === "light" || saved === "dark") && value === undefined) setInternal(saved);
    } catch {
      /* localStorage 접근 불가 환경 무시 */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mode 변경 시 data-theme 세팅 + persist.
  useEffect(() => {
    const el = applyTo === "documentElement" ? document.documentElement : applyTo;
    if (el) el.setAttribute("data-theme", mode);
    if (persistKey) {
      try {
        localStorage.setItem(persistKey, mode);
      } catch {
        /* 무시 */
      }
    }
  }, [mode, applyTo, persistKey]);

  const set = (dark: boolean) => {
    const next: ThemeMode = dark ? "dark" : "light";
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const iconSize = size === "sm" ? 10 : 13;

  return (
    <Switch
      size={size}
      checked={mode === "dark"}
      onChange={set}
      aria-label="Toggle color theme"
      className={className}
      knobContent={
        <span
          style={{
            display: "inline-flex",
            color: mode === "dark" ? "var(--color-primary)" : "var(--color-status-warning)",
          }}
        >
          {mode === "dark" ? <MoonIcon s={iconSize} /> : <SunIcon s={iconSize} />}
        </span>
      }
    />
  );
}
