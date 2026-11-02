import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  const errorMessage =
    params.error === "not-authorized"
      ? "Your account is signed in but is not registered as an admin. Contact the academy owner to be added to the profiles table."
      : params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-800 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <Image
            src="/images/pna-logo.png"
            alt="Physio Nexus Academy"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <h1 className="mt-4 font-heading text-lg font-bold text-navy-800">
            Admin Dashboard
          </h1>
          <p className="text-sm text-navy-400">Physio Nexus Academy</p>
        </div>

        <form action={login} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">
              Email
            </label>
            <input name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">
              Password
            </label>
            <input name="password" type="password" required className="input" />
          </div>
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
