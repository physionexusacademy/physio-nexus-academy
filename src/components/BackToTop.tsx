"use client";

export function BackToTop() {
  return (
    <div className="border-t border-grey-200 bg-white px-4 py-5 text-center">
      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-700"
        aria-label="Back to top"
      >
        ↑ Back to Top
      </button>
    </div>
  );
}
