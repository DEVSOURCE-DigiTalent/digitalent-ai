const INLINE_IMAGE = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/;

/** Browsers refuse to open data: URLs in a new tab, so the screenshot is opened as a temporary blob. */
export function openScreenshot(src: string) {
  const match = INLINE_IMAGE.exec(src);
  if (!match) return;
  const bytes = Uint8Array.from(atob(match[2]!), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: match[1] }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
