"use client";

import { Globe, Users } from "lucide-react";

import { EventOptionCard } from "@/components/dashboard/activities/event-option-card";
import { cn } from "@/lib/utils";

interface EventVisibilityFieldsProps {
  visibleToChurch: boolean;
  onVisibleToChurchChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const OPTIONS = [
  {
    value: true,
    title: "Exibir para a igreja inteira",
    description:
      "Aparece em Atividades e no painel para quem tem acesso à agenda.",
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

export function EventVisibilityFields({
  visibleToChurch,
  onVisibleToChurchChange,
  disabled,
  className,
}: EventVisibilityFieldsProps) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {OPTIONS.map((option) => (
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
