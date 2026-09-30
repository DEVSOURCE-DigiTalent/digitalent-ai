import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import { matchRoutes } from 'react-router-dom';
import { enterpriseRoutes } from '@/app/routes/enterprise.routes';
import { RequirePermission } from '@/components/guards/RequirePermission';
import { sidebarGroups } from '../sidebar-config';

const enterpriseItems = sidebarGroups
  .flatMap((group) => group.items)
  .filter((item) => item.path.startsWith('/enterprise'));

function routeElementFor(path: string) {
  return matchRoutes(enterpriseRoutes, path)?.at(-1)?.route.element;
}

describe('sidebar-config', () => {
  it.each(enterpriseItems.map((item) => [item.label, item] as const))(
    '"%s" points to a registered enterprise route',
    (_label, item) => {
      expect(routeElementFor(item.path)).toBeDefined();
    },
  );

  it.each(enterpriseItems.map((item) => [item.label, item] as const))(
    '"%s" declares the permission its route is guarded with',
    (_label, item) => {
      const element = routeElementFor(item.path);
      const routePermission =
        isValidElement<{ permission: string }>(element) && element.type === RequirePermission
          ? element.props.permission
          : undefined;

      expect(item.permission).toBe(routePermission);
    },
  );
});
