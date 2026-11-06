import { BookOpen, BrainCircuit, Database, Lightbulb, PenTool, ShieldCheck, UsersRound } from 'lucide-react';

const DOMAIN_ICONS = [Database, UsersRound, PenTool, ShieldCheck, Lightbulb, BrainCircuit];

export function CourseDomainIcon({ domain, size = 20 }: { domain: number; size?: number }) {
  const Icon = DOMAIN_ICONS[domain - 1] ?? BookOpen;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

/** A consistent editorial cover for the TT02 course series; no external image asset is required. */
export function CourseArtwork({ domain, level, compact = false }: { domain: number; level: number; compact?: boolean }) {
  return <span className={`course-artwork course-artwork--domain-${domain} ${compact ? 'is-compact' : ''}`} data-level={level} aria-hidden="true">
    <span className="course-artwork-orbit course-artwork-orbit-one" />
    <span className="course-artwork-orbit course-artwork-orbit-two" />
    <span className="course-artwork-symbol"><CourseDomainIcon domain={domain} size={compact ? 30 : 39} /></span>
    <span className="course-artwork-learning"><BookOpen size={17} /><i /><i /><i /></span>
    <span className="course-artwork-steps"><i className={level >= 1 ? 'is-active' : ''} /><i className={level >= 2 ? 'is-active' : ''} /><i className={level >= 3 ? 'is-active' : ''} /></span>
  </span>;
}
