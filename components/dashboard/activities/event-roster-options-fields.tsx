"use client";

import { CalendarCheck, ClipboardList, MessageSquareText } from "lucide-react";

import { EventOptionCard } from "@/components/dashboard/activities/event-option-card";
import { EventRosterSlotsEditor } from "@/components/dashboard/activities/event-roster-slots-editor";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RosterSlotPlanItem } from "@/lib/ministries/roster";

interface EventRosterOptionsFieldsProps {
  usesRoster: boolean;
  rosterOpen: boolean;
  rosterSlotPlan: RosterSlotPlanItem[];
  availabilityMessage?: string;
  onUsesRosterChange: (value: boolean) => void;
  onRosterOpenChange: (value: boolean) => void;
  onRosterSlotPlanChange: (value: RosterSlotPlanItem[]) => void;
  onAvailabilityMessageChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  /** Na página do evento a coleta é controlada no passo 2 do fluxo */
  hideCollectionToggle?: boolean;
}

export function EventRosterOptionsFields({
  usesRoster,
  rosterOpen,
  rosterSlotPlan,
  availabilityMessage = "",
  onUsesRosterChange,
  onRosterOpenChange,
  onRosterSlotPlanChange,
  onAvailabilityMessageChange,
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
            onRosterSlotPlanChange([]);
            onAvailabilityMessageChange?.("");
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
              value={rosterSlotPlan}
              onChange={onRosterSlotPlanChange}
              disabled={disabled}
              embedded
            />
          </div>

          {onAvailabilityMessageChange ? (
            <div className="space-y-2">
              <Label
                htmlFor="event-availability-message"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <MessageSquareText className="size-3.5" />
                Mensagem para a equipe
              </Label>
              <Textarea
                id="event-availability-message"
                value={availabilityMessage}
                onChange={(event) =>
                  onAvailabilityMessageChange(event.target.value)
                }
                rows={3}
                maxLength={1000}
                disabled={disabled}
                className="min-h-[88px] resize-y rounded-xl"
                placeholder="Ex.: Cheguem 30 min antes para o ensaio. Tragam a partitura do hino 245."
              />
              <p className="text-xs text-muted-foreground">
                Aparece para quem for marcar disponibilidade neste evento.
              </p>
            </div>
          ) : null}

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
