import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

/**
 * Sign-language video of a lesson video — mirrors DigiTalent.Api/Controllers/PlatformSignLanguageController.cs
 * (schema v3.13, docs/specs/2026-11-24-sign-language-video.md). Separate from the captions: captions are text, this
 * is a video of people signing, made from the sign dictionary and kept in sync with the captions.
 */

/** NONE = nothing made yet; the rest is platform_sign_language_tracks.status. */
export type SignTrackStatus = 'NONE' | 'ANALYZING' | 'MISSING_GLOSSES' | 'READY_TO_RENDER' | 'RENDERING' | 'READY' | 'FAILED' | 'PUBLISHED';
export type SignRenderMode = 'OVERLAY' | 'FULLSCREEN' | 'TRACK_ONLY';
/** AVATAR = one 3D character for the whole video (default); CLIP = dictionary videos of one real signer. */
export type SignRendererKind = 'CLIP' | 'AVATAR';
export type SignCaptionSource = 'PUBLISHED' | 'DRAFT';
export type SignReviewStatus = 'PENDING' | 'APPROVED' | 'SKIPPED';
/** Steps of a render, in order (platform_sign_language_tracks.progress_stage). */
export type SignRenderStage = 'QUEUED' | 'DOWNLOADING' | 'PREPARING_CLIPS' | 'JOINING' | 'COMPOSING' | 'CHECKING' | 'SAVING';
/** Why a sign can (OK) or cannot be rendered. */
export type SignAvailability = 'OK' | 'MISSING' | 'AMBIGUOUS' | 'NO_VIDEO' | 'NO_MOTION' | 'NO_LICENSE' | 'ARCHIVED' | 'SKIPPED';
export type SignMatchType =
  | 'EXACT_SENTENCE' | 'PHRASE' | 'WORD' | 'UNACCENTED' | 'SYNONYM' | 'NORMALIZED' | 'DIGITS' | 'MANUAL' | 'AMBIGUOUS' | 'MISSING';

export interface SignCandidate {
  id: string;
  gloss: string;
  kind: string;
  status: string;
  region: string;
  variant: string | null;
  isPreferred: boolean;
  priority: number;
  hasVideo: boolean;
  hasMotion: boolean;
  licensed: boolean;
}

export interface SignItem {
  sourceText: string;
  normalizedText: string;
  glossId: string | null;
  gloss: string | null;
  glossKind: string | null;
  glossStatus: string | null;
  region: string | null;
  variant: string | null;
  matchedAssetId: string | null;
  matchType: SignMatchType;
  confidence: number;
  isManualOverride: boolean;
  isMissing: boolean;
  skipped: boolean;
  /** Length the admin gave the sign; null = the clip's own length. */
  durationMs: number | null;
  clipDurationMs: number | null;
  startMs: number | null;
  endMs: number | null;
  /** false = estimated before the first render. */
  timingMeasured: boolean;
  note: string | null;
  /** FUNCTION_WORD = a word sign languages often leave out (the reviewer decides). */
  hint: string | null;
  availability: SignAvailability;
  problem: string | null;
  candidates: SignCandidate[];
}

export interface SignSegment {
  index: number;
  startMs: number;
  endMs: number;
  captionText: string;
  reviewStatus: SignReviewStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  confidence: number;
  /** Only sounds that are not speech ([nhạc nền]). */
  nonSpeech: boolean;
  items: SignItem[];
  problem: string | null;
}

export interface SignVideoOutput {
  assetId: string;
  /** Signed path relative to the API root (like every platform asset). */
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  durationMs: number | null;
  width: number | null;
  height: number | null;
  renderMode: SignRenderMode;
  at: string | null;
}

export interface SignVideoPrerequisites {
  isLessonVideo: boolean;
  hasCaptions: boolean;
  hasPublishedCaptions: boolean;
  hasDraftCaptions: boolean;
  captionsProcessing: boolean;
  dictionarySigns: number;
  usableSigns: number;
  /** Signs with a motion from a video whose rights are recorded (the 3D avatar can perform them). */
  usableMotionSigns: number;
  rendererAvailable: boolean;
  rendererMessage: string | null;
  avatarRendererAvailable: boolean;
  avatarRendererMessage: string | null;
}

export interface SignVideoSettings {
  captionSource: SignCaptionSource;
  renderMode: SignRenderMode;
  renderer: SignRendererKind;
  signLanguage: string;
  region: string;
  variant: string | null;
}

export interface SignVideoSummary {
  segments: number;
  readySegments: number;
  skippedSegments: number;
  nonSpeechSegments: number;
  items: number;
  signedItems: number;
  missingItems: number;
  ambiguousItems: number;
  unavailableItems: number;
  skippedItems: number;
  unreviewedSegments: number;
  confidence: number;
}

export interface SignMissingWord {
  text: string;
  count: number;
  segments: number[];
  reason: string;
  hint: string | null;
}

export interface SignLanguageVideo {
  assetId: string;
  trackId: string | null;
  status: SignTrackStatus;
  prerequisites: SignVideoPrerequisites;
  settings: SignVideoSettings | null;
  progress: number;
  /** Step of the render (kept after a failure, null once ready). */
  progressStage: SignRenderStage | null;
  /** What the render is doing, in Vietnamese. */
  progressDetail: string | null;
  renderStartedAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  stale: boolean;
  captionsChanged: boolean;
  outputOutdated: boolean;
  hasUnpublishedChanges: boolean;
  summary: SignVideoSummary;
  missing: SignMissingWord[];
  warnings: string[];
  segments: SignSegment[];
  output: SignVideoOutput | null;
  published: SignVideoOutput | null;
  renderBlockers: string[];
  publishBlockers: string[];
  updatedAt: string | null;
}

