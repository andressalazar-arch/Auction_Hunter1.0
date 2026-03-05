import axios from "axios";

const timeout = Number(process.env.SCRAPE_TIMEOUT_MS ?? 20000);

export const http = axios.create({
  timeout,
  headers: {
    "User-Agent": "UnsoldAuctionHunter/1.0 (+contact: admin@example.com)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  },
  maxRedirects: 5,
  validateStatus: (s) => s >= 200 && s < 400
});

export async function fetchHtml(url: string): Promise<string> {
  const res = await http.get(url);
  return res.data as string;
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
