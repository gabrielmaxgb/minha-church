"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";

import { RosterFunctionsEditor } from "@/components/dashboard/ministries/roster-functions-editor";
import { RosterFunctionsReminder } from "@/components/dashboard/ministries/roster-functions-reminder";
import { Skeleton } from "@/components/ui/skeleton";
import { ROSTER_PROFILE_SECTION_ID } from "@/constants/routes";
import { useRosterProfile, useUpdateRosterProfile } from "@/lib/api/queries";
import {
  hasRosterProfileHash,
  scrollToRosterProfileSection,
} from "@/lib/ministries/roster-profile-scroll";
import {
  needsRosterFunctions,
  normalizeRosterRoleList,
  rosterRolesEqual,
} from "@/lib/ministries/roster";

interface MinistryRosterProfileSectionProps {
  ministryId: string;
  ministryName?: string;
}

export function MinistryRosterProfileSection({
  ministryId,
  ministryName,
}: MinistryRosterProfileSectionProps) {
  const { data, isLoading, isError } = useRosterProfile(ministryId);
  const updateProfile = useUpdateRosterProfile(ministryId);
  const [draft, setDraft] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  const instruments = data?.instruments ?? [];
  const displayName = ministryName ?? data?.ministryName ?? "";
  const missingFunctions = needsRosterFunctions(instruments);
  const dirty = initialized && !rosterRolesEqual(draft, instruments);

  useEffect(() => {
    if (!data) {
      return;
    }

    setDraft(data.instruments ?? []);
    setInitialized(true);
  }, [data]);

  useEffect(() => {
    if (!data || !hasRosterProfileHash()) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollToRosterProfileSection();
    });

    return () => cancelAnimationFrame(frame);
  }, [data?.ministryId]);

  async function handleSave() {
    await updateProfile.mutateAsync(normalizeRosterRoleList(draft));
  }

  function handleDiscard() {
    setDraft(instruments);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  return (
    <div className="space-y-4">
      {missingFunctions && displayName && (
        <RosterFunctionsReminder
          ministryId={ministryId}
          ministryName={displayName}
        />
      )}

      <section
        id={ROSTER_PROFILE_SECTION_ID}
        className="scroll-mt-24 space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40">
            <ClipboardList className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Seu perfil na escala
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Informe como você costuma servir neste ministério. O líder só
              poderá escalá-lo nessas funções.
            </p>
          </div>
        </div>

        <RosterFunctionsEditor
          value={draft}
          onChange={setDraft}
          dirty={dirty}
          saving={updateProfile.isPending}
          onDiscard={handleDiscard}
          onSave={() => void handleSave()}
        />
      </section>
    </div>
  );
}
