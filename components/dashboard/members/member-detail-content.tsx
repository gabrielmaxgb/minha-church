"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HandCoins,
  HeartHandshake,
  UserRound,
  UsersRound,
} from "lucide-react";

import { GivingDonationsPanel } from "@/components/dashboard/finances/giving-donations-panel";
import {
  MemberExpandedPanel,
  type MemberDetailSection,
} from "@/components/dashboard/members/member-expanded-panel";
import { MemberPastoralCarePanel } from "@/components/dashboard/pastoral-care/member-pastoral-care-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/constants/routes";
import { useMember } from "@/lib/api/queries";
import { canManageMembers, hasRoutePermission } from "@/lib/permissions";
import { memberStatusBadgeClass } from "@/lib/members/status-badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { MEMBER_STATUS_LABELS } from "@/types/members";

type MemberDetailTab =
  | "cadastro"
  | "ministerios"
  | "acompanhamento"
  | "contribuicoes";

const TAB_HASH: Record<MemberDetailTab, string> = {
  cadastro: "cadastro",
  ministerios: "ministerios",
  acompanhamento: "acompanhamento",
  contribuicoes: "contribuicoes",
};

function tabFromHash(hash: string): MemberDetailTab | null {
  const value = hash.replace(/^#/, "");
  if (
    value === "cadastro" ||
    value === "ministerios" ||
    value === "acompanhamento" ||
    value === "contribuicoes"
  ) {
    return value;
  }
  return null;
}

interface MemberDetailContentProps {
  memberId: string;
}

export function MemberDetailContent({ memberId }: MemberDetailContentProps) {
  const router = useRouter();
  const { permissions, user } = useAuth();
  const canManage = permissions ? canManageMembers(permissions) : false;
  const canSeeContributions = Boolean(
    user?.isOwner ||
      permissions?.finances.access ||
      permissions?.finances.manage,
  );
  const canSeePastoralCare =
    permissions !== null &&
    hasRoutePermission(permissions, "pastoralCare", {
      isOwner: Boolean(user?.isOwner),
    });
  const { data: member, isLoading, isError, error } = useMember(memberId);

  const [tab, setTab] = useState<MemberDetailTab>("cadastro");
  const [isEditing, setIsEditing] = useState(false);

  const availableTabs = useMemo(() => {
    const tabs: Array<{
      id: MemberDetailTab;
      label: string;
      icon: typeof UserRound;
      description: string;
    }> = [
      {
        id: "cadastro",
        label: "Cadastro",
        icon: UserRound,
        description: "Contato, dados pessoais e vida na igreja",
      },
      {
        id: "ministerios",
        label: "Ministérios",
        icon: UsersRound,
        description: "Vínculos, cargos e funções na escala",
      },
    ];

    if (canSeePastoralCare) {
      tabs.push({
        id: "acompanhamento",
        label: "Acompanhamento",
        icon: HeartHandshake,
        description: "Visitas, conversas e retornos",
      });
    }

    if (canSeeContributions) {
      tabs.push({
        id: "contribuicoes",
        label: "Contribuições",
        icon: HandCoins,
        description: "Doações online deste membro",
      });
    }

    return tabs;
  }, [canSeeContributions, canSeePastoralCare]);

  const selectTab = useCallback(
    (next: MemberDetailTab, { replaceHash = true } = {}) => {
      if (isEditing && next !== "cadastro") {
        return;
      }
      if (
        next === "acompanhamento" &&
        !canSeePastoralCare
      ) {
        return;
      }
      if (next === "contribuicoes" && !canSeeContributions) {
        return;
      }

      setTab(next);
      if (replaceHash && typeof window !== "undefined") {
        const url = `${window.location.pathname}${window.location.search}#${TAB_HASH[next]}`;
        window.history.replaceState(null, "", url);
      }
    },
    [canSeeContributions, canSeePastoralCare, isEditing],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const applyHash = () => {
      const fromHash = tabFromHash(window.location.hash);
      if (!fromHash) {
        return;
      }
      if (fromHash === "acompanhamento" && !canSeePastoralCare) {
        return;
      }
      if (fromHash === "contribuicoes" && !canSeeContributions) {
        return;
      }
      if (isEditing && fromHash !== "cadastro") {
        return;
      }
      setTab(fromHash);
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [canSeeContributions, canSeePastoralCare, isEditing]);

  useEffect(() => {
    if (!availableTabs.some((item) => item.id === tab)) {
      setTab("cadastro");
    }
  }, [availableTabs, tab]);

  const handleEditingChange = useCallback((editing: boolean) => {
    setIsEditing(editing);
    if (editing) {
      setTab("cadastro");
      if (typeof window !== "undefined") {
        const url = `${window.location.pathname}${window.location.search}#${TAB_HASH.cadastro}`;
        window.history.replaceState(null, "", url);
      }
    }
  }, []);

  const panelSection: MemberDetailSection =
    tab === "ministerios" ? "ministries" : "profile";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-10 w-full max-w-lg rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="space-y-4">
        <Link
          href={AUTH_ROUTES.members}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para membros
        </Link>

        <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar o cadastro."}
        </div>
      </div>
    );
  }

  const activeTabMeta = availableTabs.find((item) => item.id === tab);

  return (
    <div className="space-y-6">
      <Link
        href={AUTH_ROUTES.members}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para membros
      </Link>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl font-semibold tracking-tight">
                {member.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {isEditing
                  ? "Editando cadastro — salve ou cancele antes de mudar de aba"
                  : (activeTabMeta?.description ??
                    "Ficha pastoral e vínculos na igreja")}
              </CardDescription>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium",
                memberStatusBadgeClass(member.status),
              )}
            >
              {MEMBER_STATUS_LABELS[member.status]}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div
            role="tablist"
            aria-label="Seções da ficha"
            className="flex gap-1 overflow-x-auto overscroll-x-contain rounded-lg border border-border bg-muted/30 p-0.5 scrollbar-none"
          >
            {availableTabs.map((item) => {
              const Icon = item.icon;
              const selected = tab === item.id;
              const locked = isEditing && item.id !== "cadastro";

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-disabled={locked || undefined}
                  disabled={locked}
                  title={
                    locked
                      ? "Termine a edição do cadastro para mudar de aba"
                      : item.description
                  }
                  onClick={() => selectTab(item.id)}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm transition-colors",
                    selected
                      ? "bg-foreground font-medium text-background"
                      : "font-normal text-muted-foreground hover:text-foreground",
                    locked &&
                      "cursor-not-allowed opacity-45 hover:text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5 opacity-70" aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            aria-label={activeTabMeta?.label ?? "Cadastro"}
            className="min-h-48"
          >
            {tab === "cadastro" || tab === "ministerios" || isEditing ? (
              <MemberExpandedPanel
                member={member}
                canManage={canManage}
                section={isEditing ? "profile" : panelSection}
                onEditingChange={handleEditingChange}
                onDeleted={() => router.push(AUTH_ROUTES.members)}
              />
            ) : null}

            {tab === "acompanhamento" && canSeePastoralCare && !isEditing ? (
              <MemberPastoralCarePanel memberId={memberId} />
            ) : null}

            {tab === "contribuicoes" && canSeeContributions && !isEditing ? (
              <GivingDonationsPanel embedded memberId={memberId} />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
