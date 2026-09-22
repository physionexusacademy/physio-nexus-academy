import type { Metadata } from "next";
import { CertificateVerificationForm } from "./CertificateVerificationForm";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description:
    "Verify a Physio Nexus Academy certificate using the exact Certificate ID printed on the credential.",
};

export default function VerifyCertificatePage() {
  return (
    <div className="bg-grey-50 py-12 sm:py-16">
      <div className="container-content">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
            Credential Verification
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold text-navy-800 sm:text-4xl">
            Verify a PNA Certificate
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-navy-500 sm:text-base">
            Enter the exact Certificate ID shown on the certificate. No participant directory or certificate list is publicly available.
          </p>
        </div>

        <div className="mt-8">
          <CertificateVerificationForm />
        </div>
      </div>
    </div>
  );
}
