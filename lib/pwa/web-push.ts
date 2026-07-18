/**
 * Web Push helpers — subscribe/unsubscribe no PWA.
 * iOS: só funciona com o app na Tela de Início (standalone).
 */

import {
  deletePushSubscription,
  fetchVapidPublicKey,
  upsertPushSubscription,
} from "@/lib/api/push";
import { isIosDevice, isStandaloneDisplay } from "@/lib/pwa/install";

export type PushSupport =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "unsupported"
        | "ios-not-standalone"
        | "no-service-worker"
        | "permission-denied"
        | "not-configured";
      message: string;
    };

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") {
    return {
      ok: false,
      reason: "unsupported",
      message: "Disponível apenas no celular.",
    };
  }

  if (!("Notification" in window) || !("PushManager" in window)) {
    return {
      ok: false,
      reason: "unsupported",
      message: "Este navegador não suporta notificações push.",
    };
  }

  if (!("serviceWorker" in navigator)) {
    return {
      ok: false,
      reason: "no-service-worker",
      message: "Service worker indisponível neste ambiente.",
    };
  }

  if (isIosDevice() && !isStandaloneDisplay()) {
    return {
      ok: false,
      reason: "ios-not-standalone",
      message:
        "No iPhone, instale o Minha Church na Tela de Início para receber push.",
    };
  }

  return { ok: true };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) {
    return existing;
  }

  return navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
}

export async function enableWebPush(): Promise<void> {
  const support = getPushSupport();
  if (!support.ok) {
    throw new Error(support.message);
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Permissão de notificação bloqueada no sistema."
        : "Permissão de notificação não concedida.",
    );
  }

  const { publicKey } = await fetchVapidPublicKey();
  const registration = await getRegistration();
  await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Não foi possível obter a subscription de push.");
  }

  await upsertPushSubscription({
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    userAgent: navigator.userAgent,
  });
}

export async function disableWebPush(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return;
  }

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return;
  }

  const endpoint = subscription.endpoint;
  try {
    await deletePushSubscription(endpoint);
  } finally {
    await subscription.unsubscribe();
  }
}

export async function getBrowserPushSubscriptionEndpoint(): Promise<
  string | null
> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return null;
  }

  const subscription = await registration.pushManager.getSubscription();
  return subscription?.endpoint ?? null;
}
