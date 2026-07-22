"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useFamilyGraph } from "@/lib/api/queries/use-family-graph";
import { useRecordParentalConsent } from "@/lib/api/queries/use-members";
import { PARENTAL_CONSENT_TEXT } from "@/lib/members/parental-consent";
import { toastApiError } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/members";

type GuardianOption = {
  id: string;
  name: string;
};

export function ParentalConsentModal({
  member,
  open,
  onClose,
  onRecorded,
}: {
  member: Member;
  open: boolean;
  onClose: () => void;
  onRecorded?: (updated: Member) => void;
}) {
  const recordConsent = useRecordParentalConsent(member.id);
  const { data: graph } = useFamilyGraph(member.familyId ?? "", {
    enabled: open && Boolean(member.familyId),
  });

  const parentOptions = useMemo((): GuardianOption[] => {
    if (!graph) {
      return [];
    }

    return graph.relations
      .filter(
        (relation) =>
          (relation.type === "parent" || relation.type === "step_parent") &&
          relation.toMemberId === member.id,
      )
      .map((relation) => {
        const parent = graph.members.find(
          (item) => item.id === relation.fromMemberId,
        );
        return parent
          ? { id: parent.id, name: parent.name }
          : null;
      })
      .filter((item): item is GuardianOption => item !== null);
  }, [graph, member.id]);

  const [guardianMemberId, setGuardianMemberId] = useState<string>("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setAccepted(false);
    setGuardianEmail("");
    if (parentOptions.length === 1) {
      setGuardianMemberId(parentOptions[0]!.id);
      setGuardianName("");
    } else {
      setGuardianMemberId("");
      setGuardianName("");
    }
  }, [open, parentOptions]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !recordConsent.isPending) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, recordConsent.isPending]);

  if (!open) {
    return null;
  }

  const usingParentFromGraph = Boolean(guardianMemberId);
  const canSubmit =
    accepted &&
    (usingParentFromGraph || guardianName.trim().length >= 2) &&
    !recordConsent.isPending;

  async function handleSubmit() {
    try {
      const updated = await recordConsent.mutateAsync({
        accepted: true,
        ...(guardianMemberId
          ? { guardianMemberId }
          : {
              guardianName: guardianName.trim(),
              guardianEmail: guardianEmail.trim() || undefined,
            }),
      });
      onRecorded?.(updated);
      onClose();
    } catch (submitError) {
      toastApiError(submitError, "Não foi possível registrar o consentimento.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        aria-label="Fechar"
        disabled={recordConsent.isPending}
        onClick={() => {
          if (!recordConsent.isPending) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="parental-consent-title"
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-background p-6 shadow-popover sm:rounded-2xl"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Shield className="size-5" aria-hidden />
        </div>

        <h2
          id="parental-consent-title"
          className="mt-4 text-lg font-semibold tracking-tight"
        >
          Consentimento parental
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {member.name} é menor de 18 anos. Registre a autorização do responsável
          antes de liberar o acesso ao painel.
        </p>

        <div className="mt-5 space-y-4">
          {parentOptions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Responsável na família
              </p>
              <div className="space-y-2">
                {parentOptions.map((option) => {
                  const selected = guardianMemberId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={recordConsent.isPending}
                      onClick={() => {
                        setGuardianMemberId(option.id);
                        setGuardianName("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "border-foreground bg-muted/40"
                          : "border-border hover:bg-muted/30",
                      )}
                    >
                      <span className="font-medium">{option.name}</span>
                      <span
                        className={cn(
                          "size-4 rounded-full border",
                          selected
                            ? "border-foreground bg-foreground shadow-[inset_0_0_0_3px_var(--background)]"
                            : "border-border",
                        )}
                        aria-hidden
                      />
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={recordConsent.isPending}
                  onClick={() => setGuardianMemberId("")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                    !guardianMemberId
                      ? "border-foreground bg-muted/40"
                      : "border-border hover:bg-muted/30",
                  )}
                >
                  <span className="font-medium">Outro responsável</span>
                  <span
                    className={cn(
                      "size-4 rounded-full border",
                      !guardianMemberId
                        ? "border-foreground bg-foreground shadow-[inset_0_0_0_3px_var(--background)]"
                        : "border-border",
                    )}
                    aria-hidden
                  />
                </button>
              </div>
            </div>
          ) : null}

          {!usingParentFromGraph ? (
            <div className="space-y-3">
              <FormField label="Nome do responsável" htmlFor="guardian-name" required>
                <Input
                  id="guardian-name"
                  value={guardianName}
                  onChange={(event) => setGuardianName(event.target.value)}
                  placeholder="Nome completo"
                  disabled={recordConsent.isPending}
                />
              </FormField>
              <FormField label="E-mail do responsável" htmlFor="guardian-email">
                <Input
                  id="guardian-email"
                  type="email"
                  value={guardianEmail}
                  onChange={(event) => setGuardianEmail(event.target.value)}
                  placeholder="Opcional"
                  disabled={recordConsent.isPending}
                />
              </FormField>
            </div>
          ) : null}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
              checked={accepted}
              disabled={recordConsent.isPending}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            <span className="leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Autorizo. </span>
              {PARENTAL_CONSENT_TEXT}
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={recordConsent.isPending}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            className="gap-2"
            onClick={() => void handleSubmit()}
          >
            {recordConsent.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Registrar e continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
