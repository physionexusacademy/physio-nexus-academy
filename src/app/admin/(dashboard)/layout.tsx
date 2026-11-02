import Image from "next/image";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ShoppingBag,
  Stethoscope,
  Home as HomeIcon,
  Images,
  Newspaper,
  MessageSquareQuote,
  HelpCircle,
  Inbox,
  Settings,
  FileBadge2,
  Trophy,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Workshops", href: "/admin/workshops", icon: CalendarDays },
  { label: "Certificates", href: "/admin/certificates", icon: FileBadge2 },
  { label: "Quiz Results", href: "/admin/quiz-results", icon: Trophy },
  { label: "Resources", href: "/admin/resources", icon: BookOpen },
  { label: "Book Orders", href: "/admin/book-orders", icon: ShoppingBag },
  { label: "Appointments", href: "/admin/appointments", icon: Stethoscope },
  { label: "Home Visits", href: "/admin/home-visits", icon: HomeIcon },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Updates", href: "/admin/updates", icon: Newspaper },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { label: "Messages", href: "/admin/messages", icon: Inbox },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
];

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
if (!user) redirect("/admin/login");

const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

if (adminError || !isAdmin) {
  redirect("/admin/login?error=not-authorized");
}
  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-grey-50">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-grey-200 bg-navy-800 text-white lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Image
            src="/images/pna-logo.png"
            alt="PNA"
            width={32}
            height={32}
            className="h-8 w-8 rounded bg-white object-contain p-0.5"
          />
          <span className="font-heading text-sm font-semibold">PNA Admin</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-grey-200 hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <p className="truncate px-3 text-xs text-grey-300">{user?.email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-grey-200 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar + horizontally scrollable nav */}
        <div className="border-b border-grey-200 bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-heading text-sm font-semibold text-navy-800">PNA Admin</span>
            <form action={signOut}>
              <button type="submit" className="text-xs font-semibold text-navy-500">
                Sign out
              </button>
            </form>
          </div>
          <nav className="flex flex-wrap gap-2 px-3 pb-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-grey-100 px-3 py-1.5 text-xs font-medium text-navy-600"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <main className="min-w-0 max-w-full overflow-x-hidden p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
