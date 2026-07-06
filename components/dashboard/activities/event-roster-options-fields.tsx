"use client";

import { CalendarCheck, ClipboardList } from "lucide-react";

import { EventOptionCard } from "@/components/dashboard/activities/event-option-card";
import { EventRosterSlotsEditor } from "@/components/dashboard/activities/event-roster-slots-editor";
import { cn } from "@/lib/utils";

interface EventRosterOptionsFieldsProps {
  usesRoster: boolean;
  rosterOpen: boolean;
  rosterRoles: string[];
  onUsesRosterChange: (value: boolean) => void;
  onRosterOpenChange: (value: boolean) => void;
  onRosterRolesChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function EventRosterOptionsFields({
  usesRoster,
  rosterOpen,
  rosterRoles,
  onUsesRosterChange,
  onRosterOpenChange,
  onRosterRolesChange,
  disabled,
  className,
}: EventRosterOptionsFieldsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <EventOptionCard
        type="checkbox"
        checked={usesRoster}
        onChange={(next) => {
          onUsesRosterChange(next);
          if (!next) {
            onRosterOpenChange(false);
            onRosterRolesChange([]);
          }
        }}
        title="Este evento usa escala"
        description="Ativa disponibilidade da equipe e montagem de escala nesta data (e nas ocorrências da série, se for recorrente)."
        icon={ClipboardList}
        disabled={disabled}
      />

      {usesRoster ? (
        <div className="ml-1 space-y-4 border-l-2 border-primary/20 pl-4 sm:pl-5">
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Funções na escala
            </p>
            <EventRosterSlotsEditor
              value={rosterRoles}
              onChange={onRosterRolesChange}
              disabled={disabled}
              embedded
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Coleta de disponibilidade
            </p>
            <EventOptionCard
              type="checkbox"
              checked={rosterOpen}
              onChange={onRosterOpenChange}
              title="Liberar para a equipe marcar disponibilidade"
              description="A equipe poderá informar se pode ou não servir. Você também pode abrir depois na aba Escalas."
              icon={CalendarCheck}
              disabled={disabled}
              compact
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
