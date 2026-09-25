import fs from 'node:fs';

const result = {};
const sectionNames = new Map([
  ['Mục tiêu học tập', 'objectives'],
  ['Định nghĩa', 'definitions'],
  ['Nội dung', 'theory'],
  ['Bài thực hành', 'practice'],
  ['Câu hỏi ôn tập', 'quizRaw'],
]);
const questionPattern = /^\d+\.\s+(.+?)\s+A\.\s+(.+?)\s+B\.\s+(.+?)\s+C\.\s+(.+?)\s+D\.\s+(.+?)\s+Đáp án:\s*([ABCD])\s*[—–-]\s*(.+)$/u;

for (let area = 1; area <= 5; area++) {
  const raw = fs.readFileSync(`doc-${area}.json`, 'utf8').replace(/^\uFEFF/, '');
  let lines = JSON.parse(raw);
  if (area === 1 && lines[0] === 'Table of Contents') {
    const actual = lines.findIndex((line, index) => index > 10 && /^KHÓA M1-F\s*[—–-]/u.test(line) && !/\d$/.test(line));
    if (actual < 0) throw new Error('Could not skip area 1 table of contents');
    lines = lines.slice(actual);
  }
  let course = null;
  let module = null;
  let section = null;
  for (const line of lines) {
    const courseMatch = line.match(/^KHÓA M([1-5])-([FIA])\s*[—–-]\s*(.+)$/u);
    if (courseMatch) {
      const id = `A${courseMatch[1]}-${courseMatch[2]}`;
      course = result[id] = { id, source: `giaotrinh-linhvuc${area}.docx`, introduction: '', modules: [], finalAssessment: [] };
      module = null;
      section = 'introduction';
      continue;
    }
    if (!course) continue;
    const moduleMatch = line.match(/^MODULE\s+(\d+)\s*[—–-]\s*(.+)$/u);
    if (moduleMatch) {
      const index = Number(moduleMatch[1]);
      module = { id: `${course.id}-M${index}`, title: moduleMatch[2], objectives: [], definitions: [], theory: [], practice: [], product: '', quiz: [] };
      course.modules.push(module);
      section = null;
      continue;
    }
    if (/^ĐÁNH GIÁ CUỐI KHÓA/u.test(line)) { module = null; section = 'finalAssessment'; continue; }
    if (!module) {
      if (section === 'introduction' && !/^Mức\s/u.test(line)) course.introduction += `${course.introduction ? ' ' : ''}${line}`;
      if (section === 'finalAssessment') course.finalAssessment.push(line);
      continue;
    }
    if (/^Năng lực\s+\d+\.\d+/u.test(line)) { module.competence = line; continue; }
    if (sectionNames.has(line)) { section = sectionNames.get(line); continue; }
    if (/^Sản phẩm nộp:/u.test(line)) { module.product = line.replace(/^Sản phẩm nộp:\s*/u, ''); continue; }
    if (section === 'quizRaw') {
      const questionMatch = line.match(questionPattern);
      if (questionMatch) {
        const [, q, a, b, c, d, letter, explanation] = questionMatch;
        module.quiz.push({ q, opts: [a,b,c,d], ans: letter.charCodeAt(0) - 65, exp: explanation });
      } else if (/^\d+\./u.test(line)) {
        throw new Error(`Could not parse ${module.id} question: ${line}`);
      }
      continue;
    }
    if (section && Array.isArray(module[section])) module[section].push(line);
  }
}

const courses = Object.values(result);
const moduleCount = courses.reduce((sum, course) => sum + course.modules.length, 0);
const quizCount = courses.reduce((sum, course) => sum + course.modules.reduce((total, module) => total + module.quiz.length, 0), 0);
if (courses.length !== 15 || moduleCount !== 63 || quizCount !== 315) {
  throw new Error(`Unexpected curriculum size: ${courses.length} courses, ${moduleCount} modules, ${quizCount} questions`);
}
for (const course of courses) {
  if (!course.finalAssessment.length) throw new Error(`Missing final assessment for ${course.id}`);
  for (const module of course.modules) {
    if (!module.theory.length || !module.practice.length || !module.objectives.length || module.quiz.length !== 5) throw new Error(`Incomplete lesson ${module.id}`);
  }
}
fs.writeFileSync('src/data/curriculumLessons.json', JSON.stringify(result));
console.log(`Generated ${courses.length} courses, ${moduleCount} lessons and ${quizCount} review questions from the five project textbooks.`);
