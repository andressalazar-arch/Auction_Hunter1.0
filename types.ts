export type ScrapedLot = {
  source: string;
  sourceUrl: string;
  title?: string | null;
  address?: string | null;
  postcode?: string | null;
  bedrooms?: number | null;
  guidePrice?: string | null;
  dedupeKey: string;
};
