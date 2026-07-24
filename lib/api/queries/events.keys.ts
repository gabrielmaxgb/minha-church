import { createQueryKeys } from "@lukemorales/query-key-factory";

import { apiClient, buildTenantPath } from "@/lib/api/client";
import type {
	ChurchEvent,
	ChurchEventDetail,
	CreateChurchEventPayload,
	EventNotesList,
	EventNote,
	EventSeriesOccurrence,
	EventTicketRegistrationsResponse,
	UpdateChurchEventPayload,
	CreateEventNotePayload,
	UpdateEventNotePayload,
} from "@/types/events";
import type { EventRosterAssignment } from "@/types/ministries";

export interface ListChurchEventsParams {
	ministryId?: string;
	churchWideOnly?: boolean;
	from?: string;
	to?: string;
}

async function fetchChurchEvents(
	churchId: string,
	params: ListChurchEventsParams = {},
): Promise<ChurchEvent[]> {
	const searchParams = new URLSearchParams();

	if (params.ministryId) {
		searchParams.set("ministryId", params.ministryId);
	}

	if (params.churchWideOnly) {
		searchParams.set("churchWideOnly", "true");
	}

	if (params.from) {
		searchParams.set("from", params.from);
	}

	if (params.to) {
		searchParams.set("to", params.to);
	}

	const query = searchParams.toString();
	const path = buildTenantPath(churchId, `/events${query ? `?${query}` : ""}`);

	return apiClient<ChurchEvent[]>(path, { churchId });
}

async function fetchChurchEvent(
	churchId: string,
	eventId: string,
): Promise<ChurchEventDetail> {
	return apiClient<ChurchEventDetail>(
		buildTenantPath(churchId, `/events/${eventId}`),
		{ churchId },
	);
}

async function fetchEventSeriesOccurrences(
	churchId: string,
	seriesId: string,
): Promise<EventSeriesOccurrence[]> {
	return apiClient<EventSeriesOccurrence[]>(
		buildTenantPath(churchId, `/events/series/${seriesId}/occurrences`),
		{ churchId },
	);
}

async function fetchEventTicketRegistrations(
	churchId: string,
	eventId: string,
): Promise<EventTicketRegistrationsResponse> {
	return apiClient<EventTicketRegistrationsResponse>(
		buildTenantPath(churchId, `/events/${eventId}/ticket-registrations`),
		{ churchId },
	);
}

async function registerForFreeEvent(
	churchId: string,
	eventId: string,
): Promise<{
	id: string;
	status: "succeeded" | "pending" | "failed" | "canceled" | "refunded";
	amountCents: number;
}> {
	return apiClient(buildTenantPath(churchId, `/events/${eventId}/register`), {
		churchId,
		method: "POST",
		body: JSON.stringify({}),
	});
}

async function createChurchEvent(
	churchId: string,
	payload: CreateChurchEventPayload,
): Promise<ChurchEvent> {
	return apiClient<ChurchEvent>(buildTenantPath(churchId, "/events"), {
		churchId,
		method: "POST",
		body: JSON.stringify(payload),
	});
}

async function updateChurchEvent(
	churchId: string,
	eventId: string,
	payload: UpdateChurchEventPayload,
): Promise<ChurchEvent> {
	return apiClient<ChurchEvent>(
		buildTenantPath(churchId, `/events/${eventId}`),
		{
			churchId,
			method: "PATCH",
			body: JSON.stringify(payload),
		},
	);
}

async function deleteChurchEvent(
	churchId: string,
	eventId: string,
	scope?: UpdateChurchEventPayload["scope"],
): Promise<void> {
	const query = scope && scope !== "this" ? `?scope=${scope}` : "";

	await apiClient<void>(
		buildTenantPath(churchId, `/events/${eventId}${query}`),
		{
			churchId,
			method: "DELETE",
		},
	);
}

async function upsertEventRoster(
	churchId: string,
	eventId: string,
	payload: { memberId: string; roleLabel: string; rosterSlotId?: string },
): Promise<EventRosterAssignment[]> {
	return apiClient<EventRosterAssignment[]>(
		buildTenantPath(churchId, `/events/${eventId}/roster`),
		{
			churchId,
			method: "PUT",
			body: JSON.stringify(payload),
		},
	);
}

