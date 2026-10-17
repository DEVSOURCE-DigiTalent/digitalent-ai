import type { CourseFinalContent } from '@/types/learning-content';
import { RichText } from '@/features/pulse-employee/components/RichText';

export function CourseFinalBrief({ content }: { content: CourseFinalContent }) {
  return <section className="pu-surface pu-pad" aria-label="Đề cuối khóa từ học liệu">
    <h3>{content.title}</h3><RichText body={content.promptHtml} />
    {content.criteria.length > 0 && <><h4>Yêu cầu của đề</h4><ul>{content.criteria.map((title, index) => <li key={index}>{title}</li>)}</ul></>}
  </section>;
}
