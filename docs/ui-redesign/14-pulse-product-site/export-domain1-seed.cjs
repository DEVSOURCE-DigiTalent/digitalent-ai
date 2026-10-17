#!/usr/bin/env node
// Export the reviewed Domain I teaching content as a deterministic, data-only seed package.
// Run: node docs/ui-redesign/14-pulse-product-site/export-domain1-seed.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const studio = __dirname;
const docsRoot = path.resolve(studio, '..');
const outputDir = path.join(docsRoot, 'domain1-seed');
const scripts = [
  'pulse-domain1-data.js',
  'pulse-domain1-depth.js',
  'pulse-domain1-quiz-bank.js',
  'pulse-domain1-enrichment.js',
];
// The browser scripts decorate lessonPage for the preview. The exporter only
// reads their data functions, so a no-op page renderer is sufficient here.
const sandbox = { window: {}, lessonPage: () => '' };
vm.createContext(sandbox);
for (const file of scripts) {
  vm.runInContext(fs.readFileSync(path.join(studio, file), 'utf8'), sandbox, { filename: file });
}

const domain = sandbox.window.PulseDomain1;
if (!domain?.modulesFor || !domain?.assignmentFor || !domain?.photoForTrack) {
  throw new Error('Domain I source files did not initialize the expected content API.');
}

const tracks = ['general', 'accounting', 'marketing', 'hr', 'sales', 'ceo'];
const courses = [1, 2, 3].map((tier) => {
  const source = domain.courses[tier];
  const modules = tracks.reduce((result, track) => {
    const sourceModules = domain.modulesFor(tier, track);
    if (sourceModules.length !== 3) throw new Error(`Expected 3 modules for ${source.code}/${track}`);
    result[track] = sourceModules.map((module, moduleIndex) => {
      if (module.slides.length !== 11 || module.questions.length !== 5) {
        throw new Error(`Expected 11 slides and 5 questions for ${source.code}/${track}/M0${moduleIndex + 1}`);
      }
      return {
        code: `${source.code}/M${String(moduleIndex + 1).padStart(2, '0')}`,
        title: module.title,
        objective: module.body,
        minutes: module.minutes,
        source: module.source,
        practice: module.practice,
        slides: module.slides.map((slide, slideIndex) => {
          const image = domain.photoForTrack(tier, moduleIndex, slideIndex, track);
          const absoluteImage = path.join(docsRoot, image);
          if (!fs.existsSync(absoluteImage)) {
            throw new Error(`Missing image: ${absoluteImage}`);
          }
          return {
            code: `${source.code}/M${String(moduleIndex + 1).padStart(2, '0')}/S${String(slideIndex + 1).padStart(2, '0')}`,
            tag: slide.tag,
            title: slide.title,
            body: slide.body,
            prompt: slide.prompt,
            visual: slide.visual,
            source: slide.source,
            image: image.replace(/\\/g, '/'),
            imageAlt: slide.visual?.caption || slide.title,
          };
        }),
        questions: module.questions.map((question, questionIndex) => ({
          code: `${source.code}/M${String(moduleIndex + 1).padStart(2, '0')}/${track.toUpperCase()}/Q${String(questionIndex + 1).padStart(2, '0')}`,
          text: question.text,
          options: question.options,
          correctIndex: question.answer,
          explanation: question.reason,
        })),
      };
    });
    return result;
  }, {});
  const assignments = Object.fromEntries(tracks.map((track) => [track, domain.assignmentFor(tier, track)]));
  return {
    code: source.code,
    platformCode: source.code.replace(/^M1-/, 'A1-'),
    tier,
    title: source.title,
    outcome: source.outcome,
    framework: source.framework,
    hours: source.hours,
    modules,
    assignments,
  };
});

const assets = [...new Set(courses.flatMap((course) =>
  tracks.flatMap((track) => course.modules[track].flatMap((module) =>
    module.slides.map((slide) => slide.image)))))]
  .sort()
  .map((relativePath) => {
    const bytes = fs.readFileSync(path.join(docsRoot, relativePath));
    return {
      key: relativePath,
      mimeType: 'image/png',
      sizeBytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    };
  });

const packageData = {
  schemaVersion: 1,
  contentVersion: 'domain1.v1',
  sourceScripts: scripts,
  tracks: Object.fromEntries(tracks.map((track) => [track, domain.tracks[track].label])),
  sources: domain.sources,
  assets,
  courses,
};

fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'domain1.v1.json');
fs.writeFileSync(outputPath, JSON.stringify(packageData, null, 2) + '\n', 'utf8');
const metrics = {
  courses: courses.length,
  contentModules: courses.reduce((count, course) => count + course.modules.general.length, 0),
  coreSlides: courses.reduce((count, course) => count + course.modules.general.reduce((n, module) => n + module.slides.length, 0), 0),
  tracks: tracks.length,
  roleQuestions: courses.reduce((count, course) => count + tracks.filter((track) => track !== 'general')
    .reduce((n, track) => n + course.modules[track].reduce((q, module) => q + module.questions.length, 0), 0), 0),
  roleAssignments: courses.length * (tracks.length - 1),
  uniqueImages: assets.length,
};
fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify({
  ...metrics,
  contentVersion: packageData.contentVersion,
  sha256: crypto.createHash('sha256').update(fs.readFileSync(outputPath)).digest('hex'),
}, null, 2) + '\n', 'utf8');
process.stdout.write(JSON.stringify(metrics, null, 2) + '\n');
