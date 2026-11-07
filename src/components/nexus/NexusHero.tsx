import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

/**
 * The shared night-sky hero for academy sections. Server component, no JS.
 * Gives every hub the same "you are in the academy" entrance: breadcrumb to the
 * wing, a live kicker, a display title, a lead, actions and optional stats.
 */
export function NexusHero({
  kicker,
  title,
  lead,
  crumbs = [],
  actions,
  stats,
  aside,
  id = "page-title",
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  stats?: { value: ReactNode; label: string }[];
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <section className="nx-sky nx-grid nx-stars nx-hero" aria-labelledby={id}>
      <div className="container-content nx-hero-inner">
        {crumbs.length ? (
          <nav aria-label="Breadcrumb" className="nx-crumbs mb-5">
            <a href="/">Home</a>
            {crumbs.map((crumb) => (
              <span key={crumb.label} className="inline-flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : <span aria-current="page" className="text-[var(--nx-mute)]">{crumb.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        <div className={aside ? "grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]" : undefined}>
          <div>
            <p className="nx-kicker">
              <span className="nx-live" /> {kicker}
            </p>
            <h1 id={id} className="nx-title mt-4 max-w-4xl text-[2.15rem] text-white sm:text-5xl lg:text-[3.4rem]">
              {title}
            </h1>
            {lead ? <div className="nx-lead mt-4 max-w-3xl text-base sm:text-lg">{lead}</div> : null}
            {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
            {stats?.length ? (
              <dl className="mt-8 flex flex-wrap gap-2.5">
                {stats.map((stat) => (
                  <div key={stat.label} className="nx-stat">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          {aside ? <div className="min-w-0">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
