import { lazy, type ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- React.lazy accepts components with any props
type AnyComponent = ComponentType<any>;

const loaders: (() => Promise<unknown>)[] = [];

/**
 * A page or layout loaded on first visit (its own chunk) instead of at app start, so opening one screen does not
 * download every portal. `load` is the module import, `name` the exported component (its props are kept). Portal pages
 * render inside a Suspense boundary (build-routes.tsx); layouts and full-page screens use the root one (providers.tsx).
 */
export function lazyPage<M extends Record<K, AnyComponent>, K extends keyof M & string>(load: () => Promise<M>, name: K) {
  loaders.push(load);
  return lazy<M[K]>(() => load().then((module) => ({ default: module[name] })));
}

/** Loads every lazy page module up front — for tests that render the whole router (the first visit is then fast). */
export async function preloadLazyPages(): Promise<void> {
  await Promise.all(loaders.map((load) => load()));
}
