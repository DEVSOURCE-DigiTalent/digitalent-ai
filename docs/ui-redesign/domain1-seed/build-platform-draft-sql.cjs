#!/usr/bin/env node
// Import the reviewed Domain I package into the single Platform Admin DRAFT.
// The CURRENT catalog is deliberately untouched; organizations only receive this content after Admin publishes it.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const inputPath = path.join(root, 'domain1.v1.json');
const manifestPath = path.join(root, 'manifest.json');
const sourceBytes = fs.readFileSync(inputPath);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (crypto.createHash('sha256').update(sourceBytes).digest('hex') !== manifest.sha256) {
  throw new Error('Học liệu đã thay đổi; chạy lại export-domain1-seed.cjs trước khi tạo SQL.');
}

const source = JSON.parse(sourceBytes);
if (source.courses.length !== 3 || source.courses.some((course) => course.modules.general.length !== 3)) {
  throw new Error('Gói học liệu không có đủ 3 khóa và 3 mô đun mỗi khóa.');
}

function text(value) { return String(value ?? '').trim(); }
function html(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function list(items) {
  return Array.isArray(items) && items.length
    ? `<ul>${items.map((item) => `<li>${html(item)}</li>`).join('')}</ul>`
    : '';
}
function visual(slide) {
  const value = slide.visual;
  if (!value || typeof value !== 'object') return '';
  const rows = Array.isArray(value.rows)
    ? value.rows.map((row) => {
      const cells = Array.isArray(row) ? row : row && typeof row === 'object' ? Object.values(row) : [row];
      return `<li>${cells.map(html).filter(Boolean).join(' · ')}</li>`;
    }).join('')
    : '';
  return `<aside><h4>${html(value.title || 'Minh họa')}</h4>${rows ? `<ul>${rows}</ul>` : ''}${value.caption ? `<p>${html(value.caption)}</p>` : ''}</aside>`;
}
function slideHtml(slide) {
  const sourceLine = slide.source?.title && slide.source?.url
    ? `<footer><strong>Nguồn tham khảo:</strong> ${html(slide.source.title)} · ${html(slide.source.url)}</footer>`
    : '';
  return [
    `<article data-slide-code="${html(slide.code)}">`,
    slide.tag ? `<p><strong>${html(slide.tag)}</strong></p>` : '',
    `<h3>${html(slide.title)}</h3>`,
    `<p>${html(slide.body)}</p>`,
    visual(slide),
    slide.prompt ? `<section><h4>Tự kiểm tra</h4><p>${html(slide.prompt)}</p></section>` : '',
    sourceLine,
    '</article>',
  ].filter(Boolean).join('');
}
function assignmentHtml(assignment) {
  return [
    assignment.situation ? `<h3>Tình huống</h3><p>${html(assignment.situation)}</p>` : '',
    `<h3>Yêu cầu</h3><p>${html(assignment.prompt)}</p>`,
    assignment.caseFacts?.length ? `<h3>Dữ kiện</h3>${list(assignment.caseFacts)}` : '',
    assignment.requirements?.length ? `<h3>Các bước cần thực hiện</h3>${list(assignment.requirements)}` : '',
    assignment.deliverables?.length ? `<h3>Sản phẩm cần nộp</h3>${list(assignment.deliverables)}` : '',
  ].filter(Boolean).join('');
}

const selected = {
  schemaVersion: 1,
  contentVersion: 'domain1.platform-draft.v2',
  sourceSha256: manifest.sha256,
  courses: source.courses.map((course) => {
    const final = course.assignments.general;
    return {
      code: course.platformCode,
      title: course.title,
      outcome: course.outcome,
      final: {
        title: final.title,
        promptHtml: assignmentHtml(final),
        criteria: final.rubric.map(([criterion]) => criterion),
      },
      modules: course.modules.general.map((module) => ({
        title: module.title,
        quizTitle: `Ôn tập · ${module.title}`,
        blocks: module.slides.map((slide) => ({
          bodyHtml: slideHtml(slide),
          caption: slide.imageAlt || slide.visual?.caption || null,
          altText: slide.imageAlt || slide.visual?.caption || null,
        })),
        questions: module.questions.map((question) => ({
          text: question.text,
          explanation: question.explanation,
          options: question.options.map((option, index) => ({ text: option, isCorrect: index === question.correctIndex })),
        })),
      })),
    };
  }),
};

for (const course of selected.courses) {
  if (!/^A1-[FIA]$/.test(course.code) || course.modules.length !== 3) throw new Error(`Khóa Platform không hợp lệ: ${course.code}`);
  for (const module of course.modules) {
    if (module.blocks.length !== 11 || module.questions.length !== 5) throw new Error(`Thiếu slide/quiz: ${course.code}`);
    for (const question of module.questions) {
      if (!question.text || !question.explanation || question.options.length < 2 || question.options.filter((option) => option.isCorrect).length !== 1) {
        throw new Error(`Câu hỏi không hợp lệ trong ${course.code}.`);
      }
    }
  }
}

const dryRun = process.argv.includes('--dry-run');
if (!dryRun && !process.argv.includes('--apply')) throw new Error('Chọn --dry-run hoặc --apply.');
const json = JSON.stringify(selected);
const delimiter = '$domain1_platform_v2$';
if (json.includes(delimiter)) throw new Error('JSON trùng dấu phân cách SQL.');

const sql = `\\set ON_ERROR_STOP on
BEGIN;
CREATE TEMP TABLE pulse_platform_payload (data jsonb) ON COMMIT DROP;
INSERT INTO pulse_platform_payload VALUES (${delimiter}${json}${delimiter}::jsonb);

CREATE TEMP TABLE pulse_platform_courses AS
SELECT v.id AS version_id, v.version_no, cc.id AS catalog_course_id, pc.id AS course_id,
       pc.code, source.value AS doc
FROM pulse_platform_payload payload
CROSS JOIN LATERAL jsonb_array_elements(payload.data->'courses') source(value)
JOIN platform_courses pc ON pc.code = source.value->>'code'
JOIN platform_catalog_versions v ON v.status = 'DRAFT'
JOIN platform_catalog_courses cc ON cc.version_id = v.id AND cc.course_id = pc.id;

DO $$ BEGIN
  IF (SELECT count(*) FROM platform_catalog_versions WHERE status='DRAFT') <> 1
     OR (SELECT count(*) FROM pulse_platform_courses) <> 3
     OR (SELECT count(DISTINCT version_id) FROM pulse_platform_courses) <> 1
  THEN RAISE EXCEPTION 'Cần đúng một catalog DRAFT chứa đủ A1-F, A1-I, A1-A; dừng import.'; END IF;
END $$;

DELETE FROM platform_question_options option_row
USING platform_module_questions question_row, platform_course_modules module_row, pulse_platform_courses selected_course
WHERE option_row.question_id=question_row.id AND question_row.module_id=module_row.id AND module_row.catalog_course_id=selected_course.catalog_course_id;
DELETE FROM platform_module_questions question_row
USING platform_course_modules module_row, pulse_platform_courses selected_course
WHERE question_row.module_id=module_row.id AND module_row.catalog_course_id=selected_course.catalog_course_id;
DELETE FROM platform_slide_items slide_item
USING platform_module_blocks block_row, platform_course_modules module_row, pulse_platform_courses selected_course
WHERE slide_item.block_id=block_row.id AND block_row.module_id=module_row.id AND module_row.catalog_course_id=selected_course.catalog_course_id;
DELETE FROM platform_module_blocks block_row
USING platform_course_modules module_row, pulse_platform_courses selected_course
WHERE block_row.module_id=module_row.id AND module_row.catalog_course_id=selected_course.catalog_course_id;
DELETE FROM platform_course_modules module_row
USING pulse_platform_courses selected_course
WHERE module_row.catalog_course_id=selected_course.catalog_course_id;

UPDATE platform_catalog_courses catalog_course
SET title=selected_course.doc->>'title', outcome=selected_course.doc->>'outcome',
    final_title=selected_course.doc->'final'->>'title', final_prompt=selected_course.doc->'final'->>'promptHtml',
    final_criteria=selected_course.doc->'final'->'criteria', change_kind='EDITED', updated_at=now()
FROM pulse_platform_courses selected_course
WHERE catalog_course.id=selected_course.catalog_course_id;

CREATE TEMP TABLE pulse_platform_modules AS
SELECT selected_course.*, module_doc.ordinality::int AS module_no, module_doc.value AS module_doc,
       md5('pulse-platform-domain1-v2:module:' || selected_course.catalog_course_id::text || ':' || module_doc.ordinality::text)::uuid AS module_id
FROM pulse_platform_courses selected_course
CROSS JOIN LATERAL jsonb_array_elements(selected_course.doc->'modules') WITH ORDINALITY module_doc(value, ordinality);

INSERT INTO platform_course_modules (id, catalog_course_id, sort_order, title, quiz_title, created_at, updated_at)
SELECT module_id, catalog_course_id, module_no, module_doc->>'title', module_doc->>'quizTitle', now(), now()
FROM pulse_platform_modules;

CREATE TEMP TABLE pulse_platform_blocks AS
SELECT module_row.*, block_doc.ordinality::int AS block_no, block_doc.value AS block_doc,
       md5('pulse-platform-domain1-v2:block:' || module_row.module_id::text || ':' || block_doc.ordinality::text)::uuid AS block_id
FROM pulse_platform_modules module_row
CROSS JOIN LATERAL jsonb_array_elements(module_row.module_doc->'blocks') WITH ORDINALITY block_doc(value, ordinality);

INSERT INTO platform_module_blocks (id, module_id, sort_order, block_type, body_html, asset_id, caption, alt_text, created_at, updated_at)
SELECT block_id, module_id, block_no, 'TEXT', block_doc->>'bodyHtml', NULL, block_doc->>'caption', block_doc->>'altText', now(), now()
FROM pulse_platform_blocks;

CREATE TEMP TABLE pulse_platform_questions AS
SELECT module_row.*, question_doc.ordinality::int AS question_no, question_doc.value AS question_doc,
       md5('pulse-platform-domain1-v2:question:' || module_row.module_id::text || ':' || question_doc.ordinality::text)::uuid AS question_id
FROM pulse_platform_modules module_row
CROSS JOIN LATERAL jsonb_array_elements(module_row.module_doc->'questions') WITH ORDINALITY question_doc(value, ordinality);

INSERT INTO platform_module_questions (id, module_id, sort_order, question_text, explanation, block_id, created_at, updated_at)
SELECT question_id, module_id, question_no, question_doc->>'text', question_doc->>'explanation', NULL, now(), now()
FROM pulse_platform_questions;

INSERT INTO platform_question_options (id, question_id, sort_order, option_text, is_correct, created_at, updated_at)
SELECT md5('pulse-platform-domain1-v2:option:' || question_row.question_id::text || ':' || option_doc.ordinality::text)::uuid,
       question_row.question_id, option_doc.ordinality::int, option_doc.value->>'text',
       (option_doc.value->>'isCorrect')::boolean, now(), now()
FROM pulse_platform_questions question_row
CROSS JOIN LATERAL jsonb_array_elements(question_row.question_doc->'options') WITH ORDINALITY option_doc(value, ordinality);

DO $$ BEGIN
  IF (SELECT count(*) FROM pulse_platform_modules) <> 9 THEN
    RAISE EXCEPTION 'Platform Draft v2: cần 9 mô đun, hiện có %.', (SELECT count(*) FROM pulse_platform_modules);
  END IF;
  IF (SELECT count(*) FROM pulse_platform_blocks) <> 99 THEN
    RAISE EXCEPTION 'Platform Draft v2: cần 99 khối, hiện có %.', (SELECT count(*) FROM pulse_platform_blocks);
  END IF;
  IF (SELECT count(*) FROM pulse_platform_questions) <> 45 THEN
    RAISE EXCEPTION 'Platform Draft v2: cần 45 câu hỏi, hiện có %.', (SELECT count(*) FROM pulse_platform_questions);
  END IF;
  IF EXISTS (
    SELECT 1 FROM pulse_platform_courses selected_course
    WHERE (SELECT count(*) FROM platform_course_modules m WHERE m.catalog_course_id=selected_course.catalog_course_id) <> 3
       OR (SELECT count(*) FROM platform_module_blocks b JOIN platform_course_modules m ON m.id=b.module_id WHERE m.catalog_course_id=selected_course.catalog_course_id) <> 33
       OR (SELECT count(*) FROM platform_module_questions q JOIN platform_course_modules m ON m.id=q.module_id WHERE m.catalog_course_id=selected_course.catalog_course_id) <> 15
       OR (SELECT count(*) FROM platform_question_options o JOIN platform_module_questions q ON q.id=o.question_id JOIN platform_course_modules m ON m.id=q.module_id WHERE m.catalog_course_id=selected_course.catalog_course_id AND o.is_correct) <> 15
       OR (SELECT change_kind FROM platform_catalog_courses c WHERE c.id=selected_course.catalog_course_id) <> 'EDITED')
  THEN RAISE EXCEPTION 'Platform Draft v2: số liệu từng khóa hoặc trạng thái EDITED không hợp lệ.'; END IF;
END $$;

SELECT version_no, code,
       (SELECT change_kind FROM platform_catalog_courses c WHERE c.id=selected_course.catalog_course_id) change_kind,
       (SELECT count(*) FROM platform_course_modules m WHERE m.catalog_course_id=selected_course.catalog_course_id) modules,
       (SELECT count(*) FROM platform_module_blocks b JOIN platform_course_modules m ON m.id=b.module_id WHERE m.catalog_course_id=selected_course.catalog_course_id) blocks,
       (SELECT count(*) FROM platform_module_questions q JOIN platform_course_modules m ON m.id=q.module_id WHERE m.catalog_course_id=selected_course.catalog_course_id) questions
FROM pulse_platform_courses selected_course ORDER BY code;
${dryRun ? 'ROLLBACK;' : 'COMMIT;'}
`;

const filename = `domain1-platform-draft-v2.${dryRun ? 'dry-run' : 'apply'}.sql`;
fs.writeFileSync(path.join(root, filename), sql, 'utf8');
process.stdout.write(`${filename}: ${Buffer.byteLength(sql)} bytes; ${dryRun ? 'ROLLBACK' : 'COMMIT'}; 3 courses, 9 modules, 99 content blocks, 45 questions.\n`);
