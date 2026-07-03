export function getTimeGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

export function formatLongDate(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatEventDateChip(iso: string): { day: string; month: string } {
  const date = new Date(iso);

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(date)
      .replace(".", "")
      .toUpperCase(),
  };
}

export function formatEventTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRelativeEventDay(iso: string): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDay = new Date(iso);
  eventDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return "Hoje";
  }

  if (diffDays === 1) {
    return "Amanhã";
  }

  if (diffDays > 1 && diffDays <= 14) {
    return `Em ${diffDays} dias`;
  }

  return null;
}

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
