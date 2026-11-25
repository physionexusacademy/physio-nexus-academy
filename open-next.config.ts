import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Prebuilt (static) pages are served straight from Workers static assets instead of being
 * rendered again on every request. Large content pages (manual therapy, MSK injuries, case
 * reports, atlas) used to exceed the Workers CPU limit when rendered per request and fail
 * with Cloudflare error 1102. The cache is read-only: pages that read live Supabase data
 * are marked `dynamic = "force-dynamic"` and still render on every request.
 */
export default {
	...defineCloudflareConfig({
		incrementalCache: staticAssetsIncrementalCache,
		enableCacheInterception: true,
	}),
	/**
	 * The Form Check's pose-engine and model files (public/formcheck, git-ignored) are fetched and hash-verified before EVERY build, whoever starts it.
	 * Cloudflare's own Git build ("Workers Builds") deploys each push to this branch too, after our GitHub workflow; without this its Worker had no /formcheck/
	 * files, so every deploy it made switched the posture screen's and RehabVerse's camera pose engine off ("The camera could not start").
	 * A file that does not match its locked SHA-256 fails the build: nothing is deployed with a wrong file.
	 */
	buildCommand: "node scripts/fetch-formcheck-assets.mjs && npm run build",
};
