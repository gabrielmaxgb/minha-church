"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { SettingsSaveBar } from "@/components/dashboard/settings/settings-shared";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ministryDetailPath } from "@/constants/routes";
import {
  useMinistry,
  useUpdateMemberMinistryInstruments,
} from "@/lib/api/queries";
import {
  addRosterRole,
  formatRosterRole,
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
  const { data: ministry, isLoading } = useMinistry(link.ministryId);
  const updateInstruments = useUpdateMemberMinistryInstruments(link.ministryId);
  const [selected, setSelected] = useState<string[]>(link.instruments ?? []);

  useEffect(() => {
    setSelected(link.instruments ?? []);
  }, [link.instruments]);

  const catalog = ministry?.serviceFunctions ?? [];
  const saved = normalizeRosterRoleList(link.instruments ?? []);
  const current = normalizeRosterRoleList(selected);
  const dirty = saved.join("|") !== current.join("|");

  async function handleSave() {
    await updateInstruments.mutateAsync({
      memberId,
      instruments: current,
    });
  }

  function toggleRole(role: string) {
    setSelected((value) =>
      isRosterRoleSelected(value, role)
        ? removeRosterRole(value, role)
        : addRosterRole(value, role),
    );
  }

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-foreground">{link.ministryName}</h3>
          {link.roles.length > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Cargos: {link.roles.map((role) => role.name).join(", ")}
            </p>
          ) : null}
        </div>
        <Link
          href={`${ministryDetailPath(link.ministryId)}?section=service-functions`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver ministério
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          Marque as funções em que você pode servir neste ministério.
        </p>

        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : catalog.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-5 text-sm text-muted-foreground">
            O líder ainda não definiu as funções deste ministério.
          </p>
        ) : editable ? (
          <div className="flex flex-wrap gap-2">
            {catalog.map((item) => {
              const active = isRosterRoleSelected(current, item.label);

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={updateInstruments.isPending}
                  onClick={() => toggleRole(item.label)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {formatRosterRole(item.label)}
                </button>
              );
            })}
          </div>
        ) : current.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {current.map((item) => (
              <Badge key={item} variant="secondary">
                {formatRosterRole(item)}
              </Badge>
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
            onDiscard={() => setSelected(link.instruments ?? [])}
            onSave={() => void handleSave()}
          />
        ) : null}
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
