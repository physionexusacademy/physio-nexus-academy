export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Physio Nexus Academy</p>
      <p className="mt-5 text-sm font-bold text-slate-500">404 · PAGE NOT FOUND</p>
      <h1 className="mt-3 text-3xl font-bold text-navy-900">We couldn’t find that page</h1>
      <p className="mt-3 max-w-lg leading-7 text-slate-600">
        The link may be outdated, or the page may have moved. Use the homepage to find the right learning resource or service.
      </p>
      <a href="/" className="mt-7 rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
        Go to homepage
      </a>
    </main>
  );
}
