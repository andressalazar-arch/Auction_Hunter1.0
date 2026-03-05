import { fetchHtml, sleep } from "./fetch.js";
import { dedupeKey } from "./hash.js";
import { extractBedrooms, extractGuidePrice, extractPostcode } from "./parse.js";
import type { ScrapedLot } from "./types.js";
const SOURCE = "Auction House";
const LIST_URL = "https://www.auctionhouse.co.uk/unsold";

function absolutize(href: string) {
  if (href.startsWith("http")) return href;
  return new URL(href, "https://www.auctionhouse.co.uk").toString();
}

export async function scrapeAuctionHouse(): Promise<ScrapedLot[]> {
  const html = await fetchHtml(LIST_URL);
  const $ = cheerio.load(html);

  // Try common patterns
  const links = new Set<string>();

  $("a").each((_i, a) => {
    const href = $(a).attr("href") || "";
    if (!href) return;
    if (href.includes("/property/") || href.includes("/lot/") || href.includes("/properties/")) {
      links.add(absolutize(href));
    }
  });

  // Fallback: if the page uses cards with data-url
  $("[data-url]").each((_i, el) => {
    const href = $(el).attr("data-url");
    if (href) links.add(absolutize(href));
  });

  const out: ScrapedLot[] = [];
  let count = 0;

  for (const url of links) {
    // polite pace
    if (count++ > 120) break;
    await sleep(400);

    let title: string | null = null;
    let address: string | null = null;
    let postcode: string | null = null;
    let bedrooms: number | null = null;
    let guidePrice: string | null = null;

    try {
      const detailHtml = await fetchHtml(url);
      const $$ = cheerio.load(detailHtml);
      const text = $$.text();

      title = ($$("h1").first().text().trim() || null);
      address = ($$("[class*='address']").first().text().trim() || null);

      postcode = extractPostcode(text);
      bedrooms = extractBedrooms(text);
      guidePrice = extractGuidePrice(text);

      out.push({
        source: SOURCE,
        sourceUrl: url,
        title,
        address,
        postcode,
        bedrooms,
        guidePrice,
        dedupeKey: dedupeKey(SOURCE, url)
      });
    } catch {
      // ignore failures, keep going
    }
  }

  return out;
}
