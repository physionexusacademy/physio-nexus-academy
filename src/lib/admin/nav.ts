import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ShoppingBag,
  Stethoscope,
  Home as HomeIcon,
  Images,
  MessageSquareQuote,
  HelpCircle,
  Inbox,
  Settings,
  FileBadge2,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import type { AdminCounts } from "./types";

/** Every admin section, grouped the way an administrator thinks about the work. One list feeds the sidebar, the command palette and the overview. */
export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** One line shown in the palette and on the overview. */
  blurb: string;
  /** Which "waiting for you" count belongs on this item. */
  badge?: keyof AdminCounts;
  /** Extra words the palette also matches. */
  keywords?: string;
};

export type AdminNavGroup = { id: string; label: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: "command",
    label: "Command",
    items: [{ label: "Overview", href: "/admin", icon: LayoutDashboard, blurb: "Everything that needs you today, at a glance", keywords: "home dashboard summary" }],
  },
  {
    id: "learn",
    label: "Learning & events",
    items: [
      { label: "Workshops", href: "/admin/workshops", icon: CalendarDays, blurb: "Create workshops, registrations, results and exports", keywords: "events cpd courses registrations" },
      { label: "Certificates", href: "/admin/certificates", icon: FileBadge2, blurb: "Issue and export participant certificates", keywords: "certificate verify" },
      { label: "Resources", href: "/admin/resources", icon: BookOpen, blurb: "Learning resources and downloads", keywords: "files pdf library" },
      { label: "Book Orders", href: "/admin/book-orders", icon: ShoppingBag, blurb: "Printed book orders, status and delivery", badge: "orders", keywords: "books shop delivery" },
    ],
  },
  {
    id: "care",
    label: "Patient care",
    items: [
      { label: "Appointments", href: "/admin/appointments", icon: Stethoscope, blurb: "Clinic and online appointment requests", badge: "appointments", keywords: "booking patients clinic" },
      { label: "Home Visits", href: "/admin/home-visits", icon: HomeIcon, blurb: "Physio-at-home requests and addresses", badge: "homeVisits", keywords: "home visit patients" },
      { label: "RehabVerse", href: "/admin/rehabverse", icon: HeartPulse, blurb: "Patient programmes, reviews and alerts", keywords: "rehab programmes patients exercises" },
    ],
  },
  {
    id: "content",
    label: "Website content",
    items: [
      { label: "Training Photos", href: "/admin/gallery", icon: Images, blurb: "Photos of workshops and training", keywords: "gallery images" },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote, blurb: "What participants say about PNA", keywords: "reviews quotes" },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle, blurb: "Frequently asked questions shown on the site", keywords: "questions help" },
    ],
  },
  {
    id: "system",
    label: "Inbox & system",
    items: [
      { label: "Messages", href: "/admin/messages", icon: Inbox, blurb: "Messages from the contact form", badge: "messages", keywords: "contact inbox email" },
      { label: "Site Settings", href: "/admin/settings", icon: Settings, blurb: "Contact details, founder profile and site text", keywords: "settings founder branding" },
    ],
  },
];

export const ADMIN_NAV_FLAT: AdminNavItem[] = ADMIN_NAV.flatMap((group) => group.items);

export const totalWaiting = (counts: AdminCounts) => counts.appointments + counts.homeVisits + counts.orders + counts.messages;
