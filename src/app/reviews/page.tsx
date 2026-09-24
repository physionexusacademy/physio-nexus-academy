import type { Metadata } from "next";
import { ExternalLink, Mail, ShieldCheck, Star } from "lucide-react";
import { ReviewForm } from "./ReviewForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Reviews & Feedback | Physio Nexus Academy",
  description:
    "Rate Physio Nexus Academy, send private feedback to the PNA team, or leave an honest Google review.",
  alternates: {
    canonical: "https://physionexusacademy.com/reviews",
  },
};

export default function ReviewsPage() {
  return (
    <>
      <section className="bg-navy-800 text-white">
        <div className="container-content section-padding text-center">
          <div className="mx-auto flex w-fit items-center gap-1" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-7 w-7 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Reviews &amp; Feedback</h1>
          <p className="mx-auto mt-4 max-w-2xl text-grey-200">
            Your feedback helps Physio Nexus Academy improve its workshops, learning resources and patient services.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-content grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Website feedback</p>
              <h2 className="mt-2 text-2xl font-bold text-navy-800">Rate your PNA experience</h2>
              <p className="mt-2 text-sm leading-6 text-navy-500">
                Choose 1–5 stars and optionally add a comment. Your submission is emailed to the PNA team and saved
                as a draft for review before it can appear publicly on the website.
              </p>
            </div>

            <ReviewForm googleReviewUrl={siteConfig.contact.googleReviewUrl} />
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-grey-200 bg-grey-50 p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-navy-800">Want your rating to count on Google?</h2>
              <p className="mt-2 text-sm leading-6 text-navy-500">
                Google ratings can only be submitted directly to Google. Website ratings do not automatically change
                the Google Business Profile score.
              </p>
              <a
                href={siteConfig.contact.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-navy-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Review PNA on Google <ExternalLink className="h-4 w-4" />
              </a>
              <p className="mt-3 text-xs leading-5 text-navy-400">
                The Google review option is available to everyone regardless of the star rating submitted on this
                website.
              </p>
            </div>

            <div className="rounded-2xl border border-grey-200 bg-white p-6">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
                <div>
                  <h3 className="font-semibold text-navy-800">Email notification</h3>
                  <p className="mt-1 text-sm leading-6 text-navy-500">
                    Every website review is sent to the PNA admin email so the team can respond and decide whether to
                    publish it as a testimonial.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-grey-200 bg-white p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
                <div>
                  <h3 className="font-semibold text-navy-800">No automatic publishing</h3>
                  <p className="mt-1 text-sm leading-6 text-navy-500">
                    Website submissions stay in draft until reviewed by an administrator, helping prevent spam and
                    fabricated public testimonials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
