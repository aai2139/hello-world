import "server-only";

import type { SidequestCover, SidequestStop, Vibe } from "@/lib/sidequests";

type CoverInput = {
  neighborhood: string;
  title: string;
  vibe: Vibe;
  stops: SidequestStop[];
};

type CuratedCover = SidequestCover & { tags: string[] };

const CURATED_COVERS: CuratedCover[] = [
  {
    src: "/nyc-skyline.jpg",
    alt: "The Manhattan skyline at golden hour",
    credit: "Michael Discenza · CC0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Skyline_of_Manhattan.jpg",
    source: "local",
    key: "local:nyc-skyline",
    tags: ["manhattan", "skyline", "outdoors", "surprise"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Central_Park_New_York_City_New_York_23_cropped.jpg/1920px-Central_Park_New_York_City_New_York_23_cropped.jpg",
    alt: "A Gothic arch and bridle path in Central Park",
    credit: "Jet Lowe · Public domain",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Central_Park_New_York_City_New_York_23_cropped.jpg",
    source: "wikimedia",
    key: "commons:175365",
    tags: ["central park", "upper west side", "upper east side", "park", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Central_Park_New_York_October_2016_panorama_1.jpg/1920px-Central_Park_New_York_October_2016_panorama_1.jpg",
    alt: "Harlem Meer in Central Park",
    credit: "King of Hearts · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Central_Park_New_York_October_2016_panorama_1.jpg",
    source: "wikimedia",
    key: "commons:62974790",
    tags: ["harlem", "central park", "park", "water", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Upper_West_Side_New_York_August_2013_002.jpg/1920px-Upper_West_Side_New_York_August_2013_002.jpg",
    alt: "Broadway on the Upper West Side",
    credit: "King of Hearts · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Upper_West_Side_New_York_August_2013_002.jpg",
    source: "wikimedia",
    key: "commons:90929511",
    tags: ["upper west side", "broadway", "manhattan", "culture", "food"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Apartment_buildings_on_the_bank_of_East_River%2C_Manhattan%2C_New_York_City%2C_20231001_1109_1028.jpg/1920px-Apartment_buildings_on_the_bank_of_East_River%2C_Manhattan%2C_New_York_City%2C_20231001_1109_1028.jpg",
    alt: "Upper East Side buildings along the East River",
    credit: "Jakub Hałun · CC BY 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Apartment_buildings_on_the_bank_of_East_River,_Manhattan,_New_York_City,_20231001_1109_1028.jpg",
    source: "wikimedia",
    key: "commons:140605630",
    tags: ["upper east side", "east river", "manhattan", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Washington_Square_Arch_and_the_Empire_State_Building%2C_Greenwich_Village%2C_Manhattan%2C_New_York.jpg/1920px-Washington_Square_Arch_and_the_Empire_State_Building%2C_Greenwich_Village%2C_Manhattan%2C_New_York.jpg",
    alt: "Washington Square Arch with the Empire State Building beyond it",
    credit: "Christian David · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Washington_Square_Arch_and_the_Empire_State_Building,_Greenwich_Village,_Manhattan,_New_York.jpg",
    source: "wikimedia",
    key: "commons:193123010",
    tags: ["greenwich village", "washington square", "west village", "culture", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Chinatown-manhattan-2004.jpg/1920px-Chinatown-manhattan-2004.jpg",
    alt: "Mott Street in Manhattan's Chinatown",
    credit: "Derek Jensen · Public domain",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Chinatown-manhattan-2004.jpg",
    source: "wikimedia",
    key: "commons:229903",
    tags: ["chinatown", "mott street", "lower manhattan", "food", "culture"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/UA_Kaufman_Astoria_Cinema_14_jeh.jpg/1920px-UA_Kaufman_Astoria_Cinema_14_jeh.jpg",
    alt: "A cinema in Astoria, Queens",
    credit: "Jim Henderson · CC BY 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:UA_Kaufman_Astoria_Cinema_14_jeh.jpg",
    source: "wikimedia",
    key: "commons:92598861",
    tags: ["astoria", "queens", "cinema", "culture", "night owl"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/SVA_Residence_Hall_on_the_Lower_East_Side_%2865813p%29.jpg/1920px-SVA_Residence_Hall_on_the_Lower_East_Side_%2865813p%29.jpg",
    alt: "A street scene on Manhattan's Lower East Side",
    credit: "Rhododendrites · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:SVA_Residence_Hall_on_the_Lower_East_Side_(65813p).jpg",
    source: "wikimedia",
    key: "commons:111182041",
    tags: ["lower east side", "les", "manhattan", "food", "culture", "night owl"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/SoHo%2C_Manhattan%2C_New_York_City.jpg/1920px-SoHo%2C_Manhattan%2C_New_York_City.jpg",
    alt: "A street in SoHo, Manhattan",
    credit: "Emperor of Emperors · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:SoHo,_Manhattan,_New_York_City.jpg",
    source: "wikimedia",
    key: "commons:185119724",
    tags: ["soho", "shopping", "manhattan", "culture", "surprise"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Brooklyn_Bridge_Park_td_%282019-08-23%29_041_-_Pier_1.jpg/1920px-Brooklyn_Bridge_Park_td_%282019-08-23%29_041_-_Pier_1.jpg",
    alt: "The waterfront promenade at Brooklyn Bridge Park",
    credit: "Tdorante10 · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Bridge_Park_td_(2019-08-23)_041_-_Pier_1.jpg",
    source: "wikimedia",
    key: "commons:94391736",
    tags: ["dumbo", "brooklyn heights", "brooklyn bridge park", "waterfront", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Williamsburg_Bridge%2C_New_York_City%2C_20231001_1053_0976.jpg/1920px-Williamsburg_Bridge%2C_New_York_City%2C_20231001_1053_0976.jpg",
    alt: "The Williamsburg Bridge over the East River",
    credit: "Jakub Hałun · CC BY 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Williamsburg_Bridge,_New_York_City,_20231001_1053_0976.jpg",
    source: "wikimedia",
    key: "commons:140546468",
    tags: ["williamsburg", "brooklyn", "bridge", "waterfront", "outdoors", "night owl"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Coney_Island_Boardwalk_1.jpg/1920px-Coney_Island_Boardwalk_1.jpg",
    alt: "The Coney Island boardwalk and Parachute Jump",
    credit: "Rhododendrites · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Coney_Island_Boardwalk_1.jpg",
    source: "wikimedia",
    key: "commons:51880568",
    tags: ["coney island", "brooklyn", "boardwalk", "beach", "outdoors"],
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Jackson_Heights-Roosevelt_Avenue-74th_Street.jpg",
    alt: "The Jackson Heights–Roosevelt Avenue subway station",
    credit: "Pacific Coast Highway · Public domain",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Jackson_Heights-Roosevelt_Avenue-74th_Street.jpg",
    source: "wikimedia",
    key: "commons:2760337",
    tags: ["jackson heights", "roosevelt avenue", "queens", "food", "culture"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Long_Island_City_Skyline_March_2023.jpg/1920px-Long_Island_City_Skyline_March_2023.jpg",
    alt: "The Long Island City skyline from the East River waterfront",
    credit: "Kidfly182 · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Long_Island_City_Skyline_March_2023.jpg",
    source: "wikimedia",
    key: "commons:129992861",
    tags: ["long island city", "lic", "queens", "waterfront", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx%2C_New_York_City_001.jpg/1920px-Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx%2C_New_York_City_001.jpg",
    alt: "Arthur Avenue in the Bronx's Little Italy",
    credit: "Leonard J. DeFrancisci · CC BY-SA 3.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx,_New_York_City_001.jpg",
    source: "wikimedia",
    key: "commons:33300680",
    tags: ["arthur avenue", "belmont", "bronx", "little italy", "food"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Bronx_Zoo_Asia_Gate_entrance_August_2026.jpg/1920px-Bronx_Zoo_Asia_Gate_entrance_August_2026.jpg",
    alt: "The Asia Gate entrance to the Bronx Zoo",
    credit: "SnowFire · CC BY 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Bronx_Zoo_Asia_Gate_entrance_August_2026.jpg",
    source: "wikimedia",
    key: "commons:197511203",
    tags: ["bronx zoo", "bronx", "animals", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Cooper%27s_hawk_in_Prospect_Park_%2822513%29.jpg/1920px-Cooper%27s_hawk_in_Prospect_Park_%2822513%29.jpg",
    alt: "A Cooper's hawk in Prospect Park",
    credit: "Rhododendrites · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Cooper%27s_hawk_in_Prospect_Park_(22513).jpg",
    source: "wikimedia",
    key: "commons:98629530",
    tags: ["prospect park", "park slope", "brooklyn", "birds", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Brooklyn_Bridge_at_Night.jpg/1920px-Brooklyn_Bridge_at_Night.jpg",
    alt: "The Brooklyn Bridge illuminated at night",
    credit: "Andrew Choy · CC BY-SA 2.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Bridge_at_Night.jpg",
    source: "wikimedia",
    key: "commons:502149",
    tags: ["brooklyn bridge", "dumbo", "lower manhattan", "night owl", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/High_Line%2C_New_York_2012_39.jpg/1920px-High_Line%2C_New_York_2012_39.jpg",
    alt: "The High Line elevated park in Manhattan",
    credit: "Mike Peel · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:High_Line,_New_York_2012_39.jpg",
    source: "wikimedia",
    key: "commons:35738512",
    tags: ["high line", "chelsea", "meatpacking", "manhattan", "outdoors"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Brooklyn_Diner%2C_New_York_City_%282024%29-L1006207.jpg/1920px-Brooklyn_Diner%2C_New_York_City_%282024%29-L1006207.jpg",
    alt: "A diner near Times Square at night",
    credit: "Frank Schulenburg · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Diner,_New_York_City_(2024)-L1006207.jpg",
    source: "wikimedia",
    key: "commons:153061729",
    tags: ["times square", "midtown", "theater district", "food", "night owl"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Solomon_R._Guggenheim_Museum_skylight.jpg/1920px-Solomon_R._Guggenheim_Museum_skylight.jpg",
    alt: "The skylight inside the Solomon R. Guggenheim Museum",
    credit: "T meltzer · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Solomon_R._Guggenheim_Museum_skylight.jpg",
    source: "wikimedia",
    key: "commons:111442053",
    tags: ["guggenheim", "museum mile", "upper east side", "museum", "culture"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Portrait_of_Billie_Holiday_and_Mister%2C_Downbeat%2C_New_York%2C_N.Y.%2C_ca._Feb._1947_%28LOC%2C_5020400274%2C_cropped%29.jpg/1920px-Portrait_of_Billie_Holiday_and_Mister%2C_Downbeat%2C_New_York%2C_N.Y.%2C_ca._Feb._1947_%28LOC%2C_5020400274%2C_cropped%29.jpg",
    alt: "Billie Holiday at the Downbeat jazz club in 1947",
    credit: "William P. Gottlieb · Public domain",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Portrait_of_Billie_Holiday_and_Mister,_Downbeat,_New_York,_N.Y.,_ca._Feb._1947_(LOC,_5020400274,_cropped).jpg",
    source: "wikimedia",
    key: "commons:116216387",
    tags: ["jazz", "music", "harlem", "midtown", "culture", "night owl"],
  },
  {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Community_Bookstore_2.jpg/1920px-Community_Bookstore_2.jpg",
    alt: "Community Bookstore in Cobble Hill, Brooklyn",
    credit: "Rhododendrites · CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Community_Bookstore_2.jpg",
    source: "wikimedia",
    key: "commons:49635367",
    tags: ["cobble hill", "brooklyn", "bookstore", "books", "culture"],
  },
];

const MATCH_THRESHOLD = 4;
const SUPPORTED_LICENSE = /^(CC0|CC BY(?:-SA)?(?: \d\.\d)?|Public domain)/i;

export async function chooseCoverImage(input: CoverInput, usedKeys: Set<string>) {
  const haystack = buildHaystack(input);
  const ranked = CURATED_COVERS
    .filter((cover) => !usedKeys.has(cover.key))
    .map((cover) => ({ cover, score: scoreCover(cover, input, haystack) }))
    .sort((a, b) => b.score - a.score || a.cover.key.localeCompare(b.cover.key));

  if (ranked[0] && ranked[0].score >= MATCH_THRESHOLD) return withoutTags(ranked[0].cover);

  const liveCover = await searchWikimedia(input, usedKeys);
  if (liveCover) return liveCover;

  const fallback = ranked[0]?.cover ?? CURATED_COVERS.find((cover) => !usedKeys.has(cover.key));
  if (!fallback) throw new Error("No unused NYC cover photo is currently available.");
  return withoutTags(fallback);
}

function scoreCover(cover: CuratedCover, input: CoverInput, haystack: string) {
  const neighborhood = input.neighborhood.toLowerCase();
  let score = 0;
  for (const tag of cover.tags) {
    if (neighborhood.includes(tag) || tag.includes(neighborhood)) score += 6;
    else if (tag === input.vibe.replace("-", " ")) score += 2;
    else if (haystack.includes(tag)) score += 3;
  }
  return score;
}

function buildHaystack(input: CoverInput) {
  return [
    input.neighborhood,
    input.title,
    input.vibe,
    ...input.stops.flatMap((stop) => [
      stop.label,
      stop.activity,
      ...stop.places.flatMap((place) => [place.name, place.address]),
    ]),
  ].join(" ").toLowerCase();
}

function withoutTags(cover: CuratedCover): SidequestCover {
  return {
    src: cover.src,
    alt: cover.alt,
    credit: cover.credit,
    creditUrl: cover.creditUrl,
    source: cover.source,
    key: cover.key,
  };
}

async function searchWikimedia(input: CoverInput, usedKeys: Set<string>) {
  const placeNames = input.stops
    .flatMap((stop) => stop.places.slice(0, 1).map((place) => place.name))
    .join(" ");
  const search = `${input.neighborhood} ${placeNames} New York City`;
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: search,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime",
    iiurlwidth: "1600",
    iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ImageDescription",
    format: "json",
    origin: "*",
  });

  try {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": "NYC-Sidequests/1.0 (https://github.com/aai2139/hello-world)" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!response.ok) return null;
    const body = await response.json() as WikimediaResponse;
    const pages = Object.values(body.query?.pages ?? {}).sort(
      (a, b) => (a.index ?? 99) - (b.index ?? 99),
    );
    for (const page of pages) {
      const image = page.imageinfo?.[0];
      const license = cleanHtml(image?.extmetadata?.LicenseShortName?.value ?? "");
      const key = `commons:${page.pageid}`;
      if (
        !image?.thumburl ||
        !image.mime?.startsWith("image/") ||
        image.mime === "image/svg+xml" ||
        !SUPPORTED_LICENSE.test(license) ||
        usedKeys.has(key)
      ) continue;
      const artist = cleanHtml(image.extmetadata?.Artist?.value ?? "Wikimedia contributor");
      return {
        src: stripTracking(image.thumburl),
        alt: cleanHtml(image.extmetadata?.ImageDescription?.value ?? page.title.replace(/^File:/, "")),
        credit: `${artist} · ${license}`,
        creditUrl: image.descriptionurl,
        source: "wikimedia" as const,
        key,
      };
    }
  } catch (error) {
    console.error("Wikimedia cover lookup failed", error);
  }
  return null;
}

function cleanHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}

function stripTracking(value: string) {
  const url = new URL(value);
  url.search = "";
  return url.toString();
}

type WikimediaResponse = {
  query?: {
    pages?: Record<string, {
      pageid: number;
      title: string;
      index?: number;
      imageinfo?: Array<{
        thumburl?: string;
        descriptionurl: string;
        mime?: string;
        extmetadata?: Record<string, { value?: string }>;
      }>;
    }>;
  };
};
