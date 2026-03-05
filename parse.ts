export function extractPostcode(text: string): string | null {
  // UK postcode regex (good-enough)
  const m = text.toUpperCase().match(/\b([A-Z]{1,2}\d[A-Z\d]?)\s?(\d[A-Z]{2})\b/);
  if (!m) return null;
  return `${m[1]} ${m[2]}`;
}

export function extractBedrooms(text: string): number | null {
  const t = text.toLowerCase();
  // e.g. "4 bed", "4-bedroom", "four bedroom"
  const digit = t.match(/\b([1-9])\s*[- ]?(bed|bedroom|beds|bedrooms)\b/);
  if (digit) return Number(digit[1]);

  const words: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9
  };
  const word = t.match(/\b(one|two|three|four|five|six|seven|eight|nine)\s+bed(room)?s?\b/);
  if (word) return words[word[1]];
  return null;
}

export function extractGuidePrice(text: string): string | null {
  // matches "£150,000" or "£150,000+" etc.
  const m = text.match(/£\s?\d{1,3}(?:,\d{3})+(?:\s?\+)?/);
  return m ? m[0].replace(/\s+/g, "") : null;
}
