import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { partitionGivingFundsByAudience } from "./partition-giving-funds";

describe("partitionGivingFundsByAudience", () => {
  it("splits public and members without mixing", () => {
    const { publicFunds, memberFunds } = partitionGivingFundsByAudience([
      { id: "1", audience: "public" as const },
      { id: "2", audience: "members" as const },
      { id: "3", audience: "public" as const },
    ]);

    assert.deepEqual(
      publicFunds.map((f) => f.id),
      ["1", "3"],
    );
    assert.deepEqual(
      memberFunds.map((f) => f.id),
      ["2"],
    );
  });

  it("returns empty groups when there are no funds", () => {
    assert.deepEqual(partitionGivingFundsByAudience([]), {
      publicFunds: [],
      memberFunds: [],
    });
  });
});
