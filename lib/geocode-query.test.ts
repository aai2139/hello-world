import assert from "node:assert/strict";
import test from "node:test";
import { buildPlaceQueries } from "./geocode-query";

test("prefers the named venue and street address over a conflicting map query", () => {
  assert.deepEqual(buildPlaceQueries({
    name: "The Museum at FIT",
    address: "227 W 27th St, New York, NY 10001",
    mapQuery: "Union Square, New York, NY",
  }), [
    "The Museum at FIT, 227 W 27th St, New York, NY 10001",
    "227 W 27th St, New York, NY 10001",
    "Union Square, New York, NY",
    "The Museum at FIT",
  ]);
});

test("deduplicates identical fallback queries", () => {
  assert.deepEqual(buildPlaceQueries({
    name: "Bryant Park",
    address: "Bryant Park",
    mapQuery: "Bryant Park",
  }), ["Bryant Park"]);
});
