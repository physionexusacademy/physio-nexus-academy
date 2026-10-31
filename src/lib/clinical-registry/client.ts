"use client";

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";

let registryClient: SupabaseClient | null = null;

export function getClinicalRegistryClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_SUPABASE_ANON_KEY;

  // Deliberately do not fall back to the PNA website Supabase credentials.
  if (!url || !anonKey) return null;

  if (!registryClient) {
    registryClient = createBrowserClient(url, anonKey);
  }
  return registryClient;
}

export const CLINICAL_REGISTRY_CONSENT_VERSION =
  process.env.NEXT_PUBLIC_CLINICAL_REGISTRY_CONSENT_VERSION ?? "";
