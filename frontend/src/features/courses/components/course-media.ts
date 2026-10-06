export type CourseMedia = { kind: 'embed' | 'file'; url: string };

/** Only turn recognized video links into player sources; lesson text remains plain text. */
export function resolveCourseMedia(value?: string | null): CourseMedia | null {
  if (!value?.trim()) return null;

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) return null;

  const host = url.hostname.toLowerCase();
  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const id = url.pathname.slice(1);
    return /^[\w-]{11}$/.test(id) ? { kind: 'embed', url: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
    const id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})$/)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? { kind: 'embed', url: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const id = url.pathname.match(/(?:\/video)?\/(\d+)\/?$/)?.[1];
    return id ? { kind: 'embed', url: `https://player.vimeo.com/video/${id}` } : null;
  }
  if (['loom.com', 'www.loom.com'].includes(host)) {
    const id = url.pathname.match(/^\/(?:share|embed)\/([\w-]+)\/?$/)?.[1];
    return id ? { kind: 'embed', url: `https://www.loom.com/embed/${id}` } : null;
  }
  return /\.(mp4|webm|ogg)$/i.test(url.pathname) ? { kind: 'file', url: url.toString() } : null;
}
