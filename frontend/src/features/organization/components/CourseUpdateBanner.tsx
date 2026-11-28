import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowRight, History, Sparkles } from 'lucide-react';
import { useCourseUpdates } from '@/hooks/use-course-updates';
import './course-update-banner.css';

/**
 * On the owner's course page and the R&D workspace: a newer DigiTalent version waits for the company, or the company
 * kept its version (a quieter strip, so a "keep" pressed by mistake can still be undone). When the company's R&D
 * decides, the owner's strip only says so.
 */
export function CourseUpdateBanner() {
  useUiLanguage();
  const { data } = useCourseUpdates();
  if (data?.status === 'AVAILABLE') {
    return (
      <Link to="/enterprise/courses/updates" className="cu-banner">
        <Sparkles className="cu-banner__icon" aria-hidden="true" />
        <span className="cu-banner__text">
          <strong>{translateUi(`Có bản khóa học mới v${data.latestVersionNo} từ DigiTalent`)}</strong>
          <span>
            {data.canDecide
              ? translateUi(`${data.courses.length} khóa thay đổi. Áp dụng thì nhân viên học lại các khóa đó từ đầu.`)
              : translateUi(`${data.courses.length} khóa thay đổi. R&D của công ty đang xem và quyết định.`)}
          </span>
        </span>
        <span className="cu-banner__action">
          {translateUi(data.canDecide ? 'Xem và quyết định' : 'Xem')}<ArrowRight size={16} aria-hidden="true" />
        </span>
      </Link>
    );
  }

  if (data?.status === 'KEPT') {
    return (
      <Link to="/enterprise/courses/updates" className="cu-banner cu-banner--kept">
        <History className="cu-banner__icon" aria-hidden="true" />
        <span className="cu-banner__text">
          <strong>{translateUi(`Công ty đang giữ v${data.currentVersionNo}, chưa áp dụng v${data.latestVersionNo}`)}</strong>
          {data.canDecide && <span>{translateUi('Đổi ý thì vẫn áp dụng bản mới được bất cứ lúc nào.')}</span>}
        </span>
        <span className="cu-banner__action">{translateUi('Xem lại')}<ArrowRight size={16} aria-hidden="true" /></span>
      </Link>
    );
  }

  return null;
}
