import { fetchHtml, sleep } from "./fetch.js";
import { dedupeKey } from "./hash.js";
import { extractBedrooms, extractGuidePrice, extractPostcode } from "./parse.js";
import type { ScrapedLot } from "./types.js";


const SOURCE = "Allsop";
const BASE = "https://www.allsop.co.uk";
const START_URL = "https://www.allsop.co.uk/property-search?available_only=true&lot_type=residential&region=yorkshire-and-humberside&past_auctions=on&page=1";

function absolutize(href: string) {
  if (href.startsWith("http")) return href;
  return new URL(href, BASE).toString();
}

export async function scrapeAllsop(): Promise<ScrapedLot[]> {
  const out: ScrapedLot[] = [];
  // We'll try first 3 pages to keep it light; increase later if needed
  const pages = [1,2,3];

  for (const p of pages) {
    const url = START_URL.replace(/page=\d+/, `page=${p}`);
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const links = new Set<string>();
    $("a").each((_i, a) => {
      const href = $(a).attr("href") || "";
      if (!href) return;
      // Allsop often uses /property/<id> or similar
      if (href.includes("/property/") || href.includes("/properties/")) {
        links.add(absolutize(href));
      }
    });

    let count = 0;
    for (const lotUrl of links) {
      if (count++ > 80) break;
      await sleep(400);

      try {
        const detailHtml = await fetchHtml(lotUrl);
        const $$ = cheerio.load(detailHtml);
        const text = $$.text();

        const title = ($$("h1").first().text().trim() || null);
        const address = ($$("[class*='address']").first().text().trim() || null);

        out.push({
          source: SOURCE,
          sourceUrl: lotUrl,
          title,
          address,
          postcode: extractPostcode(text),
          bedrooms: extractBedrooms(text),
          guidePrice: extractGuidePrice(text),
          dedupeKey: dedupeKey(SOURCE, lotUrl)
        });
      } catch {
        // ignore
      }
    }
  }

  return out;
}
