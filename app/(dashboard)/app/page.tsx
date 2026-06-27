import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/lib/auth/constants";

export default function AppIndexPage() {
  redirect(APP_ROUTES.dashboard);
}
