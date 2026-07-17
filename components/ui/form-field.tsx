import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

const alertStyles = {
  error: "border-destructive/30 bg-destructive/10 text-foreground",
  success: "border-success/30 bg-success-subtle text-success-foreground",
  info: "border-border bg-muted/50 text-foreground",
} as const;

interface FormAlertProps {
  variant?: keyof typeof alertStyles;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormAlert({
  variant = "error",
  title,
  children,
  className,
}: FormAlertProps) {
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "flex gap-3 rounded-xl border px-3.5 py-3 text-sm",
        alertStyles[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <p className={cn(title && "mt-0.5", "text-[0.925rem] leading-relaxed")}>
          {children}
        </p>
      </div>
    </div>
  );
}

interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormMessage({ children, className, id }: FormMessageProps) {
  if (!children) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className={cn("text-xs text-destructive", className)}
    >
      {children}
    </p>
  );
}

interface FormHintProps {
  children: React.ReactNode;
  className?: string;
}

export function FormHint({ children, className }: FormHintProps) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const messageId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none text-foreground"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <FormMessage id={messageId}>{error}</FormMessage>
      ) : hint ? (
        <FormHint>{hint}</FormHint>
      ) : null}
    </div>
  );
}

export function fieldControlProps(error?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? undefined : undefined,
  } as const;
}
