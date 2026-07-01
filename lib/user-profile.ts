const INTERNAL_LOGIN_EMAIL_SUFFIX = "@accounts.minhachurch.app";

export function isInternalLoginEmail(email: string): boolean {
  return email.endsWith(INTERNAL_LOGIN_EMAIL_SUFFIX);
}

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCpf(cpf: string): string {
  const digits = normalizeCpf(cpf);

  if (digits.length !== 11) {
    return digits || cpf;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function getProfileEmailValue(user: {
  email: string;
  cpf?: string;
}): string {
  if (isInternalLoginEmail(user.email)) {
    return "";
  }

  return user.email;
}

export function getUserLoginLabel(user: {
  email: string;
  cpf?: string;
}): string {
  if (user.cpf) {
    return formatCpf(user.cpf);
  }

  if (isInternalLoginEmail(user.email)) {
    return user.email;
  }

  return user.email;
}
