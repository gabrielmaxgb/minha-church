export interface PrayerRequestAuthor {
  id: string;
  name: string;
}

export interface PrayerRequest {
  id: string;
  churchId: string;
  body: string;
  isAnonymous: boolean;
  author: PrayerRequestAuthor | null;
  prayerCount: number;
  prayedByMe: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrayerRequestPayload {
  body: string;
  isAnonymous?: boolean;
}
