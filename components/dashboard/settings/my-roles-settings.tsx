"use client";

import { Building2, Church, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FormAlert } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyMember } from "@/lib/api/queries";
import { useAuth } from "@/providers/auth-provider";

import { SettingsPanel, SettingsSectionHeader } from "./settings-shared";

export function MyRolesSettings() {
  const { user } = useAuth();
  const myMember = useMyMember();

  if (!user) {
    return null;
  }

  const churchRoles = user.roles;
  const ministries = myMember.data?.ministries ?? [];
  const ministriesWithRoles = ministries.filter(
    (link) => link.roles.length > 0,
  );
  const ministriesWithoutRoles = ministries.filter(
    (link) => link.roles.length === 0,
  );

  return (
    <div>
      <SettingsSectionHeader
        title="Meus cargos"
        description="Seus cargos na igreja e nos ministérios ou grupos de serviço em que você serve."
      />

      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Church className="size-4 text-muted-foreground" aria-hidden />
            <h3 className="text-sm font-semibold tracking-tight">
              Cargos na igreja
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Definem o que você pode fazer no painel (membros, finanças,
            configurações, etc.).
          </p>

          <SettingsPanel>
            <ul className="divide-y divide-border/70">
              {user.isOwner && (
                <li className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Proprietário
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Acesso completo à igreja nesta conta
                    </p>
                  </div>
                  <Badge variant="secondary">Igreja</Badge>
                </li>
              )}

              {churchRoles.length === 0 && !user.isOwner ? (
                <li className="px-4 py-6 text-sm text-muted-foreground">
                  Você ainda não tem um cargo na igreja.
                </li>
              ) : (
                churchRoles.map((role) => (
                  <li
                    key={role.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {role.color ? (
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: role.color }}
                          aria-hidden
                        />
                      ) : null}
                      <p className="truncate text-sm font-medium text-foreground">
                        {role.name}
                      </p>
                    </div>
                    <Badge variant="outline">Igreja</Badge>
                  </li>
                ))
              )}
            </ul>
          </SettingsPanel>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" aria-hidden />
            <h3 className="text-sm font-semibold tracking-tight">
              Cargos em ministérios e grupos de serviço
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Cargos de liderança ou equipe dentro de cada ministério ou grupo
            (diferente das funções de serviço na escala).
          </p>

          {myMember.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : myMember.isError ? (
            <FormAlert>
              Não foi possível carregar seus ministérios. Recarregue a página.
            </FormAlert>
          ) : ministries.length === 0 ? (
            <SettingsPanel>
              <p className="px-4 py-6 text-sm text-muted-foreground">
                Você ainda não está em nenhum ministério.
              </p>
            </SettingsPanel>
          ) : (
            <div className="space-y-3">
              {ministriesWithRoles.map((link) => (
                <SettingsPanel key={link.id}>
                  <div className="border-b border-border/70 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2
                        className="size-3.5 text-muted-foreground"
                        aria-hidden
                      />
                      <p className="text-sm font-medium text-foreground">
                        {link.ministryName}
                      </p>
                    </div>
                  </div>
                  <ul className="divide-y divide-border/70">
                    {link.roles.map((role) => (
                      <li
                        key={role.id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <p className="text-sm text-foreground">{role.name}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline">Ministério</Badge>
                          {role.canManageEvents ? (
                            <Badge variant="secondary">Eventos</Badge>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </SettingsPanel>
              ))}

              {ministriesWithRoles.length === 0 && (
                <SettingsPanel>
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    Você participa de ministério(s), mas ainda não tem cargo de
                    equipe neles.
                  </p>
                </SettingsPanel>
              )}

              {ministriesWithoutRoles.length > 0 &&
                ministriesWithRoles.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Também em:{" "}
                    {ministriesWithoutRoles
                      .map((link) => link.ministryName)
                      .join(", ")}{" "}
                    (sem cargo de equipe).
                  </p>
                )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
