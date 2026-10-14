"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Physio Nexus Academy</p>
      <h1 className="mt-4 text-3xl font-bold text-navy-900">Something went wrong</h1>
      <p className="mt-3 max-w-lg text-base leading-7 text-slate-600">
        This page could not be loaded as expected. Your saved information has not been intentionally changed.
        Please try again, or return to the homepage.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-navy-900 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          Return home
        </a>
      </div>
    </main>
  );
}
