"use client";

import { useQuery } from "@tanstack/react-query";

import { churchRolesKeys } from "@/lib/api/queries/church-roles.keys";
import { useTenant } from "@/providers/auth-provider";

export function useChurchRoles() {
  const { churchId } = useTenant();

  return useQuery({
    ...churchRolesKeys.list(churchId ?? ""),
    enabled: Boolean(churchId),
  });
}
