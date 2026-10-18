import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCompactWalkingRoute,
  distanceMiles,
  routeDistanceMiles,
} from "./route-quality";

const breadsBakery = { latitude: 40.7709574, longitude: -73.9818385 };
const tartinery = { latitude: 40.7685685, longitude: -73.9824278 };
const incorrectDowntownMatch = { latitude: 40.7127281, longitude: -74.0060152 };

test("accepts a compact Columbus Circle route", () => {
  assert.doesNotThrow(() => assertCompactWalkingRoute([
    breadsBakery,
    tartinery,
    { latitude: 40.76775, longitude: -73.9821 },
  ]));
});

test("rejects the production route whose final stop geocoded downtown", () => {
  assert.throws(
    () => assertCompactWalkingRoute([breadsBakery, tartinery, incorrectDowntownMatch]),
    /Route leg 2 is 4\.05 miles/,
  );
});

test("computes route length from consecutive legs", () => {
  const firstLeg = distanceMiles(breadsBakery, tartinery);
  const fullRoute = routeDistanceMiles([breadsBakery, tartinery, incorrectDowntownMatch]);
  assert.ok(firstLeg > 0.16 && firstLeg < 0.18);
  assert.ok(fullRoute > 4.2 && fullRoute < 4.3);
});

test("rejects a compact route that is outside the requested neighborhood", () => {
  assert.throws(
    () => assertCompactWalkingRoute(
      [breadsBakery, tartinery],
      { latitude: 40.7308, longitude: -73.9973 },
    ),
    /requested area/,
  );
});
