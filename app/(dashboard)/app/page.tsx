import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/constants/routes";

export default function AppIndexPage() {
  redirect(AUTH_ROUTES.dashboard);
}
