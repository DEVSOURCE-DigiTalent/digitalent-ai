export interface LessonMedia { kind: 'IMAGE' | 'VIDEO'; url: string; alt: string }
export interface CourseFinalContent { title: string; promptHtml: string; criteria: string[] }

export function lessonMediaUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
  return `${base}/${url.replace(/^\//, '')}`;
}
