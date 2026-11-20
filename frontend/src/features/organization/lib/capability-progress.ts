import type { CapabilityProgress, CapabilityProgressEmployee } from '@/services/intelligence.service';

/** People by how much they lack: met (0 missing level), small (1–2), large (3 or more), none (no survey result). */
export interface PeopleBuckets { met: number; small: number; large: number; none: number }

export interface ScopeDomain { number: number; name: string; required: number; atSurvey: number; now: number; compared: number; belowNow: number }

/** One scope (the company or one position) of "Khoảng trống năng lực", computed from the progress payload. */
export interface ScopeView {
  employees: number;
  assessed: number;
  /** Share (0–100) of employee × domain pairs at or above the required level; null without any survey result. */
  metAtSurvey: number | null;
  metNow: number | null;
  gapsAtSurvey: number;
  gapsNow: number;
  people: { atSurvey: PeopleBuckets; now: PeopleBuckets };
  domains: ScopeDomain[];
  /** Most levels gained since the survey (only people who gained). */
  /** Largest gap now (only people still below). */
  needs: CapabilityProgressEmployee[];
}

const average = (values: number[]) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);
const share = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : null);

function buckets(gaps: number[], none: number): PeopleBuckets {
  return {
    met: gaps.filter((g) => g === 0).length,
    small: gaps.filter((g) => g > 0 && g < 3).length,
    large: gaps.filter((g) => g >= 3).length,
    none,
  };
}

/** Key of a position scope: its id, or `none` for the people without a position. */
export const positionKey = (positionId: string | null | undefined) => positionId ?? 'none';

export function scopeView(data: CapabilityProgress, position?: string, highlights = 4): ScopeView {
  const people = position ? data.people.filter((p) => positionKey(p.positionId) === position) : data.people;
  const assessed = people.filter((p) => p.assessed);
  const pairs = assessed.flatMap((p) => p.domains.filter((d) => d.atSurvey != null && d.now != null));
  const none = people.length - assessed.length;

  const domains = data.domains
    .map((domain) => {
      const rows = pairs.filter((d) => d.categoryId === domain.categoryId);
      return {
        number: domain.number,
        name: domain.name,
        required: average(rows.map((d) => d.required)),
        atSurvey: average(rows.map((d) => d.atSurvey!)),
        now: average(rows.map((d) => d.now!)),
        compared: rows.length,
        belowNow: rows.filter((d) => d.now! < d.required).length,
      };
    })
    .filter((domain) => domain.compared > 0)
    .sort((a, b) => a.number - b.number);

  return {
    employees: people.length,
    assessed: assessed.length,
    metAtSurvey: share(pairs.filter((d) => d.atSurvey! >= d.required).length, pairs.length),
    metNow: share(pairs.filter((d) => d.now! >= d.required).length, pairs.length),
    gapsAtSurvey: assessed.reduce((sum, p) => sum + p.gapsAtSurvey, 0),
    gapsNow: assessed.reduce((sum, p) => sum + p.gapsNow, 0),
    people: {
      atSurvey: buckets(assessed.map((p) => p.gapsAtSurvey), none),
      now: buckets(assessed.map((p) => p.gapsNow), none),
    },
    domains,
    needs: assessed.filter((p) => p.gapsNow > 0)
      .sort((a, b) => b.gapsNow - a.gapsNow || a.name.localeCompare(b.name, 'vi'))
      .slice(0, highlights),
  };
}
