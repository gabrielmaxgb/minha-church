"use client";

import { useMemo, useState } from "react";
import { Loader2, Shield } from "lucide-react";

import { roleLabels } from "@/constants/dashboard-nav";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChurchMemberships,
  useUpdateChurchMembership,
} from "@/lib/api/queries";
import {
  canManageChurchMemberships,
  getEditableRolesForTarget,
} from "@/lib/church-memberships/constants";
import type { UserRole } from "@/types/auth";
import { useAuth } from "@/providers/auth-provider";

const ROLE_ORDER: UserRole[] = [
  "owner",
  "admin",
  "pastor",
  "secretary",
  "treasurer",
  "leader",
  "member",
];

function roleRank(role: UserRole) {
  return ROLE_ORDER.indexOf(role);
}

export function ChurchMembershipsSettings() {
  const { user } = useAuth();
  const { data: memberships, isLoading, isError } = useChurchMemberships();
  const updateMembership = useUpdateChurchMembership();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const actorRole = user?.role;
  const canManage = actorRole ? canManageChurchMemberships(actorRole) : false;

  const sortedMemberships = useMemo(
    () =>
      [...(memberships ?? [])].sort(
        (a, b) => roleRank(a.role) - roleRank(b.role) || a.user.name.localeCompare(b.user.name, "pt-BR"),
      ),
    [memberships],
  );

  if (!canManage) {
    return null;
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    if (!actorRole) {
      return;
    }

    setErrorMessage(null);
    setPendingUserId(userId);

    try {
      await updateMembership.mutateAsync({
        userId,
        payload: { role },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <section className="rounded-xl border border-border p-5 lg:col-span-2">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Shield className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold">
            Usuários e permissões
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Perfis de acesso ao sistema — tesoureiro, pastor, secretário e demais.
            O usuário precisa ter conta vinculada para aparecer aqui.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-border bg-muted/60 px-3 py-2.5 text-sm"
        >
          {errorMessage}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os usuários da igreja.
          </p>
        ) : sortedMemberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum usuário com acesso a esta igreja.
          </p>
        ) : (
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Usuário</th>
                <th className="pb-3 pr-4 font-medium">Membro vinculado</th>
                <th className="pb-3 font-medium">Perfil de acesso</th>
              </tr>
            </thead>
            <tbody>
              {sortedMemberships.map((membership) => {
                const isSelf = membership.userId === user?.id;
                const editableRoles =
                  actorRole && user
                    ? getEditableRolesForTarget(
                        actorRole,
                        membership.role,
                        membership.userId,
                        user.id,
                      )
                    : [];
                const canEdit = editableRoles.length > 0;
                const isPending = pendingUserId === membership.userId;

                return (
                  <tr
                    key={membership.id}
                    className="border-b border-border/70 last:border-0"
                  >
                    <td className="py-3 pr-4 align-middle">
                      <p className="font-medium">
                        {membership.user.name}
                        {isSelf && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            (você)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {membership.user.email}
                      </p>
                    </td>
                    <td className="py-3 pr-4 align-middle text-muted-foreground">
                      {membership.memberName ?? "—"}
                    </td>
                    <td className="py-3 align-middle">
                      {canEdit ? (
                        <div className="relative max-w-[14rem]">
                          <SelectField
                            value={membership.role}
                            disabled={isPending}
                            onChange={(event) => {
                              const nextRole = event.target.value as UserRole;

                              if (nextRole !== membership.role) {
                                void handleRoleChange(membership.userId, nextRole);
                              }
                            }}
                            className="h-9"
                          >
                            {editableRoles.map((role) => (
                              <option key={role} value={role}>
                                {roleLabels[role]}
                              </option>
                            ))}
                          </SelectField>
                          {isPending && (
                            <Loader2
                              className="absolute right-8 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                              aria-hidden
                            />
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
                          {roleLabels[membership.role]}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {actorRole && actorRole !== "owner" && (
        <p className="mt-4 text-xs text-muted-foreground">
          {actorRole === "admin"
            ? "Como administrador, você pode alterar pastor, secretário, tesoureiro, líder e membro."
            : "Como pastor, você pode alterar secretário, tesoureiro, líder e membro."}
        </p>
      )}
    </section>
  );
}
