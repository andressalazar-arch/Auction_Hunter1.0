export const YORKSHIRE_POSTCODE_PREFIXES = ["YO","HG","LS","BD","HD","HX","WF","HU","S","DN"];

// Convert "LS12 3AB" -> "LS"
export function postcodePrefix(postcode?: string | null) {
  if (!postcode) return null;
  const up = postcode.trim().toUpperCase();
  const first = up.split(" ")[0];
  return first.replace(/[0-9].*$/, "");
}

export function matchesYorkshire(postcode?: string | null) {
  const prefix = postcodePrefix(postcode);
  if (!prefix) return false;
  return YORKSHIRE_POSTCODE_PREFIXES.includes(prefix);
}

export function matchesBeds(beds?: number | null) {
  if (!beds) return false;
  return beds >= 4 && beds <= 5;
}
