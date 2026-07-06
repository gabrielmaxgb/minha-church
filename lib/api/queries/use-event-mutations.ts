"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	createChurchEvent,
	deleteChurchEvent,
	eventsKeys,
	removeEventRoster,
	setEventRosterCollection,
	updateChurchEvent,
	updateChurchEventAvailability,
	upsertEventRoster,
	type CreateChurchEventPayload,
	type UpdateChurchEventPayload,
} from "@/lib/api/queries/events.keys";
import { ministriesKeys, queries } from "@/lib/api/queries";
import { rosterKeys } from "@/lib/api/queries/roster.keys";
import { useTenant } from "@/providers/auth-provider";
import type { ChurchEventDetail } from "@/types/events";
import type { EventRosterAssignment } from "@/types/ministries";

function useInvalidateEvents() {
	const queryClient = useQueryClient();

	return async () => {
		await queryClient.invalidateQueries({ queryKey: eventsKeys._def });
		await queryClient.invalidateQueries({ queryKey: ministriesKeys._def });
		await queryClient.invalidateQueries({ queryKey: queries.dashboard._def });
	};
}

export function useCreateChurchEvent() {
	const { churchId } = useTenant();
	const invalidate = useInvalidateEvents();

	return useMutation({
		mutationFn: (payload: CreateChurchEventPayload) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}

			return createChurchEvent(churchId, payload);
		},
		onSuccess: invalidate,
	});
}

export function useUpdateChurchEvent(eventId: string) {
	const { churchId } = useTenant();
	const invalidate = useInvalidateEvents();

	return useMutation({
		mutationFn: (payload: UpdateChurchEventPayload) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}

			return updateChurchEvent(churchId, eventId, payload);
		},
		onSuccess: invalidate,
	});
}

export function useDeleteChurchEvent(eventId: string) {
	const { churchId } = useTenant();
	const invalidate = useInvalidateEvents();

	return useMutation({
		mutationFn: (scope?: UpdateChurchEventPayload["scope"]) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}

			return deleteChurchEvent(churchId, eventId, scope);
		},
		onSuccess: invalidate,
	});
}

function patchEventRosterCache(
	queryClient: ReturnType<typeof useQueryClient>,
	churchId: string,
	eventId: string,
	roster: EventRosterAssignment[],
) {
	queryClient.setQueryData(
		eventsKeys.detail(churchId, eventId).queryKey,
		(current: ChurchEventDetail | undefined) => {
			if (!current) {
				return current;
			}

			const assignedIds = new Set(roster.map((item) => item.memberId));

			return {
				...current,
				roster,
				rosterCandidates: current.rosterCandidates.filter(
					(candidate) => !assignedIds.has(candidate.memberId),
				),
			};
		},
	);
}

export function useSetEventRosterCollection(eventId: string) {
	const { churchId } = useTenant();
	const invalidate = useInvalidateEvents();

	return useMutation({
		mutationFn: (payload: { rosterOpen: boolean; eventIds: string[] }) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}

			return setEventRosterCollection(churchId, eventId, payload);
		},
		onSuccess: invalidate,
	});
}

export function useUpdateChurchEventAvailability(eventId: string) {
	const { churchId } = useTenant();
	const queryClient = useQueryClient();
	const invalidate = useInvalidateEvents();

	return useMutation({
		mutationFn: (payload: {
			status: "available" | "unavailable" | "clear";
			roleLabels?: string[];
		}) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}

			return updateChurchEventAvailability(churchId, eventId, payload);
		},
		onSuccess: async () => {
			if (churchId) {
				await queryClient.invalidateQueries({
					queryKey: eventsKeys.detail(churchId, eventId).queryKey,
				});
			}

			await invalidate();
			await queryClient.invalidateQueries({ queryKey: rosterKeys._def });
		},
	});
}

export function useUpsertEventRoster(eventId: string) {
	const { churchId } = useTenant();
	const queryClient = useQueryClient();
	const invalidate = useInvalidateEvents();

	return useMutation({
		mutationFn: (payload: { memberId: string; rosterSlotId: string }) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}

			return upsertEventRoster(churchId, eventId, payload);
		},
		onSuccess: async (roster) => {
			if (churchId) {
				patchEventRosterCache(queryClient, churchId, eventId, roster);
			}

			await invalidate();
			await queryClient.invalidateQueries({ queryKey: rosterKeys._def });
		},
	});
}

export function useRemoveEventRoster(eventId: string) {
	const { churchId } = useTenant();
	const queryClient = useQueryClient();
	const invalidate = useInvalidateEvents();

	return useMutation({
		mutationFn: (memberId: string) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}

			return removeEventRoster(churchId, eventId, memberId);
		},
		onSuccess: async (roster) => {
			if (churchId) {
				patchEventRosterCache(queryClient, churchId, eventId, roster);
			}

			await invalidate();
			await queryClient.invalidateQueries({ queryKey: rosterKeys._def });
		},
	});
}
