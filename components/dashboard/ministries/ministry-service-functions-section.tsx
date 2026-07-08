"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Music2 } from "lucide-react";

import { EventRosterSlotsEditor } from "@/components/dashboard/activities/event-roster-slots-editor";
import { SettingsSaveBar } from "@/components/dashboard/settings/settings-shared";
import { useReplaceMinistryServiceFunctions } from "@/lib/api/queries";
import { formatRosterRole } from "@/lib/ministries/roster";
import type { Ministry } from "@/types/ministries";

interface MinistryServiceFunctionsSectionProps {
  ministry: Ministry;
  canManage: boolean;
}

function serviceFunctionLabels(functions: Ministry["serviceFunctions"]): string[] {
  return functions.map((item) => item.label);
}

function labelsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((label, index) => label === b[index]);
}

function labelsToPlan(labels: string[]) {
  return labels.map((label) => ({ label, requiredCount: 1 }));
}

export function MinistryServiceFunctionsSection({
  ministry,
  canManage,
}: MinistryServiceFunctionsSectionProps) {
  const replaceFunctions = useReplaceMinistryServiceFunctions(ministry.id);
  const savedLabelsSignature = ministry.serviceFunctions
    .map((item) => item.label)
    .join("\u0001");
  const savedLabels = useMemo(
    () => serviceFunctionLabels(ministry.serviceFunctions),
    [savedLabelsSignature],
  );
  const [labels, setLabels] = useState(savedLabels);

  useEffect(() => {
    setLabels((current) =>
      labelsEqual(current, savedLabels) ? current : savedLabels,
    );
  }, [savedLabels]);

  const dirty = !labelsEqual(labels, savedLabels);

  async function handleSave() {
    await replaceFunctions.mutateAsync(labels);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <Music2 className="size-4" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Funções de serviço
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina como a equipe pode servir neste ministério. Os membros
            escolhem, no perfil, em quais funções podem atuar.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        {canManage ? (
          <>
            <EventRosterSlotsEditor
              value={labelsToPlan(labels)}
              onChange={(next) => setLabels(next.map((item) => item.label))}
              disabled={replaceFunctions.isPending}
              embedded
              compact
            />
            <SettingsSaveBar
              visible={dirty}
              saving={replaceFunctions.isPending}
              onDiscard={() => setLabels(savedLabels)}
              onSave={() => void handleSave()}
            />
          </>
        ) : labels.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <li
                key={label}
                className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm"
              >
                {formatRosterRole(label)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            O líder ainda não definiu as funções deste ministério.
          </p>
        )}

        {replaceFunctions.isPending ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Salvando funções...
          </p>
        ) : null}
      </div>
    </section>
  );
}
