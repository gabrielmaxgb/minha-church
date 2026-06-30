"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SettingsSectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function SettingsPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/70",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SettingsSplitLayout({
  sidebar,
  children,
  minHeight = "min-h-112",
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  minHeight?: string;
}) {
  return (
    <div className={cn("flex", minHeight)}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function SettingsSidebar({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <aside className="flex w-44 shrink-0 flex-col border-r border-border/70 bg-muted/20 sm:w-56">
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">{children}</div>
      {footer && <div className="border-t border-border/70 p-2">{footer}</div>}
    </aside>
  );
}

export function SettingsSidebarItem({
  label,
  selected,
  dirty,
  onClick,
  hint,
}: {
  label: string;
  selected: boolean;
  dirty?: boolean;
  onClick: () => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition-colors",
        selected
          ? "bg-background font-medium text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        <span className="truncate">{label}</span>
        {dirty && (
          <span
            className="ml-auto size-1.5 shrink-0 rounded-full bg-amber-500"
            aria-label="Alterações não salvas"
          />
        )}
      </span>
      {hint && (
        <span className="mt-0.5 truncate text-xs font-normal opacity-70">
          {hint}
        </span>
      )}
    </button>
  );
}

export function SettingsToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-lg px-1 py-2.5 text-left transition-colors",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-muted/50",
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-foreground" : "bg-muted-foreground/25",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-background shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function SettingsSaveBar({
  visible,
  saving,
  onDiscard,
  onSave,
}: {
  visible: boolean;
  saving?: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/70 bg-muted/30 px-5 py-3">
      <p className="text-sm text-muted-foreground">
        Você tem alterações não salvas!
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={saving}
          onClick={onDiscard}
        >
          Descartar
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Salvando
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </div>
  );
}

export function SettingsEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function SettingsAlert({
  message,
}: {
  message: string;
}) {
  return (
    <div
      role="alert"
      className="mb-4 rounded-lg bg-muted/60 px-3 py-2.5 text-sm"
    >
      {message}
    </div>
  );
}

export function SettingsDetailHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
