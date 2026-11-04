type PlaceQueryInput = {
  name: string;
  address: string;
  mapQuery: string;
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function buildPlaceQueries(place: PlaceQueryInput) {
  const name = normalize(place.name);
  const address = normalize(place.address);
  const mapQuery = normalize(place.mapQuery);

  return [...new Set([
    name && address && name.toLowerCase() !== address.toLowerCase() ? `${name}, ${address}` : "",
    address,
    mapQuery,
    name,
  ].filter(Boolean))];
}
