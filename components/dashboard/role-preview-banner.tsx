"use client";

import { Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { settingsSectionPath } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

/**
 * Barra flutuante exibida enquanto o usuário pré-visualiza a igreja como um cargo.
 * Fica sempre acessível (independe das permissões do cargo) para permitir sair.
 * Durante o preview, mutações estão bloqueadas (somente visualização).
 */
export function RolePreviewBanner() {
  const router = useRouter();
  const { isPreviewingRole, previewRoleName, stopRolePreview } = useAuth();

  if (!isPreviewingRole) {
    return null;
  }

  const handleExit = () => {
    stopRolePreview();
    router.push(settingsSectionPath("roles"));
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 bottom-[calc(var(--mobile-nav-offset,0px)+1rem)] lg:bottom-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-amber-900 shadow-lg dark:border-amber-500/40 dark:bg-amber-950/90 dark:text-amber-100">
        <Eye className="size-4 shrink-0" />
        <p className="min-w-0 truncate text-sm">
          Vendo como{" "}
          <span className="font-semibold">{previewRoleName}</span>
          <span className="text-amber-800/80 dark:text-amber-200/80">
            {" "}
            · somente visualização
          </span>
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleExit}
          className="h-7 shrink-0 gap-1 rounded-full border-amber-300 bg-transparent text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-100 dark:hover:bg-amber-900/60"
        >
          <X className="size-3.5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
