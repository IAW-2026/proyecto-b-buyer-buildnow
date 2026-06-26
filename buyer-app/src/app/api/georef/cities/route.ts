import { NextResponse } from "next/server";

const GEOREF_CITIES_URL =
  "https://apis.datos.gob.ar/georef/api/localidades-censales";

type GeorefCity = {
  nombre?: string;
  provincia?: {
    nombre?: string;
  };
};

type GeorefCitiesResponse = {
  localidades_censales?: GeorefCity[];
};

function formatCity(city: GeorefCity) {
  const name = city.nombre?.trim();
  const province = city.provincia?.nombre?.trim();

  if (!name) {
    return null;
  }

  return province ? `${name}, ${province}` : name;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";

  if (search.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const params = new URLSearchParams({
    nombre: search,
    max: "8",
    campos: "nombre,provincia.nombre",
  });

  const response = await fetch(
    `${GEOREF_CITIES_URL}?${params.toString()}`,
    { next: { revalidate: 60 * 60 * 24 } }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "No se pudieron obtener las ciudades" },
      { status: 502 }
    );
  }

  const body = (await response.json()) as GeorefCitiesResponse;
  const data = Array.from(
    new Set(
      (body.localidades_censales ?? [])
        .map(formatCity)
        .filter((city): city is string => Boolean(city))
    )
  );

  return NextResponse.json({ data });
}
