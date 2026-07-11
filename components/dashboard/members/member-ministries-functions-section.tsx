"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { SettingsSaveBar } from "@/components/dashboard/settings/settings-shared";
import {
  MinistryCargoBadge,
  MinistryFunctionBadge,
  MinistryTagSection,
} from "@/components/dashboard/ministries/ministry-member-tags";
import { Skeleton } from "@/components/ui/skeleton";
import { ministryDetailPath } from "@/constants/routes";
import {
  useMinistry,
  useUpdateMemberMinistryInstruments,
} from "@/lib/api/queries";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import {
  addRosterRole,
  ensureMinistryServiceFunctionLabels,
  formatRosterRole,
  isProtectedMinistryServiceFunction,
  isRosterRoleSelected,
  normalizeRosterRoleList,
  removeRosterRole,
} from "@/lib/ministries/roster";
import { cn } from "@/lib/utils";
import type { MemberMinistryLink } from "@/types/members";

interface MemberMinistryFunctionsCardProps {
  memberId: string;
  link: MemberMinistryLink;
  editable: boolean;
}

function MemberMinistryFunctionsCard({
  memberId,
  link,
  editable,
}: MemberMinistryFunctionsCardProps) {
  const { locked } = useFeatureLock();
  const { data: ministry, isLoading } = useMinistry(link.ministryId);
  const updateInstruments = useUpdateMemberMinistryInstruments(link.ministryId);
  const [selected, setSelected] = useState<string[]>(
    ensureMinistryServiceFunctionLabels(link.instruments ?? []),
  );

  useEffect(() => {
    setSelected(ensureMinistryServiceFunctionLabels(link.instruments ?? []));
  }, [link.instruments]);

  const catalog = ministry?.serviceFunctions ?? [];
  const saved = normalizeRosterRoleList(
    ensureMinistryServiceFunctionLabels(link.instruments ?? []),
  );
  const current = normalizeRosterRoleList(
    ensureMinistryServiceFunctionLabels(selected),
  );
  const dirty = saved.join("|") !== current.join("|");

  async function handleSave() {
    await updateInstruments.mutateAsync({
      memberId,
      instruments: current,
    });
  }

  function toggleRole(role: string) {
    if (
      isRosterRoleSelected(selected, role) &&
      isProtectedMinistryServiceFunction(role)
    ) {
      return;
    }

    setSelected((value) =>
      isRosterRoleSelected(value, role)
        ? removeRosterRole(value, role)
        : addRosterRole(value, role),
    );
  }

  return (
    <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-foreground">{link.ministryName}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Cargos
            </span>
            {link.roles.length > 0 ? (
              link.roles.map((role) => (
                <MinistryCargoBadge key={role.id} size="sm">
                  {role.name}
                </MinistryCargoBadge>
              ))
            ) : (
              <MinistryCargoBadge empty size="sm" />
            )}
          </div>
        </div>
        {!locked ? (
          <Link
            href={`${ministryDetailPath(link.ministryId)}?section=service-functions`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver ministério
          </Link>
        ) : null}
      </div>

      <div className="mt-4">
      <MinistryTagSection
        title="Funções de serviço"
        hint="Marque as funções em que você pode servir neste ministério."
      >
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-lg" />
        ) : catalog.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/15 px-4 py-5 text-sm text-muted-foreground">
            O líder ainda não definiu as funções deste ministério.
          </p>
        ) : editable ? (
          <div className="flex flex-wrap gap-2">
            {catalog.map((item) => {
              const active = isRosterRoleSelected(current, item.label);
              const locked = isProtectedMinistryServiceFunction(item.label);

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={updateInstruments.isPending || (locked && active)}
                  onClick={() => toggleRole(item.label)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                    active
                      ? locked
                        ? "cursor-default border-border bg-muted text-foreground"
                        : "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    locked && active && "cursor-default",
                  )}
                >
                  {formatRosterRole(item.label)}
                  {locked && active ? (
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
                      Padrão
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : current.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {current.map((item) => (
              <MinistryFunctionBadge key={item} label={item} size="md" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma função selecionada.
          </p>
        )}

        {editable ? (
          <SettingsSaveBar
            visible={dirty}
            saving={updateInstruments.isPending}
            onDiscard={() =>
              setSelected(ensureMinistryServiceFunctionLabels(link.instruments ?? []))
            }
            onSave={() => void handleSave()}
          />
        ) : null}
      </MinistryTagSection>
      </div>
    </article>
  );
}

interface MemberMinistriesFunctionsSectionProps {
  memberId: string;
  ministries: MemberMinistryLink[];
  editable: boolean;
}

export function MemberMinistriesFunctionsSection({
  memberId,
  ministries,
  editable,
}: MemberMinistriesFunctionsSectionProps) {
  const activeMinistries = ministries.filter((link) => !link.endedAt);

  if (activeMinistries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
        Este membro ainda não participa de nenhum ministério.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activeMinistries.map((link) => (
        <MemberMinistryFunctionsCard
          key={link.id}
          memberId={memberId}
          link={link}
          editable={editable}
        />
      ))}
    </div>
  );
}
