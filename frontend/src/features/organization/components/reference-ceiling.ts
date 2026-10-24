import type { CeilingDomain } from '@/services/capability-ceiling.service';

const SAMPLE_CODES: Record<string, string> = {
  CEO: 'CEO',
  HR: 'HR',
  NHANSU: 'HR',
  MARKETING: 'MARKETING',
  SALES: 'SALES_CRM',
  SALESCRM: 'SALES_CRM',
  KINHDOANH: 'SALES_CRM',
  KETOAN: 'ACCOUNTANT',
  ACCOUNTANT: 'ACCOUNTANT',
};

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd')
    .replace(/[^a-z0-9]/gi, '').toUpperCase();
}

/** Chooses an initial sample in the UI only; this never creates a position-to-department link. */
export function suggestedSampleForDepartment(code: string, name: string): string {
  return SAMPLE_CODES[normalize(code)] ?? SAMPLE_CODES[normalize(name)] ?? '';
}

/** Draft from the Admin reference, capped by the organization's existing course limit. */
export function referenceLevelForDomain(domain: CeilingDomain, index: number, levels: number[]) {
  const matched = /^TT02_D([1-6])$/i.exec(domain.code);
  const domainNumber = matched ? Number(matched[1]) : index + 1;
  return levels[domainNumber - 1];
}

export function referenceCeilingDraft(domains: CeilingDomain[], levels: number[], organization: Record<string, number>) {
  let capped = false;
  const draft = Object.fromEntries(domains.map((domain, index) => {
    const sample = referenceLevelForDomain(domain, index, levels);
    const organizationLevel = organization[domain.categoryId] ?? 0;
    if (sample > organizationLevel) capped = true;
    return [domain.categoryId, Math.min(sample, organizationLevel)];
  }));
  return { draft, capped };
}
