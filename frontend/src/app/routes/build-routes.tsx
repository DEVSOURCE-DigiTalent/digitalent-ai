import { Suspense, type ComponentType, type ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequireActiveSubscription } from '../../components/guards/RequireActiveSubscription';
import { RequireEntitlement } from '../../components/guards/RequireEntitlement';
import { RequirePermission } from '../../components/guards/RequirePermission';
import { RequireRole } from '../../components/guards/RequireRole';
import { PlaceholderPage } from '../../features/system/pages/PlaceholderPage';
import type { ScreenDef } from '../../lib/screens/types';

/** Shown while a page's code chunk loads (pages are lazy, see lazy-page.ts); the portal shell stays on screen. */
export function RouteFallback() {
  return <div aria-busy="true" aria-label="Đang tải trang" style={{ minHeight: '40vh' }} />;
}

/** Real pages by screen ID. Screens without an entry render a placeholder until they are built. */
export type PageRegistry = Partial<Record<string, ComponentType>>;

function guard(screen: ScreenDef, page: ReactNode): ReactNode {
  let element = page;
  if (!screen.allowUnpaid) element = <RequireActiveSubscription>{element}</RequireActiveSubscription>;
  if (screen.entitlement) element = <RequireEntitlement entitlement={screen.entitlement}>{element}</RequireEntitlement>;
  if (screen.permission) element = <RequirePermission permission={screen.permission}>{element}</RequirePermission>;
  if (!screen.roles.includes('*')) element = <RequireRole roles={screen.roles}>{element}</RequireRole>;
  return element;
}

/** Route children (paths relative to `base`) for every screen, guarded as the sitemap declares. */
export function buildRoutes(screens: ScreenDef[], pages: PageRegistry, base: string): RouteObject[] {
  return screens.map((screen) => {
    const Page = pages[screen.id];
    const page = Page ? (
      <Suspense fallback={<RouteFallback />}>
        <Page />
      </Suspense>
    ) : (
      <PlaceholderPage screenId={screen.id} title={screen.title} priority={screen.priority} />
    );
    return { path: screen.path.slice(base.length + 1), element: guard(screen, page) };
  });
}
