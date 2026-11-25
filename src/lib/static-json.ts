import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Reads a static JSON file from public/ for server code. These files are deliberately NOT bundled into the worker (every KiB of data in the worker counts against
 * Cloudflare's 3 MiB gzip limit, see docs/worker-size.md): on Cloudflare they come through the ASSETS binding, and in the build and in local development from
 * the file in the repository. The pages are prerendered, so in production visitors get finished HTML. Returns null when the file does not exist.
 */
type Assets = { fetch: (request: Request) => Promise<Response> };

export async function readStaticJson<T>(publicPath: string): Promise<T | null> {
  if (!/^\/[a-z0-9][a-z0-9/_.-]*\.json$/i.test(publicPath) || publicPath.includes("..")) return null;
  try {
    const assets = (getCloudflareContext() as unknown as { env?: { ASSETS?: Assets } }).env?.ASSETS;
    if (assets) {
      const response = await assets.fetch(new Request(`https://assets.invalid${publicPath}`));
      if (response.ok) return (await response.json()) as T;
      if (response.status === 404) return null;
    }
  } catch {
    /* not on Cloudflare (the build or local development): read the file */
  }
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    return JSON.parse(await fs.readFile(path.join(process.cwd(), "public", publicPath), "utf8")) as T;
  } catch {
    return null;
  }
}
