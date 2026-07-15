import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  matchesRosterCandidateFilter,
  matchesRosterCandidateSearch,
  prepareRosterAssignableCandidates,
  rankCandidateAvailability,
} from "./roster-candidates";

describe("roster-candidates (fe)", () => {
  it("ranks availability as signal priority", () => {
    assert.equal(rankCandidateAvailability("available"), 0);
    assert.equal(rankCandidateAvailability(null), 1);
    assert.equal(rankCandidateAvailability("unavailable"), 2);
  });

  it("filters by availability signal", () => {
    assert.equal(matchesRosterCandidateFilter("available", "available"), true);
    assert.equal(matchesRosterCandidateFilter(null, "pending"), true);
    assert.equal(matchesRosterCandidateFilter("unavailable", "pending"), false);
    assert.equal(matchesRosterCandidateFilter(null, "all"), true);
  });

  it("searches by name without blocking assignment pool", () => {
    assert.equal(
      matchesRosterCandidateSearch({ memberName: "Maria Silva" }, "maria"),
      true,
    );
    assert.equal(
      matchesRosterCandidateSearch({ memberName: "Maria Silva" }, "joao"),
      false,
    );
  });

  it("keeps unavailable and pending people in the assignable list", () => {
    const rows = prepareRosterAssignableCandidates(
      [
        {
          memberId: "1",
          memberName: "Zoe",
          availabilityStatus: "unavailable",
          roleLabels: ["voz"],
        },
        {
          memberId: "2",
          memberName: "Ana",
          availabilityStatus: "available",
          roleLabels: ["voz"],
        },
        {
          memberId: "3",
          memberName: "Bia",
          availabilityStatus: null,
          roleLabels: ["voz"],
        },
      ],
      { filter: "all" },
    );

    assert.deepEqual(
      rows.map((row) => row.memberName),
      ["Ana", "Bia", "Zoe"],
    );
  });
});
