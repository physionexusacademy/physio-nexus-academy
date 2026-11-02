import { createClient } from "@/lib/supabase/server";
import {
  updateFounderProfile,
  addQualification,
  deleteQualification,
  updateSiteSetting,
  updateAboutContent,
} from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { siteConfig } from "@/lib/site-config";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [{ data: founder }, { data: qualifications }, { data: settings }, { data: aboutSection }] =
    await Promise.all([
      supabase.from("founder_profile").select("*").eq("id", 1).single(),
      supabase.from("qualifications").select("*").order("sort_order", { ascending: true }),
      supabase.from("site_settings").select("*"),
      supabase
        .from("editable_page_sections")
        .select("*")
        .eq("page", "about")
        .eq("section_key", "mission")
        .maybeSingle(),
    ]);

  const about = {
    purpose: aboutSection?.content?.purpose ?? siteConfig.mission.purpose,
    vision: aboutSection?.content?.vision ?? siteConfig.mission.vision,
    mission: aboutSection?.content?.mission ?? siteConfig.mission.mission,
  };

  const settingValue = (key: string) => {
    const row = settings?.find((s) => s.key === key);
    if (!row) return "";
    try {
      return JSON.parse(row.value as unknown as string);
    } catch {
      return row.value as unknown as string;
    }
  };

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Site Settings</h1>
        <p className="mt-1 text-sm text-navy-400">
          Founder profile, qualifications and contact details shown across the site.
        </p>
      </div>

      {/* Founder profile */}
      <section className="rounded-xl border border-grey-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-navy-800">Founder Profile</h2>
        <form action={updateFounderProfile} className="mt-4 grid gap-4 sm:grid-cols-2" encType="multipart/form-data">
          <div className="sm:col-span-2 flex items-center gap-4">
            {founder?.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={founder.photo_url} alt="Current founder photo" className="h-16 w-16 rounded-full object-cover" />
            )}
            <div className="flex-1">
              <label className="label">Replace founder photo</label>
              <input name="photo" type="file" accept="image/*" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Name</label>
            <input name="name" defaultValue={founder?.name ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Credentials (short)</label>
            <input name="credentials_short" defaultValue={founder?.credentials_short ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Role</label>
            <input name="role" defaultValue={founder?.role ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Academic focus</label>
            <input name="academic_focus" defaultValue={founder?.academic_focus ?? ""} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Founder message — heading</label>
            <input name="message_heading" defaultValue={founder?.message_heading ?? ""} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Founder message — body (one paragraph per line)</label>
            <textarea
              name="message_body"
              rows={4}
              defaultValue={founder?.message_body?.join("\n") ?? ""}
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600">
              Save Founder Profile
            </button>
          </div>
        </form>
      </section>

      {/* Qualifications */}
      <section className="rounded-xl border border-grey-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-navy-800">Qualifications & Certifications</h2>
        <p className="mt-1 text-sm text-navy-400">
          Add issuer, year and verification link only once you have them — never invented.
        </p>
        <form action={addQualification} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="title" placeholder="Certification title" required className="input sm:col-span-2" />
          <input name="issuer" placeholder="Issuing organization (optional)" className="input" />
          <input name="year" placeholder="Year (optional)" className="input" />
          <input name="verification_url" placeholder="Verification URL (optional)" className="input sm:col-span-2" />
          <button type="submit" className="rounded-md bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 sm:col-span-2">
            Add Qualification
          </button>
        </form>

        <ul className="mt-5 space-y-2">
          {qualifications?.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-3 rounded-lg border border-grey-100 px-3 py-2 text-sm">
              <span className="text-navy-700">
                {q.title}
                {q.issuer && <span className="text-navy-400"> — {q.issuer}</span>}
                {q.year && <span className="text-navy-400"> ({q.year})</span>}
              </span>
              <form action={deleteQualification}>
                <input type="hidden" name="id" value={q.id} />
                <ConfirmSubmitButton confirmMessage="Remove this qualification?" className="text-xs font-semibold text-red-600 hover:underline">
                  Remove
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {/* About page content */}
      <section className="rounded-xl border border-grey-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-navy-800">About Page Content</h2>
        <p className="mt-1 text-sm text-navy-400">
          Purpose, vision and mission text shown on the homepage and About page.
        </p>
        <form action={updateAboutContent} className="mt-4 space-y-4">
          <div>
            <label className="label">Purpose</label>
            <textarea name="purpose" rows={3} defaultValue={about.purpose} className="input" />
          </div>
          <div>
            <label className="label">Vision</label>
            <textarea name="vision" rows={2} defaultValue={about.vision} className="input" />
          </div>
          <div>
            <label className="label">Mission</label>
            <textarea name="mission" rows={2} defaultValue={about.mission} className="input" />
          </div>
          <button type="submit" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600">
            Save About Content
          </button>
        </form>
      </section>

      {/* Contact & site info */}
      <section className="rounded-xl border border-grey-200 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-navy-800">Contact & Site Info</h2>
        <div className="mt-4 space-y-3">
          {[
            { key: "contact_phone", label: "Phone / WhatsApp number" },
            { key: "contact_email", label: "Email address" },
            { key: "contact_address", label: "Public address (leave blank to hide)" },
            { key: "operating_hours", label: "Operating hours" },
          ].map((field) => (
            <form key={field.key} action={updateSiteSetting} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="key" value={field.key} />
              <div className="flex-1">
                <label className="label">{field.label}</label>
                <input name="value" defaultValue={settingValue(field.key)} className="input" />
              </div>
              <button type="submit" className="rounded-md bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
