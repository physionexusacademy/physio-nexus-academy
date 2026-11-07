import {
  Activity, Archive, BadgeCheck, BookMarked, BookOpen, BrainCircuit, CalendarDays, ClipboardList, Eye,
  FlaskConical, GraduationCap, Hand, HeartPulse, Home, Info, Laugh, Layers, LibraryBig, Mail, MapPin,
  MessageCircleQuestion, Microscope, Presentation, Sparkles, Star, Stethoscope, Trophy, UserRound, Users,
  Bone, Ruler, Target, type LucideIcon,
} from "lucide-react";
import type { AcademyIcon as IconKey } from "@/lib/academy-map";

const icons: Record<IconKey, LucideIcon> = {
  teacher: GraduationCap,
  library: LibraryBig,
  hand: Hand,
  injury: Bone,
  plan: ClipboardList,
  tests: Target,
  atlas: Eye,
  book: BookOpen,
  trophy: Trophy,
  arena: BrainCircuit,
  cases: Microscope,
  cards: Layers,
  registry: BookMarked,
  laugh: Laugh,
  care: HeartPulse,
  calendar: CalendarDays,
  home: Home,
  symptoms: Stethoscope,
  calculator: Activity,
  pin: MapPin,
  workshop: Presentation,
  archive: Archive,
  research: FlaskConical,
  people: Users,
  founder: UserRound,
  info: Info,
  certificate: BadgeCheck,
  star: Star,
  faq: MessageCircleQuestion,
  contact: Mail,
  lesson: Sparkles,
  skills: Ruler,
};

export function AcademyIcon({ name, className }: { name: IconKey; className?: string }) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
