import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Check, Flag, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateCompetencyMilestones } from '@/hooks/use-capability-ceilings';
import { apiErrorMessage } from '@/lib/utils';
import type { CeilingDomain } from '@/services/capability-ceiling.service';
import './course-position-standard.css';

const LEVEL_NAMES = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

/**
 * Mốc năng lực doanh nghiệp của một lĩnh vực (OW-05): áp dụng cho cả doanh nghiệp, đặt được trước khi mua khóa.
 * Báo cáo khảo sát dùng thử so kết quả nhân viên với mốc này để quyết định mua khóa nào.
 */
export function DomainMilestonePanel({ domain, canEdit }: { domain: CeilingDomain; canEdit: boolean }) {
  useUiLanguage();
  const saved = domain.milestoneLevel ?? 0;
  const suggested = saved ? 0 : Math.max(1, Math.min(3, domain.suggestedCeiling || 1));
  const [selected, setSelected] = useState(saved || suggested);
  const update = useUpdateCompetencyMilestones();
  const course = (level: number) => domain.courses.find((item) => item.level === level);
  const code = (level: number) => course(level)?.code ?? translateUi(`Cấp ${level}`);

  const save = async (level: number) => {
    try {
      await update.mutateAsync([{ categoryId: domain.categoryId, level }]);
      toast.success(level ? `Đã đặt mốc ${code(level)} cho doanh nghiệp.` : 'Đã bỏ mốc của lĩnh vực.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Chưa lưu được mốc năng lực.'));
    }
  };

  return (
    <section className="cp-standard cp-standard--domain" aria-label={translateUi(`Mốc năng lực doanh nghiệp · ${domain.name}`)}>
      <div className="cp-standard__course-options" role="group" aria-label={translateUi(`Chọn mốc cho lĩnh vực ${domain.name}`)}>
        {[1, 2, 3].map((level) => {
          const item = course(level);
          return (
            <button key={level} type="button" className={`cp-standard__course-option${selected === level ? ' is-active' : ''}`}
              aria-pressed={selected === level} disabled={!canEdit || update.isPending} onClick={() => setSelected(level)}>
              <span className="cp-standard__course-option-head">
                <strong>{translateUi(LEVEL_NAMES[level])}</strong>
                <small>{code(level)}</small>
              </span>
              <span>{item?.title ? translateUi(item.title) : translateUi('Chưa có khóa học')}</span>
              <em>
                {level === saved ? <span className="cp-milestone-tag"><Flag size={11} aria-hidden="true" />{translateUi('Mốc hiện tại')}</span>
                  : level === suggested ? <span className="cp-milestone-tag is-suggested">{translateUi('Gợi ý theo vị trí')}</span>
                  : level === 1 ? translateUi('Miễn phí') : item?.isUnlocked === false ? translateUi('Chưa mua khóa học') : translateUi('Đã mở quyền học')}
              </em>
              {selected === level && <Check size={15} className="cp-standard__course-option-check" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="cp-standard__footer">
        <span>{saved ? translateUi(`Mốc hiện tại: ${code(saved)}`) : translateUi('Chưa đặt mốc')}</span>
        <div className="cp-milestone-actions">
          {saved > 0 && canEdit && (
            <button type="button" className="cp-milestone-clear" disabled={update.isPending} onClick={() => save(0)}>{translateUi('Bỏ mốc')}</button>
          )}
          <button type="button" className="cp-standard__save" disabled={!canEdit || update.isPending || !selected || selected === saved} onClick={() => save(selected)}>
            <Save size={15} /> {update.isPending ? translateUi('Đang lưu…') : selected === saved ? translateUi('Đang áp dụng') : translateUi('Lưu mốc')}
          </button>
        </div>
      </div>
    </section>
  );
}
