import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DailyChallengeQuestion } from "@/lib/daily-challenge";

/**
 * Reads the lesson-based part of the Daily Clinical Challenge pool (public/daily-content/pool.json, written by scripts/build-daily-pool.ts).
 * It is deliberately NOT bundled into the worker (about 54 KiB gzip): on Cloudflare it comes through the ASSETS binding, in the build and in local development
 * from the file in the repository. These questions are built from the PNA Teacher lessons, whose checks are already public (public/teacher-data), so
 * serving the file adds no new exposure. The hand-written 100-question bank stays in the worker. A copy is kept for the life of the isolate.
 */
type Assets = { fetch: (request: Request) => Promise<Response> };
let cached: Promise<DailyChallengeQuestion[]> | null = null;

async function read(): Promise<DailyChallengeQuestion[]> {
  try {
    const assets = (getCloudflareContext() as unknown as { env?: { ASSETS?: Assets } }).env?.ASSETS;
    if (assets) {
      const response = await assets.fetch(new Request("https://assets.invalid/daily-content/pool.json"));
      if (response.ok) return (await response.json()) as DailyChallengeQuestion[];
    }
  } catch {
    /* not on Cloudflare (the build or local development): read the file */
  }
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  return JSON.parse(await fs.readFile(path.join(process.cwd(), "public", "daily-content", "pool.json"), "utf8")) as DailyChallengeQuestion[];
}

/** The generated lesson questions. A failed read is not remembered, so the next request tries again (and the caller never serves a half-empty pool). */
export function loadGeneratedPool(): Promise<DailyChallengeQuestion[]> {
  if (!cached) {
    cached = read().then((pool) => {
      if (!Array.isArray(pool) || pool.length < 150) throw new Error("Daily pool is missing or too small.");
      return pool;
    });
    cached.catch(() => { cached = null; });
  }
  return cached;
}
