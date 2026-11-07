import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Prebuilt (static) pages are served straight from Workers static assets instead of being
 * rendered again on every request. Large content pages (manual therapy, MSK injuries, case
 * reports, atlas) used to exceed the Workers CPU limit when rendered per request and fail
 * with Cloudflare error 1102. The cache is read-only: pages that read live Supabase data
 * are marked `dynamic = "force-dynamic"` and still render on every request.
 */
export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
	enableCacheInterception: true,
});
