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
  settingsSectionPath,
} from "@/constants/routes";
import {
  useConnectStatus,
  useDashboardSummary,
  useFiscalProfile,
  useManagedAnnouncements,
  useMinistries,
} from "@/lib/api/queries";
import { isOwnerOnboardingMinimumComplete } from "@/lib/payments/fiscal-profile-completeness";
import { useAuth } from "@/providers/auth-provider";

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
  const { data: connectStatus } = useConnectStatus();
  const { data: fiscalProfile, isPending: fiscalPending } = useFiscalProfile();

  const isStatusReady =
    !summaryPending &&
    !announcementsPending &&
    !ministriesPending &&
    (!isOwner || !fiscalPending);

  const emailVerified = user?.emailVerified !== false;
  const hasExtraMember = (summary?.memberCount ?? 0) > 1;
  const hasAnnouncement = (announcements?.length ?? 0) > 0;
  const hasMinistry = (ministries?.length ?? 0) > 0;
  const receivablesActive = Boolean(connectStatus?.canReceivePayments);
  const churchProfileDone = isOwnerOnboardingMinimumComplete(
    fiscalProfile ?? null,
  );

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
      id: "church-profile",
      title: "Complete o perfil da igreja",
      description:
        "WhatsApp, cidade/UF e documentos da igreja (CNPJ + CPF de quem responde, ou só CPF se não houver CNPJ).",
      actionLabel: "Completar perfil",
      href: settingsSectionPath("general"),
      done: churchProfileDone,
    });

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

    if (isOwner) {
      list.push({
        id: "activate-receivables",
        title: "Ative os recebimentos",
        description:
          "Receba dízimos, doações e inscrições em eventos por Pix, cartão e boleto.",
        actionLabel: "Ativar recebimentos",
        href: settingsSectionPath("recebimentos"),
        done: receivablesActive,
        optional: true,
      });
    }

    return list;
  }, [
    churchProfileDone,
    emailStepRelevant,
    emailVerified,
    hasAnnouncement,
    hasExtraMember,
    hasMinistry,
    isOwner,
    receivablesActive,
  ]);

  const completedCount = steps.filter((step) => step.done).length;

  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

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
    if (!isOwner || !church || !isStatusReady) {
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
