export type FinancesTab =
  | "fundos"
  | "contribuicoes"
  | "mensais"
  | "repasses"
  | "caixa";

const CAIXA_HASHES = new Set([
  "#contas",
  "#categorias",
  "#plano-de-contas",
  "#movimentacoes",
  "#lancamentos-manuais",
  "#caixa",
]);

const CATEGORIES_HASHES = new Set([
  "#contas",
  "#categorias",
  "#plano-de-contas",
]);

export function parseFinancesHash(hash: string): FinancesTab {
  if (hash === "#contribuicoes") {
    return "contribuicoes";
  }
  if (hash === "#mensais") {
    return "mensais";
  }
  if (hash === "#repasses") {
    return "repasses";
  }
  if (CAIXA_HASHES.has(hash)) {
    return "caixa";
  }
  return "fundos";
}

export function financesHashForTab(tab: FinancesTab): string {
  switch (tab) {
    case "contribuicoes":
      return "#contribuicoes";
    case "mensais":
      return "#mensais";
    case "repasses":
      return "#repasses";
    case "caixa":
      return "#caixa";
    default:
      return "";
  }
}

export function isCategoriesHash(hash: string): boolean {
  return CATEGORIES_HASHES.has(hash);
}
