// Visuals are versioned with the Domain I content pack. Vite emits these files
// from docs as build assets, so the repository does not need a second copy.
const visualFiles = import.meta.glob('../../../../../docs/ui-redesign/assets/domain1-accounting/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const visuals = new Map(
  Object.entries(visualFiles).map(([path, url]) => [path.split('/').pop(), url]),
);

const slideVariants = ['', '-s02', '-s03', '-v2', '-s05', '-s06', '-v3', '-s08', '-v4', '-s10', '-s11'];

export function domain1SlideArt(courseCode: string, moduleIndex: number, slideIndex: number, slideCount: number): string | null {
  const match = /^[MA]1-([FIA])$/i.exec(courseCode);
  if (!match || slideCount !== 11 || moduleIndex < 0 || moduleIndex > 2 || slideIndex < 0 || slideIndex > 10) return null;

  const name = `m1-${match[1].toLowerCase()}-m${String(moduleIndex + 1).padStart(2, '0')}${slideVariants[slideIndex]}.png`;
  return visuals.get(name) ?? null;
}
