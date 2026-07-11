"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Network, Plus } from "lucide-react";

import { BusyOverlay } from "@/components/ui/busy-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { familyGraphPath } from "@/constants/routes";
import {
  useCreateFamily,
  useFamilies,
  useSetMemberFamily,
} from "@/lib/api/queries";

interface LinkMemberFamilyModalProps {
  memberId: string;
  memberName: string;
  open: boolean;
  onClose: () => void;
}

export function LinkMemberFamilyModal({
  memberId,
  memberName,
  open,
  onClose,
}: LinkMemberFamilyModalProps) {
  const titleId = useId();
  const router = useRouter();
  const { data: families = [], isLoading: loadingFamilies } = useFamilies({
    enabled: open,
  });
  const createFamily = useCreateFamily();
  const setFamily = useSetMemberFamily();

  const [mode, setMode] = useState<"existing" | "new">("new");
  const [familyId, setFamilyId] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = createFamily.isPending || setFamily.isPending;
  const busySteps =
    mode === "new"
      ? ([
          "Criando a família...",
          "Vinculando o membro...",
          "Abrindo o grafo...",
        ] as const)
      : (["Vinculando o membro...", "Abrindo o grafo..."] as const);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode(families.length > 0 ? "existing" : "new");
    setFamilyId(families[0]?.id ?? "");
    setNewName(`Família ${memberName.split(/\s+/)[0] ?? ""}`.trim());
    setError(null);
  }, [open, families, memberName]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      let nextFamilyId = familyId;

      if (mode === "new") {
        const name = newName.trim();
        if (name.length < 2) {
          setError("Informe um nome para a família.");
          return;
        }
        const family = await createFamily.mutateAsync(name);
        nextFamilyId = family.id;
      } else if (!nextFamilyId) {
        setError("Escolha uma família.");
        return;
      }

      await setFamily.mutateAsync({ memberId, familyId: nextFamilyId });
      onClose();
      router.push(familyGraphPath(nextFamilyId));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível vincular a família.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        disabled={busy}
        onClick={() => {
          if (!busy) onClose();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-xl border border-border bg-background shadow-popover sm:rounded-xl"
      >
        <BusyOverlay active={busy} icon={Network} steps={busySteps} />

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6">
          <div className="flex size-11 items-center justify-center rounded-xl bg-domain-members-subtle text-domain-members-foreground">
            <Network className="size-5" aria-hidden />
          </div>
          <h2
            id={titleId}
            className="mt-4 text-xl font-semibold tracking-tight text-foreground"
          >
            Vincular família
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {memberName} ainda não está em uma família. Crie uma nova ou vincule
            a uma existente para abrir o grafo.
          </p>

          <div className="mt-5 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "new" ? "default" : "outline"}
              disabled={busy}
              onClick={() => setMode("new")}
            >
              <Plus className="size-3.5" />
              Nova
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "existing" ? "default" : "outline"}
              disabled={busy || families.length === 0}
              onClick={() => setMode("existing")}
            >
              Existente
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {mode === "new" ? (
              <>
                <Label htmlFor="link-family-name">Nome da família</Label>
                <Input
                  id="link-family-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={busy}
                  placeholder="Ex.: Família Silva"
                  className="h-11 rounded-xl"
                  autoFocus
                />
              </>
            ) : (
              <>
                <Label htmlFor="link-family-select">Família</Label>
                <SelectField
                  id="link-family-select"
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  disabled={busy || loadingFamilies}
                >
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                      {family.memberCount > 0
                        ? ` (${family.memberCount})`
                        : ""}
                    </option>
                  ))}
                </SelectField>
              </>
            )}
          </div>

          {error ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Abrir grafo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
