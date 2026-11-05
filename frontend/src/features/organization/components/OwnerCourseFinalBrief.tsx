import { ChevronDown, ClipboardCheck, ListChecks } from 'lucide-react';
import type { CourseFinalContent } from '@/types/learning-content';
import { lessonSections } from '@/features/pulse-employee/lib/lesson-sections';
import { RichText } from '@/features/pulse-employee/components/RichText';

export function OwnerCourseFinalBrief({ content }: { content: CourseFinalContent }) {
  const sections = lessonSections(content.promptHtml);
  return <details className="owner-course-final">
    <summary>
      <span className="owner-course-final-icon"><ClipboardCheck size={23} /></span>
      <span className="owner-course-final-heading"><strong>Đề cuối khóa</strong><small>{content.title}</small></span>
      <span className="owner-course-final-count">{content.criteria.length} tiêu chí</span>
      <ChevronDown className="owner-course-final-chevron" size={19} />
    </summary>
    <div className="owner-course-final-body pu">
      <div className="owner-course-final-task">
        <h3><ListChecks size={18} /> Nội dung thực hiện</h3>
        <div className="owner-course-final-sections">
          {sections.length ? sections.map((section, index) => <section key={index} className={index === 0 ? 'is-intro' : ''}>
            {section.title && <h4>{section.title}</h4>}
            {section.body.trim() && <RichText body={section.body} />}
          </section>) : <RichText body={content.promptHtml} />}
        </div>
      </div>
      {content.criteria.length > 0 && <aside className="owner-course-final-criteria">
        <h3>Tiêu chí đánh giá</h3>
        <ol>{content.criteria.map((criterion, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span><p>{criterion}</p></li>)}</ol>
      </aside>}
    </div>
  </details>;
}
