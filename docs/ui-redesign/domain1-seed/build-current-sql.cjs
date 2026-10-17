#!/usr/bin/env node
// Build a versioned, additive import for the current PostgreSQL schema.
// Run with --dry-run (ROLLBACK) first. No credentials or environment-specific IDs are stored here.
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
if (source.courses.length !== 3 || source.courses.some((c) => c.modules.general.length !== 3)) {
  throw new Error('Gói học liệu không có đủ 3 khóa và 3 mô đun mỗi khóa.');
}
const flagValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return index < 0 ? null : process.argv[index + 1];
};
const prefix = flagValue('--prefix') ?? 'M1';
const organizationId = flagValue('--organization');
if (!['M1', 'A1'].includes(prefix) || (organizationId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(organizationId))) {
  throw new Error('Dùng --prefix M1|A1 và --organization <uuid> hợp lệ.');
}
if (prefix === 'A1' && !organizationId) throw new Error('A1 cần --organization để tránh seed nhầm doanh nghiệp.');

function text(value) { return String(value ?? '').trim(); }
function visualLines(visual) {
  if (!visual || typeof visual !== 'object') return [];
  const lines = [];
  if (visual.title) lines.push(`### ${text(visual.title)}`);
  if (Array.isArray(visual.rows)) {
    for (const row of visual.rows) {
      if (Array.isArray(row)) lines.push(`- ${row.map(text).filter(Boolean).join(' · ')}`);
      else if (row && typeof row === 'object') lines.push(`- ${Object.values(row).map(text).filter(Boolean).join(' · ')}`);
      else if (row) lines.push(`- ${text(row)}`);
    }
  }
  if (visual.caption) lines.push(text(visual.caption));
  return lines;
}

function slideBody(slide) {
  const sections = [text(slide.body)];
  const visual = visualLines(slide.visual);
  if (visual.length) sections.push(visual.join('\n'));
  if (slide.prompt) sections.push(`### Tự kiểm tra\n${text(slide.prompt)}`);
  if (slide.source?.title && slide.source?.url) {
    // Current RichText intentionally strips links. Keep the source readable as plain text.
    sections.push(`### Nguồn tham khảo\n${text(slide.source.title)}\n${text(slide.source.url)}`);
  }
  return sections.filter(Boolean).join('\n\n');
}

const selected = {
  schemaVersion: 1,
  contentVersion: 'domain1.v2-current-schema',
  sourceSha256: manifest.sha256,
  courses: source.courses.map((course) => ({
    code: course.code,
    tier: course.tier,
    title: course.title,
    description: course.outcome,
    purpose: `${course.framework} · ${course.hours}`,
    modules: course.modules.general.map((module) => ({
      title: module.title,
      description: module.objective,
      purpose: module.practice,
      minutes: module.minutes,
      slides: module.slides.map((slide) => ({
        code: slide.code,
        title: slide.title,
        content: slideBody(slide),
      })),
      questions: module.questions.map((question) => ({
        code: question.code,
        text: question.text,
        explanation: question.explanation,
        options: question.options,
        correctIndex: question.correctIndex,
      })),
    })),
    assignments: course.assignments,
  })),
};

for (const course of selected.courses) {
  for (const module of course.modules) {
    if (module.slides.length !== 11 || module.questions.length !== 5) throw new Error(`Thiếu slide/quiz: ${course.code}`);
    for (const question of module.questions) {
      if (!question.text || !question.explanation || !Array.isArray(question.options)
        || question.options.length < 2 || !Number.isInteger(question.correctIndex)
        || question.correctIndex < 0 || question.correctIndex >= question.options.length) {
        throw new Error(`Câu hỏi không hợp lệ: ${question.code}`);
      }
    }
  }
}

