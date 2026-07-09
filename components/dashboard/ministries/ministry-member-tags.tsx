import { formatRosterRole } from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";

const cargoBadgeClassName =
  "border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-300";
const functionBadgeClassName =
  "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300";

const cargoLabelClassName =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700/85 dark:text-sky-400/90";
const functionLabelClassName =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700/85 dark:text-violet-400/90";

function badgeBaseClassName(size: "sm" | "md") {
  return cn(
    "inline-flex items-center rounded-full border font-medium",
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
  );
}

export function MinistryCargoBadge({
  children,
  empty = false,
  size = "sm",
}: {
  children?: React.ReactNode;
  empty?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        badgeBaseClassName(size),
        cargoBadgeClassName,
        empty && "opacity-75",
      )}
    >
      {empty ? "Sem cargo" : children}
    </span>
  );
}

export function MinistryFunctionBadge({
  label,
  size = "sm",
}: {
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <span className={cn(badgeBaseClassName(size), functionBadgeClassName)}>
      {formatRosterRole(label)}
    </span>
  );
}

interface MemberMinistryTagsSummaryProps {
  roles: Array<{ id: string; name: string }>;
  instruments?: string[];
  /** Exibe funções mesmo quando vazio (não usado por padrão). */
  showEmptyFunctions?: boolean;
  className?: string;
}

export function MemberMinistryTagsSummary({
  roles,
  instruments = [],
  showEmptyFunctions = false,
  className,
}: MemberMinistryTagsSummaryProps) {
  const hasFunctions = instruments.length > 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <TagGroup label="Cargos" labelClassName={cargoLabelClassName}>
        {roles.length > 0 ? (
          roles.map((role) => (
            <MinistryCargoBadge key={role.id}>{role.name}</MinistryCargoBadge>
          ))
        ) : (
          <MinistryCargoBadge empty />
        )}
      </TagGroup>

      {(hasFunctions || showEmptyFunctions) && (
        <TagGroup label="Funções" labelClassName={functionLabelClassName}>
          {hasFunctions ? (
            instruments.map((instrument) => (
              <MinistryFunctionBadge key={instrument} label={instrument} />
            ))
          ) : (
            <span className="text-[11px] text-muted-foreground">
              Nenhuma função
            </span>
          )}
        </TagGroup>
      )}
    </div>
  );
}

function TagGroup({
  label,
  labelClassName,
  children,
}: {
  label: string;
  labelClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
      <span className={cn("w-14 shrink-0 pt-0.5", labelClassName)}>{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1">{children}</div>
    </div>
  );
}

export function MinistryTagSection({
  title,
  titleClassName,
  children,
  hint,
}: {
  title: string;
  titleClassName: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <section className="space-y-2">
      <p className={titleClassName}>{title}</p>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </section>
  );
}
