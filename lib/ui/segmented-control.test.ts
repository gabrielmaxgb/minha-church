import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  segmentedListClassName,
  segmentedTriggerClassName,
} from "../../components/ui/segmented-control";

describe("segmented-control", () => {
  it("selected trigger uses ink on paper (preto/branco)", () => {
    const selected = segmentedTriggerClassName(true);
    assert.match(selected, /bg-foreground/);
    assert.match(selected, /text-background/);
    assert.doesNotMatch(selected, /text-muted-foreground/);
  });

  it("idle trigger stays muted", () => {
    const idle = segmentedTriggerClassName(false);
    assert.match(idle, /text-muted-foreground/);
    assert.doesNotMatch(idle, /bg-foreground/);
  });

  it("list keeps the pill rail shell", () => {
    const list = segmentedListClassName();
    assert.match(list, /rounded-xl/);
    assert.match(list, /bg-muted\/30/);
  });
});
