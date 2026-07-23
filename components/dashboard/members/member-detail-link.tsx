"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { memberDetailPath } from "@/constants/routes";
import { canAccessMembers } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type MemberDetailHrefOptions = {
  tab?: "cadastro" | "ministerios" | "acompanhamento" | "contribuicoes";
  from?: "acompanhamento" | "membros";
};

type MemberDetailButtonProps = {
  memberId: string | null | undefined;
  memberName?: string | null;
  className?: string;
  /** Preferir quando o botão fica dentro de outro controle clicável. */
  stopPropagation?: boolean;
} & MemberDetailHrefOptions;

/**
 * Botão discreto para abrir a ficha do membro.
 * Só renderiza se houver `memberId` e o usuário tiver `members.access`.
 */
export function MemberDetailButton({
  memberId,
  memberName,
  className,
  stopPropagation = false,
  tab,
  from,
}: MemberDetailButtonProps) {
  const { permissions } = useAuth();

  if (!memberId || !canAccessMembers(permissions)) {
    return null;
  }

  const label = memberName?.trim()
    ? `Abrir ficha de ${memberName.trim()}`
    : "Abrir ficha do membro";

  return (
    <Button
      asChild
      size="icon"
      variant="ghost"
      className={cn(
        "size-8 shrink-0 text-muted-foreground hover:text-foreground",
        className,
      )}
      title={label}
    >
      <Link
        href={memberDetailPath(memberId, { tab, from })}
        aria-label={label}
        onClick={
          stopPropagation
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
      >
        <UserRound className="size-3.5" />
      </Link>
    </Button>
  );
}

type MemberNameLinkProps = {
  memberId: string | null | undefined;
  children: React.ReactNode;
  className?: string;
  stopPropagation?: boolean;
} & MemberDetailHrefOptions;

/**
 * Nome como link para a ficha, quando o usuário tem permissão.
 * Sem permissão ou sem id, renderiza o conteúdo como texto.
 */
export function MemberNameLink({
  memberId,
  children,
  className,
  stopPropagation = false,
  tab,
  from,
}: MemberNameLinkProps) {
  const { permissions } = useAuth();

  if (!memberId || !canAccessMembers(permissions)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={memberDetailPath(memberId, { tab, from })}
      className={cn(
        "rounded-sm text-foreground underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      onClick={
        stopPropagation
          ? (event) => {
              event.stopPropagation();
            }
          : undefined
      }
    >
      {children}
    </Link>
  );
}
