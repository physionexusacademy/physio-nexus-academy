import { Accessibility, Activity, Brain, Dumbbell, Fingerprint, Footprints, Gauge, Hammer, HeartPulse, Map, Network, Ruler, Scale, Sparkles, Waypoints, Zap, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  mmt: Dumbbell,
  goniometer: Gauge,
  dermatomes: Map,
  myotomes: Zap,
  reflexes: Hammer,
  nerves: Waypoints,
  tone: Brain,
  length: Ruler,
  vitals: HeartPulse,
  posture: Accessibility,
  balance: Scale,
  measures: Activity,
  palpation: Fingerprint,
  gait: Footprints,
  network: Network,
};

export function SkillIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