const json = JSON.stringify(selected);
const delimiter = '$domain1_v2$';
if (json.includes(delimiter)) throw new Error('JSON trùng dấu phân cách SQL.');
const dryRun = process.argv.includes('--dry-run');
if (!dryRun && !process.argv.includes('--apply')) throw new Error('Chọn --dry-run hoặc --apply.');
const sql = `\\set ON_ERROR_STOP on
BEGIN;
CREATE TEMP TABLE pulse_domain1_payload (data jsonb) ON COMMIT DROP;
INSERT INTO pulse_domain1_payload VALUES (${delimiter}${json}${delimiter}::jsonb);
CREATE TEMP TABLE pulse_domain1_courses AS
SELECT old.id AS old_id, old.organization_id, old.created_by_user_id,
       md5('pulse-domain1-v2:course:' || old.organization_id::text || ':' || old.code)::uuid AS new_id,
       old.code, old.version_no, old.estimated_duration_minutes, old.certificate_enabled,
       old.certificate_validity_days, old.entry_level, source.value AS doc
FROM pulse_domain1_payload p
CROSS JOIN LATERAL jsonb_array_elements(p.data->'courses') source(value)
JOIN courses old ON old.code = replace(source.value->>'code', 'M1-', '${prefix}-')
  AND old.version_no = 1 AND old.status = 'PUBLISHED'
  ${organizationId ? `AND old.organization_id = '${organizationId}'::uuid` : ''};
DO $$ BEGIN
  IF (SELECT count(*) FROM pulse_domain1_courses) <> 3
     OR (SELECT count(DISTINCT organization_id) FROM pulse_domain1_courses) <> 1
     OR EXISTS (SELECT 1 FROM pulse_domain1_courses s JOIN courses c ON c.organization_id=s.organization_id AND c.code=s.code AND c.version_no=2 WHERE c.id<>s.new_id)
  THEN RAISE EXCEPTION 'Sai khóa v1, tổ chức hoặc phiên bản v2 đã có ID khác; dừng import.'; END IF;
END $$;
INSERT INTO courses (id, organization_id, code, version_no, supersedes_course_id, title, short_name,
                     description, purpose, entry_level, estimated_duration_minutes, certificate_enabled,
                     certificate_validity_days, status, created_by_user_id, created_at, updated_at, row_version)
SELECT new_id, organization_id, code, 2, old_id, doc->>'title', doc->>'title',
       doc->>'description', doc->>'purpose', entry_level, estimated_duration_minutes,
       certificate_enabled, certificate_validity_days, 'PUBLISHED', created_by_user_id, now(), now(), 1
FROM pulse_domain1_courses ON CONFLICT (id) DO NOTHING;
INSERT INTO course_competencies (course_id, competency_id, target_level, coverage_type, coverage_weight, note)
SELECT s.new_id, cc.competency_id, cc.target_level, cc.coverage_type, cc.coverage_weight, cc.note
FROM pulse_domain1_courses s JOIN course_competencies cc ON cc.course_id=s.old_id
ON CONFLICT (course_id, competency_id) DO NOTHING;
CREATE TEMP TABLE pulse_domain1_modules AS
SELECT s.*, (s.doc->>'tier')::int AS tier, m.ordinality::int AS module_no, m.value AS module_doc,
       md5('pulse-domain1-v2:module:' || s.new_id::text || ':' || m.ordinality::text)::uuid AS module_id
FROM pulse_domain1_courses s
CROSS JOIN LATERAL jsonb_array_elements(s.doc->'modules') WITH ORDINALITY AS m(value, ordinality);
INSERT INTO course_modules (id, course_id, code, title, description, purpose, estimated_minutes,
                            sort_order, is_required, status, created_at, updated_at)
SELECT module_id, new_id, code || '-CH' || module_no, module_doc->>'title', module_doc->>'description',
       module_doc->>'purpose', (module_doc->>'minutes')::int, module_no, true, 'ACTIVE', now(), now()
FROM pulse_domain1_modules ON CONFLICT (id) DO NOTHING;
INSERT INTO course_learning_outcomes (id, course_id, code, competency_id, target_level,
                                      outcome_type, statement, source_type, source_ref,
                                      assessment_method, sort_order, created_at, updated_at)
SELECT md5('pulse-domain1-v2:outcome:' || m.new_id::text || ':' || m.module_no::text)::uuid,
       m.new_id, m.code || '-LO-' || m.module_no, mapped.competency_id, m.tier,
       'SKILL', m.module_doc->>'description', 'DIGITALENT_ADAPTATION', 'TT02/2025/TT-BGDĐT',
       'Quiz mô đun và bài cuối', m.module_no, now(), now()
FROM pulse_domain1_modules m
JOIN (
  SELECT cc.course_id, cc.competency_id,
         row_number() OVER (PARTITION BY cc.course_id ORDER BY competency.code) AS module_no
  FROM course_competencies cc JOIN competencies competency ON competency.id=cc.competency_id
) mapped ON mapped.course_id=m.new_id AND mapped.module_no=m.module_no
ON CONFLICT (id) DO NOTHING;
CREATE TEMP TABLE pulse_domain1_slides AS
SELECT m.module_id, s.ordinality::int AS slide_no, s.value AS slide_doc,
       md5('pulse-domain1-v2:lesson:' || m.module_id::text || ':' || s.ordinality::text)::uuid AS lesson_id
FROM pulse_domain1_modules m
CROSS JOIN LATERAL jsonb_array_elements(m.module_doc->'slides') WITH ORDINALITY AS s(value, ordinality);
INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, estimated_minutes,
                     sort_order, is_required, completion_rule, status, created_at, updated_at)
SELECT lesson_id, module_id, replace(slide_doc->>'code', 'M1-', '${prefix}-'), slide_doc->>'title', 'TEXT', slide_doc->>'content',
       4, slide_no, true, 'VIEW', 'ACTIVE', now(), now()
FROM pulse_domain1_slides ON CONFLICT (id) DO NOTHING;
CREATE TEMP TABLE pulse_domain1_banks AS
SELECT DISTINCT organization_id,
       md5('pulse-domain1-v2:bank:' || organization_id::text)::uuid AS bank_id
FROM pulse_domain1_courses;
INSERT INTO question_banks (id, organization_id, title, description, status, created_at, updated_at)
SELECT bank_id, organization_id, 'Lĩnh vực I · Quiz nội dung v2',
       'Câu hỏi ôn tập 3 cấp Lĩnh vực I, gắn theo từng mô đun.', 'ACTIVE', now(), now()
FROM pulse_domain1_banks ON CONFLICT (id) DO NOTHING;
CREATE TEMP TABLE pulse_domain1_questions AS
SELECT m.*, q.ordinality::int AS question_no, q.value AS question_doc,
       b.bank_id,
       md5('pulse-domain1-v2:question:' || m.module_id::text || ':' || q.ordinality::text)::uuid AS question_id,
       md5('pulse-domain1-v2:quiz:' || m.module_id::text)::uuid AS assessment_id
FROM pulse_domain1_modules m
JOIN pulse_domain1_banks b ON b.organization_id=m.organization_id
CROSS JOIN LATERAL jsonb_array_elements(m.module_doc->'questions') WITH ORDINALITY AS q(value, ordinality);
INSERT INTO assessments (id, course_id, module_id, code, version_no, title, assessment_type,
                         is_final, passing_score, status, created_by_user_id, created_at, updated_at, row_version)
SELECT md5('pulse-domain1-v2:quiz:' || module_id::text)::uuid, new_id, module_id,
       code || '-CH' || module_no || '-QUIZ', 1, 'Ôn tập · ' || (module_doc->>'title'),
       'QUIZ', false, 100, 'PUBLISHED', created_by_user_id, now(), now(), 1
FROM pulse_domain1_modules ON CONFLICT (id) DO NOTHING;
INSERT INTO questions (id, bank_id, competency_id, question_type, difficulty, content, explanation,
                       ai_generated_flag, status, created_by_user_id, created_at, updated_at)
SELECT question_id, bank_id, NULL, 'MULTIPLE_CHOICE', 'L' || tier,
       question_doc->>'text', question_doc->>'explanation', false, 'APPROVED', created_by_user_id, now(), now()
FROM pulse_domain1_questions ON CONFLICT (id) DO NOTHING;
INSERT INTO assessment_questions (assessment_id, question_id, points, sort_order)
SELECT assessment_id, question_id, 1, question_no FROM pulse_domain1_questions
ON CONFLICT (assessment_id, question_id) DO NOTHING;
INSERT INTO question_options (id, question_id, content, is_correct, sort_order, created_at, updated_at)
SELECT md5('pulse-domain1-v2:option:' || q.question_id::text || ':' || o.ordinality::text)::uuid,
       q.question_id, o.value #>> '{}', (o.ordinality - 1)::int = (q.question_doc->>'correctIndex')::int,
       o.ordinality::int, now(), now()
FROM pulse_domain1_questions q
CROSS JOIN LATERAL jsonb_array_elements(q.question_doc->'options') WITH ORDINALITY AS o(value, ordinality)
ON CONFLICT (id) DO NOTHING;
INSERT INTO assessments (id, course_id, code, version_no, title, assessment_type, is_final,
                         passing_score, status, created_by_user_id, created_at, updated_at, row_version)
SELECT md5('pulse-domain1-v2:final:' || new_id::text)::uuid, new_id, code || '-FINAL', 1,
       'Bài cuối khóa · ' || (doc->>'title'), 'FINAL', true, 70, 'PUBLISHED', created_by_user_id, now(), now(), 1
FROM pulse_domain1_courses ON CONFLICT (id) DO NOTHING;
CREATE TEMP TABLE pulse_domain1_assignments AS
SELECT s.*, a.key AS track_code, a.value AS assignment_doc,
       md5('pulse-domain1-v2:task:' || s.new_id::text || ':' || a.key)::uuid AS task_id
FROM pulse_domain1_courses s
CROSS JOIN LATERAL jsonb_each(s.doc->'assignments') AS a(key, value);
INSERT INTO practical_task_templates (id, organization_id, related_course_id, title, description,
                                      expected_output, general_marking_criteria, source_type,
                                      status, created_by_user_id, created_at, updated_at)
SELECT task_id, organization_id, new_id, assignment_doc->>'title',
       concat_ws(E'\\n\\n', assignment_doc->>'situation', assignment_doc->>'prompt',
         (SELECT string_agg('- ' || (item #>> '{}'), E'\\n') FROM jsonb_array_elements(assignment_doc->'caseFacts') item),
         (SELECT string_agg('- ' || (item #>> '{}'), E'\\n') FROM jsonb_array_elements(assignment_doc->'requirements') item)),
       (SELECT string_agg('- ' || (item #>> '{}'), E'\\n') FROM jsonb_array_elements(assignment_doc->'deliverables') item),
       jsonb_build_object('track', track_code, 'rubric', assignment_doc->'rubric', 'pass', assignment_doc->'pass',
         'minimumCriterion', assignment_doc->'minimumCriterion', 'contentVersion', 'domain1.v2-current-schema'),
       'MANUAL', 'ACTIVE', created_by_user_id, now(), now()
FROM pulse_domain1_assignments ON CONFLICT (id) DO NOTHING;
DO $$ BEGIN
  IF (SELECT count(*) FROM pulse_domain1_modules) <> 9
     OR (SELECT count(*) FROM pulse_domain1_slides) <> 99
     OR (SELECT count(*) FROM pulse_domain1_questions) <> 45
     OR (SELECT count(*) FROM pulse_domain1_assignments) <> 18
     OR EXISTS (SELECT 1 FROM pulse_domain1_courses s WHERE
       (SELECT count(*) FROM course_modules m WHERE m.course_id=s.new_id AND m.status='ACTIVE') <> 3
       OR (SELECT count(*) FROM lessons l JOIN course_modules m ON m.id=l.module_id WHERE m.course_id=s.new_id AND l.status='ACTIVE') <> 33
       OR (SELECT count(*) FROM assessments a WHERE a.course_id=s.new_id AND a.module_id IS NOT NULL AND a.status='PUBLISHED') <> 3
       OR (SELECT count(*) FROM course_learning_outcomes o WHERE o.course_id=s.new_id) <> 3
       OR (SELECT count(*) FROM practical_task_templates t WHERE t.related_course_id=s.new_id) <> 6)
  THEN RAISE EXCEPTION 'Không đủ dữ liệu phiên bản v2; rollback.'; END IF;
END $$;
SELECT s.code, s.new_id, c.version_no,
       (SELECT count(*) FROM course_modules m WHERE m.course_id=s.new_id) modules,
       (SELECT count(*) FROM lessons l JOIN course_modules m ON l.module_id=m.id WHERE m.course_id=s.new_id) slides,
       (SELECT count(*) FROM enrollments e WHERE e.course_id=s.old_id) preserved_v1_enrollments,
       (SELECT count(*) FROM enrollments e WHERE e.course_id=s.new_id) new_v2_enrollments
FROM pulse_domain1_courses s JOIN courses c ON c.id=s.new_id ORDER BY s.code;
${dryRun ? 'ROLLBACK;' : 'COMMIT;'}
`;

const basename = organizationId ? `domain1-${prefix.toLowerCase()}-${organizationId}-v2` : 'domain1-v2';
const filename = `${basename}.${dryRun ? 'dry-run' : 'apply'}.sql`;
fs.writeFileSync(path.join(root, filename), sql, 'utf8');
process.stdout.write(`${filename}: ${Buffer.byteLength(sql)} bytes; ${dryRun ? 'ROLLBACK' : 'COMMIT'}; 3 courses, 9 modules, 9 outcomes, 99 lessons, 45 questions, 18 role tasks.\n`);
