import { cn } from "@/lib/utils";

interface DashboardPlaceholderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function DashboardPlaceholder({
  title,
  description,
  children,
}: DashboardPlaceholderProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated",
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      {hint && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/90">
          {hint}
        </p>
      )}
    </div>
  );
}
