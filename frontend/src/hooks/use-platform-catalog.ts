import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformCatalogService, type CatalogCourseDetail } from '@/services/platform-catalog.service';
import { PLATFORM_ADMIN_KEY } from './use-platform-admin';
import { ASSIGNMENTS_KEY } from './use-assignments';
import { PULSE_KEYS } from './use-pulse';
import { learningContentQueryOptions } from '@/lib/learning-content-query';

/**
 * React Query hooks of Platform Admin v2: frameworks, catalog versions and the course builder. Keys live under the
 * console key, so any console mutation also refreshes them.
 */
const CATALOG = [...PLATFORM_ADMIN_KEY, 'catalog'] as const;

export const catalogKeys = {
  frameworks: [...CATALOG, 'frameworks'] as const,
  framework: (id: string | undefined) => [...CATALOG, 'framework', id] as const,
  versions: [...CATALOG, 'versions'] as const,
  version: (versionNo: number | undefined) => [...CATALOG, 'version', versionNo] as const,
  publishCheck: (versionNo: number | undefined) => [...CATALOG, 'publish-check', versionNo] as const,
  course: (versionNo: number | undefined, courseId: string | undefined) => [...CATALOG, 'course', versionNo, courseId] as const,
};

/**
 * After any catalog change: lists, counts and the overview are refreshed (the open course is set directly). A version
 * that was just published has no publish check any more (the API answers 409), so that query is left alone.
 */
function useRefreshCatalog() {
  const queryClient = useQueryClient();
  return (publishedVersionNo?: number) =>
    queryClient.invalidateQueries({
      queryKey: PLATFORM_ADMIN_KEY,
      predicate: (q) => q.queryKey[2] !== 'course' && !(q.queryKey[2] === 'publish-check' && q.queryKey[3] === publishedVersionNo),
    });
}

export const useFrameworks = () => useQuery({ queryKey: catalogKeys.frameworks, queryFn: platformCatalogService.getFrameworks });

export const useFramework = (id: string | undefined) =>
  useQuery({ queryKey: catalogKeys.framework(id), queryFn: () => platformCatalogService.getFramework(id!), enabled: Boolean(id) });

export function useSaveFrameworkDraft(id: string) {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: (body: Parameters<typeof platformCatalogService.saveFrameworkDraft>[1]) => platformCatalogService.saveFrameworkDraft(id, body),
    onSuccess: () => refresh(),
  });
}

export function usePublishFramework(id: string) {
  const refresh = useRefreshCatalog();
  return useMutation({ mutationFn: (note?: string) => platformCatalogService.publishFramework(id, note), onSuccess: () => refresh() });
}

export function useUpdateDomain(id: string) {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: ({ domainId, ...body }: { domainId: string; name: string; description?: string }) =>
      platformCatalogService.updateDomain(id, domainId, body),
    onSuccess: () => refresh(),
  });
}

export function useArchiveDomain(id: string) {
  const refresh = useRefreshCatalog();
  return useMutation({ mutationFn: (domainId: string) => platformCatalogService.archiveDomain(id, domainId), onSuccess: () => refresh() });
}

export function useAddFrameworkDomain(id: string) {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) => platformCatalogService.addFrameworkDomain(id, body),
    onSuccess: () => refresh(),
  });
}

export const useCatalogVersions = () => useQuery({ queryKey: catalogKeys.versions, queryFn: platformCatalogService.getVersions });

export const useCatalogVersion = (versionNo: number | undefined) =>
  useQuery({
    queryKey: catalogKeys.version(versionNo),
    queryFn: () => platformCatalogService.getVersion(versionNo!),
    enabled: versionNo != null,
  });

export const usePublishCheck = (versionNo: number | undefined, enabled: boolean) =>
  useQuery({
    queryKey: catalogKeys.publishCheck(versionNo),
    queryFn: () => platformCatalogService.getPublishCheck(versionNo!),
    enabled: enabled && versionNo != null,
  });

export function useCreateDraft() {
  const refresh = useRefreshCatalog();
  return useMutation({ mutationFn: () => platformCatalogService.createDraft(), onSuccess: () => refresh() });
}

export function usePublishVersion(versionNo: number) {
  const refresh = useRefreshCatalog();
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (note?: string) => platformCatalogService.publishVersion(versionNo, note), onSuccess: async () => {
    await Promise.all([
      refresh(versionNo),
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_KEY }),
      queryClient.invalidateQueries({ queryKey: PULSE_KEYS.all }),
      queryClient.invalidateQueries({ queryKey: catalogKeys.course(versionNo, undefined).slice(0, 4) }),
    ]);
  } });
}

export function useUpdatePrices(versionNo: number) {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: (items: Parameters<typeof platformCatalogService.updatePrices>[1]) => platformCatalogService.updatePrices(versionNo, items),
    onSuccess: () => refresh(),
  });
}

export function useCreateCatalogCourse(versionNo: number) {
  const queryClient = useQueryClient();
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: (body: { code: string; title: string; domainId: string; level: number }) => platformCatalogService.createCourse(versionNo, body),
    onSuccess: (detail) => {
      queryClient.setQueryData(catalogKeys.course(versionNo, detail.courseId), detail);
      return refresh();
    },
  });
}

export function useRemoveCatalogCourse(versionNo: number) {
  const refresh = useRefreshCatalog();
  return useMutation({ mutationFn: (courseId: string) => platformCatalogService.removeCourse(versionNo, courseId), onSuccess: () => refresh() });
}

export const useCatalogCourse = (versionNo: number | undefined, courseId: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.course(versionNo, courseId),
    ...learningContentQueryOptions,
    queryFn: () => platformCatalogService.getCourse(versionNo!, courseId!),
    enabled: versionNo != null && Boolean(courseId),
  });

/**
 * One mutation for every course-builder edit: the edit returns the whole course, which replaces the cached course,
 * then version lists and counts are refreshed.
 */
export function useCourseEdit(versionNo: number, courseId: string) {
  const queryClient = useQueryClient();
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: (edit: (versionNo: number, courseId: string) => Promise<CatalogCourseDetail>) => edit(versionNo, courseId),
    onSuccess: (detail) => {
      queryClient.setQueryData(catalogKeys.course(versionNo, courseId), detail);
      return refresh();
    },
  });
}
