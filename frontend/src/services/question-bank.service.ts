import apiClient from './api-client';
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

export interface QuestionBankDto {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  questionCount: number;
  createdAt: string;
}

export interface CreateQuestionBankRequest {
  title: string;
  description?: string;
  ownerTrainerId?: string;
}

export interface UpdateQuestionBankRequest {
  title?: string;
  description?: string;
}

export interface QuestionTagDto {
  id: string;
  name: string;
  category: string;
}

export interface CreateQuestionTagRequest {
  name: string;
  category: string;
}

export interface QuestionOptionDto {
  id?: string;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuestionDto {
  id: string;
  bankId: string;
  competencyId?: string | null;
  questionType: string;
  difficulty?: string | null;
  content: string;
  explanation?: string | null;
  aiGeneratedFlag: boolean;
  status: string;
  createdAt: string;
  options: QuestionOptionDto[];
  tags: QuestionTagDto[];
}

export interface SaveQuestionRequest {
  competencyId?: string;
  questionType: string;
  difficulty?: string;
  content: string;
  explanation?: string;
  aiGeneratedFlag?: boolean;
  options: QuestionOptionDto[];
  tagIds: string[];
  status?: string;
}

/**
 * Question Bank & Taxonomy Tagging API client (DT-205/DT-206).
 */
export const questionBankService = {
  listBanks: (params: PaginationRequest) =>
    apiClient.get<ApiResponse<PagedList<QuestionBankDto>>>('/question-banks', { params }),

  getBank: (bankId: string) =>
    apiClient.get<ApiResponse<QuestionBankDto>>(`/question-banks/${bankId}`),

  createBank: (data: CreateQuestionBankRequest) =>
    apiClient.post<ApiResponse<QuestionBankDto>>('/question-banks', data),

  updateBank: (bankId: string, data: UpdateQuestionBankRequest) =>
    apiClient.put<ApiResponse<QuestionBankDto>>(`/question-banks/${bankId}`, data),

  deleteBank: (bankId: string) =>
    apiClient.delete<void>(`/question-banks/${bankId}`),

  listTags: () =>
    apiClient.get<ApiResponse<QuestionTagDto[]>>('/question-tags'),

  createTag: (data: CreateQuestionTagRequest) =>
    apiClient.post<ApiResponse<QuestionTagDto>>('/question-tags', data),

  listQuestions: (bankId: string, params: PaginationRequest, tagId?: string) =>
    apiClient.get<ApiResponse<PagedList<QuestionDto>>>(`/question-banks/${bankId}/questions`, {
      params: { ...params, tagId },
    }),

  getQuestion: (questionId: string) =>
    apiClient.get<ApiResponse<QuestionDto>>(`/questions/${questionId}`),

  createQuestion: (bankId: string, data: SaveQuestionRequest) =>
    apiClient.post<ApiResponse<QuestionDto>>(`/question-banks/${bankId}/questions`, data),

  updateQuestion: (questionId: string, data: Partial<SaveQuestionRequest>) =>
    apiClient.put<ApiResponse<QuestionDto>>(`/questions/${questionId}`, data),

  deleteQuestion: (questionId: string) =>
    apiClient.delete<void>(`/questions/${questionId}`),

  changeQuestionStatus: (questionId: string, status: string) =>
    apiClient.patch<void>(`/questions/${questionId}/status`, { status }),

  approveQuestion: (questionId: string, comment?: string) =>
    apiClient.post<ApiResponse<QuestionDto>>(`/questions/${questionId}/approve`, { comment }),
};
