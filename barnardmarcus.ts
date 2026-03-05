import { fetchHtml, sleep } from "./fetch.js";
import { dedupeKey } from "./hash.js";
import { extractBedrooms, extractGuidePrice, extractPostcode } from "./parse.js";
import type { ScrapedLot } from "./types.js";

const SOURCE = "Barnard Marcus";
const BASE = "https://www.barnardmarcusauctions.co.uk";
const LIST_URL = "https://www.barnardmarcusauctions.co.uk/auctions/previous/";

function absolutize(href: string) {
  if (href.startsWith("http")) return href;
  return new URL(href, BASE).toString();
}

export async function scrapeBarnardMarcus(): Promise<ScrapedLot[]> {
  // This page lists previous auctions; each auction has lots.
  const html = await fetchHtml(LIST_URL);
  const $ = cheerio.load(html);

  const auctionLinks = new Set<string>();

  $("a").each((_i, a) => {
    const href = $(a).attr("href") || "";
    if (!href) return;
    // likely pattern includes "/auctions/" and maybe an id/date
    if (href.includes("/auctions/") && !href.endsWith("/previous/") && !href.includes("calendar")) {
      auctionLinks.add(absolutize(href));
    }
  });

  const out: ScrapedLot[] = [];
  let auctionCount = 0;

  for (const auctionUrl of auctionLinks) {
    if (auctionCount++ > 8) break; // keep it bounded
    await sleep(500);

    try {
      const ah = await fetchHtml(auctionUrl);
      const $$ = cheerio.load(ah);

      const lotLinks = new Set<string>();
      $$("a").each((_i, a) => {
        const href = $$(a).attr("href") || "";
        if (!href) return;
        if (href.includes("/lots/") || href.includes("/lot/") || href.includes("/property/")) {
          lotLinks.add(absolutize(href));
        }
      });

      let count = 0;
      for (const lotUrl of lotLinks) {
        if (count++ > 80) break;
        await sleep(350);
        try {
          const detailHtml = await fetchHtml(lotUrl);
          const $$$ = cheerio.load(detailHtml);
          const text = $$$.text();

          const title = ($$$("h1").first().text().trim() || null);
          const address = ($$$("[class*='address']").first().text().trim() || null);

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
          // ignore individual lot
        }
      }
    } catch {
      // ignore auction page
    }
  }

  return out;
}
