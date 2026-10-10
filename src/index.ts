/**
 * Denyx Design System — root barrel.
 *
 * 3-tier hierarchy: Primitives → Composite → Shell.
 *
 * 사용:
 *   import { DashboardLayout, PageHeader, DenyxAiWidget, AiCard } from "@denyx/design-system";
 *
 * 위젯 전용 import만 쓰고 싶으면:
 *   import { AiCard, AiToneBadge } from "@denyx/design-system/widget";
 */

// ─── Primitives — 자립 렌더. DS 컴포넌트 import 없음 ─────────────────
//   General
export { default as ActionMenuItem } from "./ActionMenuItem";
export type { ActionMenuItemProps, ActionMenuItemTone } from "./ActionMenuItem";
export { default as Autocomplete } from "./Autocomplete";
export type { AutocompleteProps, AutocompleteOption, AutocompleteSize } from "./Autocomplete";
export { default as Breadcrumb } from "./Breadcrumb";
export type { BreadcrumbProps, BreadcrumbItem } from "./Breadcrumb";
export { default as Button } from "./Button";
export { default as CardHead } from "./CardHead";
export type { CardHeadProps, CardHeadTabs, CardHeadTab } from "./CardHead";
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonTone } from "./Button";
export { default as Checkbox } from "./Checkbox";
export { default as ConfirmDialog } from "./ConfirmDialog";
export type { ConfirmDialogProps, ConfirmDialogTone, ConfirmDialogOutcome } from "./ConfirmDialog";
export type { CheckboxProps, CheckboxSize } from "./Checkbox";
export { default as Chip } from "./Chip";
export type { ChipProps, ChipVariant, ChipTone, ChipSize } from "./Chip";
export { default as DataTable } from "./DataTable";
export type { DataTableColumn, DataTableProps } from "./DataTable";
export { default as Disclosure } from "./Disclosure";
export type { DisclosureProps, DisclosureSize } from "./Disclosure";
export { default as EmptyState } from "./EmptyState";
export type { EmptyStateProps, EmptyStateSize } from "./EmptyState";
export { default as ListRow } from "./ListRow";
export type { ListRowProps } from "./ListRow";
export { default as LiveTimerCompact } from "./LiveTimerCompact";
export { default as MiniLineChart } from "./MiniLineChart";
export { default as Modal } from "./Modal";
export type { ModalProps, ModalSize } from "./Modal";
export { default as Notice } from "./Notice";
export type { NoticeProps, NoticeTone, NoticeVariant } from "./Notice";
export { default as Pagination } from "./Pagination";
export type { PaginationProps } from "./Pagination";
export { default as RadioGroup } from "./RadioGroup";
export type { RadioGroupProps, RadioGroupItem, RadioGroupDirection } from "./RadioGroup";
export { default as Select } from "./Select";
export { default as Slider } from "./Slider";
export type { SliderProps } from "./Slider";
export type { SelectProps, SelectSize, SelectOption } from "./Select";
export { default as StatCard } from "./StatCard";
export type { StatCardProps, StatCardTone, StatCardTrend } from "./StatCard";
export { default as Switch } from "./Switch";
export type { SwitchProps, SwitchSize } from "./Switch";
export { default as Tabs } from "./Tabs";
export type { TabsProps, TabsVariant, TabsSize, TabsItem } from "./Tabs";
export { default as TextField } from "./TextField";
export type { TextFieldProps, TextFieldSize } from "./TextField";
export { default as ThemeToggle } from "./ThemeToggle";
export type { ThemeToggleProps, ThemeMode } from "./ThemeToggle";
export { default as TimeChip } from "./TimeChip";
export type { TimeChipProps, TimeChipTone } from "./TimeChip";
export { default as Toast } from "./Toast";
export type { ToastVariant } from "./Toast";
export { default as Tooltip } from "./Tooltip";
export type { TooltipProps, TooltipPlacement } from "./Tooltip";
//   Parts (Chrome)
export { default as AiSymbol } from "./AiSymbol";
export { default as BottomRailItem } from "./BottomRailItem";
export { default as DashboardBuildingProgress } from "./DashboardBuildingProgress";
export type { DashboardBuildingProgressProps } from "./DashboardBuildingProgress";
export { default as DataTableRow } from "./DataTableRow";
export { default as DateTimeBlock } from "./DateTimeBlock";
export type { DateParts } from "./DateTimeBlock";
export { default as WeekHourMatrix } from "./WeekHourMatrix";
export type { WeekHourMatrixProps } from "./WeekHourMatrix";
export { default as FilterChipItem } from "./FilterChipItem";
export { default as FilterDropdownOptionItem } from "./FilterDropdownOptionItem";
export { default as HeaderPillButton } from "./HeaderPillButton";
export { IcDocs, IcSupport } from "./icons/HeaderIcons";
export { default as OptionbarInstanceSelector } from "./OptionbarInstanceSelector";
export type { InstanceStatus } from "./OptionbarInstanceSelector";
export { default as OptionbarItem } from "./OptionbarItem";
export { default as OptionbarValueDisplay } from "./OptionbarValueDisplay";
export { default as PageHeaderNotificationItem } from "./PageHeaderNotificationItem";
export { default as PageHeaderProfileMenuItem } from "./PageHeaderProfileMenuItem";
export { default as PresetSelect } from "./PresetSelect";
export { default as ProductRailItem } from "./ProductRailItem";
export { default as SidebarCopyright } from "./SidebarCopyright";
export { default as SidebarLogoHeader } from "./SidebarLogoHeader";
export { default as SidebarMenuItem } from "./SidebarMenuItem";
export { default as SidebarOrgSwitcher } from "./SidebarOrgSwitcher";
export { default as SidebarProjectSwitcher } from "./SidebarProjectSwitcher";
export { default as Stage } from "./Stage";
export { default as SubHeaderBar } from "./SubHeaderBar";
export type { SubHeaderBarProps } from "./SubHeaderBar";
export { default as TabButton } from "./TabButton";
export { default as TimeRangeSelector } from "./TimeRangeSelector";
//   Parts (AI)
export { default as AiQuickActionChip } from "./AiQuickActionChip";
export { default as AiActionChip } from "./widget/AiActionChip";
export { default as AiAttachmentChip } from "./widget/AiAttachmentChip";
export { default as AiToneRow } from "./widget/AiToneRow";
export { default as AiOptionButton } from "./widget/AiOptionButton";
export { default as AiSeverityRow } from "./widget/AiSeverityRow";
export { default as ReasoningStep } from "./widget/ReasoningStep";
export { default as TimelineStepItem } from "./widget/TimelineStepItem";

