import type { SessionUser } from '../../../types/session';
import { HttpError, errorBody, forbidden, okBody } from './http';
import { getOrgData, updateOrgData } from './org-store';
import { lookupSession } from './session';
import type { OrgData } from './types';

/**
 * A small REST router for the mock server. Handlers register with `route()`, receive the parsed request and
 * return the `data` of the ApiResponse (or throw an HttpError). Permissions are checked against the session
 * of the caller, so a screen that shows a button the role does not own gets the same 403 the backend would send.
 */

export interface RequestContext {
  params: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, unknown>;
  session: SessionUser;
  /** The caller's organization data. Throws 403 when the caller belongs to no organization. */
  org: () => OrgData;
  /** Changes the caller's organization data and persists it. */
  update: <T>(change: (data: OrgData) => T) => T;
}

type Handler = (context: RequestContext) => unknown | Promise<unknown>;

interface RouteOptions {
  /** Permission key the caller must hold. */
  permission?: string;
  /** The caller must hold one of these roles (for areas with no permission key, such as billing). */
  roles?: string[];
  /** Success message of the ApiResponse. */
  message?: string;
  /** Status of a successful answer (201 for creations). */
  status?: number;
}

interface RouteDefinition {
  method: string;
  segments: string[];
  handler: Handler;
  options: RouteOptions;
}

const routes: RouteDefinition[] = [];

const split = (path: string) => path.split('/').filter(Boolean);

export function route(method: 'GET' | 'POST' | 'PUT' | 'DELETE', pattern: string, handler: Handler, options: RouteOptions = {}): void {
  routes.push({ method, segments: split(pattern), handler, options });
}

function match(method: string, path: string): { definition: RouteDefinition; params: Record<string, string> } | undefined {
  const segments = split(path);
  for (const definition of routes) {
    if (definition.method !== method || definition.segments.length !== segments.length) continue;
    const params: Record<string, string> = {};
    const fits = definition.segments.every((expected, index) => {
      if (expected.startsWith(':')) {
        params[expected.slice(1)] = decodeURIComponent(segments[index]);
        return true;
      }
      return expected === segments[index];
    });
    if (fits) return { definition, params };
  }
  return undefined;
}

export interface MockRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  body: Record<string, unknown>;
  /** User id taken from the access token, if any. */
  userId: string | undefined;
}

export interface MockResponse {
  status: number;
  body: unknown;
}

export async function dispatch(request: MockRequest): Promise<MockResponse> {
  try {
    const found = match(request.method, request.path);
    if (!found) throw new HttpError(404, `Không có API ${request.method} /${split(request.path).join('/')}.`);

    const lookup = lookupSession(request.userId);
    if ('error' in lookup) throw new HttpError(401, 'Phiên đăng nhập không hợp lệ.');
    const { session } = lookup;
    const { options } = found.definition;
    const isPlatform = session.roles.includes('PLATFORM_ADMIN');
    if (options.permission && !session.permissions.includes(options.permission) && !isPlatform) throw forbidden();
    if (options.roles && !options.roles.some((role) => session.roles.includes(role)) && !isPlatform) throw forbidden();

    const organizationId = session.organization?.id;
    const context: RequestContext = {
      params: found.params,
      query: request.query,
      body: request.body,
      session,
      org: () => {
        if (!organizationId) throw forbidden('Tài khoản này không thuộc tổ chức nào.');
        return getOrgData(organizationId);
      },
      update: (change) => {
        if (!organizationId) throw forbidden('Tài khoản này không thuộc tổ chức nào.');
        return updateOrgData(organizationId, change);
      },
    };

    const data = await found.definition.handler(context);
    return { status: options.status ?? 200, body: okBody(data ?? null, options.message) };
  } catch (error) {
    if (error instanceof HttpError) return { status: error.status, body: errorBody(error) };
    throw error;
  }
}
