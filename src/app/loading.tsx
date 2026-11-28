/**
 * Shown the instant another page is opening, while its content arrives (the header and footer stay in place). A calm skeleton in the shape of
 * a page (a title and a few cards) instead of a blank screen: the site answers at once, like a video page that shows its frame before the video.
 * At least a screen tall, so the footer is never on screen while it waits: the page content then replaces it without pushing the footer (no layout shift).
 */
export default function Loading() {
  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-6xl px-4 py-10 sm:px-6" role="status" aria-live="polite" aria-label="Loading the page">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-28 rounded-full bg-slate-200/80" />
        <div className="h-9 w-3/5 max-w-xl rounded-xl bg-slate-200/80" />
        <div className="h-4 w-4/5 max-w-2xl rounded-full bg-slate-200/70" />
        <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-200/60" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
