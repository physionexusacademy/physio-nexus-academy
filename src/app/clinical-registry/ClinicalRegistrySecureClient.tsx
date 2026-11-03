"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { BookOpen, FileDown, LockKeyhole, LogOut, Plus, Printer, ShieldCheck, UserPlus, Users } from "lucide-react";
import { CLINICAL_REGISTRY_CONSENT_VERSION, getClinicalRegistryClient } from "@/lib/clinical-registry/client";
import { ClinicalDocumentationForms } from "./ClinicalDocumentationForms";

// PHASE1_PLACEHOLDER - content will be replaced in follow-up if this is too large
export function ClinicalRegistrySecureClient() {
  return (
    <main className="min-h-screen bg-[#f5f8fb] p-8 text-slate-800">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Physio Nexus Academy</p>
        <h1 className="mt-1 text-xl font-bold text-[#173653]">Clinical Registry</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Phase 1 structured forms are on this branch. Full client restore is in progress on
          <code className="mx-1 rounded bg-slate-100 px-1">fix/registry-phase1-audit</code>.
          Production branch is untouched.
        </p>
      </div>
    </main>
  );
}