async function removeEventRoster(
	churchId: string,
	eventId: string,
	memberId: string,
): Promise<EventRosterAssignment[]> {
	return apiClient<EventRosterAssignment[]>(
		buildTenantPath(churchId, `/events/${eventId}/roster/${memberId}`),
		{
			churchId,
			method: "DELETE",
		},
	);
}

async function updateChurchEventAvailability(
	churchId: string,
	eventId: string,
	payload: {
		status: "available" | "unavailable" | "clear";
		roleLabels?: string[];
	},
): Promise<void> {
	await apiClient<void>(
		buildTenantPath(churchId, `/events/${eventId}/availability`),
		{
			churchId,
			method: "PATCH",
			body: JSON.stringify(payload),
		},
	);
}

async function setEventRosterCollection(
	churchId: string,
	eventId: string,
	payload: { rosterOpen: boolean; eventIds: string[] },
): Promise<{ updated: number }> {
	return apiClient<{ updated: number }>(
		buildTenantPath(churchId, `/events/${eventId}/roster-collection`),
		{
			churchId,
			method: "PATCH",
			body: JSON.stringify(payload),
		},
	);
}

async function fetchEventNotes(
	churchId: string,
	eventId: string,
): Promise<EventNotesList> {
	return apiClient<EventNotesList>(
		buildTenantPath(churchId, `/events/${eventId}/notes`),
		{ churchId },
	);
}

async function createEventNote(
	churchId: string,
	eventId: string,
	payload: CreateEventNotePayload,
): Promise<EventNote> {
	return apiClient<EventNote>(
		buildTenantPath(churchId, `/events/${eventId}/notes`),
		{
			churchId,
			method: "POST",
			body: JSON.stringify(payload),
		},
	);
}

async function updateEventNote(
	churchId: string,
	eventId: string,
	noteId: string,
	payload: UpdateEventNotePayload,
): Promise<EventNote> {
	return apiClient<EventNote>(
		buildTenantPath(churchId, `/events/${eventId}/notes/${noteId}`),
		{
			churchId,
			method: "PATCH",
			body: JSON.stringify(payload),
		},
	);
}

async function deleteEventNote(
	churchId: string,
	eventId: string,
	noteId: string,
): Promise<void> {
	await apiClient<void>(
		buildTenantPath(churchId, `/events/${eventId}/notes/${noteId}`),
		{
			churchId,
			method: "DELETE",
		},
	);
}

export const eventsKeys = createQueryKeys("events", {
	list: (churchId: string, params: ListChurchEventsParams = {}) => ({
		queryKey: [churchId, params],
		queryFn: () => fetchChurchEvents(churchId, params),
	}),
	detail: (churchId: string, eventId: string) => ({
		queryKey: [churchId, eventId],
		queryFn: () => fetchChurchEvent(churchId, eventId),
	}),
	seriesOccurrences: (churchId: string, seriesId: string) => ({
		queryKey: [churchId, "series", seriesId],
		queryFn: () => fetchEventSeriesOccurrences(churchId, seriesId),
	}),
	ticketRegistrations: (churchId: string, eventId: string) => ({
		queryKey: [churchId, eventId, "ticket-registrations"],
		queryFn: () => fetchEventTicketRegistrations(churchId, eventId),
	}),
	notes: (churchId: string, eventId: string) => ({
		queryKey: [churchId, eventId, "notes"],
		queryFn: () => fetchEventNotes(churchId, eventId),
	}),
});

export {
	createChurchEvent,
	createEventNote,
	deleteChurchEvent,
	deleteEventNote,
	fetchChurchEvent,
	fetchChurchEvents,
	fetchEventNotes,
	fetchEventSeriesOccurrences,
	fetchEventTicketRegistrations,
	registerForFreeEvent,
	removeEventRoster,
	setEventRosterCollection,
	updateChurchEvent,
	updateChurchEventAvailability,
	updateEventNote,
	upsertEventRoster,
};

export type {
	CreateChurchEventPayload,
	CreateEventNotePayload,
	UpdateChurchEventPayload,
	UpdateEventNotePayload,
};
