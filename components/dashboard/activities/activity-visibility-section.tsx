"use client";

import { Eye, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { EventFormSection } from "@/components/dashboard/activities/event-form-section";
import { EventVisibilityFields } from "@/components/dashboard/activities/event-visibility-fields";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUpdateChurchEvent } from "@/lib/api/queries";
import { toastApiError } from "@/lib/ui/toast";
import { canCreateChurchWideActivity } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import type { ChurchEventDetail } from "@/types/events";

interface ActivityVisibilitySectionProps {
  event: ChurchEventDetail;
  /** Uma linha dentro do card do evento */
  inline?: boolean;
}

export function ActivityVisibilitySection({
  event,
  inline = false,
}: ActivityVisibilitySectionProps) {
  const { permissions } = useAuth();
  const canSelectChurchWide =
    permissions !== null && canCreateChurchWideActivity(permissions);
  const updateEvent = useUpdateChurchEvent(event.id);
  const [visibleToChurch, setVisibleToChurch] = useState(event.visibleToChurch);

  useEffect(() => {
    setVisibleToChurch(event.visibleToChurch);
  }, [event.id, event.visibleToChurch]);

  if (!canSelectChurchWide) {
    return null;
  }

  const dirty = visibleToChurch !== event.visibleToChurch;

  async function handleSave() {
    try {
      await updateEvent.mutateAsync({ visibleToChurch });
    } catch (saveError) {
      toastApiError(
        saveError,
        "Não foi possível salvar a visibilidade.",
      );
    }
  }

  if (inline) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="size-4 shrink-0" />
            <span>Quem vê na agenda</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <EventVisibilityFields
              layout="inline"
              visibleToChurch={visibleToChurch}
              onVisibleToChurchChange={setVisibleToChurch}
              allowChurchWideVisibility={canSelectChurchWide}
              disabled={updateEvent.isPending}
            />
            {dirty && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8"
                disabled={updateEvent.isPending}
                onClick={() => void handleSave()}
              >
                {updateEvent.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Salvando
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Eye className="size-4" />
          Visibilidade na agenda
        </CardTitle>
        <CardDescription>
          Onde este evento do ministério aparece para os membros.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EventFormSection
          title="Quem pode ver"
          description="Eventos só do ministério ficam na aba do ministério. Você pode exibir também na agenda geral."
          bare
        >
          <EventVisibilityFields
            visibleToChurch={visibleToChurch}
            onVisibleToChurchChange={setVisibleToChurch}
            allowChurchWideVisibility={canSelectChurchWide}
            disabled={updateEvent.isPending}
          />
        </EventFormSection>

        {dirty && (
          <Button
            type="button"
            size="sm"
            disabled={updateEvent.isPending}
            onClick={() => void handleSave()}
          >
            {updateEvent.isPending ? "Salvando..." : "Salvar visibilidade"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
