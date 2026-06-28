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
  tagline: "Gestão de igreja sem planilhas e grupos espalhados.",
  description:
    "Plataforma de gestão para igrejas — membros, cultos, finanças e comunicação em um único sistema, feito para pastores e líderes.",
};
