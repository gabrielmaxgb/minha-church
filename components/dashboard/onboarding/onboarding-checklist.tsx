"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";

import {
  OnboardingChecklistModal,
  type OnboardingStep,
} from "@/components/dashboard/onboarding/onboarding-checklist-modal";
import {
  AUTH_ROUTES,
  MEMBER_CREATE_ROUTE,
} from "@/constants/routes";
import {
  useDashboardSummary,
  useManagedAnnouncements,
  useMinistries,
} from "@/lib/api/queries";
import { useAuth } from "@/providers/auth-provider";

function dismissStorageKey(churchId: string): string {
  return `mc:onboarding-checklist:dismissed:${churchId}`;
}

function readDismissed(churchId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(dismissStorageKey(churchId)) === "1";
  } catch {
    return false;
  }
}

function persistDismissed(churchId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(dismissStorageKey(churchId), "1");
  } catch {
    // Ignora falhas de storage (ex.: modo privado) — o guia continua funcional.
  }
}

export function OnboardingChecklist() {
  const router = useRouter();
  const { user, church } = useAuth();

  const isOwner = Boolean(user?.isOwner);
  const churchId = church?.id ?? null;

  // Captura, na primeira montagem para esta igreja, se a verificação de e-mail
  // é relevante. Assim o passo não some da lista logo após ser concluído.
  const [emailStepRelevant, setEmailStepRelevant] = useState(false);
  const emailRelevanceChurchRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOwner || !churchId) {
      return;
    }

    if (emailRelevanceChurchRef.current !== churchId) {
      emailRelevanceChurchRef.current = churchId;
      setEmailStepRelevant(user?.emailVerified === false);
    }
  }, [churchId, isOwner, user?.emailVerified]);

  const { data: summary, isPending: summaryPending } = useDashboardSummary();
  const { data: announcements, isPending: announcementsPending } =
    useManagedAnnouncements({ enabled: isOwner });
  const { data: ministries, isPending: ministriesPending } = useMinistries({
    enabled: isOwner,
  });

  const isStatusReady =
    !summaryPending && !announcementsPending && !ministriesPending;

  const emailVerified = user?.emailVerified !== false;
  const hasExtraMember = (summary?.memberCount ?? 0) > 1;
  const hasAnnouncement = (announcements?.length ?? 0) > 0;
  const hasMinistry = (ministries?.length ?? 0) > 0;

  const steps = useMemo<OnboardingStep[]>(() => {
    const list: OnboardingStep[] = [];

    if (emailStepRelevant) {
      list.push({
        id: "verify-email",
        title: "Confirme seu e-mail",
        description:
          "Garante a segurança da conta e libera todos os recursos, sem limite de membros.",
        actionLabel: "Ver como confirmar",
        href: AUTH_ROUTES.dashboard,
        done: emailVerified,
      });
    }

    list.push({
      id: "first-member",
      title: "Cadastre o primeiro membro",
      description:
        "Comece a montar o cadastro da sua comunidade adicionando uma pessoa.",
      actionLabel: "Cadastrar membro",
      href: MEMBER_CREATE_ROUTE,
      done: hasExtraMember,
    });

    list.push({
      id: "first-announcement",
      title: "Publique um comunicado",
      description:
        "Envie um aviso para a igreja e veja como a comunicação funciona.",
      actionLabel: "Ir para comunicação",
      href: AUTH_ROUTES.communication,
      done: hasAnnouncement,
      optional: true,
    });

    list.push({
      id: "first-ministry",
      title: "Crie um ministério",
      description:
        "Organize equipes e áreas de serviço para escalar e delegar tarefas.",
      actionLabel: "Ir para ministérios",
      href: AUTH_ROUTES.ministries,
      done: hasMinistry,
      optional: true,
    });

    return list;
  }, [
    emailStepRelevant,
    emailVerified,
    hasAnnouncement,
    hasExtraMember,
    hasMinistry,
  ]);

  const allDone = steps.length > 0 && steps.every((step) => step.done);
  const completedCount = steps.filter((step) => step.done).length;

  const [open, setOpen] = useState(false);
  const autoOpenChurchRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOwner || !churchId || !isStatusReady) {
      return;
    }

    // Abre automaticamente apenas uma vez por igreja, se ainda não foi dispensado.
    if (autoOpenChurchRef.current === churchId) {
      return;
    }

    autoOpenChurchRef.current = churchId;

    if (!readDismissed(churchId) && !allDone) {
      setOpen(true);
    }
  }, [allDone, churchId, isOwner, isStatusReady]);

  const handleClose = useCallback(() => {
    setOpen(false);

    if (churchId) {
      persistDismissed(churchId);
    }
  }, [churchId]);

  const handleSelectStep = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [handleClose, router],
  );

  if (!isOwner || !church) {
    return null;
  }

  const showLauncher = isStatusReady && !allDone;

  return (
    <>
      {showLauncher && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-transform duration-200 hover:scale-[1.03] active:scale-100 sm:bottom-6 sm:right-6"
          aria-label={`Abrir guia de primeiros passos (${completedCount} de ${steps.length} concluídos)`}
        >
          <Rocket className="size-4" aria-hidden />
          <span className="hidden sm:inline">Primeiros passos</span>
          <span className="inline-flex items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-xs tabular-nums">
            {completedCount}/{steps.length}
          </span>
        </button>
      )}

      <OnboardingChecklistModal
        open={open}
        onClose={handleClose}
        onSelectStep={handleSelectStep}
        steps={steps}
        churchName={church.name}
      />
    </>
  );
}
