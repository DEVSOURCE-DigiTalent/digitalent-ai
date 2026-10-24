import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

/** Mirrors AssistantController (POST /assistant/chat). The server keeps no history: send the whole conversation. */
export type AssistantRole = 'user' | 'assistant';

export interface AssistantTurn {
  role: AssistantRole;
  content: string;
}

export interface AssistantToolCall {
  name: string;
  succeeded: boolean;
}

export interface AssistantReply {
  /** Markdown answer. */
  reply: string;
  /** Record types / metrics read to answer, e.g. "enrollments", "analytics:learning_progress". */
  sources: string[];
  toolCalls: AssistantToolCall[];
}

/** Matches ChatWithAssistantUseCaseValidator. */
export const ASSISTANT_MAX_MESSAGES = 40;
export const ASSISTANT_MAX_LENGTH = 4000;

export const assistantService = {
  async chat(messages: AssistantTurn[]): Promise<AssistantReply> {
    // The model may look up several tools before answering: allow up to 2 minutes.
    const response = await apiClient.post<ApiResponse<AssistantReply>>('/assistant/chat', { messages }, { timeout: 120_000 });
    return response.data.data as AssistantReply;
  },
};
