import type { NavLink } from "@/types";

import { marketingPitch } from "@/constants/marketing-pitch";
import { PUBLIC_ROUTES } from "@/constants/routes";

export const mainNavLinks: NavLink[] = [
  { label: "Início", href: PUBLIC_ROUTES.home },
  { label: "Recursos", href: PUBLIC_ROUTES.resources },
  { label: "Preços", href: PUBLIC_ROUTES.pricing },
  { label: "Sobre", href: PUBLIC_ROUTES.about },
  { label: "FAQ", href: PUBLIC_ROUTES.faq },
  { label: "Segurança", href: PUBLIC_ROUTES.security },
];

export const footerNavLinks: NavLink[] = [
  { label: "Início", href: PUBLIC_ROUTES.home },
  { label: "Recursos", href: PUBLIC_ROUTES.resources },
  { label: "Preços", href: PUBLIC_ROUTES.pricing },
  { label: "Sobre", href: PUBLIC_ROUTES.about },
  { label: "FAQ", href: PUBLIC_ROUTES.faq },
  { label: "Segurança", href: PUBLIC_ROUTES.security },
  { label: "Instalar app", href: PUBLIC_ROUTES.installApp },
  { label: "Termos de Uso", href: PUBLIC_ROUTES.terms },
  { label: "Privacidade", href: PUBLIC_ROUTES.privacy },
  { label: "Adendo LGPD", href: PUBLIC_ROUTES.dpa },
];

export const siteConfig = {
  name: "Minha Church",
  tagline: marketingPitch.tagline,
  description: marketingPitch.siteDescription,
};
