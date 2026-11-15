import { CalendarCheck, House, MessageCircle, PersonStanding, Stethoscope } from "lucide-react";
import { whatsappLink } from "@/lib/site-config";
import { Ur } from "@/components/Ur";
import "./home-features.css";

/**
 * "Need physiotherapy?" — one calm strip right under the hero so a patient never has to read
 * past the learning content to find care. Server-rendered, five big buttons.
 */
const actions = [
  { href: "/appointment", label: ["Book an appointment", "Appointment book karein"], note: ["Clinic or online", "Clinic ya online"], icon: CalendarCheck },
  { href: "/home-visit", label: ["Physio at home", "Ghar par physio"], note: ["A physio visits you", "Physio aap ke ghar aata hai"], icon: House },
  { href: "/symptom-checker", label: ["Check my symptoms", "Apne symptoms check karein"], note: ["Free, 2 minutes", "Free, 2 minute"], icon: Stethoscope },
  { href: "/rehabverse", label: ["Guided 3D home rehab", "3D guided ghar ki rehab"], note: ["RehabVerse", "RehabVerse"], icon: PersonStanding },
  { href: whatsappLink("Assalam-o-alaikum, I need physiotherapy help."), label: ["Ask on WhatsApp", "WhatsApp par poochein"], note: ["Quick reply", "Jaldi jawab"], icon: MessageCircle, external: true },
];

export function HomeNeedHelp() {
  return (
    <section className="hn" aria-labelledby="hn-title" data-pna-home-directory>
      <div className="container-content hn-inner">
        <div className="hn-copy">
          <h2 id="hn-title"><Ur en="Need physiotherapy?" ur="Physiotherapy chahiye?" /></h2>
          <p><Ur en="We can help — at the clinic, at home or online." ur="Hum madad kar sakte hain — clinic mein, ghar par ya online." /></p>
        </div>
        <ul className="hn-list">
          {actions.map(({ href, label, note, icon: Icon, external }) => (
            <li key={label[0]}>
              <a href={href} className="hn-btn" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <span className="hn-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="min-w-0"><strong><Ur en={label[0]} ur={label[1]} /></strong><small><Ur en={note[0]} ur={note[1]} /></small></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
