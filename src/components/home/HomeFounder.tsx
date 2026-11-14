import Image from "next/image";
import { ArrowRight, BadgeCheck, GraduationCap, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import "./home-founder.css";

/**
 * The Founder section: the one place on the homepage with the founder's name and portrait (the top of the page shows the PNA Teacher,
 * the AI teaching assistant). Static; the portrait is the approved one used on the Founder page.
 */
export function HomeFounder() {
  const founder = siteConfig.founder;
  return (
    <section id="founder" className="hfd" aria-labelledby="hfd-title" data-pna-home-founder>
      <div className="container-content">
        <div className="hfd-card">
          <div className="hfd-photo">
            <Image
              src={founder.photo}
              alt={`${founder.name}, founder of Physio Nexus Academy`}
              width={960}
              height={1200}
              sizes="(max-width: 760px) 62vw, 340px"
              className="hfd-img"
            />
          </div>
          <div className="hfd-copy">
            <p className="nx-kicker nx-kicker-light"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Meet the founder</p>
            <h2 id="hfd-title" className="hfd-title">{founder.name}</h2>
            <p className="hfd-role">{founder.role}</p>
            <p className="hfd-cred"><GraduationCap className="h-4 w-4" aria-hidden="true" /> {founder.credentialsShort}</p>
            <p className="hfd-text">
              A physiotherapist and clinical educator who leads practical physiotherapy education, hands-on clinical workshops and
              evidence-informed learning for students and professionals in Pakistan.
            </p>
            <blockquote className="hfd-quote">“{founder.message.body[0]}”</blockquote>
            <div className="hfd-actions">
              <a href="/founder" className="nx-btn nx-btn-primary">
                Read the full profile <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="/contact" className="nx-btn nx-btn-light">
                <Mail className="h-4 w-4" aria-hidden="true" /> Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
