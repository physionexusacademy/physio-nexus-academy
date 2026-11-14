"use client";

import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";

type Testimonial = { id: string; content: string; name: string; role: string | null };

/**
 * Published testimonials. The homepage is a prebuilt (static) page so it opens instantly; this block asks the database for the
 * published testimonials only when it is about to scroll into view, and shows nothing at all when there are none (no empty box).
 * It uses the public key the database already exposes to every visitor (published rows only; row-level security).
 */
export function HomeTestimonials() {
  const anchor = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Testimonial[]>([]);

  useEffect(() => {
    const node = anchor.current;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!node || !base || !key) return;
    let cancelled = false;
    const load = () => {
      fetch(`${base}/rest/v1/testimonials?select=id,content,name,role&status=eq.published&order=sort_order.asc&limit=3`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      })
        .then((response) => (response.ok ? (response.json() as Promise<Testimonial[]>) : []))
        .then((data) => !cancelled && Array.isArray(data) && setRows(data))
        .catch(() => undefined);
    };
    if (!("IntersectionObserver" in window)) {
      load();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={anchor}>
      {rows.length ? (
        <section className="container-content pb-12" aria-labelledby="home-testimonials-title">
          <p className="nx-kicker nx-kicker-light">Trusted by learners</p>
          <h2 id="home-testimonials-title" className="nx-title mt-3 text-3xl text-navy-800">What physiotherapists &amp; students say</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {rows.map((t) => (
              <figure key={t.id} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <Quote className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-sm leading-7 text-slate-700">“{t.content}”</blockquote>
                <figcaption className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-sm font-bold text-navy-800">{t.name}</p>
                  {t.role ? <p className="text-xs font-medium text-slate-500">{t.role}</p> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
