import type { PageRegistry } from '../build-routes';
import { OWNER_PAGES } from './owner';
import { MANAGER_PAGES } from './manager';
import { EMPLOYEE_PAGES } from './employee';
import { WORK_PAGES } from './work';

export * from './owner';
export * from './manager';
export * from './employee';
export * from './work';

/** Consolidated enterprise page registry covering Owner, Manager, Employee, Work, and Shared. */
export const ENTERPRISE_PAGES: PageRegistry = {
  ...OWNER_PAGES,
  ...WORK_PAGES,
  ...MANAGER_PAGES,
  ...EMPLOYEE_PAGES,
};
