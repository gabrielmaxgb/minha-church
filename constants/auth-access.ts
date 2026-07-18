/**
 * TEMP: desliga login/cadastro no site público de produção até o go-live.
 * Preview/dev continuam liberados. Reverter: forçar `true`.
 */
const isVercelProduction =
	process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export const AUTH_ACCESS_ENABLED = !isVercelProduction;

export const AUTH_PAUSED_TITLE = "Em breve";

export const AUTH_PAUSED_MESSAGE =
	"Login e cadastro estão temporariamente indisponíveis enquanto finalizamos o MinhaChurch. Volte em breve.";
