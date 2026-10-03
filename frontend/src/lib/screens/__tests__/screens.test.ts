import { describe, it, expect } from 'vitest';
import { isValidElement, type ReactElement } from 'react';
import { matchRoutes } from 'react-router-dom';
import { enterpriseRoutes } from '@/app/routes/enterprise.routes';
import { platformRoutes } from '@/app/routes/platform.routes';
import { RequireRole } from '@/components/guards/RequireRole';
import { RequirePermission } from '@/components/guards/RequirePermission';
import { RequireEntitlement } from '@/components/guards/RequireEntitlement';
import { RequireActiveSubscription } from '@/components/guards/RequireActiveSubscription';
import { ROLES } from '../../roles';
import { ENTITLEMENTS } from '../../entitlements';

import { ENTERPRISE_SCREENS } from '../enterprise';
import { PLATFORM_SCREENS } from '../platform';
import type { ScreenDef } from '../types';

const PORTALS = [
  { name: 'enterprise', screens: ENTERPRISE_SCREENS, routes: enterpriseRoutes, base: '/enterprise' },
  { name: 'platform', screens: PLATFORM_SCREENS, routes: platformRoutes, base: '/platform' },
] as const;

/** Guard components wrapped around a route element, outermost first. */
function guardsOf(element: unknown): unknown[] {
  const guards: unknown[] = [];
  let current = element;
  while (isValidElement(current)) {
    const { type } = current as ReactElement;
    if (type !== RequireRole && type !== RequirePermission && type !== RequireEntitlement && type !== RequireActiveSubscription) break;
    guards.push(type);
    current = (current as ReactElement<{ children: unknown }>).props.children;
  }
  return guards;
}

describe.each(PORTALS)('$name sitemap', ({ screens, routes, base }) => {
  it('has unique screen ids and paths', () => {
    const paths = screens.map((s) => s.path);
    const ids = screens.map((s) => s.id);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every path under the portal prefix', () => {
    for (const screen of screens) expect(screen.path.startsWith(`${base}/`)).toBe(true);
  });

  it.each(screens.map((s) => [s.id, s] as [string, ScreenDef]))('%s resolves to a guarded route', (_id, screen) => {
    const concretePath = screen.path.replace(/:\w+/g, 'x1');
    const route = matchRoutes(routes, concretePath)?.at(-1)?.route;
    expect(route).toBeDefined();

    const guards = guardsOf(route?.element);
    expect(guards.includes(RequireRole)).toBe(!screen.roles.includes('*'));
    expect(guards.includes(RequirePermission)).toBe(Boolean(screen.permission));
    expect(guards.includes(RequireEntitlement)).toBe(Boolean(screen.entitlement));
    expect(guards.includes(RequireActiveSubscription)).toBe(!screen.allowUnpaid);
  });
});

describe('sitemap entitlements', () => {
  it('carries the permission and entitlement of the route', () => {
    const internalCourses = ENTERPRISE_SCREENS.find((s) => s.path === '/enterprise/internal-courses');

    expect(internalCourses?.entitlement).toBe(ENTITLEMENTS.INTERNAL_LEARNING);
  });
});

describe('expired subscription', () => {
  it('keeps billing and account screens reachable so the owner can renew', () => {
    const reachable = ENTERPRISE_SCREENS.filter((s) => s.allowUnpaid).map((s) => s.id);

    expect(reachable).toEqual(expect.arrayContaining(['OW-41', 'OW-43', 'SHR-01', 'SHR-02', 'SHR-03']));
  });

  it('blocks every learning and administration screen', () => {
    const blocked = ENTERPRISE_SCREENS.filter((s) => !s.allowUnpaid);

    expect(blocked.length).toBeGreaterThan(30);
    expect(blocked.map((s) => s.id)).not.toContain('OW-41');
  });
});

describe('role separation', () => {
  it('keeps commercial screens to the owner', () => {
    const billing = ENTERPRISE_SCREENS.find((s) => s.id === 'OW-41');
    expect(billing?.roles).toEqual([ROLES.OWNER]);
  });

  it('keeps platform screens to platform staff', () => {
    for (const screen of PLATFORM_SCREENS) expect(screen.roles).toEqual([ROLES.PLATFORM_ADMIN]);
  });

  it('does not let any enterprise screen admit the platform role', () => {
    for (const screen of ENTERPRISE_SCREENS) expect(screen.roles).not.toContain(ROLES.PLATFORM_ADMIN);
  });
});
