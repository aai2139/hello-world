export type RoutePoint = {
  latitude: number;
  longitude: number;
};

export const MAX_WALKING_LEG_MILES = 1.25;
export const MAX_ROUTE_DISTANCE_MILES = 2.5;
export const MAX_NEIGHBORHOOD_RADIUS_MILES = 2.25;
export const MAX_OPTION_DISTANCE_MILES = 0.75;

const EARTH_RADIUS_MILES = 3_958.8;

export function distanceMiles(first: RoutePoint, second: RoutePoint) {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) *
    Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(haversine));
}

export function routeDistanceMiles(points: RoutePoint[]) {
  return points.slice(1).reduce(
    (total, point, index) => total + distanceMiles(points[index], point),
    0,
  );
}

export function assertCompactWalkingRoute(
  points: RoutePoint[],
  neighborhoodCenter?: RoutePoint | null,
) {
  if (points.length < 2) throw new Error("A route needs at least two mapped stops.");

  for (let index = 1; index < points.length; index += 1) {
    const legDistance = distanceMiles(points[index - 1], points[index]);
    if (legDistance > MAX_WALKING_LEG_MILES) {
      throw new Error(`Route leg ${index} is ${legDistance.toFixed(2)} miles as the crow flies.`);
    }
  }

  const totalDistance = routeDistanceMiles(points);
  if (totalDistance > MAX_ROUTE_DISTANCE_MILES) {
    throw new Error(`The route spans ${totalDistance.toFixed(2)} miles as the crow flies.`);
  }

  if (neighborhoodCenter) {
    const farthestDistance = Math.max(
      ...points.map((point) => distanceMiles(neighborhoodCenter, point)),
    );
    if (farthestDistance > MAX_NEIGHBORHOOD_RADIUS_MILES) {
      throw new Error(`A stop is ${farthestDistance.toFixed(2)} miles from the requested area.`);
    }
  }
}
