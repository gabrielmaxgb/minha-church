"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, FileText, Trash2 } from "lucide-react";

import { FormAlert } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { MEMBER_RETENTION_DAYS } from "@/constants/legal";
import { useFiscalProfile } from "@/lib/api/queries";
import {
  acceptDpa,
  cancelChurchClosure,
  exportChurchData,
  requestChurchClosure,
} from "@/lib/api/privacy";
import { ApiError } from "@/lib/api/client";
import { useFeatureLock } from "@/lib/subscription/use-feature-lock";
import { useAuth, useTenant } from "@/providers/auth-provider";

import { ChurchFiscalProfileForm } from "./church-fiscal-profile-form";
import {
  SettingsPanel,
  SettingsSectionHeader,
} from "./settings-shared";

export function SettingsGeneralPanel() {
  const { user, reloadSession } = useAuth();
  const { church, churchId, churches } = useTenant();
  const fiscalProfile = useFiscalProfile();
  const { locked } = useFeatureLock();

  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closureSlug, setClosureSlug] = useState("");

  const isOwner = Boolean(user?.isOwner);
  const needsDpa = isOwner && church && !church.dpaAccepted;
  const pendingClosure = Boolean(church?.deletedAt);

  async function runAction(
    key: string,
    action: () => Promise<void>,
    success: string,
  ) {
    if (!churchId) return;
    setBusy(key);
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(success);
      await reloadSession();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível concluir a ação.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <SettingsSectionHeader
        title="Geral"
        description="Dados e identificação da igreja ativa."
      />

      <div className="space-y-6">
        {(message || error) && (
          <FormAlert variant={error ? "error" : "success"}>
            {error ?? message}
          </FormAlert>
        )}

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

        {user?.isOwner ? (
          fiscalProfile.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          ) : fiscalProfile.isError ? (
            <FormAlert>
              Não foi possível carregar o perfil da igreja. Recarregue a página
              e tente novamente.
            </FormAlert>
          ) : (
            <ChurchFiscalProfileForm
              profile={fiscalProfile.data ?? null}
              locked={locked}
            />
          )
        ) : null}

        {isOwner && needsDpa ? (
          <SettingsPanel>
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Adendo LGPD (DPA)</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Aceite o adendo de proteção de dados para formalizar o papel
                    da igreja como controladora e da plataforma como operadora.{" "}
                    <Link
                      href={PUBLIC_ROUTES.dpa}
                      className="font-medium underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ler o DPA
                    </Link>
                  </p>
                </div>
              </div>
              <Button
                type="button"
                disabled={busy === "dpa"}
                onClick={() =>
                  runAction(
                    "dpa",
                    async () => {
                      await acceptDpa(churchId!);
                    },
                    "Adendo LGPD aceito.",
                  )
                }
              >
                Aceitar Adendo LGPD
              </Button>
            </div>
          </SettingsPanel>
        ) : null}

        {isOwner ? (
          <SettingsPanel>
            <div className="space-y-4 px-5 py-5">
              <div>
                <h3 className="text-sm font-medium">Exportar dados da igreja</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Baixa um JSON com membros, famílias, ministérios e avisos
                  (sem segredos de pagamento).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={busy === "export" || !churchId}
                onClick={() =>
                  runAction(
                    "export",
                    async () => {
                      await exportChurchData(churchId!);
                    },
                    "Exportação iniciada.",
                  )
                }
              >
                <Download className="size-4" />
                Baixar pacote JSON
              </Button>
            </div>
          </SettingsPanel>
        ) : null}

        {isOwner ? (
          <SettingsPanel>
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-start gap-3">
                <Trash2 className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <h3 className="text-sm font-medium text-destructive">
                    Encerrar igreja
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pendingClosure
                      ? `Encerramento solicitado. Dados serão anonimizados após ${MEMBER_RETENTION_DAYS} dias (até ${
                          church?.purgeAfter
                            ? new Date(church.purgeAfter).toLocaleDateString(
                                "pt-BR",
                              )
                            : "—"
                        }). Você pode cancelar neste período.`
                      : `Solicita o encerramento. Mantemos os dados por ${MEMBER_RETENTION_DAYS} dias e depois anonimizamos. Exporte antes. Digite o slug da igreja para confirmar.`}
                  </p>
                </div>
              </div>

              {pendingClosure ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy === "cancel-closure"}
                  onClick={() =>
                    runAction(
                      "cancel-closure",
                      async () => {
                        await cancelChurchClosure(churchId!);
                      },
                      "Encerramento cancelado. A igreja foi reativada.",
                    )
                  }
                >
                  Cancelar encerramento
                </Button>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <label
                      htmlFor="closure-slug"
                      className="text-xs text-muted-foreground"
                    >
                      Digite o slug ({church?.slug})
                    </label>
                    <Input
                      id="closure-slug"
                      value={closureSlug}
                      onChange={(e) => setClosureSlug(e.target.value)}
                      placeholder={church?.slug}
                      disabled={busy === "closure"}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={
                      busy === "closure" ||
                      !churchId ||
                      closureSlug.trim() !== (church?.slug ?? "")
                    }
                    onClick={() =>
                      runAction(
                        "closure",
                        async () => {
                          await requestChurchClosure(
                            churchId!,
                            closureSlug.trim(),
                          );
                        },
                        "Encerramento solicitado.",
                      )
                    }
                  >
                    Encerrar igreja
                  </Button>
                </div>
              )}
            </div>
          </SettingsPanel>
        ) : null}
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
