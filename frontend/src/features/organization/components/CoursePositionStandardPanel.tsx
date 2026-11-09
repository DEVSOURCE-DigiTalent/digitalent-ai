import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, LockKeyhole } from 'lucide-react';
import { useCourse } from '@/hooks/use-assignments';
import { useAllActiveCompetencies } from '@/hooks/use-competencies';
import { TT02_COMPETENCY_CODES } from '@/features/competency/utils/requirement-domains';
import type { CeilingCourse, CeilingDomain } from '@/services/capability-ceiling.service';
import './course-position-standard.css';

const LEVEL_NAMES = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const TT02_CODES = new Set<string>(TT02_COMPETENCY_CODES);

interface Props {
  domain: CeilingDomain;
  course: CeilingCourse;
  isSelectedToBuy: boolean;
  scopeLabel: string;
  onSelectToBuy: () => void;
}

/** One matrix cell represents one actual course; purchasing controls the ceiling, not position standards. */
export function CoursePositionStandardPanel({ domain, course, isSelectedToBuy, scopeLabel, onSelectToBuy }: Props) {
  useUiLanguage();
  const { data: courseDetail, isLoading: courseLoading } = useCourse(course.courseId ?? undefined);
  const { data: competencyData } = useAllActiveCompetencies();
  const isLicensed = course.level === 1 || course.isUnlocked === true;
  const totalSeats = (courseDetail?.seatsPurchased ?? course.seatsPurchased ?? 0) + (courseDetail?.seatsGranted ?? 0);
  const availableSeats = courseDetail?.seatsAvailable;
  const usedSeats = courseDetail?.seatsUsed ?? (availableSeats == null ? null : Math.max(0, totalSeats - availableSeats));
  const taught = new Map((course.competencies ?? []).map((item) => [item.competencyId, item.targetLevel]));
  const coveredCompetencies = (competencyData ?? []).filter((item) => TT02_CODES.has(item.frameworkCode ?? '') && item.categoryId === domain.categoryId && (taught.get(item.id) ?? 0) >= course.level);

  return <section className="cp-standard cp-standard--course" aria-label={translateUi(`Khóa học ${course.title ?? domain.name}`)}>
    <div className="cp-standard__heading">
      <span className="cp-standard__icon"><BookOpen size={19} /></span>
      <div className="cp-standard__title">
        <span className="cp-standard__eyebrow">{course.code} · {translateUi(domain.name)} · {translateUi(LEVEL_NAMES[course.level])}</span>
        <h3>{translateUi(course.title) || `${domain.name} · ${LEVEL_NAMES[course.level]}`}</h3>
      </div>
      <div className="cp-standard__header-actions">
      <span className={`cp-standard__license${course.level > 1 && course.isUnlocked !== true ? ' is-locked' : ''}`}>
        {course.level > 1 && course.isUnlocked !== true ? <LockKeyhole size={13} /> : <Check size={13} />}
        {!course.courseId ? translateUi('Chưa có khóa học') : course.level === 1 ? translateUi('Miễn phí') : isLicensed ? translateUi('Đã có quyền học') : 'Chưa mua khóa học'}
      </span>
      {course.courseId && <Link to={`/enterprise/courses?focus=${encodeURIComponent(course.courseId)}`}>{translateUi("Xem khóa học ")}<ArrowRight size={13} /></Link>}
      </div>
    </div>
    {course.level > 1 && isLicensed && <div className="cp-standard__seats" aria-label={translateUi("Suất học của khóa")}>
      <div><span>{translateUi("Tổng suất học")}</span><strong>{totalSeats}</strong></div>
      <div><span>{translateUi("Đã sử dụng")}</span><strong>{usedSeats ?? '—'}</strong></div>
      <div className={availableSeats === 0 ? 'is-exhausted' : 'is-available'}><span>{translateUi("Còn lại")}</span><strong>{availableSeats ?? '—'}</strong></div>
      {availableSeats === 0 && <p>{translateUi("Đã hết suất. Mua thêm để phân công người mới.")}</p>}
    </div>}
    <div className="cp-standard__mapping">
      <div className="cp-standard__mapping-section">
        <strong>{translateUi("Học phần ")}{courseDetail?.modules?.length ? <small>{courseDetail.modules.length}</small> : null}</strong>
        {courseDetail?.modules?.length ? <ol className="cp-standard__modules">{[...courseDetail.modules].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((module) => <li key={module.id} title={translateUi(module.title)}>{module.title.replace(/^Học phần\s*\d+\s*:\s*/iu, '')}</li>)}</ol> : <p className="cp-standard__description">{courseLoading ? 'Đang tải học phần…' : 'Chưa có học phần.'}</p>}
      </div>
      <div className="cp-standard__mapping-section">
        <strong>{translateUi("Năng lực đáp ứng ")}<small>{coveredCompetencies.length}</small></strong>
        <div className="cp-standard__competencies">{coveredCompetencies.map((item) => <span key={item.id} title={translateUi(item.name)}>{item.frameworkCode} · {item.name}</span>)}</div>
      </div>
    </div>
    {course.courseId && course.level > 1 && <div className="cp-standard__actions">
      {course.courseId && course.level > 1 && course.code && <>
        <button type="button" onClick={onSelectToBuy}>{isSelectedToBuy ? 'Bỏ khỏi giỏ' : translateUi('Thêm vào giỏ')}</button>
        <Link className={isLicensed && availableSeats !== 0 ? '' : 'is-primary'} to={`/enterprise/courses/checkout?courses=${encodeURIComponent(course.code)}`}>{isLicensed ? translateUi('Mua thêm suất') : translateUi('Mua suất học')} <ArrowRight size={13} /></Link>
      </>}
      {course.courseId && course.level > 1 && course.isUnlocked !== true && <span className="cp-standard__purchase-note">{translateUi("Mua suất học để thiết lập phạm vi ")}{scopeLabel}.</span>}
    </div>}
  </section>;
}
