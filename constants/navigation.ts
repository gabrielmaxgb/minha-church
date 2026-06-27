import type { NavLink } from "@/types";

export const mainNavLinks: NavLink[] = [
	{ label: "Recursos", href: "/recursos" },
	{ label: "Preços", href: "/preco" },
	{ label: "Sobre", href: "/sobre" },
];

export const footerNavLinks: NavLink[] = [
	{ label: "Início", href: "/" },
	{ label: "Recursos", href: "/recursos" },
	{ label: "Preços", href: "/preco" },
	{ label: "Sobre", href: "/sobre" },
	{ label: "FAQ", href: "/faq" },
	{ label: "Segurança", href: "/seguranca" },
];

export const siteConfig = {
	name: "Minha Church",
	tagline: "Gestão de igreja sem planilhas e grupos espalhados.",
	description:
		"Plataforma de gestão para igrejas — membros, cultos, finanças e comunicação em um único sistema, feito para pastores e líderes.",
};
