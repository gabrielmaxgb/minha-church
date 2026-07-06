"use client";

import { Eye } from "lucide-react";
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
import type { ChurchEventDetail } from "@/types/events";

interface ActivityVisibilitySectionProps {
  event: ChurchEventDetail;
}

export function ActivityVisibilitySection({ event }: ActivityVisibilitySectionProps) {
  const updateEvent = useUpdateChurchEvent(event.id);
  const [visibleToChurch, setVisibleToChurch] = useState(event.visibleToChurch);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVisibleToChurch(event.visibleToChurch);
    setError(null);
  }, [event.id, event.visibleToChurch]);

  const dirty = visibleToChurch !== event.visibleToChurch;

  async function handleSave() {
    setError(null);

    try {
      await updateEvent.mutateAsync({ visibleToChurch });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar a visibilidade.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base">
          <Eye className="size-4" />
          Visibilidade na agenda
        </CardTitle>
        <CardDescription>
          Onde este evento do ministério aparece para os membros.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <EventFormSection
          title="Quem pode ver"
          description="Eventos só do ministério ficam na aba do ministério. Você pode exibir também na agenda geral."
          bare
        >
          <EventVisibilityFields
            visibleToChurch={visibleToChurch}
            onVisibleToChurchChange={setVisibleToChurch}
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
