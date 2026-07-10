"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Layers,
  Power,
  Tag,
} from "lucide-react";

import { SettingsSaveBar } from "@/components/dashboard/settings/settings-shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMinistry } from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import type { Ministry } from "@/types/ministries";

interface MinistrySettingDefinition {
  field: "isActive";
  label: string;
  description: string;
  icon: LucideIcon;
  accent: {
    activeBorder: string;
    activeBg: string;
    iconBg: string;
    iconColor: string;
  };
}

const MINISTRY_SETTINGS: MinistrySettingDefinition[] = [
  {
    field: "isActive",
    label: "Ministério ativo",
    description:
      "Inativos permanecem no histórico, mas aparecem desmarcados na lista.",
    icon: Power,
    accent: {
      activeBorder: "border-success/30",
      activeBg: "bg-success-subtle",
      iconBg: "bg-success-subtle",
      iconColor: "text-success-foreground",
    },
  },
];

function SettingSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Alternar ${label}`}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-foreground" : "bg-muted-foreground/25",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function MinistrySettingToggle({
  setting,
  checked,
  disabled,
  onToggle,
}: {
  setting: MinistrySettingDefinition;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const Icon = setting.icon;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3.5 transition-all duration-200",
        checked
          ? cn(setting.accent.activeBorder, setting.accent.activeBg)
          : "border-border/60 bg-card/40",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "group flex min-w-0 flex-1 items-start gap-3 text-left transition-colors",
          "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            checked
              ? setting.accent.iconBg
              : "bg-muted/50 group-hover:bg-muted group-disabled:group-hover:bg-muted/50",
          )}
        >
          <Icon
            className={cn(
              "size-4",
              checked ? setting.accent.iconColor : "text-muted-foreground",
            )}
            aria-hidden
          />
        </span>

        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block text-sm font-medium leading-tight">
            {setting.label}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {setting.description}
          </span>
        </span>
      </button>

      <SettingSwitch
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        label={setting.label}
      />
    </div>
  );
}

export function MinistryOverviewSection({
  ministry,
  canManage,
}: {
  ministry: Ministry;
  canManage: boolean;
}) {
  const updateMinistry = useUpdateMinistry(ministry.id);
  const [name, setName] = useState(ministry.name);
  const [description, setDescription] = useState(ministry.description ?? "");
  const [isActive, setIsActive] = useState(ministry.isActive);

  useEffect(() => {
    setName(ministry.name);
    setDescription(ministry.description ?? "");
    setIsActive(ministry.isActive);
  }, [ministry]);

  const hasChanges =
    name.trim() !== ministry.name ||
    (description.trim() || null) !== (ministry.description ?? null) ||
    isActive !== ministry.isActive;

  const disabled = !canManage || updateMinistry.isPending;

  function discardChanges() {
    setName(ministry.name);
    setDescription(ministry.description ?? "");
    setIsActive(ministry.isActive);
  }

  async function handleSave() {
    if (!name.trim()) {
      return;
    }

    await updateMinistry.mutateAsync({
      name: name.trim(),
      description: description.trim() || null,
      isActive,
    });
  }

  function getSettingValue() {
    return isActive;
  }

  function setSettingValue(next: boolean) {
    setIsActive(next);
  }

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
            <Layers className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <CardTitle>Visão geral</CardTitle>
            <CardDescription className="mt-1">
              Nome, descrição e configurações exibidas na lista de ministérios.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {!canManage && (
          <p className="mx-6 mb-5 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Você pode visualizar estas informações. Para editá-las, é necessário
            gerenciar ministérios na igreja.
          </p>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <div className="space-y-5 px-6 pb-6">
            <section className="overflow-hidden rounded-lg border border-border bg-muted/10">
              <header className="border-b border-border px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-2">
                  <Tag className="size-4 text-muted-foreground" aria-hidden />
                  <h3 className="text-sm font-medium tracking-tight">
                    Identidade
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Como este ministério aparece para a equipe e na navegação.
                </p>
              </header>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="space-y-2">
                  <Label htmlFor="ministry-name">Nome</Label>
                  <Input
                    id="ministry-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={disabled}
                    placeholder="Ex.: Ministério de Louvor"
                    className="rounded-lg border-border bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ministry-description">Descrição</Label>
                    <span className="text-xs text-muted-foreground">
                      (opcional)
                    </span>
                  </div>
                  <div className="relative">
                    <AlignLeft
                      className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground/70"
                      aria-hidden
                    />
                    <Textarea
                      id="ministry-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      disabled={disabled}
                      placeholder="Breve resumo do propósito ou área de atuação do ministério."
                      className="min-h-[96px] rounded-lg border-border bg-background pl-9"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-border bg-card">
              <header className="border-b border-border px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-2">
                  <Power className="size-4 text-muted-foreground" aria-hidden />
                  <h3 className="text-sm font-semibold tracking-tight">
                    Configurações
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Controle a visibilidade deste ministério na lista.
                </p>
              </header>

              <div className="grid grid-cols-1 gap-2 p-3 sm:p-4">
                {MINISTRY_SETTINGS.map((setting) => (
                  <MinistrySettingToggle
                    key={setting.field}
                    setting={setting}
                    checked={getSettingValue()}
                    disabled={disabled}
                    onToggle={() => setSettingValue(!getSettingValue())}
                  />
                ))}
              </div>
            </section>
          </div>

          {canManage && (
            <SettingsSaveBar
              visible={hasChanges && Boolean(name.trim())}
              saving={updateMinistry.isPending}
              onDiscard={discardChanges}
              onSave={() => void handleSave()}
            />
          )}
        </form>
      </CardContent>
    </Card>
  );
}
