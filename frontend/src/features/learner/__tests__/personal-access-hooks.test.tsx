import type { ReactNode } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMarkSeen, usePersonalAccess, useSetLessonCompleted } from '@/hooks/use-personal-learning';
import { usePlanErrorHandler } from '@/hooks/use-plan-error-handler';
import apiClient from '@/services/api-client';
import { authService } from '@/services/auth.service';
import { mockAuthService } from '@/services/mock/mock-auth.service';
import { personalLearningService } from '@/services/personal-learning.service';
import { resetMockDb } from '@/services/mock/mock-store';
import { mockAdapter } from '@/services/mock/server/mock-adapter';
import { MOCK_EMAILS, signInAsMock, signOut } from '@/test/session';
import { planErrorOf } from '../utils/error-message';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

function planFailure(status: number, code: string, message = 'Câu thông báo của máy chủ.') {
  return { response: { status, data: { message, errors: [{ message: code }] } } };
}

describe('planErrorOf (spec §6)', () => {
  it('reads the machine code and the sentence of a 403 plan refusal', () => {
    expect(planErrorOf(planFailure(403, 'TRIAL_COURSE_LIMIT', 'Hết lượt.')))
      .toEqual({ code: 'TRIAL_COURSE_LIMIT', message: 'Hết lượt.' });
    for (const code of ['PLAN_REQUIRED', 'DIAGNOSTIC_LIMIT', 'REASSESSMENT_NOT_DUE', 'TARGET_CHANGE_LIMIT']) {
      expect(planErrorOf(planFailure(403, code))?.code).toBe(code);
    }
  });

  it('is null for any other failure', () => {
    expect(planErrorOf(planFailure(400, 'PLAN_REQUIRED'))).toBeNull();
    expect(planErrorOf(planFailure(403, 'SOMETHING_ELSE'))).toBeNull();
    expect(planErrorOf({ response: { status: 403, data: { message: 'x', errors: [] } } })).toBeNull();
    expect(planErrorOf(new Error('network'))).toBeNull();
    expect(planErrorOf(null)).toBeNull();
    expect(planErrorOf(undefined)).toBeNull();
  });
});

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  signOut();
  resetMockDb();
  vi.mocked(toast.error).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function wrapperWith(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const newClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('usePersonalAccess', () => {
  it('refetches after a lesson is completed, so the trial counters move at once', async () => {
    signInAsMock(MOCK_EMAILS.trial);
    const lessonId = (await personalLearningService.getCourse('crs-M6-F')).modules[0].lessons[0].id;
    const queryClient = newClient();
    const { result } = renderHook(
      () => ({ access: usePersonalAccess(), complete: useSetLessonCompleted() }),
      { wrapper: wrapperWith(queryClient) },
    );
    await waitFor(() => expect(result.current.access.data?.coursesLeft).toBe(1));

    // trial@ has two slots used; completing a first lesson of a new (not exempt) course takes the last one.
    await act(async () => {
      await result.current.complete.mutateAsync({ courseId: 'crs-M6-F', lessonId, completed: true });
    });

    await waitFor(() => expect(result.current.access.data?.coursesLeft).toBe(0));
    expect(result.current.access.data?.trialCourseIds).toContain('crs-M6-F');
  });

  it('is full for personal@ with an empty checklist', async () => {
    signInAsMock(MOCK_EMAILS.personal);
    const { result } = renderHook(() => usePersonalAccess(), { wrapper: wrapperWith(newClient()) });

    await waitFor(() => expect(result.current.data?.mode).toBe('full'));
    expect(result.current.data?.checklist).toEqual([]);
  });
});

describe('useMarkSeen', () => {
  it('updates the cached access at once and keeps the server time', async () => {
    signInAsMock(MOCK_EMAILS.trial);
    const queryClient = newClient();
    const { result } = renderHook(
      () => ({ access: usePersonalAccess(), mark: useMarkSeen() }),
      { wrapper: wrapperWith(queryClient) },
    );
    await waitFor(() => expect(result.current.access.data).toBeDefined());
    expect(result.current.access.data?.seen['checklist-hidden']).toBeUndefined();

    act(() => result.current.mark.mutate('checklist-hidden'));

    await waitFor(() => expect(result.current.access.data?.seen['checklist-hidden']).toBeDefined());
    await waitFor(() => expect(result.current.mark.isSuccess).toBe(true));
    const first = result.current.access.data!.seen['checklist-hidden'];
    act(() => result.current.mark.mutate('checklist-hidden'));
    await waitFor(() => expect(result.current.mark.isSuccess).toBe(true));
    expect(result.current.access.data?.seen['checklist-hidden']).toBe(first);
  });
});

describe('usePlanErrorHandler', () => {
  it('shows the server sentence and ignores errors that are not plan errors', () => {
    signInAsMock(MOCK_EMAILS.trial);
    const { result } = renderHook(() => usePlanErrorHandler(), { wrapper: wrapperWith(newClient()) });

    expect(result.current(planFailure(403, 'TRIAL_COURSE_LIMIT', 'Bạn đã dùng hết 3 lượt học thử.'))).toBe(true);
    expect(toast.error).toHaveBeenCalledWith('Bạn đã dùng hết 3 lượt học thử.');

    vi.mocked(toast.error).mockClear();
    expect(result.current(new Error('network'))).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('reloads the session on PLAN_REQUIRED so the plan badge follows a trial that just ended', async () => {
    // The page still believes in a trial; the server already sees the Free plan (free@ is the same learner later).
    vi.spyOn(authService, 'getMe').mockImplementation(() => mockAuthService.getMe());
    signInAsMock(MOCK_EMAILS.trial);
    localStorage.setItem('accessToken', 'mock-token:mock-free');
    const { result } = renderHook(() => usePlanErrorHandler(), { wrapper: wrapperWith(newClient()) });
    expect(useCurrentUser.getState().user?.subscription?.status).toBe('trialing');

    act(() => {
      result.current(planFailure(403, 'PLAN_REQUIRED', 'Gói Miễn phí không mở bài học mới.'));
    });

    await waitFor(() => expect(useCurrentUser.getState().user?.subscription?.planCode).toBe('IND_FREE'));
  });
});
