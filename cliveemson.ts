import * as cheerio from "cheerio";
import { fetchHtml, sleep } from "../../utils/fetch.js";
import { dedupeKey } from "../../utils/hash.js";
import { extractBedrooms, extractGuidePrice, extractPostcode } from "../../utils/parse.js";
import type { ScrapedLot } from "../../utils/types.js";

const SOURCE = "Clive Emson";
const LIST_URL = "https://www.cliveemson.co.uk/properties/unsold-lots-still-available/";

function absolutize(href: string) {
  if (href.startsWith("http")) return href;
  return new URL(href, "https://www.cliveemson.co.uk").toString();
}

export async function scrapeCliveEmson(): Promise<ScrapedLot[]> {
  const html = await fetchHtml(LIST_URL);
  const $ = cheerio.load(html);

  const links = new Set<string>();

  // Common: property cards link to /properties/....
  $("a").each((_i, a) => {
    const href = $(a).attr("href") || "";
    if (!href) return;
    if (href.includes("/properties/") && !href.includes("unsold-lots-still-available")) {
      links.add(absolutize(href));
    }
  });

  const out: ScrapedLot[] = [];
  let count = 0;

  for (const url of links) {
    if (count++ > 150) break;
    await sleep(400);

    try {
      const detailHtml = await fetchHtml(url);
      const $$ = cheerio.load(detailHtml);
      const text = $$.text();

      const title = ($$("h1").first().text().trim() || null);
      const address = ($$("[class*='address']").first().text().trim() || null);

      out.push({
        source: SOURCE,
        sourceUrl: url,
        title,
        address,
        postcode: extractPostcode(text),
        bedrooms: extractBedrooms(text),
        guidePrice: extractGuidePrice(text),
        dedupeKey: dedupeKey(SOURCE, url)
      });
    } catch {
      // ignore
    }
  }

  return out;
}
