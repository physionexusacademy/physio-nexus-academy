import { CalendarCheck, House, MessageCircle, PersonStanding, Stethoscope } from "lucide-react";
import { whatsappLink } from "@/lib/site-config";
import "./home-features.css";

/**
 * "Need physiotherapy?" — one calm strip right under the hero so a patient never has to read
 * past the learning content to find care. Server-rendered, five big buttons.
 */
const actions = [
  { href: "/appointment", label: "Book an appointment", note: "Clinic or online", icon: CalendarCheck },
  { href: "/home-visit", label: "Physio at home", note: "A physio visits you", icon: House },
  { href: "/symptom-checker", label: "Check my symptoms", note: "Free, 2 minutes", icon: Stethoscope },
  { href: "/rehabverse", label: "Guided 3D home rehab", note: "RehabVerse", icon: PersonStanding },
  { href: whatsappLink("Assalam-o-alaikum, I need physiotherapy help."), label: "Ask on WhatsApp", note: "Quick reply", icon: MessageCircle, external: true },
];

export function HomeNeedHelp() {
  return (
    <section className="hn" aria-labelledby="hn-title" data-pna-home-directory>
      <div className="container-content hn-inner">
        <div className="hn-copy">
          <h2 id="hn-title">Need physiotherapy?</h2>
          <p>We can help — at the clinic, at home or online.</p>
        </div>
        <ul className="hn-list">
          {actions.map(({ href, label, note, icon: Icon, external }) => (
            <li key={label}>
              <a href={href} className="hn-btn" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <span className="hn-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="min-w-0"><strong>{label}</strong><small>{note}</small></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
