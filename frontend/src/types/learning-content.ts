export interface LessonMedia {
  kind: 'IMAGE' | 'VIDEO' | 'PDF';
  url: string;
  alt: string;
  /** VIDEO only: published sign-language video (schema v3.13); null / absent when the video has none. */
  signLanguage?: LessonSignVideo | null;
}

/**
 * The published sign-language video of a lesson video. OVERLAY / FULLSCREEN = a whole lesson video with the signer
 * (the player swaps the source); TRACK_ONLY = the signer alone, shown over the lesson video in sync.
 */
export interface LessonSignVideo {
  url: string;
  mode: 'OVERLAY' | 'FULLSCREEN' | 'TRACK_ONLY';
  signLanguage: string;
  region: string;
}
export interface CourseFinalContent { title: string; promptHtml: string; criteria: string[] }

export function lessonMediaUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
  return `${base}/${url.replace(/^\//, '')}`;
}
