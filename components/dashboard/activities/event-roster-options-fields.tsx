"use client";

import { CalendarCheck, ClipboardList } from "lucide-react";

import { EventOptionCard } from "@/components/dashboard/activities/event-option-card";
import { EventRosterSlotsEditor } from "@/components/dashboard/activities/event-roster-slots-editor";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RosterSlotPlanItem } from "@/lib/ministries/roster";

export type CollectionScope = "this" | "all_future";

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
  hideCollectionToggle?: boolean;
  /** Eventos de ministério usam o catálogo do ministério, não slots por evento. */
  hideSlotPlan?: boolean;
  isRecurring?: boolean;
  collectionScope?: CollectionScope;
  onCollectionScopeChange?: (scope: CollectionScope) => void;
  collectionBusy?: boolean;
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
  hideSlotPlan = false,
  isRecurring = false,
  collectionScope = "this",
  onCollectionScopeChange,
  collectionBusy = false,
}: EventRosterOptionsFieldsProps) {
  const fieldsDisabled = disabled || collectionBusy;

  return (
    <div className={cn("space-y-4", className)}>
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
        title="Montar escalas"
        description="Defina quem serve em cada função."
        icon={ClipboardList}
        disabled={fieldsDisabled}
        compact
      />

      {usesRoster ? (
        <div className="space-y-4">
          {!hideSlotPlan ? (
            <EventRosterSlotsEditor
              value={rosterSlotPlan}
              onChange={onRosterSlotPlanChange}
              disabled={fieldsDisabled}
              embedded
            />
          ) : null}

          {onAvailabilityMessageChange ? (
            <details className="group rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
              <summary className="cursor-pointer text-sm text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">+ Mensagem para a equipe (opcional)</span>
                <span className="hidden group-open:inline">Mensagem para a equipe</span>
              </summary>
              <Textarea
                id="event-availability-message"
                value={availabilityMessage}
                onChange={(event) =>
                  onAvailabilityMessageChange(event.target.value)
                }
                rows={2}
                maxLength={1000}
                disabled={fieldsDisabled}
                className="mt-2 min-h-[72px] resize-y rounded-lg text-sm"
                placeholder="Ex.: Cheguem 30 min antes para o ensaio."
              />
            </details>
          ) : null}

          {!hideCollectionToggle ? (
            <div className="space-y-2">
              <EventOptionCard
                type="checkbox"
                checked={rosterOpen}
                onChange={onRosterOpenChange}
                title="Equipe pode marcar disponibilidade"
                description="A equipe informa se pode ou não servir."
                icon={CalendarCheck}
                disabled={fieldsDisabled}
                compact
              />

              {isRecurring && onCollectionScopeChange ? (
                <div className="flex flex-wrap gap-4 pl-1 text-sm">
                  <Label className="inline-flex cursor-pointer items-center gap-2 font-normal">
                    <input
                      type="radio"
                      name="collection-scope"
                      className="size-4 accent-primary"
                      checked={collectionScope === "this"}
                      disabled={fieldsDisabled}
                      onChange={() => onCollectionScopeChange("this")}
                    />
                    Nesta data
                  </Label>
                  <Label className="inline-flex cursor-pointer items-center gap-2 font-normal">
                    <input
                      type="radio"
                      name="collection-scope"
                      className="size-4 accent-primary"
                      checked={collectionScope === "all_future"}
                      disabled={fieldsDisabled}
                      onChange={() => onCollectionScopeChange("all_future")}
                    />
                    Todas as datas futuras
                  </Label>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
