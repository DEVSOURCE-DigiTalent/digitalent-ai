import fs from 'node:fs';
import crypto from 'node:crypto';

// Run scripts/readDocxText.ps1 for each document into docs/source-text first.
const sourceDir='docs/source-text';
const files=fs.readdirSync('tai lieu').filter(name=>name.endsWith('.docx')).sort();
const read=name=>JSON.parse(fs.readFileSync(`${sourceDir}/${name.replace(/\.docx$/,'.json')}`,'utf8').replace(/^\uFEFF/,''));
const sources=files.map(name=>({file:name,sha256:crypto.createHash('sha256').update(fs.readFileSync(`tai lieu/${name}`)).digest('hex'),paragraphs:read(name).length,
  role:name.includes('mien6')?'Giáo trình AI · 3 khóa / 9 module':name.includes('linhvuc')?'Giáo trình đang dùng trong lớp học':name.includes('khung-')?'Khung chương trình · bản dự thảo':'Ma trận vị trí · benchmark đề xuất',reviewStatus:'PENDING'}));
const lines=read('giaotrinh-mien6-AI.docx');
const courses=[];let course;let lesson;let section;
const headings={'Mục tiêu học tập':'objectives','Nội dung':'theory','Bài thực hành':'practice'};
for(const line of lines){
  const match=line.match(/^KHÓA M6-([FIA])\s*[—–-]\s*(.+?)(?<!\d)$/u);
  if(match){course={id:`AI-${match[1]}`,title:match[2],modules:[],source:'giaotrinh-mien6-AI.docx'};courses.push(course);lesson=null;section=null;continue;}
  if(!course)continue;
  const moduleMatch=line.match(/^MODULE\s+(\d+)\s*[—–-]\s*(.+)$/u);
  if(moduleMatch){lesson={id:`${course.id}-M${moduleMatch[1]}`,title:moduleMatch[2],competenceCode:`6.${moduleMatch[1]}`,objectives:[],theory:[],practice:[],product:''};course.modules.push(lesson);section=null;continue;}
  if(/^ĐÁNH GIÁ CUỐI KHÓA/u.test(line)){lesson=null;section=null;continue;}
  if(!lesson)continue;
  if(headings[line]){section=headings[line];continue;}
  if(['Định nghĩa','Ví dụ minh họa','Câu hỏi ôn tập'].includes(line)){section=null;continue;}
  if(line.startsWith('Sản phẩm nộp:')){lesson.product=line.replace(/^Sản phẩm nộp:\s*/,'');section=null;continue;}
  if(section)lesson[section].push(line);
}
if(courses.length!==3||courses.some(course=>course.modules.length!==3||course.modules.some(lesson=>!lesson.objectives.length||!lesson.theory.length||!lesson.product)))throw new Error('Giáo trình AI thiếu nội dung hoặc thay đổi cấu trúc; cần kiểm tra bộ đọc.');
fs.writeFileSync('src/data/frameworkSourceManifest.json',JSON.stringify({sources,aiCourses:courses},null,2)+'\n');
console.log(`${sources.length} nguồn; ${courses.length} khóa AI; ${courses.reduce((n,c)=>n+c.modules.length,0)} module AI. Không thay đổi danh mục bán/hồ sơ.`);