// ─── Composite — Primitives 를 1단계 조합. Composite 끼리 import 금지 ──
//   Chrome
export { default as FilterBar } from "./FilterBar";
export type { FilterBarProps, FilterBarDropdownConfig, FilterBarSize } from "./FilterBar";
export { default as FilterChip } from "./FilterChip";
export type { FilterChipProps } from "./FilterChip";
export { default as FilterDropdown } from "./FilterDropdown";
export type {
  FilterDropdownProps,
  FilterDropdownOption,
  FilterDropdownPlacement,
} from "./FilterDropdown";
export { default as PageHeader } from "./PageHeader";
export type { ProfileMenuItem, NotificationItem } from "./PageHeader";
export { default as PageHeaderAiInline } from "./PageHeaderAiInline";
export type { PageHeaderAiInlineProps } from "./PageHeaderAiInline";
export { default as Sidebar } from "./Sidebar";
export type { MenuItem, ProjectContext, OrgContext } from "./Sidebar";

// ─── Shell — 모든 계층 조합. 앱 진입점 ────────────────────────────────
export { default as DashboardLayout } from "./DashboardLayout";
export { default as DenyxAiWidget } from "./DenyxAiWidget";
export { default as AiWidget } from "./AiWidget";
export { DenyxAiProvider, useDenyxAi } from "./DenyxAiContext";
export type { LastPrompt } from "./DenyxAiContext";
export type { WidgetAction } from "./DenyxAiWidget";

// Policy
export { default as DsReadOnlyNotice } from "./DsReadOnlyNotice";
export type { DsReadOnlyNoticeProps } from "./DsReadOnlyNotice";

// Icons
export { default as SettingsIcon } from "./icons/SettingsIcon";

// Widget tokens / primitives / message cards
export * from "./widget";
