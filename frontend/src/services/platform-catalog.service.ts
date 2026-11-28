import axios from 'axios';
import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { CaptionCue } from '@/lib/captions';

/**
 * Platform Admin v2 — frameworks, catalog versions and the course builder. Mirrors
 * DigiTalent.Api/Controllers/PlatformCatalogController.cs (docs/specs/2026-10-15-platform-admin-v2.md).
 * Courses are edited only in the draft version; publishing it moves the anchor (the version in use).
 */

export type FrameworkStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CatalogVersionStatus = 'DRAFT' | 'CURRENT' | 'RETIRED';
export type ChangeKind = 'NEW' | 'EDITED' | 'UNCHANGED';
export type BlockType = 'TEXT' | 'SLIDE' | 'IMAGE' | 'VIDEO' | 'PDF';
export type AssetKind = 'IMAGE' | 'VIDEO' | 'PDF';
export type CatalogSalesStatus = 'OPEN' | 'PAUSED';

export interface FrameworkSummary {
  id: string;
  code: string;
  name: string;
  description: string;
  status: FrameworkStatus;
  currentVersionNo: number;
  domainCount: number;
  courseCount: number;
  /** [Cơ bản, Trung cấp, Nâng cao] in the version in use. */
  coursesByLevel: number[];
  draftCourseCount: number | null;
  hasDraft: boolean;
}

export interface FrameworkCourseRef {
  courseId: string;
  code: string;
  title: string;
  level: number;
  levelName: string;
}

export interface FrameworkDomain {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  publishedDescription: string;
  draftDescription: string;
  hasDraft: boolean;
  courses: FrameworkCourseRef[];
  draftNewCourses: FrameworkCourseRef[];
}

export interface FrameworkDetail extends FrameworkSummary {
  currentCatalogVersionNo: number | null;
  draftCatalogVersionNo: number | null;
  domains: FrameworkDomain[];
  releases: { versionNo: number; releaseNote: string | null; publishedByEmail: string | null; publishedAt: string }[];
}

export interface FrameworksOutput {
  items: FrameworkSummary[];
  currentCatalogVersionNo: number | null;
  draftCatalogVersionNo: number | null;
}

export interface CatalogVersionSummary {
  versionNo: number;
  status: CatalogVersionStatus;
  basedOnVersionNo: number | null;
  releaseNote: string | null;
  createdAt: string;
  publishedAt: string | null;
  publishedByEmail: string | null;
  courseCount: number;
  frameworkCount: number;
  newCount: number;
  editedCount: number;
}

export interface CatalogVersionsOutput {
  items: CatalogVersionSummary[];
  currentVersionNo: number | null;
  draftVersionNo: number | null;
}

export interface CatalogCourseRow {
  courseId: string;
  code: string;
  title: string;
  frameworkId: string;
  frameworkName: string;
  domainId: string;
  domainName: string;
  level: number;
  levelName: string;
  moduleCount: number;
  questionCount: number;
  price: number;
  salesStatus: CatalogSalesStatus;
  changeKind: ChangeKind;
}

export interface CatalogVersionDetail {
  version: CatalogVersionSummary;
  editable: boolean;
  courses: CatalogCourseRow[];
}

export interface PublishCheckItem {
  level: 'BLOCK' | 'WARN';
  courseId: string | null;
  courseCode: string | null;
  moduleId: string | null;
  message: string;
}

export interface PublishCheck {
  versionNo: number;
  canPublish: boolean;
  changedCount: number;
  items: PublishCheckItem[];
}

export interface PlatformAsset {
  assetId: string;
  kind: AssetKind;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  /** Signed path relative to the API root; use assetUrl() to load it. */
  url: string;
}

export interface CatalogBlock {
  blockId: string;
  index: number;
  type: BlockType;
  bodyHtml: string | null;
  asset: PlatformAsset | null;
  caption: string | null;
  altText: string | null;
  items: { itemId: string; asset: PlatformAsset; caption: string | null }[];
}

export interface CatalogQuestion {
  questionId: string;
  index: number;
  text: string;
  explanation: string | null;
  blockId: string | null;
  options: { optionId: string; text: string; isCorrect: boolean }[];
}

export interface CatalogModule {
  moduleId: string;
  index: number;
  title: string;
  quizTitle: string;
  blocks: CatalogBlock[];
  questions: CatalogQuestion[];
}

export interface CatalogCourseDetail {
  versionNo: number;
  versionStatus: CatalogVersionStatus;
  editable: boolean;
  courseId: string;
  code: string;
  codeEditable: boolean;
  changeKind: ChangeKind;
  frameworkId: string;
  frameworkName: string;
  domainId: string;
  domainName: string;
  level: number;
  levelName: string;
  title: string;
  outcome: string;
  price: number;
  salesStatus: CatalogSalesStatus;
  final: { title: string; promptHtml: string; criteria: string[] };
  modules: CatalogModule[];
}

