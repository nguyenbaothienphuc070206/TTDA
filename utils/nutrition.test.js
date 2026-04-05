import test from "node:test";
import assert from "node:assert/strict";

import { calculateCalories } from "./nutrition.js";

test("calculate calories", () => {
  const value = calculateCalories(60, 170, 22);
  assert.ok(value > 1500);
});
