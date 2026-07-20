import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  financesHashForTab,
  isCategoriesHash,
  parseFinancesHash,
} from "./finances-tabs";

describe("finances-tabs", () => {
  it("defaults to fundos", () => {
    assert.equal(parseFinancesHash(""), "fundos");
    assert.equal(parseFinancesHash("#fundos"), "fundos");
    assert.equal(parseFinancesHash("#qualquer"), "fundos");
  });

  it("maps management hashes to the right tab", () => {
    assert.equal(parseFinancesHash("#contribuicoes"), "contribuicoes");
    assert.equal(parseFinancesHash("#mensais"), "mensais");
    assert.equal(parseFinancesHash("#repasses"), "repasses");
  });

  it("routes legacy caixa hashes to the caixa tab", () => {
    for (const hash of [
      "#caixa",
      "#contas",
      "#categorias",
      "#plano-de-contas",
      "#movimentacoes",
      "#lancamentos-manuais",
    ]) {
      assert.equal(parseFinancesHash(hash), "caixa", hash);
    }
  });

  it("opens categories modal only for category hashes", () => {
    assert.equal(isCategoriesHash("#categorias"), true);
    assert.equal(isCategoriesHash("#contas"), true);
    assert.equal(isCategoriesHash("#plano-de-contas"), true);
    assert.equal(isCategoriesHash("#caixa"), false);
    assert.equal(isCategoriesHash("#movimentacoes"), false);
  });

  it("writes stable hashes when changing tabs", () => {
    assert.equal(financesHashForTab("fundos"), "");
    assert.equal(financesHashForTab("contribuicoes"), "#contribuicoes");
    assert.equal(financesHashForTab("mensais"), "#mensais");
    assert.equal(financesHashForTab("repasses"), "#repasses");
    assert.equal(financesHashForTab("caixa"), "#caixa");
  });
});
