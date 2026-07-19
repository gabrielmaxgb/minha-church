import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  detectFamilyUnits,
  familyUnitConnectorPath,
  familyUnitGeometry,
} from "./family-graph-genealogy";
import type { MemberRelation } from "../../types/members";

const NODE = { width: 150, height: 92 };

describe("familyUnitGeometry", () => {
  it("bridges trunk to an offset single child on the rail", () => {
    const parents = [
      { id: "ana", x: 0, y: 0, ...NODE },
      { id: "bruno", x: 200, y: 0, ...NODE },
    ];
    // Child not centered under the couple midpoint (175).
    const children = [{ id: "camila", x: 260, y: 280, ...NODE }];

    const geo = familyUnitGeometry(parents, children);
    assert.ok(geo);
    assert.equal(geo.coupleMidX, 175);
    assert.equal(geo.railLeft, 175);
    assert.equal(geo.railRight, 260 + NODE.width / 2);
    assert.ok(geo.railY < children[0]!.y);
    assert.ok(geo.railY > geo.joinY);

    const path = familyUnitConnectorPath(parents, children);
    // Rail must run from couple mid to child x (the missing bridge).
    assert.match(path, new RegExp(String(geo.railRight)));
    // Child drop must reach the card top.
    assert.ok(path.includes(`${geo.railRight} ${children[0]!.y}`));
  });

  it("keeps rail between generations", () => {
    const parents = [
      { id: "a", x: 0, y: 0, ...NODE },
      { id: "b", x: 160, y: 0, ...NODE },
    ];
    const children = [
      { id: "c1", x: 40, y: 240, ...NODE },
      { id: "c2", x: 200, y: 240, ...NODE },
    ];
    const geo = familyUnitGeometry(parents, children);
    assert.ok(geo);
    assert.ok(geo.railY > geo.joinY);
    assert.ok(geo.railY < 240);
  });
});

describe("detectFamilyUnits", () => {
  it("bundles co-parent edges into one nuclear unit", () => {
    const relations: MemberRelation[] = [
      {
        id: "spouse",
        fromMemberId: "ana",
        toMemberId: "bruno",
        type: "spouse",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "p1",
        fromMemberId: "ana",
        toMemberId: "camila",
        type: "parent",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "p2",
        fromMemberId: "bruno",
        toMemberId: "camila",
        type: "parent",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const units = detectFamilyUnits(relations);
    assert.equal(units.length, 1);
    assert.deepEqual(units[0]!.childIds, ["camila"]);
    assert.deepEqual(units[0]!.bundledAscendantIds.slice().sort(), ["p1", "p2"]);
  });
});
