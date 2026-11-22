import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ChapterData, ChapterIndex } from "@/lib/manual-therapy-chapter-types";

/**
 * Reads the static Manual Therapy chapter data (public/manual-therapy-data, see manual-therapy-chapter-types.ts). It is deliberately NOT bundled into the
 * worker: it is read from the static assets through the ASSETS binding on Cloudflare, and from the file in the repository when the pages are built (or in
 * local development). The pages are prerendered, so in production the build reads the files and visitors get the finished page.
 */
type Assets = { fetch: (request: Request) => Promise<Response> };
const BASE = "/manual-therapy-data";

async function readJson(relative: string): Promise<unknown | null> {
  try {
    const assets = (getCloudflareContext() as unknown as { env?: { ASSETS?: Assets } }).env?.ASSETS;
    if (assets) {
      const response = await assets.fetch(new Request(`https://assets.invalid${BASE}${relative}`));
      if (response.ok && /json/i.test(response.headers.get("content-type") ?? "json")) return await response.json();
      if (response.status === 404) return null;
    }
  } catch {
    /* not on Cloudflare (the build or local development): read the file */
  }
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    return JSON.parse(await fs.readFile(path.join(process.cwd(), "public", BASE, relative), "utf8"));
  } catch {
    return null;
  }
}

/** The data of one chapter, or null when there is no such chapter. Slugs are checked before they touch a path. */
export async function loadChapterData(slug: string): Promise<ChapterData | null> {
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) return null;
  const data = (await readJson(`/chapters/${slug}.json`)) as ChapterData | null;
  return data && data.version === 1 && data.slug === slug ? data : null;
}

export async function loadChapterIndex(): Promise<ChapterIndex | null> {
  const index = (await readJson("/index.json")) as ChapterIndex | null;
  return index && index.version === 1 ? index : null;
}
