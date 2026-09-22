"use client";

import { FormEvent, useState } from "react";
import { BadgeCheck, Search, ShieldCheck, TriangleAlert } from "lucide-react";

type CertificateRecord = {
  certificate_id: string;
  participant_name: string;
  workshop_title: string;
  start_date: string | null;
  end_date: string | null;
  contact_hours: number | string | null;
  status: "valid" | "revoked";
};

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate) return "Not specified";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const start = formatter.format(new Date(`${startDate}T00:00:00`));
  if (!endDate || endDate === startDate) return start;

  const end = formatter.format(new Date(`${endDate}T00:00:00`));
  return `${start} – ${end}`;
}

export function CertificateVerificationForm() {
  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setCertificate(null);
    setError("");

    try {
      const response = await fetch("/api/verify-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId }),
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Certificate could not be verified.");
        return;
      }

      setCertificate(payload.certificate);
    } catch {
      setError("Verification service is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  const isValid = certificate?.status === "valid";

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm sm:p-7">
        <label htmlFor="certificate-id" className="text-sm font-semibold text-navy-800">
          Certificate ID
        </label>
        <p className="mt-1 text-sm text-navy-400">
          Enter the exact ID printed on the certificate.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            id="certificate-id"
            value={certificateId}
            onChange={(event) => setCertificateId(event.target.value.toUpperCase())}
            placeholder="PNA-26-XXXXXXXXXXXXXXXX"
            autoComplete="off"
            spellCheck={false}
            className="input flex-1 uppercase tracking-wide"
            maxLength={23}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" />
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="font-semibold">Verification unsuccessful</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {certificate && (
        <section className={`mt-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-7 ${isValid ? "border-teal-200" : "border-amber-200"}`} aria-live="polite">
          <div className="flex items-start gap-3">
            {isValid ? (
              <BadgeCheck className="h-8 w-8 flex-none text-teal-600" />
            ) : (
              <TriangleAlert className="h-8 w-8 flex-none text-amber-600" />
            )}
            <div>
              <p className={`text-lg font-bold ${isValid ? "text-teal-700" : "text-amber-700"}`}>
                {isValid ? "Certificate Verified" : "Certificate Revoked"}
              </p>
              <p className="mt-1 text-sm text-navy-400">
                This result applies only to the exact Certificate ID entered above.
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-grey-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Participant</dt>
              <dd className="mt-1 font-semibold text-navy-800">{certificate.participant_name}</dd>
            </div>
            <div className="rounded-xl bg-grey-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Certificate ID</dt>
              <dd className="mt-1 break-all font-mono text-sm font-semibold text-navy-800">{certificate.certificate_id}</dd>
            </div>
            <div className="rounded-xl bg-grey-50 p-4 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Workshop / Course</dt>
              <dd className="mt-1 font-semibold text-navy-800">{certificate.workshop_title}</dd>
            </div>
            <div className="rounded-xl bg-grey-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Workshop Date</dt>
              <dd className="mt-1 font-semibold text-navy-800">{formatDateRange(certificate.start_date, certificate.end_date)}</dd>
            </div>
            <div className="rounded-xl bg-grey-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Contact Hours</dt>
              <dd className="mt-1 font-semibold text-navy-800">{certificate.contact_hours ?? "Not specified"}</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-grey-200 bg-grey-50 p-4 text-sm text-navy-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-teal-600" />
            <p>
              Physio Nexus Academy displays certificate details only after an exact Certificate ID is submitted. Participant records cannot be publicly browsed.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
