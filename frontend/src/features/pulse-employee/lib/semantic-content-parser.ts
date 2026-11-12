/**
 * semantic-content-parser.ts
 * Bóc tách nội dung giáo trình Thông tư 02 thành các cấu trúc dữ liệu ngữ nghĩa
 * phục vụ việc hiển thị giao diện học tập trực quan (Semantic Cards).
 */

export interface GlossaryTerm {
  name: string;
  law: string | null;
  definition: string;
}

export interface StepperStep {
  step: number;
  title: string;
  text: string;
}

export type SectionKind =
  | 'TARGET'
  | 'GLOSSARY'
  | 'CASE'
  | 'STEPPER'
  | 'PITFALLS'
  | 'PRACTICE'
  | 'CHECK'
  | 'SOURCE'
  | 'PROSE';

export function detectSectionKind(title: string): SectionKind {
  const t = title.trim();
  if (/^Tự kiểm tra$/i.test(t)) return 'CHECK';
  if (/^Nguồn tham khảo$/i.test(t)) return 'SOURCE';
  if (/^(Mục tiêu|Chuẩn đầu ra)/i.test(t)) return 'TARGET';
  if (/^(Định nghĩa quy chuẩn|Quy chuẩn|Định nghĩa|Thuật ngữ)/i.test(t)) return 'GLOSSARY';
  if (/^(Quy trình tác nghiệp|Các bước thực hiện|Quy trình)/i.test(t)) return 'STEPPER';
  if (/^(Các lỗi thường gặp|Lỗi thường gặp|Lưu ý nghiệp vụ|Cảnh báo|Bẫy dữ liệu)/i.test(t)) return 'PITFALLS';
  if (/^(Tình huống|Ví dụ thực tế|Tình huống nghiệp vụ|Tình huống & Ví dụ)/i.test(t)) return 'CASE';
  if (/^(Đề bài thực hành|Thực hành có hướng dẫn|Nhiệm vụ thực hành|Yêu cầu sản phẩm|Tiêu chí nghiệm thu)/i.test(t)) return 'PRACTICE';
  return 'PROSE';
}

/** Trích xuất các gạch đầu dòng mục tiêu học tập */
export function parseObjectives(body: string): string[] {
  if (!body) return [];
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const items: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*•]\s+/.test(trimmed)) {
      const clean = trimmed.replace(/^[-*•]\s+/, '').trim();
      if (clean) items.push(clean);
    }
  }
  return items;
}

/** Trích xuất danh mục định nghĩa quy chuẩn & điều luật TT02 */
export function parseGlossary(body: string): GlossaryTerm[] {
  if (!body) return [];
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const terms: GlossaryTerm[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('-') && !trimmed.startsWith('*') && !trimmed.startsWith('•')) continue;
    const clean = trimmed.replace(/^[-*•]\s+/, '');
    const colonIdx = clean.indexOf(':');
    if (colonIdx === -1) continue;

    const termPart = clean.slice(0, colonIdx).trim();
    const definition = clean.slice(colonIdx + 1).trim();
    if (!termPart || !definition) continue;

    // Tìm xem có điều luật trong ngoặc không, vd: (Điều 2, TT 02/2025/TT-BGDĐT)
    const lawMatch = termPart.match(/\(([^)]*(?:Điều|TT|Thông tư)[^)]*)\)/i);
    const law = lawMatch ? lawMatch[1]!.trim() : null;
    const name = termPart.replace(/\([^)]*(?:Điều|TT|Thông tư)[^)]*\)/i, '').trim();

    terms.push({
      name: name || termPart,
      law,
      definition,
    });
  }

  return terms;
}

/** Trích xuất các bước quy trình tác nghiệp (1. ... 2. ... 3. ...) */
export function parseStepper(body: string): StepperStep[] {
  if (!body) return [];
  const cleanBody = body.replace(/\r\n/g, '\n').trim();

  // Kiểm tra nếu có dạng: "1. Thao tác... 2. Thao tác..."
  const stepRegex = /(?:^|\s)(\d+)[\.\)]\s+([\s\S]*?)(?=(?:\s\d+[\.\)]\s+)|$)/g;
  const steps: StepperStep[] = [];
  let match: RegExpExecArray | null;

  while ((match = stepRegex.exec(cleanBody)) !== null) {
    const stepNum = parseInt(match[1]!, 10);
    const stepContent = match[2]!.trim();
    if (stepContent && stepNum >= 1 && stepNum <= 20) {
      // Tách tiêu đề ngắn nếu có chấm câu
      const firstSentenceEnd = stepContent.indexOf('.');
      let title = `Bước ${stepNum}`;
      let text = stepContent;
      if (firstSentenceEnd > 0 && firstSentenceEnd < 40) {
        title = stepContent.slice(0, firstSentenceEnd).trim();
        text = stepContent.slice(firstSentenceEnd + 1).trim();
      }
      steps.push({ step: stepNum, title, text });
    }
  }

  return steps;
}

/** Trích xuất các lỗi thường gặp / bẫy dữ liệu */
export function parsePitfalls(body: string): string[] {
  if (!body) return [];
  const cleanBody = body.replace(/^Lỗi thường gặp[\.\:]\s*/i, '').replace(/\r\n/g, '\n').trim();

  // Thử tách theo dấu chấm phẩy ; nếu viết liền một đoạn
  if (cleanBody.includes(';')) {
    const items = cleanBody
      .split(';')
      .map((s) => s.trim().replace(/^[-*•\d\.\)]\s*/, ''))
      .filter(Boolean);
    if (items.length >= 2) return items;
  }

  // Tách theo gạch đầu dòng
  const lines = cleanBody.split('\n');
  const items: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*•]\s+/.test(trimmed)) {
      const clean = trimmed.replace(/^[-*•]\s+/, '').trim();
      if (clean) items.push(clean);
    }
  }

  if (items.length > 0) return items;

  // Tách theo câu nếu không có gạch đầu dòng
  return cleanBody
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

