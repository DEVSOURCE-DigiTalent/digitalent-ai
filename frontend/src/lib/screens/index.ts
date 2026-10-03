import { findEnterpriseScreen } from './enterprise';
import { findPlatformScreen } from './platform';
import { WORKSPACES, type Workspace } from '../roles';
import type { ScreenDef } from './types';

export * from './types';
export * from './enterprise';
export * from './platform';

/**
 * Unified screen resolver across Enterprise and Platform portals.
 * Prioritizes the active workspace and screen prefix patterns.
 */
export function findScreen(id: string, workspace?: Workspace | string): ScreenDef | undefined {
  if (workspace === WORKSPACES.PLATFORM || id.startsWith('PA-') || id.startsWith('PLT-')) {
    return findPlatformScreen(id) ?? findEnterpriseScreen(id);
  }
  return findEnterpriseScreen(id) ?? findPlatformScreen(id);
}
