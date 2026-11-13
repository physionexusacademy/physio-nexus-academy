import "@/app/rehabverse/rehabverse.css";

/** RehabVerse clinician area: same look as the patient side, inside the admin shell. */
export default function RehabVerseAdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="rv-admin" style={{ ["--rv-line" as string]: "rgba(10,31,61,0.1)" }}>{children}</div>;
}
