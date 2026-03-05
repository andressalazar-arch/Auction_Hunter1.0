import pLimit from "p-limit";
import { prisma } from "./db.js";
import { scrapeAuctionHouse } from "./auctionhouse.js";
import { scrapeCliveEmson } from "./cliveemson.js";
import { scrapeAllsop } from "./allsop.js";
import { scrapeBTGEddisons } from "./btgeddisons.js";
import { scrapeBarnardMarcus } from "./barnardmarcus.js";
import { matchesBeds, matchesYorkshire } from "./filters.js";
import { initEmail, sendEmailPerProperty } from "./email.js";

const concurrency = Number(process.env.SCRAPE_CONCURRENCY ?? 4);

async function main() {
  initEmail();

const scraped = [
  ...(await scrapeAuctionHouse()),
  ...(await scrapeCliveEmson()),
  ...(await scrapeAllsop()),
  ...(await scrapeBTGEddisons()),
  ...(await scrapeBarnardMarcus())
];

  console.log(`Scraped candidates: ${scraped.length}`);

  const limit = pLimit(concurrency);

  let createdCount = 0;
  let emailedCount = 0;

  // Upsert with concurrency (safe)
  await Promise.all(scraped.map((lot) => limit(async () => {
    const existing = await prisma.lot.findUnique({ where: { dedupeKey: lot.dedupeKey } });
    if (existing) return;

    const created = await prisma.lot.create({ data: lot as any });
    createdCount++;

    if (matchesYorkshire(created.postcode) && matchesBeds(created.bedrooms)) {
      await sendEmailPerProperty(created);
      emailedCount++;
      console.log(`Emailed: ${created.source} - ${created.postcode ?? "no postcode"} - ${created.sourceUrl}`);
    }
  })));

  console.log(`Done. New lots saved: ${createdCount}. Emails sent: ${emailedCount}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
