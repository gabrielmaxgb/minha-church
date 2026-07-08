"use client";

import { useQuery } from "@tanstack/react-query";

import { announcementsKeys } from "@/lib/api/queries/announcements.keys";
import { useTenant } from "@/providers/auth-provider";

export function useAnnouncements(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...announcementsKeys.feed(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
  });
}

export function useManagedAnnouncements(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...announcementsKeys.manage(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
  });
}

export function useAnnouncementsUnreadCount(options?: { enabled?: boolean }) {
  const { churchId } = useTenant();

  return useQuery({
    ...announcementsKeys.unreadCount(churchId ?? "unknown"),
    enabled: Boolean(churchId) && (options?.enabled ?? true),
    staleTime: 60_000,
  });
}
