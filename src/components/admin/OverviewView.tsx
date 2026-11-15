import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, ExternalLink, FilePlus2, Inbox, MessageSquare, PackageCheck, Settings, ShoppingBag, Stethoscope, Users, BookOpen, CalendarDays, HeartPulse, House } from "lucide-react";
import { ADMIN_NAV_FLAT, totalWaiting } from "@/lib/admin/nav";
import type { AdminOverview, InboxKind } from "@/lib/admin/overview";

const KIND: Record<InboxKind, { label: string; colour: string }> = {
  appointment: { label: "Appointment", colour: "#2ee6d6" },
  "home-visit": { label: "Home visit", colour: "#a08dff" },
  order: { label: "Book order", colour: "#ffc65c" },
  message: { label: "Message", colour: "#ff7aa2" },
};

function timeAgo(iso: string, now: number) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

const SERIES = [
  { key: "appointments", label: "Appointments", colour: "#2ee6d6" },
  { key: "homeVisits", label: "Home visits", colour: "#a08dff" },
  { key: "orders", label: "Book orders", colour: "#ffc65c" },
  { key: "messages", label: "Messages", colour: "#ff7aa2" },
] as const;

function ActivityChart({ activity }: { activity: AdminOverview["activity"] }) {
  const W = 420, H = 150, base = 118, barW = 20, gap = 8, left = 16, scale = 96;
  const totals = activity.map((day) => day.appointments + day.homeVisits + day.orders + day.messages);
  const max = Math.max(4, ...totals);
  const sum = totals.reduce((a, b) => a + b, 0);
  return (
    <div className="ov-chart">
      <div className="ov-chart-head"><strong>Requests, last 14 days</strong><span>{sum} in total</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Requests received per day over the last 14 days: ${sum} in total.`}>
        <line x1="8" y1={base} x2={W - 8} y2={base} stroke="rgba(150,205,255,.25)" />
        {activity.map((day, i) => {
          let y = base;
          const x = left + i * (barW + gap);
          return (
            <g key={day.day}>
              <title>{`${day.label}: ${totals[i]} request${totals[i] === 1 ? "" : "s"}`}</title>
              <rect x={x} y={base - 3} width={barW} height={3} rx="1.5" fill="rgba(150,205,255,.2)" />
              {SERIES.map((series) => {
                const value = day[series.key];
                if (!value) return null;
                const h = Math.max(4, (value / max) * scale);
                y -= h;
                return <rect key={series.key} className="ov-bar" x={x} y={y} width={barW} height={h - 1} rx="3" fill={series.colour} />;
              })}
              {i === 0 || i === 6 || i === 13 ? <text className="ov-axis" x={x + barW / 2} y={base + 16} textAnchor="middle">{day.label}</text> : null}
            </g>
          );
        })}
      </svg>
      <ul className="ov-legend">{SERIES.map((series) => <li key={series.key} style={{ ["--c" as string]: series.colour }}><i />{series.label}</li>)}</ul>
    </div>
  );
}

export function OverviewView({ data, greeting, dateLabel, now }: { data: AdminOverview; greeting: string; dateLabel: string; now: number }) {
  const { counts, totals } = data;
  const waiting = totalWaiting(counts);
  const firstBusy = counts.appointments ? "/admin/appointments" : counts.orders ? "/admin/book-orders" : counts.homeVisits ? "/admin/home-visits" : counts.messages ? "/admin/messages" : "/admin/workshops";
  const parts = [
    counts.appointments ? `${counts.appointments} appointment${counts.appointments === 1 ? "" : "s"}` : "",
    counts.homeVisits ? `${counts.homeVisits} home visit${counts.homeVisits === 1 ? "" : "s"}` : "",
    counts.orders ? `${counts.orders} book order${counts.orders === 1 ? "" : "s"}` : "",
    counts.messages ? `${counts.messages} message${counts.messages === 1 ? "" : "s"}` : "",
  ].filter(Boolean);

  const kpis = [
    { label: "Appointments", note: "waiting for a reply", value: counts.appointments, href: "/admin/appointments", icon: Stethoscope, colour: "#2ee6d6", hot: true },
    { label: "Home visits", note: "waiting for a reply", value: counts.homeVisits, href: "/admin/home-visits", icon: House, colour: "#a08dff", hot: true },
    { label: "Book orders", note: "new, to confirm", value: counts.orders, href: "/admin/book-orders", icon: ShoppingBag, colour: "#ffc65c", hot: true },
    { label: "Messages", note: "unread", value: counts.messages, href: "/admin/messages", icon: MessageSquare, colour: "#ff7aa2", hot: true },
    { label: "Workshops", note: "in total", value: totals.workshops, href: "/admin/workshops", icon: CalendarDays, colour: "#3cc8ff", hot: false },
    { label: "Registrations", note: "across all workshops", value: totals.registrations, href: "/admin/workshops", icon: Users, colour: "#7ef0c3", hot: false },
  ];

  const quick = [
    { label: "Add a workshop", href: "/admin/workshops", icon: FilePlus2 },
    { label: "Add a resource", href: "/admin/resources", icon: BookOpen },
    { label: "Review orders", href: "/admin/book-orders", icon: PackageCheck },
    { label: "Reply to messages", href: "/admin/messages", icon: Inbox },
    { label: "RehabVerse inbox", href: "/admin/rehabverse", icon: HeartPulse },
    { label: "Site settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="ov">
      <section className="ov-hero" aria-labelledby="ov-title">
        <div>
          <p className="ov-eyebrow"><i /> Mission control · {dateLabel}</p>
          <h1 id="ov-title">{greeting}, <span>welcome back.</span></h1>
          <p className="ov-lead">
            {waiting > 0 ? (
              <><b>{waiting} item{waiting === 1 ? " is" : "s are"} waiting for you</b>: {parts.join(", ")}. Everything else is running as normal.</>
            ) : (
              <>You are all caught up. <b>Nothing is waiting</b> for a reply right now.</>
            )}
          </p>
          <div className="ov-cta">
            <Link href={firstBusy} prefetch={false} className="ov-btn ov-btn-primary">{waiting > 0 ? "Review what is waiting" : "Open workshops"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className="ov-btn ov-btn-ghost"><ExternalLink className="h-4 w-4" aria-hidden="true" /> View the live site</a>
          </div>
          {!data.connected ? <p className="ov-note">The numbers could not be read just now. The sections below still work: open any of them from the menu.</p> : null}
        </div>
        <ActivityChart activity={data.activity} />
      </section>

      <section className="ov-kpis" aria-label="Key numbers">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href} prefetch={false} className="ov-kpi" data-hot={kpi.hot && kpi.value > 0 ? "1" : "0"} style={{ ["--c" as string]: kpi.colour }}>
            <span className="ov-kpi-ico"><kpi.icon className="h-5 w-5" aria-hidden="true" /></span>
            {kpi.hot && kpi.value > 0 ? <i className="ov-hotdot" aria-hidden="true" /> : null}
            <b>{kpi.value}</b>
            <span>{kpi.label}</span>
            <small>{kpi.hot && kpi.value === 0 ? "All clear" : kpi.note}</small>
          </Link>
        ))}
      </section>

      <div className="ov-cols">
        <section className="ov-panel" aria-labelledby="ov-att">
          <div className="ov-panel-head"><h2 id="ov-att">Needs your attention</h2><span className="text-xs font-bold text-[#7d90a8]">newest first</span></div>
          {data.attention.length ? (
            <ul className="ov-list">
              {data.attention.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link href={item.href} prefetch={false} className="ov-item" style={{ ["--c" as string]: KIND[item.kind].colour }}>
                    <span className="ov-chip">{KIND[item.kind].label}</span>
                    <span className="ov-item-text"><strong>{item.title}</strong><small>{item.detail || "Open to see the details"}</small></span>
                    <span className="ov-ago">{timeAgo(item.createdAt, now)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="ov-empty"><CheckCircle2 className="h-9 w-9 text-[#01828b]" aria-hidden="true" /><strong>All clear</strong><span>New appointments, orders and messages appear here the moment they arrive.</span></div>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section className="ov-panel" aria-labelledby="ov-up">
            <div className="ov-panel-head"><h2 id="ov-up">Upcoming workshops</h2><Link href="/admin/workshops" prefetch={false}>Manage</Link></div>
            {data.workshops.length ? (
              <ul className="ov-list">
                {data.workshops.map((workshop) => {
                  const date = workshop.startDate ? new Date(workshop.startDate) : null;
                  return (
                    <li key={workshop.id}>
                      <Link href={`/admin/workshops/${workshop.id}`} prefetch={false} className="ov-item" style={{ ["--c" as string]: "#3cc8ff" }}>
                        <span className="ov-date">{date ? <><b>{date.getUTCDate()}</b><small>{date.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}</small></> : <CalendarCheck className="h-5 w-5" aria-hidden="true" />}</span>
                        <span className="ov-item-text"><strong>{workshop.title}</strong><small>{[workshop.city, workshop.status].filter(Boolean).join(" · ") || "Open to edit"}</small></span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="ov-empty"><CalendarDays className="h-8 w-8 text-[#3cc8ff]" aria-hidden="true" /><strong>No upcoming workshops</strong><Link href="/admin/workshops" prefetch={false} className="text-sm font-bold text-[#01828b]">Add one</Link></div>
            )}
          </section>
          <section className="ov-panel" aria-labelledby="ov-quick">
            <div className="ov-panel-head"><h2 id="ov-quick">Quick actions</h2></div>
            <div className="ov-quick">
              {quick.map((action) => <Link key={action.label} href={action.href} prefetch={false} className="ov-q"><span><action.icon className="h-4 w-4" aria-hidden="true" /></span>{action.label}</Link>)}
            </div>
          </section>
        </div>
      </div>

      <section className="ov-panel" aria-labelledby="ov-all">
        <div className="ov-panel-head"><h2 id="ov-all">Everything you can manage</h2><span className="text-xs font-bold text-[#7d90a8]">tip: press Ctrl K to jump anywhere</span></div>
        <div className="ov-mods">
          {ADMIN_NAV_FLAT.filter((item) => item.href !== "/admin").map((item) => {
            const badge = item.badge ? counts[item.badge] : 0;
            return (
              <Link key={item.href} href={item.href} prefetch={false} className="ov-mod">
                <span className="ov-mod-ico"><item.icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="ov-mod-text"><strong>{item.label}</strong><small>{item.blurb}</small></span>
                {badge > 0 ? <span className="ad-badge ov-mod-count">{badge}</span> : null}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
