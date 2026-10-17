import manifest from './domain1-slide-art.json';

// Emit existing files through Vite; only the active slide is downloaded by the browser.
const files = import.meta.glob('../../../../../docs/ui-redesign/assets/domain1-accounting/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const urls = new Map(Object.entries(files).map(([path, url]) => [path.split('/').pop(), url]));
const normalize = (value: string) => value.normalize('NFC').trim().toLocaleLowerCase('vi');

export function slideArtwork(courseCode: string, moduleIndex: number, title: string, sourceText = '') {
  const code = courseCode.toUpperCase().replace(/^M1-/, 'A1-');
  const rows = manifest.filter(row => row.course === code && row.moduleIndex === moduleIndex);
  const byCaption = rows.filter(row => row.alt && sourceText.includes(row.alt));
  // A title edit must not detach an existing illustration when its authored caption is still present.
  const entry = rows.find(row => normalize(row.title) === normalize(title)) ?? (byCaption.length === 1 ? byCaption[0] : undefined);
  const src = entry ? urls.get(entry.image.split('/').pop()) : undefined;
  return src && entry ? { src, alt: entry.alt || entry.title } : null;
}
