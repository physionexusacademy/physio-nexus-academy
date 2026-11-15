import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminCounts } from "@/lib/admin/overview";
import { AdminShell } from "@/components/admin/AdminShell";

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

  // Verified admin from here on: the sidebar badges ("waiting for you") are read with the service-role client.
  const counts = await getAdminCounts();

  return (
    <AdminShell email={user.email ?? ""} counts={counts} signOut={signOut}>
      {children}
    </AdminShell>
  );
}
