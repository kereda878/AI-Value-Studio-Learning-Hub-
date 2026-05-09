import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
  icon?: React.ReactNode;
}

/** Color-aware category/tag badge. Pass a hex color and it derives the bg/border. */
export function Badge({ label, color, className, icon }: BadgeProps) {
  const style = color
    ? { color, borderColor: `${color}40`, backgroundColor: `${color}10` }
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
        !color && "text-[#A0A0A0] border-[#3A3A3A] bg-[#2E2E2E]",
        className
      )}
      style={style}
    >
      {icon}
      {label}
    </span>
  );
}

/** Plain tag chip — neutral styling */
export function Tag({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-block text-xs bg-[#2E2E2E] border border-[#3A3A3A] text-[#A0A0A0] px-2.5 py-1 rounded-lg", className)}>
      {label}
    </span>
  );
}
