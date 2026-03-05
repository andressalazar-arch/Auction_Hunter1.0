# Unsold Auction Hunter (Yorkshire 4–5 bed alerts)

Monitors selected UK auctioneers for **unsold lots / previous auction lots still available**, filters to **Yorkshire** (postcode prefixes) and **4–5 bedrooms**, and sends **one email per matching property**.

## Auctioneers included (v1)
- Auction House – https://www.auctionhouse.co.uk/unsold
- Clive Emson – https://www.cliveemson.co.uk/properties/unsold-lots-still-available/
- Allsop – https://www.allsop.co.uk/property-search?available_only=true&lot_type=residential&region=yorkshire-and-humberside&past_auctions=on&page=1
- BTG Eddisons – https://www.btgeddisonspropertyauctions.com/unsold-lots
- Barnard Marcus – https://www.barnardmarcusauctions.co.uk/auctions/previous/

> NOTE: Sites can change HTML any time. Scrapers are written to be robust, but if an auctioneer updates layout you may need to tweak selectors.

---

## Tech
- Node.js + TypeScript
- Cheerio (HTML parsing) + Axios (HTTP)
- PostgreSQL + Prisma
- SendGrid for email alerts

---

## Quick start (local)
1) Install deps
```bash
cd apps/api
npm i
```

2) Create `.env` in `apps/api` (see `.env.example`)
3) Run migrations & generate Prisma client
```bash
npx prisma migrate dev --name init
```

4) Run the scraper once
```bash
npm run scrape
```

5) (Optional) Run the API server
```bash
npm run dev
```

---

## Railway deployment (recommended)
1) Push this repo to GitHub.
2) Create a Railway project → Deploy from GitHub.
3) Add a **PostgreSQL** plugin.
4) Set env vars (Railway → Variables):
- `DATABASE_URL` (auto from Postgres plugin)
- `SENDGRID_API_KEY`
- `ALERT_TO_EMAIL` (your Gmail)
- `ALERT_FROM_EMAIL` (verified sender in SendGrid)

5) Add a Railway **Cron Job**
- Schedule: `0 */5 * * *`  (every 5 hours)
- Command: `npm run scrape` (from `apps/api` service)

If you want a separate always-on web service:
- Command: `npm start`

---

## Yorkshire filter
By default we filter by postcode area prefixes:
`YO, HG, LS, BD, HD, HX, WF, HU, S, DN`

You can edit them in:
`apps/api/src/filters.ts`
