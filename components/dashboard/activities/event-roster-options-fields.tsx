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
  /** Na página do evento a coleta é controlada no passo 2 do fluxo */
  hideCollectionToggle?: boolean;
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
  hideCollectionToggle = false,
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
        description="Ativa vagas por função e permite coletar disponibilidade da equipe."
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

          {!hideCollectionToggle ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Coleta de disponibilidade
              </p>
              <EventOptionCard
                type="checkbox"
                checked={rosterOpen}
                onChange={onRosterOpenChange}
                title="Liberar para a equipe marcar disponibilidade"
                description="A equipe poderá informar se pode ou não servir."
                icon={CalendarCheck}
                disabled={disabled}
                compact
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
