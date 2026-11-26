import apiClient from './api-client';
import type { ApiResponse } from '@/types/api';

/**
 * AI help of the course builder (`/content-ai`), shared by the platform admin (catalog draft) and the company R&D
 * (company draft): suggest a module's content and check it against Circular 02/2025. The builder sends the module.
 */
export interface ModuleContentOption {
  text: string;
  isCorrect: boolean;
}

export interface ModuleContentAiInput {
  courseCode: string;
  /** 0-based: module k teaches component competency domain.(k+1). */
  moduleIndex: number;
  competencyCode?: string;
  moduleTitle?: string;
  lessons: { title?: string; html?: string | null }[];
  questions: { text: string; options: ModuleContentOption[] }[];
}

export interface ContentAiCompetency {
  code: string;
  name: string;
  levelName: string;
  /** "3–4" for Trung cấp. */
  bac: string;
  outcomes: { id: string; bac: number; text: string }[];
}

export interface ModuleContentSuggestion {
  competencies: ContentAiCompetency[];
  lessons: { title: string; html: string }[];
  questions: { text: string; options: ModuleContentOption[]; explanation?: string | null; outcomeId?: string | null }[];
  note?: string | null;
  model?: string | null;
}

export type ContentOutcomeStatus = 'MET' | 'PARTIAL' | 'MISSING' | 'UNCHECKED';
export type ContentCheckVerdict = 'DAT' | 'CAN_SUA' | 'CHUA_DAT';

export type PageReviewStatus = 'OK' | 'WEAK' | 'PROBLEM';

/** The AI's view of one text page (page n = the n-th text page sent). */
export interface PageReview {
  number: number;
  status: PageReviewStatus;
  /** Requirement ids the page meets. */
  covers: string[];
  /** What to fix on the page. */
  notes: string[];
}

export interface RewrittenPage {
  pageNumber: number;
  title: string;
  /** Cleaned HTML, ready to replace the page. */
  html: string;
  covers: string[];
  note?: string | null;
  model?: string | null;
}

export interface ModuleContentCheck {
  competencies: ContentAiCompetency[];
  pages: PageReview[];
  verdict: ContentCheckVerdict;
  summary: string;
  outcomes: { id: string; competencyCode: string; bac: number; text: string; status: ContentOutcomeStatus; evidence?: string | null }[];
  issues: { kind: string; detail: string }[];
  questionProblems: { number: number; problem: string }[];
  suggestions: string[];
  model?: string | null;
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data as T;
}

// The AI reads the module and the Circular's requirements: give it longer than the default request timeout.
const AI_TIMEOUT = 120_000;

export const contentAiService = {
  suggest: (input: ModuleContentAiInput) =>
    unwrap<ModuleContentSuggestion>(apiClient.post('/content-ai/module/suggest', input, { timeout: AI_TIMEOUT })),
  check: (input: ModuleContentAiInput) =>
    unwrap<ModuleContentCheck>(apiClient.post('/content-ai/module/check', input, { timeout: AI_TIMEOUT })),
  /** Rewrites one page (1-based among the text pages sent), fixing the notes; nothing is saved. */
  rewritePage: (input: ModuleContentAiInput & { pageNumber: number; notes: string[] }) =>
    unwrap<RewrittenPage>(apiClient.post('/content-ai/module/rewrite-page', input, { timeout: AI_TIMEOUT })),
};
