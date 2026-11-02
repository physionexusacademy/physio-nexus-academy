import { LockKeyhole, Mail, TicketCheck } from "lucide-react";
import { loginToWorkshopPortal } from "./actions";

export function PortalLoginForm({
  slug,
  error,
}: {
  slug: string;
  error?: string | null;
}) {
  return (
    <form
      action={loginToWorkshopPortal.bind(null, slug)}
      className="mt-6 space-y-4"
    >
      <div>
        <label
          htmlFor="registrationId"
          className="mb-1.5 block text-sm font-semibold text-navy-700"
        >
          Registration ID
        </label>
        <div className="relative">
          <TicketCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-500" />
          <input
            id="registrationId"
            name="registrationId"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g. WKS-261002-1234"
            className="input pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="portalEmail"
          className="mb-1.5 block text-sm font-semibold text-navy-700"
        >
          Registered email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-500" />
          <input
            id="portalEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="input pl-10"
            required
          />
        </div>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
      >
        <LockKeyhole className="h-4 w-4" />
        Enter Participant Portal
      </button>

      <p className="text-center text-xs leading-5 text-navy-400">
        Access is limited to registered participants. Use the same email you
        entered during workshop registration.
      </p>
    </form>
  );
}
