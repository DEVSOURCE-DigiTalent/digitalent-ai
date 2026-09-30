import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

export interface QuestionBankListItem {
  id: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  questionCount: number;
  createdAt: string;
}

export interface QuestionTag {
  id: string;
  name: string;
  category: string;
}

export interface QuestionOption {
  id?: string;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuestionListItem {
  id: string;
  bankId: string;
  competencyId?: string;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
  difficulty?: string;
  content: string;
  explanation?: string;
  aiGeneratedFlag: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  options: QuestionOption[];
  tags: QuestionTag[];
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
}

export interface GetPagedQuestionBanksParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateQuestionBankRequest {
  title: string;
  description?: string;
  ownerUserId?: string;
}

export interface CreateQuestionTagRequest {
  name: string;
  category: string;
}

export interface GetPagedQuestionsParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  tagId?: string;
}

export interface SaveQuestionRequest {
  competencyId?: string;
  questionType: string;
  difficulty?: string;
  content: string;
  explanation?: string;
  aiGeneratedFlag?: boolean;
  options: QuestionOption[];
  tagIds: string[];
  status?: string;
}

export const questionBankService = {
  async getPagedBanks(params?: GetPagedQuestionBanksParams): Promise<PagedResult<QuestionBankListItem>> {
    const res = await apiClient.get<ApiResponse<PagedResult<QuestionBankListItem>>>('/question-banks', { params });
    return res.data.data!;
  },

  async createBank(data: CreateQuestionBankRequest): Promise<{ id: string; title: string; status: string }> {
    const res = await apiClient.post<ApiResponse<{ id: string; title: string; status: string }>>('/question-banks', data);
    return res.data.data!;
  },

  async deleteBank(id: string): Promise<{ id: string }> {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/question-banks/${id}`);
    return res.data.data!;
  },

  async getTags(): Promise<{ items: QuestionTag[] }> {
    const res = await apiClient.get<ApiResponse<{ items: QuestionTag[] }>>('/question-tags');
    return res.data.data!;
  },

  async createTag(data: CreateQuestionTagRequest): Promise<QuestionTag> {
    const res = await apiClient.post<ApiResponse<QuestionTag>>('/question-tags', data);
    return res.data.data!;
  },

  async getPagedQuestions(bankId: string, params?: GetPagedQuestionsParams): Promise<PagedResult<QuestionListItem>> {
    const res = await apiClient.get<ApiResponse<PagedResult<QuestionListItem>>>(`/question-banks/${bankId}/questions`, { params });
    return res.data.data!;
  },

  async createQuestion(bankId: string, data: SaveQuestionRequest): Promise<QuestionListItem> {
    const res = await apiClient.post<ApiResponse<QuestionListItem>>(`/question-banks/${bankId}/questions`, data);
    return res.data.data!;
  },

  async updateQuestion(id: string, data: Partial<SaveQuestionRequest>): Promise<QuestionListItem> {
    const res = await apiClient.put<ApiResponse<QuestionListItem>>(`/questions/${id}`, data);
    return res.data.data!;
  },

  async deleteQuestion(id: string): Promise<{ id: string }> {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/questions/${id}`);
    return res.data.data!;
  },

  async approveQuestion(id: string): Promise<{ id: string; status: string }> {
    const res = await apiClient.post<ApiResponse<{ id: string; status: string }>>(`/questions/${id}/approve`, {});
    return res.data.data!;
  },
};
