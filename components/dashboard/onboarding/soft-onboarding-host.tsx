"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Building2, UserRound, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormAlert, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { settingsSectionPath } from "@/constants/routes";
import { formatBrPhoneInput } from "@/lib/geo/br-states";
import { useFiscalProfile, useMyMember } from "@/lib/api/queries";
import { isOwnerOnboardingMinimumComplete } from "@/lib/payments/fiscal-profile-completeness";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const memberOnboardingSchema = z.object({
  phone: z.string().trim().min(1, "Informe seu WhatsApp."),
  birthDate: z.string().trim().min(1, "Informe sua data de nascimento."),
});

type MemberOnboardingValues = z.infer<typeof memberOnboardingSchema>;

function sessionKey(kind: "owner" | "member", id: string) {
  return `mc-soft-onboarding-auto:${kind}:${id}`;
}

function dismissKey(kind: "owner" | "member", id: string) {
  return `mc-soft-onboarding-dismiss:${kind}:${id}`;
}

function SoftModalShell({
  open,
  onClose,
  title,
  description,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 flex max-h-[min(94dvh,720px)] w-full max-w-lg flex-col rounded-t-xl border border-border bg-background shadow-popover sm:rounded-xl"
      >
        <header className="flex items-start gap-4 px-6 pb-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            {icon}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="text-xl font-semibold tracking-tight">
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-1 text-sm text-muted-foreground"
            >
              {description}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="size-4" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

function OwnerSoftOnboarding() {
  const { church } = useAuth();
  const fiscal = useFiscalProfile();
  const profile = fiscal.data ?? null;
  const complete = isOwnerOnboardingMinimumComplete(profile);
  const churchId = church?.id ?? "";

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!churchId || fiscal.isPending || complete) {
      return;
    }

    const autoKey = sessionKey("owner", churchId);
    if (sessionStorage.getItem(autoKey) === "1") {
      return;
    }

    sessionStorage.setItem(autoKey, "1");
    setOpen(true);
  }, [churchId, fiscal.isPending, complete]);

  if (!church || complete || fiscal.isPending) {
    return null;
  }

  return (
    <>
      <div className="mb-4 rounded-xl border border-attention-border bg-attention-subtle px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-attention-foreground">
              Complete o perfil da igreja
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              WhatsApp, cidade/UF e documentos da igreja (CNPJ + CPF de quem
              responde, ou só CPF se a igreja não tiver CNPJ). Sem isso, não dá
              para receber doações.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>
              Ver o que falta
            </Button>
            <Button asChild>
              <Link href={settingsSectionPath("general")}>Completar</Link>
            </Button>
          </div>
        </div>
      </div>

      <SoftModalShell
        open={open}
        onClose={() => {
          setOpen(false);
          if (churchId) {
            sessionStorage.setItem(dismissKey("owner", churchId), "1");
          }
        }}
        title="Perfil da igreja"
        description="Preencha o essencial para a igreja operar com segurança. Com CNPJ, o dinheiro entra no nome da igreja."
        icon={<Building2 className="size-5" aria-hidden />}
      >
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Contato:</span>{" "}
            WhatsApp de quem responde pela igreja
          </li>
          <li>
            <span className="font-medium text-foreground">Local:</span> cidade e
            UF
          </li>
          <li>
            <span className="font-medium text-foreground">Documentos:</span> CNPJ
            da igreja e CPF de quem responde por ela. Se a igreja não tem CNPJ,
            usamos o CPF de quem cuida da conta.
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Você pode fechar e continuar no app. O aviso permanece até completar.
          Recebimentos e fundos de doação só liberam depois.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Agora não
          </Button>
          <Button asChild>
            <Link href={settingsSectionPath("general")}>
              Ir para Geral
            </Link>
          </Button>
        </div>
      </SoftModalShell>
    </>
  );
}

function MemberSoftOnboarding() {
  const { user, church, updateProfile } = useAuth();
  const myMember = useMyMember();
  const member = myMember.data;
  const userId = user?.id ?? "";

  const incomplete = useMemo(() => {
    if (myMember.isPending || myMember.isError || !member) {
      return false;
    }

    const phone = (member.phone ?? "").replace(/\D/g, "");
    const birth = member.birthDate?.trim();
    return phone.length < 10 || !birth;
  }, [member, myMember.isError, myMember.isPending]);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<MemberOnboardingValues>({
    resolver: zodResolver(memberOnboardingSchema),
    defaultValues: {
      phone: "",
      birthDate: "",
    },
  });

  useEffect(() => {
    if (!member) {
      return;
    }

    form.reset({
      phone: member.phone ? formatBrPhoneInput(member.phone) : "",
      birthDate: member.birthDate?.split("T")[0] ?? "",
    });
  }, [member, form]);

  useEffect(() => {
    if (!userId || myMember.isPending || !incomplete) {
      return;
    }

    if (user?.mustChangePassword) {
      return;
    }

    const autoKey = sessionKey("member", userId);
    if (sessionStorage.getItem(autoKey) === "1") {
      return;
    }

    sessionStorage.setItem(autoKey, "1");
    setOpen(true);
  }, [userId, myMember.isPending, incomplete, user?.mustChangePassword]);

  if (!church || !user || user.isOwner || myMember.isPending || !incomplete) {
    return null;
  }

  if (myMember.isError || !member) {
    return null;
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await updateProfile({
        phone: values.phone.replace(/\D/g, ""),
        birthDate: values.birthDate,
      });
      await myMember.refetch();
      setOpen(false);
    } catch {
      setError("Não foi possível salvar. Tente de novo.");
    }
  });

  return (
    <>
      <div className="mb-4 rounded-xl border border-attention-border bg-attention-subtle px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-attention-foreground">
              Complete seu perfil
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Informe WhatsApp e data de nascimento para a igreja conseguir
              falar com você.
            </p>
          </div>
          <Button type="button" onClick={() => setOpen(true)}>
            Completar
          </Button>
        </div>
      </div>

      <SoftModalShell
        open={open}
        onClose={() => setOpen(false)}
        title="Seu perfil"
        description="Só o essencial — você pode fechar e continuar usando o app."
        icon={<UserRound className="size-5" aria-hidden />}
      >
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {error && <FormAlert>{error}</FormAlert>}
          <FormField
            label="WhatsApp"
            htmlFor="member-onboarding-phone"
            error={form.formState.errors.phone?.message}
            required
          >
            <Controller
              name="phone"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="member-onboarding-phone"
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(formatBrPhoneInput(event.target.value))
                  }
                />
              )}
            />
          </FormField>
          <FormField
            label="Data de nascimento"
            htmlFor="member-onboarding-birth"
            error={form.formState.errors.birthDate?.message}
            required
          >
            <Controller
              name="birthDate"
              control={form.control}
              render={({ field }) => (
                <DatePicker
                  id="member-onboarding-birth"
                  value={field.value}
                  onChange={field.onChange}
                  toYear={new Date().getFullYear()}
                />
              )}
            />
          </FormField>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Agora não
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </SoftModalShell>
    </>
  );
}

/** Banner + modal soft no 1º acesso (dono e membro). */
export function SoftOnboardingHost({ className }: { className?: string }) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={cn(className)}>
      {user.isOwner ? <OwnerSoftOnboarding /> : <MemberSoftOnboarding />}
    </div>
  );
}
