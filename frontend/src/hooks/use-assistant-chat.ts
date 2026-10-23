import { useEffect } from 'react';
import { create } from 'zustand';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  assistantService,
  ASSISTANT_MAX_MESSAGES,
  type AssistantReply,
  type AssistantTurn,
} from '../services/assistant.service';
import type { ApiResponse } from '../types/api';
import { useCurrentUser } from './use-current-user';

export interface AssistantEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  /** Epoch ms, shown as the message time. */
  at?: number;
  /** A user question whose request failed: shown with a retry, never sent as history. */
  failed?: boolean;
}

interface AssistantChatStore {
  /** The conversation belongs to one signed-in user; another user starts empty. Memory only, never persisted. */
  ownerId: string | null;
  open: boolean;
  entries: AssistantEntry[];
  setOpen: (open: boolean) => void;
  reset: (ownerId: string | null) => void;
  add: (entry: AssistantEntry) => void;
  markFailed: (id: string) => void;
  remove: (id: string) => void;
}

export const useAssistantChatStore = create<AssistantChatStore>((set) => ({
  ownerId: null,
  open: false,
  entries: [],
  setOpen: (open) => set({ open }),
  reset: (ownerId) => set({ ownerId, entries: [] }),
  add: (entry) => set((s) => ({ entries: [...s.entries, entry] })),
  markFailed: (id) => set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, failed: true } : e)) })),
  remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
}));

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

/** Successful turns only, alternating user/assistant, starting with user, at most ASSISTANT_MAX_MESSAGES. */
export function toHistory(entries: AssistantEntry[]): AssistantTurn[] {
  const turns: AssistantTurn[] = [];
  for (const entry of entries) {
    if (entry.failed) continue;
    if (turns.length > 0 && turns[turns.length - 1].role === entry.role) turns.pop();
    turns.push({ role: entry.role, content: entry.content });
  }
  let trimmed = turns.slice(-ASSISTANT_MAX_MESSAGES);
  while (trimmed.length > 0 && trimmed[0].role !== 'user') trimmed = trimmed.slice(1);
  return trimmed;
}

/** Server code (errors[0].message, e.g. ASSISTANT_NOT_CONFIGURED) mapped to a Vietnamese message. */
export function assistantErrorMessage(error: unknown): string {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    if (error.response?.status === 403) return 'Bạn không có quyền sử dụng trợ lý AI.';
    if (error.code === 'ECONNABORTED') return 'Trợ lý trả lời quá lâu. Hãy thử câu hỏi cụ thể hơn.';
    const message = error.response?.data?.message;
    if (message) return message;
  }
  return 'Không gửi được câu hỏi. Vui lòng thử lại.';
}

export function useAssistantChat() {
  const userId = useCurrentUser((s) => s.user?.id ?? null);
  const store = useAssistantChatStore();
  useEffect(() => {
    // Different account in this tab (logout/login): drop the previous conversation.
    if (useAssistantChatStore.getState().ownerId !== userId) useAssistantChatStore.getState().reset(userId);
  }, [userId]);

  const mutation = useMutation<AssistantReply, unknown, { questionId: string; history: AssistantTurn[] }>({
    mutationFn: ({ history }) => assistantService.chat(history),
    onSuccess: (reply) => {
      useAssistantChatStore.getState().add({ id: newId(), role: 'assistant', content: reply.reply, sources: reply.sources, at: Date.now() });
    },
    onError: (_error, { questionId }) => useAssistantChatStore.getState().markFailed(questionId),
  });

  const send = (text: string) => {
    const content = text.trim();
    if (!content || mutation.isPending) return;
    const question: AssistantEntry = { id: newId(), role: 'user', content, at: Date.now() };
    const history = toHistory([...useAssistantChatStore.getState().entries, question]);
    useAssistantChatStore.getState().add(question);
    mutation.mutate({ questionId: question.id, history });
  };

  const retry = (entry: AssistantEntry) => {
    useAssistantChatStore.getState().remove(entry.id);
    send(entry.content);
  };

  return {
    open: store.open,
    setOpen: store.setOpen,
    entries: store.ownerId === userId ? store.entries : [],
    clear: () => {
      mutation.reset();
      store.reset(userId);
    },
    send,
    retry,
    pending: mutation.isPending,
    error: mutation.error ? assistantErrorMessage(mutation.error) : null,
  };
}
