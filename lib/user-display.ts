import type { User } from "@/types/auth";

export function formatUserAccessLabel(user: User): string {
  if (user.isOwner) {
    return "Proprietário";
  }

  if (user.roles.length === 0) {
    return "Sem cargo";
  }

  return user.roles.map((role) => role.name).join(", ");
}
