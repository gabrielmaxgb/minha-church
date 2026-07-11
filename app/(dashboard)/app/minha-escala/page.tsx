import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/constants/routes";

export default function LegacyMySchedulePage() {
  redirect(AUTH_ROUTES.mySchedules);
}
