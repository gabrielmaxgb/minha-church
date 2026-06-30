import { cn } from "@/lib/utils";

interface SelectFieldProps extends React.ComponentProps<"select"> {
  className?: string;
}

export function SelectField({ className, children, ...props }: SelectFieldProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
