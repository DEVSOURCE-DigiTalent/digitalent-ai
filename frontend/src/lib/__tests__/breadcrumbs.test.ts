import { describe, it, expect } from 'vitest';
import { buildBreadcrumbs } from '../breadcrumbs';
import { ENTERPRISE_SCREENS } from '../screens/enterprise';
import { OWNER_SIDEBAR } from '../sidebars/owner';

describe('buildBreadcrumbs', () => {
  it('returns empty array for unknown path', () => {
    expect(buildBreadcrumbs('/unknown/path', ENTERPRISE_SCREENS, OWNER_SIDEBAR)).toEqual([]);
  });

  it('returns just the screen title for a top-level item (Tổng quan)', () => {
    const crumbs = buildBreadcrumbs('/enterprise/dashboard', ENTERPRISE_SCREENS, OWNER_SIDEBAR);
    expect(crumbs.length).toBeGreaterThanOrEqual(1);
    expect(crumbs[crumbs.length - 1].label).toBe('Tổng quan tổ chức');
  });

  it('returns the screen title for Thành viên (flat sidebar, no group)', () => {
    const crumbs = buildBreadcrumbs('/enterprise/members', ENTERPRISE_SCREENS, OWNER_SIDEBAR);
    expect(crumbs.length).toBe(1);
    expect(crumbs[0].label).toBe('Thành viên');
    expect(crumbs[0].href).toBe('/enterprise/members');
  });

  it('matches dynamic route /enterprise/members/:id', () => {
    const crumbs = buildBreadcrumbs('/enterprise/members/abc123', ENTERPRISE_SCREENS, OWNER_SIDEBAR);
    expect(crumbs.length).toBeGreaterThanOrEqual(1);
    const lastCrumb = crumbs[crumbs.length - 1];
    expect(lastCrumb.label).toBeTruthy();
  });

  it('returns screen title for Khoảng trống năng lực (flat sidebar)', () => {
    const crumbs = buildBreadcrumbs('/enterprise/skill-gap', ENTERPRISE_SCREENS, OWNER_SIDEBAR);
    expect(crumbs.length).toBe(1);
    expect(crumbs[0].label).toBe('Khoảng trống năng lực');
  });

  it('returns correct breadcrumbs for departments path', () => {
    const crumbs = buildBreadcrumbs('/enterprise/departments', ENTERPRISE_SCREENS, OWNER_SIDEBAR);
    expect(crumbs[crumbs.length - 1].label).toBe('Phòng ban');
  });

  it('returns correct breadcrumbs for positions path', () => {
    const crumbs = buildBreadcrumbs('/enterprise/positions', ENTERPRISE_SCREENS, OWNER_SIDEBAR);
    const lastLabel = crumbs[crumbs.length - 1].label;
    expect(lastLabel).toContain('Vị trí');
  });
});
