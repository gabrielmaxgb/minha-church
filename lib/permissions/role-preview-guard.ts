/**
 * Flag síncrona (fora do React) para o `apiClient` bloquear mutações mesmo que
 * algum botão ainda esteja habilitado. O AuthProvider mantém isso alinhado ao
 * estado de preview.
 *
 * Não importa `ApiError` daqui — evita dependência circular com `lib/api/client`.
 */

/** Mensagem única para UI e erros de API durante pré-visualização de cargo. */
export const ROLE_PREVIEW_READ_ONLY_REASON =
  "Pré-visualização de cargo: apenas visualização. Saia do preview para fazer alterações.";

export const ROLE_PREVIEW_READ_ONLY_CODE = "ROLE_PREVIEW_READ_ONLY";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let rolePreviewActive = false;

export function setRolePreviewActive(active: boolean): void {
  rolePreviewActive = active;
}

export function isRolePreviewActive(): boolean {
  return rolePreviewActive;
}

/**
 * Escape hatches de sessão: o usuário precisa conseguir sair do preview de
 * forma segura (logout / trocar igreja limpa o preview).
 */
function isSessionEscapeHatch(endpoint: string): boolean {
  return (
    endpoint.startsWith("/auth/logout") ||
    endpoint.startsWith("/auth/switch-church")
  );
}

export function isWriteHttpMethod(method: string | undefined): boolean {
  return WRITE_METHODS.has((method ?? "GET").toUpperCase());
}

/**
 * Retorna o bloqueio de mutação durante preview, ou `null` se a request for
 * permitida. O `apiClient` converte isso em `ApiError`.
 */
export function getRolePreviewWriteBlock(
  endpoint: string,
  method: string | undefined,
): { message: string; code: string } | null {
  if (!rolePreviewActive || !isWriteHttpMethod(method)) {
    return null;
  }

  if (isSessionEscapeHatch(endpoint)) {
    return null;
  }

  return {
    message: ROLE_PREVIEW_READ_ONLY_REASON,
    code: ROLE_PREVIEW_READ_ONLY_CODE,
  };
}
