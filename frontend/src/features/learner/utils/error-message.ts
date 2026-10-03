/** Message of a failed request: the server's when there is one. */
export function errorMessage(error: unknown): string | undefined {
  const response = (error as { response?: { data?: { message?: string } } } | null)?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : undefined);
}
