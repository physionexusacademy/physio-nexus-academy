"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let registryClient: SupabaseClient | null = null;

export function getClinicalRegistryClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_PUBLISHABLE_KEY;
  const legacyAnonKey =
    process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY;
  const apiKey = publishableKey || legacyAnonKey;

  // Deliberately do not fall back to the PNA website Supabase credentials.
  if (!url || !apiKey) return null;

  if (!registryClient) {
    registryClient = createBrowserClient(url, apiKey, {
      // The Registry Data API exposes clinical_api only; defaulting to public
      // would make every Registry RPC fail with a missing-function error.
      db: { schema: "clinical_api" },
    });
  }
  return registryClient;
}

export const CLINICAL_REGISTRY_CONSENT_VERSION =
  process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION ?? "";
