import { Download, FileBadge2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  generateCertificates,
  generateCertificatesFromCompletedRegistrations,
  updateCertificateStatus,
} from "./actions";

type SearchParams = {
  q?: string;
  workshop?: string;
  status?: string;
};

function formatWorkshopDate(startDate: string | null, endDate: string | null) {
  if (!startDate) return "Date not set";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const start = formatter.format(new Date(`${startDate}T00:00:00`));

  if (!endDate || endDate === startDate) return start;
  const end = formatter.format(new Date(`${endDate}T00:00:00`));
  return `${start} – ${end}`;
}

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [
    { data: workshops, error: workshopsError },
    { data: certificates, error: certificatesError },
  ] = await Promise.all([
    supabase
      .from("workshops")
      .select("id, title, start_date, end_date, contact_hours")
      .order("start_date", { ascending: false }),
    supabase
      .from("certificates")
      .select("id, certificate_id, participant_name, status, issued_at, workshop_id")
      .order("issued_at", { ascending: false }),
  ]);

  const loadError = workshopsError ?? certificatesError;
  const workshopsById = new Map(
    (workshops ?? []).map((workshop) => [workshop.id, workshop])
  );

  const q = (params.q ?? "").trim().toLowerCase();
  const workshopFilter = params.workshop ?? "";
  const statusFilter = params.status ?? "";

  const filtered = (certificates ?? []).filter((certificate) => {
    const matchesSearch =
      !q ||
      certificate.participant_name.toLowerCase().includes(q) ||
      certificate.certificate_id.toLowerCase().includes(q);
    const matchesWorkshop =
      !workshopFilter || certificate.workshop_id === workshopFilter;
    const matchesStatus =
      !statusFilter || certificate.status === statusFilter;

    return matchesSearch && matchesWorkshop && matchesStatus;
  });

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <div className="min-w-0 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Certificates</h1>
          <p className="mt-1 text-sm text-navy-400">
            Generate, view and manage PNA certificate verification records.
          </p>
        </div>
        <a
          href="/admin/certificates/export"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-grey-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 hover:border-teal-300 hover:text-teal-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {loadError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Certificate data could not be loaded: {loadError.message}
        </div>
      )}

      <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-2">
        <details className="min-w-0 rounded-xl border border-grey-200 bg-white p-4 sm:p-5" open>
          <summary className="cursor-pointer font-semibold text-navy-700">
            + Generate certificates from names
          </summary>
          <form
            action={generateCertificates}
            className="mt-5 space-y-4"
            encType="multipart/form-data"
          >
            <div>
              <label className="label">Workshop</label>
              <select name="workshop_id" required className="input">
                <option value="">Select workshop</option>
                {workshops?.map((workshop) => (
                  <option key={workshop.id} value={workshop.id}>
                    {workshop.title} ·{" "}
                    {formatWorkshopDate(workshop.start_date, workshop.end_date)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Participant names</label>
              <textarea
                name="participant_names"
                rows={7}
                className="input"
                placeholder={"One participant per line\nAli Raza PT\nSana Ahmed PT"}
              />
              <p className="mt-1 text-xs text-navy-400">
                Paste names directly from Excel/Sheets, one name per line.
              </p>
            </div>

            <div>
              <label className="label">Or upload a CSV</label>
              <input
                name="names_file"
                type="file"
                accept=".csv,text/csv,text/plain"
                className="input"
              />
              <p className="mt-1 text-xs text-navy-400">
                The first column should contain participant names.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
            >
              <Upload className="h-4 w-4" />
              Generate Certificate IDs
            </button>
          </form>
        </details>

        <details className="min-w-0 rounded-xl border border-grey-200 bg-white p-4 sm:p-5">
          <summary className="cursor-pointer font-semibold text-navy-700">
            Generate from completed registrations
          </summary>
          <form
            action={generateCertificatesFromCompletedRegistrations}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="label">Workshop</label>
              <select name="workshop_id" required className="input">
                <option value="">Select workshop</option>
                {workshops?.map((workshop) => (
                  <option key={workshop.id} value={workshop.id}>
                    {workshop.title} ·{" "}
                    {formatWorkshopDate(workshop.start_date, workshop.end_date)}
                  </option>
                ))}
              </select>
            </div>

            <p className="rounded-lg bg-grey-50 p-4 text-sm leading-6 text-navy-500">
              This creates verification records only for registrations marked
              <strong> Completed</strong>. Existing registration-linked certificates
              are preserved instead of duplicated.
            </p>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
            >
              <FileBadge2 className="h-4 w-4" />
              Generate from Completed
            </button>
          </form>
        </details>
      </div>

      <form
        method="get"
        className="mt-6 grid min-w-0 gap-3 rounded-xl border border-grey-200 bg-white p-4 sm:grid-cols-4"
      >
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Name or Certificate ID"
          className="input sm:col-span-2"
        />
        <select name="workshop" defaultValue={workshopFilter} className="input">
          <option value="">All workshops</option>
          {workshops?.map((workshop) => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.title}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select name="status" defaultValue={statusFilter} className="input">
            <option value="">All statuses</option>
            <option value="valid">Valid</option>
            <option value="revoked">Revoked</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-navy-700 px-4 text-sm font-semibold text-white"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="mt-5 w-full max-w-full overflow-x-auto rounded-xl border border-grey-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-grey-200 text-left text-xs uppercase tracking-wide text-navy-400">
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Certificate ID</th>
              <th className="px-4 py-3">Workshop</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((certificate) => {
              const relatedWorkshop = workshopsById.get(certificate.workshop_id);

              return (
                <tr
                  key={certificate.id}
                  className="border-b border-grey-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-navy-800">
                    {certificate.participant_name}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-grey-50 px-2 py-1 text-xs font-semibold text-navy-700">
                      {certificate.certificate_id}
                    </code>
                  </td>
                  <td className="max-w-[260px] px-4 py-3 text-navy-500">
                    {relatedWorkshop?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-navy-500">
                    {formatWorkshopDate(
                      relatedWorkshop?.start_date ?? null,
                      relatedWorkshop?.end_date ?? null
                    )}
                  </td>
                  <td className="px-4 py-3 text-navy-500">
                    {relatedWorkshop?.contact_hours ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        certificate.status === "valid"
                          ? "bg-teal-50 text-teal-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {certificate.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateCertificateStatus}>
                      <input type="hidden" name="id" value={certificate.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={certificate.status === "valid" ? "revoked" : "valid"}
                      />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-navy-600 hover:text-teal-700 hover:underline"
                      >
                        {certificate.status === "valid" ? "Revoke" : "Reactivate"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-navy-400"
                >
                  No certificate records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
