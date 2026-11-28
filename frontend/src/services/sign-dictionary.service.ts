import apiClient from './api-client';
import type { ApiResponse, PagedList } from '../types/api';
import type { PlatformAsset } from './platform-catalog.service';

/**
 * Sign-language dictionary of the 3D signing avatar — mirrors DigiTalent.Api/Controllers/PlatformSignDictionaryController.cs
 * (schema v3.12, docs/specs/2026-11-24-sign-language-avatar.md).
 */

export type SignGlossKind = 'WORD' | 'LETTER' | 'DIGIT' | 'TONE';
export type SignGlossStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export const SIGN_KIND_LABELS: Record<SignGlossKind, string> = {
  WORD: 'Từ',
  LETTER: 'Chữ cái',
  DIGIT: 'Chữ số',
  TONE: 'Dấu thanh',
};

export interface SignGloss {
  id: string;
  gloss: string;
  kind: SignGlossKind;
  status: SignGlossStatus;
  video: PlatformAsset | null;
  sourceName: string | null;
  sourceUrl: string | null;
  licenseNote: string | null;
  hasMotion: boolean;
  motionFps: number | null;
  motionFrames: number | null;
  durationMs: number | null;
  motionStartMs: number | null;
  motionEndMs: number | null;
  mirrored: boolean;
  publishedAt: string | null;
  updatedAt: string;
  // Schema v3.13: variants and rights
  signLanguage: string;
  /** VN = cả nước; VN-BAC / VN-TRUNG / VN-NAM. */
  region: string;
  variant: string | null;
  isPreferred: boolean;
  priority: number;
  synonyms: string[];
  /** The owner of the video and the signer allowed its use in DigiTalent. */
  consentConfirmed: boolean;
  signerName: string | null;
  videoDurationMs: number | null;
  /** Has a video with its source, licence and consent: the sign-language video may use it. */
  usableForVideo: boolean;
}

/** Landmarks per frame, int16 little-endian, base64 (see features/sign-language/motion-format.ts). */
export interface SignGlossMotion {
  id: string;
  gloss: string;
  kind: SignGlossKind;
  layout: number;
  fps: number;
  frames: number;
  mirrored: boolean;
  data: string;
}

export interface SignGlossInput {
  gloss: string;
  kind: SignGlossKind;
  videoAssetId?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  licenseNote?: string | null;
  mirrored?: boolean;
  region?: string;
  variant?: string | null;
  isPreferred?: boolean;
  priority?: number;
  synonyms?: string[];
  /** Required with a video (SIGN_LICENSE_MISSING otherwise). */
  consentConfirmed?: boolean;
  signerName?: string | null;
}

/** Where a sign is in its making: no video → video without motion → motion waiting to be published. */
export type SignGlossStage = 'NO_VIDEO' | 'NEEDS_MOTION' | 'READY';

export interface SignGlossQuery {
  search?: string;
  kind?: SignGlossKind | '';
  status?: SignGlossStatus | '';
  stage?: SignGlossStage | '';
  withoutMotion?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

/** Counts of the dictionary's tabs, with the list's text and kind filters. */
export interface SignGlossSummary {
  total: number;
  noVideo: number;
  needsMotion: number;
  ready: number;
  published: number;
  archived: number;
}

export interface SignMotionInput {
  layout: number;
  fps: number;
  frames: number;
  startMs: number;
  endMs: number;
  /** base64 */
  data: string;
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data as T;
}

const BASE = '/platform/sign-glosses';

export const signDictionaryService = {
  list: (query: SignGlossQuery) =>
    unwrap<PagedList<SignGloss>>(apiClient.get(BASE, {
      params: {
        search: query.search || undefined,
        kind: query.kind || undefined,
        status: query.status || undefined,
        stage: query.stage || undefined,
        withoutMotion: query.withoutMotion || undefined,
        pageIndex: query.pageIndex ?? 1,
        pageSize: query.pageSize ?? 50,
      },
    })),
  summary: (query: Pick<SignGlossQuery, 'search' | 'kind'>) =>
    unwrap<SignGlossSummary>(apiClient.get(`${BASE}/summary`, {
      params: { search: query.search || undefined, kind: query.kind || undefined },
    })),
  get: (id: string) => unwrap<SignGloss>(apiClient.get(`${BASE}/${id}`)),
  create: (body: SignGlossInput) => unwrap<SignGloss>(apiClient.post(BASE, body)),
  update: (id: string, body: SignGlossInput) => unwrap<SignGloss>(apiClient.put(`${BASE}/${id}`, body)),
  saveMotion: (id: string, body: SignMotionInput) => unwrap<SignGloss>(apiClient.put(`${BASE}/${id}/motion`, body)),
  publish: (id: string) => unwrap<SignGloss>(apiClient.post(`${BASE}/${id}/publish`)),
  archive: (id: string) => unwrap<SignGloss>(apiClient.delete(`${BASE}/${id}`)),
  /** Motions for the avatar; the admin preview passes publishedOnly = false. */
  motions: (ids: string[], publishedOnly: boolean) =>
    unwrap<SignGlossMotion[]>(apiClient.get(`${BASE}/motions`, {
      params: { ids, publishedOnly },
      paramsSerializer: { indexes: null },
    })),
  /**
   * The sign's video as a local blob: MediaPipe must read its pixels, which a cross-origin <video> does not allow.
   * `url` is the signed path of the asset (relative to the API root).
   */
  videoBlob: (url: string, onProgress?: (loaded: number, total: number) => void) =>
    apiClient.get<Blob>(url.replace(/^\//, ''), {
      responseType: 'blob',
      timeout: 0,
      onDownloadProgress: onProgress ? (event) => onProgress(event.loaded, event.total ?? 0) : undefined,
    }).then((response) => response.data),
};
