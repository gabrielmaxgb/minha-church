"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createEventNote,
	deleteEventNote,
	eventsKeys,
	updateEventNote,
	type CreateEventNotePayload,
	type UpdateEventNotePayload,
} from "@/lib/api/queries/events.keys";
import { useTenant } from "@/providers/auth-provider";
import type { EventNote, EventNotesList } from "@/types/events";

function patchNotesCache(
	queryClient: ReturnType<typeof useQueryClient>,
	churchId: string,
	eventId: string,
	updater: (current: EventNotesList) => EventNotesList,
) {
	queryClient.setQueryData<EventNotesList>(
		eventsKeys.notes(churchId, eventId).queryKey,
		(current) => (current ? updater(current) : current),
	);
}

export function useEventNotes(eventId: string, enabled = true) {
	const { churchId } = useTenant();

	return useQuery({
		...eventsKeys.notes(churchId ?? "unknown", eventId),
		enabled: Boolean(churchId && eventId && enabled),
	});
}

export function useCreateEventNote(eventId: string) {
	const { churchId } = useTenant();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateEventNotePayload) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}
			return createEventNote(churchId, eventId, payload);
		},
		onSuccess: (note) => {
			if (!churchId) {
				return;
			}
			patchNotesCache(queryClient, churchId, eventId, (current) => ({
				...current,
				notes: [
					note,
					...current.notes.filter((item) => item.id !== note.id),
				],
			}));
		},
	});
}

export function useUpdateEventNote(eventId: string) {
	const { churchId } = useTenant();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			noteId,
			payload,
		}: {
			noteId: string;
			payload: UpdateEventNotePayload;
		}) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}
			return updateEventNote(churchId, eventId, noteId, payload);
		},
		onSuccess: (note: EventNote) => {
			if (!churchId) {
				return;
			}
			patchNotesCache(queryClient, churchId, eventId, (current) => ({
				...current,
				notes: current.notes.map((item) =>
					item.id === note.id ? note : item,
				),
			}));
		},
	});
}

export function useDeleteEventNote(eventId: string) {
	const { churchId } = useTenant();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (noteId: string) => {
			if (!churchId) {
				throw new Error("Igreja não selecionada.");
			}
			return deleteEventNote(churchId, eventId, noteId);
		},
		onSuccess: (_void, noteId) => {
			if (!churchId) {
				return;
			}
			patchNotesCache(queryClient, churchId, eventId, (current) => ({
				...current,
				notes: current.notes.filter((item) => item.id !== noteId),
			}));
		},
	});
}
