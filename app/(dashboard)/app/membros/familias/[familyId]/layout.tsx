"use client";

import { FamilyGraphShell } from "@/components/dashboard/members/family-graph-shell";

/**
 * Route layout for the family graph workspace.
 * Unlike other dashboard pages (which wrap DashboardShell in the page),
 * this layout replaces the dashboard chrome entirely — canvas owns the viewport.
 */
export default function FamilyGraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FamilyGraphShell>{children}</FamilyGraphShell>;
}
