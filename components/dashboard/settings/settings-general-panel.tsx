"use client";

import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiscalProfile } from "@/lib/api/queries";
import { useAuth, useTenant } from "@/providers/auth-provider";

import { ChurchFiscalProfileForm } from "./church-fiscal-profile-form";
import {
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";

export function SettingsGeneralPanel() {
  const { user } = useAuth();
  const { church, churchId, churches } = useTenant();
  const fiscalProfile = useFiscalProfile();

  return (
    <div>
      <SettingsSectionHeader
        title="Geral"
        description="Dados e identificação da igreja ativa."
      />

      <div className="space-y-6">
        <SettingsPanel>
          <div className="border-b border-border/70 px-5 py-4">
            <h3 className="text-sm font-medium">Igreja ativa</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {church?.name ?? "—"}
            </p>
          </div>
          <div className="divide-y divide-border/50 px-5 py-2">
            <SettingsReadOnlyRow label="Slug" value={church?.slug ?? "—"} />
            <SettingsReadOnlyRow
              label="Membros cadastrados"
              value={church?.memberCount?.toString() ?? "—"}
            />
            <SettingsReadOnlyRow label="ID" value={churchId ?? "—"} mono />
            {churches.length > 1 && (
              <SettingsReadOnlyRow
                label="Outras igrejas"
                value={churches
                  .filter((item) => item.id !== churchId)
                  .map((item) => item.name)
                  .join(", ")}
              />
            )}
          </div>
        </SettingsPanel>

        {user?.isOwner ? (
          fiscalProfile.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          ) : fiscalProfile.isError ? (
            <FormAlert>
              Não foi possível carregar o perfil da igreja. Recarregue a página
              e tente novamente.
            </FormAlert>
          ) : (
            <ChurchFiscalProfileForm profile={fiscalProfile.data ?? null} />
          )
        ) : null}
      </div>
    </div>
  );
}

function SettingsReadOnlyRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={mono ? "font-mono text-xs text-foreground" : "text-sm"}
      >
        {value}
      </span>
    </div>
  );
}
