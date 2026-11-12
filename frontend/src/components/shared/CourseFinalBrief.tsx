import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { CourseFinalContent } from '@/types/learning-content';
import { RichText } from '@/features/pulse-employee/components/RichText';

export function CourseFinalBrief({ content }: { content: CourseFinalContent }) {
  useUiLanguage();
  return <section className="pu-surface pu-pad" aria-label="Đề cuối khóa từ học liệu">
    <h3>{translateUi(content.title)}</h3><RichText body={content.promptHtml} />
    {content.criteria.length > 0 && <><h4>Yêu cầu của đề</h4><ul>{content.criteria.map((title, index) => <li key={index}>{translateUi(title)}</li>)}</ul></>}
  </section>;
}
