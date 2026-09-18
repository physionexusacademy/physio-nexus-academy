import { siteConfig } from "@/lib/site-config";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-content section-padding max-w-2xl">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {siteConfig.legalNotice}
      </div>
      <div className="prose prose-navy mt-8 max-w-none text-navy-600 [&>h2]:mt-6 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-navy-800 [&>p]:mt-3">
        {children}
      </div>
    </div>
  );
}