export interface SignVideoStatus {
  trackId: string;
  status: SignTrackStatus;
  progress: number;
  progressStage: SignRenderStage | null;
  progressDetail: string | null;
  renderStartedAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  stale: boolean;
  updatedAt: string;
}

export interface SignMatch {
  text: string;
  normalizedText: string;
  glossId: string | null;
  gloss: string | null;
  matchType: SignMatchType;
  confidence: number;
  hint: string | null;
  candidates: SignCandidate[];
}

/** What the browser renders for the 3D avatar (GET avatar-job): frame grid of the lesson video, sentences, signs. */
export interface SignAvatarJob {
  trackId: string;
  /** Sent back with the upload: the map the track is rendered from. */
  fingerprint: string;
  /** "30000/1001" */
  frameRate: string;
  fps: number;
  frameCount: number;
  durationMs: number;
  width: number;
  height: number;
  /** Behind the avatar of an opaque track. */
  background: string;
  /**
   * OVERLAY: no background — frames 2 × width wide (colour premultiplied on black | alpha as grey), the avatar standing
   * in the bottom corner on `side`. Sent back with the upload.
   */
  transparent?: boolean;
  side?: 'LEFT' | 'RIGHT';
  maxSpeedup: number;
  segments: {
    index: number;
    startMs: number;
    endMs: number;
    items: { itemIndex: number; sourceText: string; glossId: string | null; durationMs: number | null }[];
  }[];
  signs: { glossId: string; gloss: string; mirrored: boolean }[];
}

export interface SignAvatarUpload {
  file: Blob;
  format: 'H264' | 'IVF';
  fingerprint: string;
  frameRate: string;
  frameCount: number;
  /** Rendered without background, as the job asked. */
  transparent: boolean;
  placements: { segmentIndex: number; itemIndex: number; startMs: number; endMs: number; speed: number; sourceMs: number }[];
}

export interface SignAnalyzeInput {
  captionSource: SignCaptionSource;
  renderMode: SignRenderMode;
  renderer: SignRendererKind;
  signLanguage?: string;
  region: string;
  variant?: string | null;
}

export interface SignItemInput {
  sourceText: string;
  glossId?: string | null;
  skipped?: boolean;
  durationMs?: number | null;
  note?: string | null;
}

export interface SignSegmentInput {
  index: number;
  items?: SignItemInput[];
  reviewStatus?: SignReviewStatus;
  reviewNote?: string | null;
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data as T;
}

const track = (trackId: string) => `/platform/sign-language/${trackId}`;

export const signLanguageVideoService = {
  get: (assetId: string) => unwrap<SignLanguageVideo>(apiClient.get(`/platform/assets/${assetId}/sign-language`)),
  /** "Xem bản đồ ký hiệu" / "Tạo video ký hiệu": matches the captions to the dictionary (no render yet). */
  analyze: (assetId: string, body: SignAnalyzeInput) =>
    unwrap<SignLanguageVideo>(apiClient.post(`/platform/assets/${assetId}/sign-language/analyze`, body)),
  /** Only the sentences that changed. */
  saveSegments: (trackId: string, segments: SignSegmentInput[]) =>
    unwrap<SignLanguageVideo>(apiClient.put(`${track(trackId)}/segments`, { segments })),
  /** 202: rendered in the background; poll status(). */
  render: (trackId: string, force = false) => unwrap<SignLanguageVideo>(apiClient.post(`${track(trackId)}/render`, { force })),
  status: (trackId: string) => unwrap<SignVideoStatus>(apiClient.get(`${track(trackId)}/status`)),
  /** 3D avatar, step 1: what to render (checks the map and the server tools first). */
  avatarJob: (trackId: string) => unwrap<SignAvatarJob>(apiClient.get(`${track(trackId)}/avatar-job`)),
  /** 3D avatar, step 2 (202): the track rendered by the browser; the server composes it, poll status(). */
  uploadAvatarTrack: (trackId: string, upload: SignAvatarUpload, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    form.append('file', upload.file, upload.format === 'H264' ? 'avatar.h264' : 'avatar.ivf');
    form.append('fingerprint', upload.fingerprint);
    form.append('format', upload.format);
    form.append('frameRate', upload.frameRate);
    form.append('frameCount', String(upload.frameCount));
    form.append('transparent', String(upload.transparent));
    form.append('placements', JSON.stringify(upload.placements));
    return unwrap<SignLanguageVideo>(apiClient.post(`${track(trackId)}/avatar-track`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    }));
  },
  preview: (trackId: string) => unwrap<SignVideoOutput>(apiClient.get(`${track(trackId)}/preview`)),
  publish: (trackId: string) => unwrap<SignLanguageVideo>(apiClient.post(`${track(trackId)}/publish`)),
  retry: (trackId: string) => unwrap<SignLanguageVideo>(apiClient.post(`${track(trackId)}/retry`)),
  discardDraft: (trackId: string) => unwrap<SignLanguageVideo>(apiClient.delete(`${track(trackId)}/draft`)),
  /** The sign of the dictionary for a text as one sign (words joined or edited in the map). */
  match: (text: string, signLanguage: string, region: string, variant?: string | null) =>
    unwrap<SignMatch>(apiClient.get('/platform/sign-glosses/match', { params: { text, signLanguage, region, variant: variant || undefined } })),
};
