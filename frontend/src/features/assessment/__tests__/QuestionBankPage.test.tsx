import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuestionBankPage } from '../pages/QuestionBankPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as bankHooks from '@/hooks/use-question-banks';
import * as questionHooks from '@/hooks/use-questions';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('QuestionBankPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    vi.spyOn(bankHooks, 'useQuestionBanks').mockReturnValue({
      data: {
        items: [{ id: 'bank-1', title: 'General Bank', status: 'ACTIVE', questionCount: 2, createdAt: '' }],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 100,
      },
      isLoading: false,
    } as any);

    vi.spyOn(bankHooks, 'useQuestionTags').mockReturnValue({
      data: { items: [{ id: 'tag-1', name: 'React', category: 'TOPIC' }] },
    } as any);
  });

  const mockUserWithPermissions = (
    permissions: string[] = ['question_bank.read', 'question.create_update', 'question.approve_publish'],
  ) => {
    useCurrentUser.setState({
      user: {
        id: 'user-1',
        email: 'trainer@digitalent.ai',
        fullName: 'Trainer',
        roles: ['TRAINER'],
        permissions,
      },
      isAuthenticated: true,
    });
  };

  it('ShowsQuestionsAndEmptyState', () => {
    mockUserWithPermissions();

    vi.spyOn(questionHooks, 'useQuestions').mockReturnValue({
      data: {
        items: [
          { id: 'q1', bankId: 'bank-1', questionType: 'SINGLE_CHOICE', content: 'What is React?', status: 'DRAFT', options: [], tags: [], aiGeneratedFlag: false, createdAt: '' },
          { id: 'q2', bankId: 'bank-1', questionType: 'ESSAY', content: 'Explain DI', status: 'PUBLISHED', options: [], tags: [{ id: 'tag-1', name: 'React', category: 'TOPIC' }], aiGeneratedFlag: false, createdAt: '' },
        ],
        totalItems: 2,
        pageIndex: 1,
        pageSize: 10,
      },
      isLoading: false,
    } as any);

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <QuestionBankPage />
      </QueryClientProvider>,
    );

    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.getByText('Explain DI')).toBeInTheDocument();

    vi.spyOn(questionHooks, 'useQuestions').mockReturnValue({
      data: { items: [], totalItems: 0, pageIndex: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    rerender(
      <QueryClientProvider client={queryClient}>
        <QuestionBankPage />
      </QueryClientProvider>,
    );

    expect(screen.getByText('No questions found')).toBeInTheDocument();
  });

  it('ReadOnlyUserCannotManageQuestions', () => {
    mockUserWithPermissions(['question_bank.read']);

    vi.spyOn(questionHooks, 'useQuestions').mockReturnValue({
      data: {
        items: [{ id: 'q1', bankId: 'bank-1', questionType: 'ESSAY', content: 'Draft question', status: 'DRAFT', options: [], tags: [], aiGeneratedFlag: false, createdAt: '' }],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <QuestionBankPage />
      </QueryClientProvider>,
    );

    expect(screen.queryByRole('button', { name: /Create Question/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Publish')).not.toBeInTheDocument();
  });

  it('DeleteQuestionRequiresConfirmation', () => {
    mockUserWithPermissions();
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(questionHooks, 'useDeleteQuestion').mockReturnValue({ mutateAsync } as any);
    vi.spyOn(questionHooks, 'useApproveQuestion').mockReturnValue({ mutateAsync: vi.fn() } as any);

    vi.spyOn(questionHooks, 'useQuestions').mockReturnValue({
      data: {
        items: [{ id: 'q1', bankId: 'bank-1', questionType: 'ESSAY', content: 'Draft question', status: 'DRAFT', options: [], tags: [], aiGeneratedFlag: false, createdAt: '' }],
        totalItems: 1,
        pageIndex: 1,
        pageSize: 10,
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <QuestionBankPage />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByTitle('Delete'));

    const dialog = screen.getByRole('dialog');
    const confirmBtn = within(dialog).getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmBtn);

    expect(mutateAsync).toHaveBeenCalledWith('q1');
  });

  it('PublishButtonOnlyShowsForDraftQuestions', () => {
    mockUserWithPermissions();
    const approveMutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(questionHooks, 'useApproveQuestion').mockReturnValue({ mutateAsync: approveMutateAsync } as any);
    vi.spyOn(questionHooks, 'useDeleteQuestion').mockReturnValue({ mutateAsync: vi.fn() } as any);

    vi.spyOn(questionHooks, 'useQuestions').mockReturnValue({
      data: {
        items: [
          { id: 'q1', bankId: 'bank-1', questionType: 'ESSAY', content: 'Draft question', status: 'DRAFT', options: [], tags: [], aiGeneratedFlag: false, createdAt: '' },
          { id: 'q2', bankId: 'bank-1', questionType: 'ESSAY', content: 'Published question', status: 'PUBLISHED', options: [], tags: [], aiGeneratedFlag: false, createdAt: '' },
        ],
        totalItems: 2,
        pageIndex: 1,
        pageSize: 10,
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <QuestionBankPage />
      </QueryClientProvider>,
    );

    const publishButtons = screen.getAllByTitle('Publish');
    expect(publishButtons).toHaveLength(1);

    fireEvent.click(publishButtons[0]);
    expect(approveMutateAsync).toHaveBeenCalledWith('q1');
  });
});
