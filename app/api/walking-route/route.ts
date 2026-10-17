import { createServerSupabaseClient } from "@/lib/supabase-server";

type Point = { latitude: number; longitude: number };

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return Response.json({ error: "Routing is not configured" }, { status: 503 });

  let points: Point[] = [];
  try {
    const body = await request.json() as { points?: Point[] };
    points = Array.isArray(body.points) ? body.points : [];
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (
    points.length < 2 || points.length > 6 ||
    points.some(({ latitude, longitude }) =>
      !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      latitude < 40.45 || latitude > 40.95 || longitude < -74.3 || longitude > -73.65)
  ) {
    return Response.json({ error: "Invalid route points" }, { status: 400 });
  }

  const params = new URLSearchParams({
    waypoints: points.map(({ latitude, longitude }) => `${latitude},${longitude}`).join("|"),
    mode: "walk",
    details: "instruction_details",
    apiKey,
  });
  const response = await fetch(`https://api.geoapify.com/v1/routing?${params}`, {
    next: { revalidate: 60 * 60 * 24 * 7 },
  });
  if (!response.ok) return Response.json({ error: "Route unavailable" }, { status: 502 });
  const route = await response.json();
  return Response.json(route, { headers: { "Cache-Control": "private, max-age=3600" } });
}
