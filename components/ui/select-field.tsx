import { cn } from "@/lib/utils";

interface SelectFieldProps extends React.ComponentProps<"select"> {
  className?: string;
}

export function SelectField({ className, children, ...props }: SelectFieldProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-transparent focus-visible:bg-muted/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
