import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#242424] rounded-xl border border-[#3A3A3A]",
        hover && "hover:border-[#4A4A4A] transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardSection className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <div>
          <div className="text-white font-bold text-lg leading-none">{value}</div>
          <div className="text-[#6A6A6A] text-xs mt-0.5">{label}</div>
        </div>
      </CardSection>
    </Card>
  );
}
