export type CareRequestType = "counseling" | "visit";

export type CareRequestStatus = "pending" | "viewed";

export interface CareRequestMemberSummary {
  id: string;
  name: string;
}

export interface CareRequestRecipient {
  id: string;
  name: string;
  roles: string[];
}

export interface CareRequest {
  id: string;
  churchId: string;
  type: CareRequestType;
  status: CareRequestStatus;
  message: string | null;
  requester: CareRequestMemberSummary;
  recipient: CareRequestMemberSummary;
  viewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareRequestPayload {
  recipientMemberId: string;
  type: CareRequestType;
  message?: string;
}

export const CARE_REQUEST_TYPE_LABELS: Record<CareRequestType, string> = {
  counseling: "Aconselhamento",
  visit: "Visita",
};
