import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type CreateUserRequest, type UpdateUserRequest } from '../services/user.service';
import type { PaginationRequest } from '../types/api';

/**
 * Fetch paginated user list.
 */
export function useUsers(params: PaginationRequest) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getList(params).then((r) => r.data.data!),
  });
}

/**
 * Fetch a single user by ID.
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

/**
 * Create a new user. Invalidates user list on success.
 */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

/**
 * Update an existing user. Invalidates both list and detail cache.
 */
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.update(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}
