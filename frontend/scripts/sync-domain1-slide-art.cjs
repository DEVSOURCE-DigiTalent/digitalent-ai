// Generate only the image metadata; lesson content continues to come from the API.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const pack = JSON.parse(fs.readFileSync(path.join(root, 'docs/ui-redesign/domain1-seed/domain1.v1.json'), 'utf8'));
const rows = pack.courses.flatMap(course => course.modules.general.flatMap((module, moduleIndex) => module.slides.map(slide => {
  if (!fs.existsSync(path.join(root, 'docs/ui-redesign', slide.image))) throw new Error(`Missing slide image: ${slide.image}`);
  return { course: course.platformCode, moduleIndex, moduleTitle: module.title, title: slide.title, image: slide.image.replace('assets/', ''), alt: slide.imageAlt };
})));
if (rows.length !== 99) throw new Error('Expected 99 Domain I slides.');
const target = path.join(root, 'frontend/src/features/pulse-employee/lib/domain1-slide-art.json');
fs.writeFileSync(target, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Generated metadata for ${rows.length} slide images.`);
