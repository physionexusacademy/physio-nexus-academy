"use client";

import dynamic from "next/dynamic";

/**
 * The secure therapist/reviewer workspace signs in with Supabase Auth and only
 * works in the browser. Loading it client-side keeps the workspace and its
 * Supabase client out of the Cloudflare Worker bundle.
 */
export const ClinicalRegistrySecureClient = dynamic(
  () => import("./ClinicalRegistrySecureClient").then((module) => module.ClinicalRegistrySecureClient),
  {
    ssr: false,
    loading: () => (
      <div className="container-content py-12" role="status" aria-live="polite">
        <div className="nx-loader-card">
          <span className="nx-loader-orb" aria-hidden="true" />
          <p className="text-sm font-bold text-teal-800">Opening the secure clinical workspace…</p>
        </div>
      </div>
    ),
  },
);
