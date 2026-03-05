import { createHash } from "crypto";

export function dedupeKey(source: string, url: string) {
  return createHash("sha256").update(`${source}::${url}`).digest("hex");
}
