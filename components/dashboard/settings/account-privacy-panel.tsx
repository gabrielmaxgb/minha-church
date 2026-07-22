"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MEMBER_RETENTION_DAYS } from "@/constants/legal";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { toastApiError, toastSuccess } from "@/lib/ui/toast";
import {
  deleteMyAccount,
  exportMyAccountData,
  exportMyMemberData,
} from "@/lib/api/privacy";
import { useAuth } from "@/providers/auth-provider";

import { SettingsPanel } from "./settings-shared";

export function AccountPrivacyPanel({
  churchId,
}: {
  churchId?: string | null;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  async function run(key: string, fn: () => Promise<void>, ok: string) {
    setBusy(key);
    try {
      await fn();
      toastSuccess(ok);
    } catch (err) {
      toastApiError(err, "Não foi possível concluir a ação.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <SettingsPanel>
        <div className="space-y-4 px-5 py-5">
          <div>
            <h3 className="text-sm font-medium">Baixar meus dados</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Exporta a conta e, se houver, a ficha de membro nesta igreja
              (portabilidade LGPD).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy === "account"}
              onClick={() =>
                run(
                  "account",
                  async () => {
                    await exportMyAccountData();
                  },
                  "Dados da conta baixados.",
                )
              }
            >
              <Download className="size-4" />
              Conta
            </Button>
            {churchId ? (
              <Button
                type="button"
                variant="outline"
                disabled={busy === "member"}
                onClick={() =>
                  run(
                    "member",
                    async () => {
                      await exportMyMemberData(churchId);
                    },
                    "Dados de membro baixados.",
                  )
                }
              >
                <Download className="size-4" />
                Ficha de membro
              </Button>
            ) : null}
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel>
        <div className="space-y-4 px-5 py-5">
          <div className="flex items-start gap-3">
            <Trash2 className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <h3 className="text-sm font-medium text-destructive">
                Excluir minha conta
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Se você for responsável (owner) de alguma igreja ativa, transfira
                a propriedade ou encerre a igreja antes. Após a exclusão,
                anonimizamos os dados em {MEMBER_RETENTION_DAYS} dias.{" "}
                <a
                  href={PUBLIC_ROUTES.privacy}
                  className="font-medium underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="delete-account-password"
                className="text-xs text-muted-foreground"
              >
                Confirme com sua senha
              </label>
              <Input
                id="delete-account-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy === "delete"}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={busy === "delete" || password.length < 1}
              onClick={() =>
                run(
                  "delete",
                  async () => {
                    await deleteMyAccount(password);
                    await logout();
                    router.replace(PUBLIC_ROUTES.login);
                  },
                  "Conta excluída.",
                )
              }
            >
              Excluir conta
            </Button>
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}
