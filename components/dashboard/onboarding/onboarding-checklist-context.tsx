"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

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

function dismissedStorageKey(churchId: string): string {
  return `mc:onboarding-checklist:dismissed:${churchId}`;
}

function autoShownStorageKey(churchId: string): string {
  return `mc:onboarding-checklist:auto-shown:${churchId}`;
}

function readStorage(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Ignora falhas de storage (ex.: modo privado).
  }
}

interface OnboardingChecklistContextValue {
  openOnboarding: () => void;
  showLauncher: boolean;
  completedCount: number;
  totalSteps: number;
  open: boolean;
}

const OnboardingChecklistContext =
  createContext<OnboardingChecklistContextValue | null>(null);

export function useOnboardingChecklist() {
  return useContext(OnboardingChecklistContext);
}

export function OnboardingChecklistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, church } = useAuth();

  const isOwner = Boolean(user?.isOwner);
  const churchId = church?.id ?? null;

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
          "Garante a segurança da conta do proprietário e conclui o cadastro da igreja.",
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
  const autoOpenAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOwner || !churchId || !isStatusReady || allDone) {
      return;
    }

    if (autoOpenAttemptedRef.current === churchId) {
      return;
    }

    autoOpenAttemptedRef.current = churchId;

    const alreadyDismissed = readStorage(dismissedStorageKey(churchId));
    const alreadyAutoShown = readStorage(autoShownStorageKey(churchId));

    if (!alreadyDismissed && !alreadyAutoShown) {
      writeStorage(autoShownStorageKey(churchId));
      setOpen(true);
    }
  }, [allDone, churchId, isOwner, isStatusReady]);

  const handleClose = useCallback(() => {
    setOpen(false);

    if (churchId) {
      writeStorage(dismissedStorageKey(churchId));
    }
  }, [churchId]);

  const openOnboarding = useCallback(() => {
    setOpen(true);
  }, []);

  const handleSelectStep = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [handleClose, router],
  );

  const contextValue = useMemo<OnboardingChecklistContextValue | null>(() => {
    if (!isOwner || !church || !isStatusReady || allDone) {
      return null;
    }

    return {
      openOnboarding,
      showLauncher: true,
      completedCount,
      totalSteps: steps.length,
      open,
    };
  }, [
    allDone,
    church,
    completedCount,
    isOwner,
    isStatusReady,
    open,
    openOnboarding,
    steps.length,
  ]);

  return (
    <OnboardingChecklistContext.Provider value={contextValue}>
      {children}

      {isOwner && church && (
        <OnboardingChecklistModal
          open={open}
          onClose={handleClose}
          onSelectStep={handleSelectStep}
          steps={steps}
          churchName={church.name}
        />
      )}
    </OnboardingChecklistContext.Provider>
  );
}
