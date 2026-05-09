import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow, format } from "date-fns";
import { CATEGORY_COLORS, CATEGORY_COLOR_DEFAULT } from "./constants";

/** Merge Tailwind class names safely (requires clsx) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Human-readable relative date: "3 hours ago" */
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Formatted absolute date: "May 8, 2026" */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMMM d, yyyy");
}

/** ISO date string for today: "2026-05-08" */
export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Clamp a string to N characters with ellipsis */
export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}

/** Return the brand color for a category, with a safe fallback */
export function categoryColor(category: string | null | undefined): string {
  if (!category) return CATEGORY_COLOR_DEFAULT;
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? CATEGORY_COLOR_DEFAULT;
}

/** Build inline style props for a category chip */
export function categoryChipStyle(category: string | null | undefined): React.CSSProperties {
  const color = categoryColor(category);
  return {
    color,
    borderColor: `${color}40`,
    backgroundColor: `${color}10`,
  };
}
