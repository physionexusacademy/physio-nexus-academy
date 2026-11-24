import "@/app/rehabverse/rehabverse.css";

/** Members access: same look as the RehabVerse clinician area, inside the admin shell. */
export default function MembersAdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="rv-admin" style={{ ["--rv-line" as string]: "rgba(10,31,61,0.1)" }}>{children}</div>;
}