export interface CourseInfoInput {
  code?: string;
  title: string;
  outcome: string;
  domainId: string;
  level: number;
  price: number;
  salesStatus: CatalogSalesStatus;
}

export interface QuestionInput {
  text?: string;
  explanation?: string | null;
  blockId?: string | null;
  options?: { text: string; isCorrect: boolean }[];
}

/** NONE = no captions yet; PROCESSING = the AI is working; FAILED = the last AI run failed (the old draft is kept). */
export type CaptionStatus = 'NONE' | 'PROCESSING' | 'READY' | 'FAILED';

/** Captions of a video (schema v3.11): the draft the Platform Admin edits and what learners see. */
export interface AssetCaptions {
  assetId: string;
  language: string;
  status: CaptionStatus;
  source: 'AI' | 'MANUAL' | null;
  model: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  draftCues: CaptionCue[];
  publishedCues: CaptionCue[] | null;
  publishedAt: string | null;
  hasUnpublishedChanges: boolean;
  /** A Gemini key is set on the server, so "Tạo lời thoại bằng AI" can run. */
  aiConfigured: boolean;
  updatedAt: string | null;
}

export interface BlockInput {
  bodyHtml?: string;
  assetId?: string;
  caption?: string;
  altText?: string;
  items?: { assetId: string; caption?: string | null }[];
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data as T;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

/** Absolute URL of a signed asset path (img / video src). */
export const assetUrl = (asset: PlatformAsset) => `${API_BASE}/${asset.url}`;

const course = (versionNo: number, courseId: string) => `/platform/catalog/versions/${versionNo}/courses/${courseId}`;

export const platformCatalogService = {
  getFrameworks: () => unwrap<FrameworksOutput>(apiClient.get('/platform/frameworks')),
  getFramework: (id: string) => unwrap<FrameworkDetail>(apiClient.get(`/platform/frameworks/${id}`)),
  saveFrameworkDraft: (id: string, body: { domains: { domainId: string; description: string }[] }) =>
    unwrap<FrameworkDetail>(apiClient.put(`/platform/frameworks/${id}/draft`, body)),
  publishFramework: (id: string, releaseNote?: string) =>
    unwrap<FrameworkDetail>(apiClient.post(`/platform/frameworks/${id}/publish`, { releaseNote })),
  addFrameworkDomain: (id: string, body: { name: string; description?: string }) =>
    unwrap<FrameworkDetail>(apiClient.post(`/platform/frameworks/${id}/domains`, body)),
  /** Sửa lĩnh vực: the name changes at once, the description goes to the draft (published with the framework). */
  updateDomain: (id: string, domainId: string, body: { name: string; description?: string }) =>
    unwrap<FrameworkDetail>(apiClient.put(`/platform/frameworks/${id}/domains/${domainId}`, body)),
  /** Xóa lĩnh vực = archive; only a domain without courses in the version in use or the draft. */
  archiveDomain: (id: string, domainId: string) => unwrap<FrameworkDetail>(apiClient.delete(`/platform/frameworks/${id}/domains/${domainId}`)),

  getVersions: () => unwrap<CatalogVersionsOutput>(apiClient.get('/platform/catalog/versions')),
  createDraft: () => unwrap<CatalogVersionDetail>(apiClient.post('/platform/catalog/versions')),
  discardDraft: (versionNo: number) => unwrap<CatalogVersionsOutput>(apiClient.delete(`/platform/catalog/versions/${versionNo}`)),
  getVersion: (versionNo: number) => unwrap<CatalogVersionDetail>(apiClient.get(`/platform/catalog/versions/${versionNo}`)),
  getPublishCheck: (versionNo: number) => unwrap<PublishCheck>(apiClient.get(`/platform/catalog/versions/${versionNo}/publish-check`)),
  publishVersion: (versionNo: number, releaseNote?: string) =>
    unwrap<CatalogVersionDetail>(apiClient.post(`/platform/catalog/versions/${versionNo}/publish`, { releaseNote })),
  /** Đơn giá: course price (bought once per organization) and sales status of several courses in the draft (Basic stays free). */
  updatePrices: (versionNo: number, items: { courseId: string; price: number; salesStatus: CatalogSalesStatus }[]) =>
    unwrap<CatalogVersionDetail>(apiClient.put(`/platform/catalog/versions/${versionNo}/prices`, { items })),

  createCourse: (versionNo: number, body: { code: string; title: string; domainId: string; level: number }) =>
    unwrap<CatalogCourseDetail>(apiClient.post(`/platform/catalog/versions/${versionNo}/courses`, body)),
  getCourse: (versionNo: number, courseId: string) => unwrap<CatalogCourseDetail>(apiClient.get(course(versionNo, courseId))),
  updateCourse: (versionNo: number, courseId: string, body: CourseInfoInput) =>
    unwrap<CatalogCourseDetail>(apiClient.put(course(versionNo, courseId), body)),
  removeCourse: (versionNo: number, courseId: string) => unwrap<CatalogVersionDetail>(apiClient.delete(course(versionNo, courseId))),
  updateFinal: (versionNo: number, courseId: string, body: { title: string; promptHtml: string; criteria: string[] }) =>
    unwrap<CatalogCourseDetail>(apiClient.put(`${course(versionNo, courseId)}/final`, body)),

  addModule: (versionNo: number, courseId: string, title: string) =>
    unwrap<CatalogCourseDetail>(apiClient.post(`${course(versionNo, courseId)}/modules`, { title })),
  updateModule: (versionNo: number, courseId: string, moduleId: string, body: { title: string; quizTitle?: string }) =>
    unwrap<CatalogCourseDetail>(apiClient.put(`${course(versionNo, courseId)}/modules/${moduleId}`, body)),
  removeModule: (versionNo: number, courseId: string, moduleId: string) =>
    unwrap<CatalogCourseDetail>(apiClient.delete(`${course(versionNo, courseId)}/modules/${moduleId}`)),
  moveModule: (versionNo: number, courseId: string, moduleId: string, toIndex: number) =>
    unwrap<CatalogCourseDetail>(apiClient.post(`${course(versionNo, courseId)}/modules/${moduleId}/move`, { toIndex })),

  addBlock: (versionNo: number, courseId: string, moduleId: string, type: BlockType, position?: number) =>
    unwrap<CatalogCourseDetail>(apiClient.post(`${course(versionNo, courseId)}/modules/${moduleId}/blocks`, { type, position })),
  updateBlock: (versionNo: number, courseId: string, blockId: string, body: BlockInput) =>
    unwrap<CatalogCourseDetail>(apiClient.put(`${course(versionNo, courseId)}/blocks/${blockId}`, body)),
  removeBlock: (versionNo: number, courseId: string, blockId: string) =>
    unwrap<CatalogCourseDetail>(apiClient.delete(`${course(versionNo, courseId)}/blocks/${blockId}`)),
  moveBlock: (versionNo: number, courseId: string, blockId: string, toIndex: number) =>
    unwrap<CatalogCourseDetail>(apiClient.post(`${course(versionNo, courseId)}/blocks/${blockId}/move`, { toIndex })),

  addQuestion: (versionNo: number, courseId: string, moduleId: string, body: QuestionInput = {}) =>
    unwrap<CatalogCourseDetail>(apiClient.post(`${course(versionNo, courseId)}/modules/${moduleId}/questions`, body)),
  updateQuestion: (versionNo: number, courseId: string, questionId: string, body: QuestionInput) =>
    unwrap<CatalogCourseDetail>(apiClient.put(`${course(versionNo, courseId)}/questions/${questionId}`, body)),
  removeQuestion: (versionNo: number, courseId: string, questionId: string) =>
    unwrap<CatalogCourseDetail>(apiClient.delete(`${course(versionNo, courseId)}/questions/${questionId}`)),

  /** Transcript of a lesson video (step 1 of its sign-language video, not shown to learners): the AI runs only when asked (generate answers at once with PROCESSING; ask again until READY / FAILED). */
  getCaptions: (assetId: string) => unwrap<AssetCaptions>(apiClient.get(`/platform/assets/${assetId}/captions`)),
  generateCaptions: (assetId: string) => unwrap<AssetCaptions>(apiClient.post(`/platform/assets/${assetId}/captions/generate`)),
  saveCaptions: (assetId: string, cues: CaptionCue[]) =>
    unwrap<AssetCaptions>(apiClient.put(`/platform/assets/${assetId}/captions`, { cues })),
  /** The saved draft becomes what learners see, at once (no new catalog version needed). */

  /** Uploads an image (≤ 10 MB), PDF (≤ 50 MB), or video (≤ 500 MB) directly to Object Storage when enabled, falling back to API proxy; onProgress receives 0..100. */
  uploadAsset: async (file: File, onProgress?: (percent: number) => void): Promise<PlatformAsset> => {
    const contentType = file.type || 'application/octet-stream';
    const presign = await unwrap<{
      mode: 'DIRECT' | 'PROXY';
      uploadUrl?: string | null;
      uploadToken?: string | null;
      method?: string | null;
    }>(
      apiClient.post('/platform/assets/presign', {
        fileName: file.name,
        contentType,
        sizeBytes: file.size,
      }),
    );

    if (presign.mode === 'DIRECT' && presign.uploadUrl && presign.uploadToken) {
      await axios.put(presign.uploadUrl, file, {
        headers: { 'Content-Type': contentType },
        timeout: 0,
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      return unwrap<PlatformAsset>(
        apiClient.post('/platform/assets/complete', { uploadToken: presign.uploadToken }),
      );
    }

    const form = new FormData();
    form.append('file', file);
    return unwrap<PlatformAsset>(
      apiClient.post('/platform/assets', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0,
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
        },
      }),
    );
  },
};
