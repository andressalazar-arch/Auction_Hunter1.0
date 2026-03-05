import { fetchHtml, sleep } from "./fetch.js";
import { dedupeKey } from "./hash.js";
import { extractBedrooms, extractGuidePrice, extractPostcode } from "./parse.js";
import type { ScrapedLot } from "./types.js";

const SOURCE = "BTG Eddisons";
const BASE = "https://www.btgeddisonspropertyauctions.com";
const LIST_URL = "https://www.btgeddisonspropertyauctions.com/unsold-lots";

function absolutize(href: string) {
  if (href.startsWith("http")) return href;
  return new URL(href, BASE).toString();
}

export async function scrapeBTGEddisons(): Promise<ScrapedLot[]> {
  const html = await fetchHtml(LIST_URL);
  const $ = cheerio.load(html);

  const links = new Set<string>();
  $("a").each((_i, a) => {
    const href = $(a).attr("href") || "";
    if (!href) return;
    if (href.includes("/property/") || href.includes("/lot/") || href.includes("/auctions/lot/")) {
      links.add(absolutize(href));
    }
  });

  const out: ScrapedLot[] = [];
  let count = 0;
  for (const url of links) {
    if (count++ > 160) break;
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
