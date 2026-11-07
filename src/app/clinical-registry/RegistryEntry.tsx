"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ClinicalRegistrySecureClient } from "./SecureClientLoader";

export function RegistryEntry({ publicLibrary }: { publicLibrary: ReactNode }) {
  const [authCallback, setAuthCallback] = useState(false);

  useEffect(() => {
    const current = new URL(window.location.href);
    const hash = current.hash.toLowerCase();
    const isCallback = current.searchParams.has("recovery")
      || current.searchParams.has("error_code")
      || current.searchParams.has("code")
      || current.searchParams.has("token_hash")
      || hash.includes("access_token=")
      || hash.includes("refresh_token=")
      || hash.includes("type=recovery")
      || hash.includes("error_description=");
    setAuthCallback(isCallback);
  }, []);

  return authCallback ? <ClinicalRegistrySecureClient /> : <>{publicLibrary}</>;
}
