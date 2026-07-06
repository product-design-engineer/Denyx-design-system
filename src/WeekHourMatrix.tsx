/**
 * WeekHourMatrix — 요일(7) × 시간(24) 토글 매트릭스.
 *
 * ## Purpose
 * 7행(요일) × 24열(시간) boolean 격자를 토글 버튼으로 표현. 각 셀 ON/OFF 로
 * 해당 요일·시간대에 알림을 수신할지 설정. read-only / 편집 두 모드 지원.
 *
 * ## When to use
 * - 경고 알림 > 이벤트 수신 설정 > 요일·시간별 알림 설정
 * - 보고서 전송 시간대 등 "요일×시간" 빈도/스케줄 설정 화면
 *
 * ## When NOT to use
 * - 시계열 추이 그래프 → [[MiniLineChart]]
 * - 단일 시각 한 개 선택(시작 시각 등) → [[Select]] / [[TimeRangeSelector]]
 * - 자유 텍스트·숫자 입력 → [[TextField]]
 *
 * ## Composition rules
 * - `weekdays` 는 7×24 그리드 — `weekdays[d][h]` 가 행·열 인덱스. 행/열 라벨 정합을
 *   위해 grid 는 `gridTemplateColumns: "28px repeat(24, 1fr)"` 로 헤더·각 행이 동일 트랙.
 * - **시간 헤더는 6시간 간격(0/6/12/18)만** 표기 — 24개 라벨은 셀 폭보다 넓어 겹침.
 *   빈 칸도 `<span>` 으로 자리를 채워 24열 정렬을 보존.
 * - `onToggle` 미지정이면 read-only (버튼 disabled). 지정 시 셀 클릭으로 토글.
 * - 색은 ON `--color-primary`, OFF `--color-surface-100` 토큰 기반(테두리는 hex stub).
 * - 각 셀은 `aria-pressed` + 한국어 `aria-label`(요일·시·수신여부)로 접근성 제공.
 *
 * @example
 * ```tsx
 * <WeekHourMatrix
 *   caption="요일·시간별 알림 설정"
 *   weekdays={grid}
 *   onToggle={(d, h, next) => setCell(d, h, next)}
 * />
 * ```
 */

const DEFAULT_DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export type WeekHourMatrixProps = {
  /** 7 × 24 boolean 그리드. weekdays[d][h] = true 면 해당 시간대 알림 수신. */
  weekdays: boolean[][];
  /** 셀 토글 콜백. 미지정이면 read-only. */
  onToggle?: (day: number, hour: number, next: boolean) => void;
  /** 요일 라벨 (기본: 월~일) */
  dayLabels?: string[];
  /** 캡션 (위쪽 안내 라벨) */
  caption?: string;
};

export default function WeekHourMatrix({
  weekdays,
  onToggle,
  dayLabels = DEFAULT_DAY_LABELS,
  caption,
}: WeekHourMatrixProps) {
  const interactive = !!onToggle;

  return (
    <div className="flex flex-col gap-6px">
      {caption && (
        <span className="text-base font-bold text-primary tracking-default leading-normal">
          {caption}
        </span>
      )}

      {/* 시간 헤더 (6시간 간격) */}
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: "28px repeat(24, 1fr)", gap: "2px" }}
      >
        <span /> {/* 좌상단 빈 칸 */}
        {Array.from({ length: 24 }, (_, h) => (
          <span
            key={h}
            className="text-chart text-tertiary text-center leading-none tabular-nums"
          >
            {h % 6 === 0 ? String(h).padStart(2, "0") : ""}
          </span>
        ))}
      </div>

      {/* 7 행 × 24 열 */}
      {weekdays.map((row, d) => (
        <div
          key={d}
          className="grid items-center"
          style={{ gridTemplateColumns: "28px repeat(24, 1fr)", gap: "2px" }}
        >
          <span className="text-sm text-secondary font-medium leading-none">
            {dayLabels[d]}
          </span>
          {row.map((on, h) => (
            <button
              key={h}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onToggle!(d, h, !on)}
              className={`h-14px rounded-2px transition-colors ${
                interactive ? "cursor-pointer hover-brightness-95" : "cursor-default"
              }`}
              style={{
                background: on ? "var(--color-primary)" : "var(--color-surface-100)",
                border: on ? "1px solid #1f57c8" : "1px solid #e0e1e3",
              }}
              aria-label={`${dayLabels[d]} ${String(h).padStart(2, "0")}시 ${on ? "수신" : "미수신"}`}
              aria-pressed={on}
            />
          ))}
        </div>
      ))}

      {/* 범례 */}
      <div className="flex items-center gap-10px mt-4px">
        <span className="flex items-center gap-4px">
          <span className="inline-block w-12px h-10px rounded-2px" style={{ background: "var(--color-primary)", border: "1px solid #1f57c8" }} />
          <span className="text-xs text-secondary">수신</span>
        </span>
        <span className="flex items-center gap-4px">
          <span className="inline-block w-12px h-10px rounded-2px" style={{ background: "var(--color-surface-100)", border: "1px solid #e0e1e3" }} />
          <span className="text-xs text-secondary">미수신</span>
        </span>
      </div>
    </div>
  );
}
