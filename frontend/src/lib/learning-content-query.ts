// Content may be published from another role/tab. Override the application's five-minute, focus-disabled cache.
export const learningContentQueryOptions = {
  staleTime: 0,
  refetchOnWindowFocus: 'always' as const,
};
