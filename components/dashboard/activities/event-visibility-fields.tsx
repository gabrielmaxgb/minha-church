"use client";

import { Globe, Users } from "lucide-react";

import { EventOptionCard } from "@/components/dashboard/activities/event-option-card";
import { cn } from "@/lib/utils";

interface EventVisibilityFieldsProps {
  visibleToChurch: boolean;
  onVisibleToChurchChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  /** cards = formulários; inline = seletor compacto na página do evento */
  layout?: "cards" | "inline";
  /**
   * Quem não tem `events_create_church_wide` não pode exibir o evento
   * na agenda geral da igreja — a opção some da seleção.
   */
  allowChurchWideVisibility?: boolean;
}

const CARD_OPTIONS = [
  {
    value: true,
    title: "Exibir para a igreja inteira",
    description:
      "Aparece em Eventos e Atividades e no painel para quem tem acesso à agenda.",
    icon: Globe,
  },
  {
    value: false,
    title: "Somente membros do ministério",
    description:
      "Visível na aba do ministério e para a equipe. Admins e donos continuam vendo tudo.",
    icon: Users,
  },
] as const;

const INLINE_OPTIONS = [
  { value: true, label: "Igreja inteira", icon: Globe },
  { value: false, label: "Só ministério", icon: Users },
] as const;

export function EventVisibilityFields({
  visibleToChurch,
  onVisibleToChurchChange,
  disabled,
  className,
  layout = "cards",
  allowChurchWideVisibility = true,
}: EventVisibilityFieldsProps) {
  // Sem permissão church-wide, a única opção possível é "só ministério" —
  // não há seleção a oferecer (o caller esconde a seção inteira).
  if (!allowChurchWideVisibility) {
    return null;
  }

  if (layout === "inline") {
    return (
      <div
        className={cn(
          "inline-flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/30 p-1",
          className,
        )}
        role="radiogroup"
        aria-label="Visibilidade na agenda"
      >
        {INLINE_OPTIONS.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={visibleToChurch === option.value}
            disabled={disabled}
            onClick={() => onVisibleToChurchChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              visibleToChurch === option.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <option.icon className="size-3.5 shrink-0" aria-hidden />
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {CARD_OPTIONS.map((option) => (
        <EventOptionCard
          key={String(option.value)}
          type="radio"
          name="event-visibility"
          checked={visibleToChurch === option.value}
          onChange={() => onVisibleToChurchChange(option.value)}
          title={option.title}
          description={option.description}
          icon={option.icon}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
