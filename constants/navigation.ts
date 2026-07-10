import type { NavLink } from "@/types";

import { PUBLIC_ROUTES } from "@/constants/routes";

export const mainNavLinks: NavLink[] = [
  { label: "Recursos", href: PUBLIC_ROUTES.resources },
  { label: "Preços", href: PUBLIC_ROUTES.pricing },
  { label: "Sobre", href: PUBLIC_ROUTES.about },
];

export const footerNavLinks: NavLink[] = [
  { label: "Início", href: PUBLIC_ROUTES.home },
  { label: "Recursos", href: PUBLIC_ROUTES.resources },
  { label: "Preços", href: PUBLIC_ROUTES.pricing },
  { label: "Sobre", href: PUBLIC_ROUTES.about },
  { label: "FAQ", href: PUBLIC_ROUTES.faq },
  { label: "Segurança", href: PUBLIC_ROUTES.security },
];

export const siteConfig = {
  name: "Minha Church",
  tagline: "A rotina da igreja, em um só lugar.",
  description:
    "Membros, escalas e comunicados para igrejas — sem planilhas e grupos espalhados. Feito para pastores e líderes.",
};
