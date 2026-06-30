"use client";

import { formatUserAccessLabel } from "@/lib/user-display";
import { useAuth, useTenant } from "@/providers/auth-provider";

import {
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";

export function SettingsGeneralPanel() {
  const { user } = useAuth();
  const { church, churchId, churches } = useTenant();

  return (
    <div>
      <SettingsSectionHeader
        title="Geral"
        description="Informações da igreja ativa e da sua conta."
      />

      <div className="space-y-4">
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

        <SettingsPanel>
          <div className="border-b border-border/70 px-5 py-4">
            <h3 className="text-sm font-medium">Sua conta</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {user?.email ?? "—"}
            </p>
          </div>
          <div className="divide-y divide-border/50 px-5 py-2">
            <SettingsReadOnlyRow label="Nome" value={user?.name ?? "—"} />
            <SettingsReadOnlyRow
              label="Acesso"
              value={user ? formatUserAccessLabel(user) : "—"}
            />
          </div>
        </SettingsPanel>
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
