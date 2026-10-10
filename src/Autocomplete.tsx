/**
 * Autocomplete — Primitives layer.
 *
 * ## Purpose
 * 대량 옵션에서 타이핑으로 좁혀 선택하는 자동완성 입력.
 * 네이티브 TextField + 드롭다운 리스트 조합.
 *
 * ## When to use
 * - 옵션이 20개 이상이라 드롭다운으로 보기 어려울 때.
 * - 사용자가 검색어를 입력하여 옵션을 필터링해야 할 때.
 *
 * ## When NOT to use
 * - 5개 이하 고정 옵션 → [[Select]] 사용.
 * - 자유 텍스트 입력 (옵션 없음) → [[TextField]] 사용.
 * - 복수 선택 → [[FilterDropdown]] 사용.
 *
 * ## Composition rules
 * - 색은 토큰만 (card · border-default · shadow-md · primary-bg) — 인라인 hex 금지.
 * - 컴포넌트는 선택을 기억하지 않음 — 호출측이 `onSelect`에서 결정.
 * - `filter` prop false 로 서버 사이드 필터링 가능.
 *
 * @example
 * ```tsx
 * <Autocomplete
 *   value={query}
 *   onChange={setQuery}
 *   options={users}
 *   onSelect={(opt) => setSelectedUser(opt.value)}
 *   placeholder="이름 또는 이메일 검색"
 * />
 * ```
 */
import { useState, useRef, useEffect, type ReactNode } from "react";

export type AutocompleteOption = {
  value: string;
  /** 첫 줄. */
  label: string;
  /** 둘째 줄 (이메일·조직 등). */
  description?: string;
  disabled?: boolean;
};

export type AutocompleteSize = "sm" | "md" | "lg";

export type AutocompleteProps = {
  label?: ReactNode;
  /** controlled 입력 값. */
  value: string;
  onChange: (next: string) => void;
  options: AutocompleteOption[];
  onSelect: (option: AutocompleteOption) => void;
  size?: AutocompleteSize;
  placeholder?: string;
  /** 결과 없을 때 텍스트. */
  emptyText?: string;
  /** 드롭다운 최대 높이. */
  maxListHeight?: number;
  /** false 면 자체 필터 안 함 (서버 필터). */
  filter?: false | ((option: AutocompleteOption, query: string) => boolean);
  openOnFocus?: boolean;
  disabled?: boolean;
  className?: string;
};

const HEIGHTS: Record<AutocompleteSize, number> = { sm: 24, md: 28, lg: 32 };

export default function Autocomplete({
  label,
  value,
  onChange,
  options,
  onSelect,
  size = "md",
  placeholder,
  emptyText = "결과가 없습니다",
  maxListHeight = 268,
  filter,
  openOnFocus = true,
  disabled,
  className,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = filter === false
    ? options
    : options.filter((o) =>
        filter
          ? filter(o, value)
          : o.label.toLowerCase().includes(value.toLowerCase()) ||
            (o.description?.toLowerCase().includes(value.toLowerCase()) ?? false),
      );

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const select = (opt: AutocompleteOption) => {
    if (opt.disabled) return;
    onSelect(opt);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === "ArrowDown") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setFocusIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && focusIdx >= 0 && filtered[focusIdx]) { e.preventDefault(); select(filtered[focusIdx]); }
    else if (e.key === "Escape") setOpen(false);
  };

  const h = HEIGHTS[size];

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
      {label && <span className="text-sm text-secondary">{label}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setFocusIdx(-1); }}
        onFocus={() => openOnFocus && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          height: h,
          padding: "0 8px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border-default)",
          background: "var(--color-card)",
          color: "var(--color-text-primary)",
          fontSize: "var(--text-base)",
          outline: "none",
        }}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <div
          ref={listRef}
          role="listbox"
          style={{
            position: "absolute",
            top: h + (label ? 22 : 0) + 4,
            left: 0,
            right: 0,
            maxHeight: maxListHeight,
            overflowY: "auto",
            background: "var(--color-card)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-md)",
            zIndex: 50,
          }}
        >
          {filtered.length === 0 ? (
            <div className="text-base text-tertiary" style={{ padding: "8px 12px" }}>{emptyText}</div>
          ) : (
            filtered.map((opt, i) => (
              <div
                key={opt.value}
                role="option"
                aria-selected={i === focusIdx}
                onClick={() => select(opt)}
                style={{
                  padding: "6px 12px",
                  cursor: opt.disabled ? "default" : "pointer",
                  opacity: opt.disabled ? 0.45 : 1,
                  background: i === focusIdx ? "var(--color-primary-bg)" : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={() => setFocusIdx(i)}
              >
                <div className="text-base text-primary">{opt.label}</div>
                {opt.description && <div className="text-sm text-tertiary">{opt.description}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
