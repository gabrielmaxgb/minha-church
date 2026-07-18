import { apiClient } from "@/lib/api/client";

export type PushStatusResponse = {
  configured: boolean;
  enabled: boolean;
  subscriptionCount: number;
};

export type VapidPublicKeyResponse = {
  publicKey: string;
};

export async function fetchPushStatus(): Promise<PushStatusResponse> {
  return apiClient<PushStatusResponse>("/push/status");
}

export async function fetchVapidPublicKey(): Promise<VapidPublicKeyResponse> {
  return apiClient<VapidPublicKeyResponse>("/push/vapid-public-key");
}

export async function upsertPushSubscription(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>("/push/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deletePushSubscription(
  endpoint: string,
): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>("/push/subscriptions", {
    method: "DELETE",
    body: JSON.stringify({ endpoint }),
  });
}
