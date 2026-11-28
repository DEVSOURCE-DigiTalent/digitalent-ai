import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, Clock, Lock, ShieldCheck, Target, Zap } from 'lucide-react';
import type { PulseCourseSummary, PulseDomain, PulseOverview } from '@/services/pulse.service';
import { courseLabel, courseStatusText, courseTone, doneLabel, showsProgress } from '../lib/course-state';
import { capNote, levelName, pad2 } from '../lib/labels';
import { isBeyond, meetsRequirement, remainingRequired, requirementSource, roadmapDomains, visibleCourses } from '../lib/requirement';
import { PULSE_PATHS } from '../lib/paths';
import { contentSwitch } from '../lib/content-switch';
import { Bar, PuLink } from './ui';

export function toSentenceCase(str: string): string {
  if (!str) return '';
  const s = str.trim();
  if (s === s.toUpperCase() && s.length > 3) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s;
}

/** Ba chấm cấp độ: ●○○ Cơ bản, ●●○ Trung cấp, ●●● Nâng cao. */
export function LevelDots({ level }: { level: number }) {
  useUiLanguage();
  return (
    <span className="pu-level-dots" aria-hidden>
      {[1, 2, 3].map((n) => <i key={n} className={n <= level ? 'on' : undefined} />)}
    </span>
  );
}

/**
 * Lộ trình của nhân viên: mỗi lĩnh vực một hàng, mỗi cấp độ một cột. Ô là khóa bắt buộc (Cơ bản → mức tối thiểu doanh
 * nghiệp yêu cầu) hoặc khóa học vượt (doanh nghiệp đã mua, cao hơn mức tối thiểu); khóa chưa mua ở trên mức tối thiểu để trống.
 */
export function RoadmapPlan({
  overview,
  variant = 'regular',
  caption,
  onSelectCourse,
}: {
  overview: PulseOverview;
  variant?: 'regular' | 'compact';
  caption: string;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  useUiLanguage();
  const domains = roadmapDomains(overview);

  return (
    <div className="pu-matrix-wrapper">
      <div className="pu-plan-scroll">
        <table className={`pu-matrix-table${variant === 'compact' ? ' compact' : ''}`}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="pu-matrix-col-domain">
                <div className="pu-matrix-th-content">
                  <span className="pu-matrix-th-title">{translateUi("Lĩnh vực Năng lực")}</span>
                </div>
              </th>
              {[1, 2, 3].map((level) => (
                <th scope="col" key={level} className={`pu-matrix-col-tier lv${level}`}>
                  <div className="pu-matrix-th-content">
                    <div className="pu-matrix-th-badge">
                      <span>{levelName(level)}</span>
                      <LevelDots level={level} />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domains.map((domain, domainIdx) => {
              const domainCourses = visibleCourses(overview, domain);
              const required = domain.pathTop > 0;
              const isDomainMet = required && meetsRequirement(domain);
              const needsAttention = required && !isDomainMet;
              const remainingCourses = remainingRequired(overview, domain).length;
              const source = requirementSource(domain, overview.person);

              const row = [1, 2, 3].map((tier) => domainCourses.find((c) => c.tier === tier));

              return (
                <tr key={domain.categoryId} className={`pu-matrix-row${needsAttention ? ' needs-attention' : ''}`}>
                  {/* Cột 1: Thông tin Lĩnh vực Năng lực & Đối sánh (Phương án 1: 2 dòng thông thoáng) */}
                  <th scope="row" className="pu-matrix-domain-th">
                    <div className="pu-matrix-domain-card">
                      <div className="pu-matrix-domain-head">
                        <span className="pu-matrix-domain-tag">Lĩnh vực {pad2(domainIdx + 1)}</span>
                        {isDomainMet ? (
                          <span className="pu-matrix-domain-status met">
                            <Check size={11} strokeWidth={3} />{translateUi(" Đạt yêu cầu")}</span>
                        ) : required ? (
                          <span className="pu-matrix-domain-status attention">
                            <AlertTriangle size={11} />{translateUi(" Còn ")}{remainingCourses}{translateUi(" khóa bắt buộc")}</span>
                        ) : (
                          <span className="pu-matrix-domain-status gap">{translateUi("Không bắt buộc")}</span>
                        )}
                      </div>

                      <h3 className="pu-matrix-domain-name">
                        {toSentenceCase(domain.name)}
                      </h3>

                      {/* Dải đối sánh 2 dòng riêng biệt: không rớt chữ, rõ ràng */}
                      <div className="pu-matrix-domain-meta">
                        <div className="pu-matrix-meta-row" title={required ? `${source} yêu cầu tối thiểu ${levelName(domain.pathTop)}` : undefined}>
                          <span className="pu-matrix-meta-label">
                            <Target size={11} className="pu-meta-icon text-amber-600" />
                            <span>Yêu cầu tối thiểu:</span>
                          </span>
                          <strong className={`pu-matrix-meta-val ${needsAttention ? 'attention' : 'target'}`}>
                            {required ? translateUi(`Cấp ${domain.pathTop} · ${levelName(domain.pathTop)}`) : translateUi('Không bắt buộc')}
                          </strong>
                        </div>

                        <div className="pu-matrix-meta-row">
                          <span className="pu-matrix-meta-label">
                            {isDomainMet ? (
                              <Check size={11} strokeWidth={3} className="pu-meta-icon text-emerald-600" />
                            ) : (
                              <span className="pu-meta-dot" />
                            )}
                            <span>Mức đã đạt:</span>
                          </span>
                          <strong
                            className={`pu-matrix-meta-val ${
                              isDomainMet
                                ? 'met'
                                : domain.verified > 0
                                  ? 'current'
                                  : 'unmet'
                            }`}
                          >
                            {isDomainMet
                              ? translateUi(`Cấp ${domain.verified} · ${levelName(domain.verified)}`)
                              : domain.verified > 0
                                ? translateUi(`Cấp ${domain.verified} · ${levelName(domain.verified)}`)
                                : translateUi('Chưa đạt')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </th>

                  {/* 3 Cột Cấp độ: Cấp 1, Cấp 2, Cấp 3 */}
                  {row.map((course, index) => {
                    const tier = index + 1;
                    const notBought = overview.courses.some(
                      (c) => c.categoryId === domain.categoryId && c.tier === tier && c.zone === 'ABOVE_CEILING'
                    );
                    return (
                      <td key={index} className="pu-matrix-cell-td">
                        {course ? (
                          <PlanCell
                            course={course}
                            domain={domain}
                            requirementGap={needsAttention && course.zone === 'PATH' && !course.approved}
                            joined={Boolean(row[index + 1])}
                            onSelectCourse={onSelectCourse}
                          />
                        ) : (
                          <div className="pu-matrix-empty-cell" aria-label={notBought ? 'Doanh nghiệp chưa mua khóa' : 'Không có khóa'}>
                            <span className="pu-matrix-empty-dash">—</span>
                            <span className="pu-matrix-empty-hint">
                              {notBought ? 'Doanh nghiệp chưa mua khóa' : 'Không có khóa'}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanCell({
  course,
  domain,
  requirementGap,
  joined,
  onSelectCourse,
}: {
  course: PulseCourseSummary;
  domain: PulseDomain;
  requirementGap: boolean;
  joined: boolean;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  useUiLanguage();
  const beyond = isBeyond(course);
  const isTarget = course.zone === 'PATH' && course.tier === domain.pathTop;
  const isDone = course.approved || course.slotStatus === 'COMPLETED';
  const isInProgress = course.slotStatus === 'IN_PROGRESS';
  const isPreTest = course.slotStatus === 'PRE_ASSESSMENT' || course.canStartPreAssessment;
  const isWaiting = course.slotStatus === 'PRE_REVIEW' || course.slotStatus === 'IN_REVIEW';
  const isPurchaseNeeded = course.slotStatus === 'PURCHASE_NEEDED';
  const isLocked = course.slotStatus === 'AFTER_PRIOR_LEVEL' || course.zone === 'ABOVE_CEILING';
  const switchInfo = isDone ? null : contentSwitch(course.contentSwitchAt);

  const statusClass = isDone
    ? 'is-completed'
    : isInProgress
      ? 'is-in-progress'
      : isPreTest
        ? 'is-pretest'
        : isWaiting
          ? 'is-waiting'
          : isLocked || isPurchaseNeeded
            ? 'is-locked'
            : 'is-standard';

  return (
    <div className={`pu-matrix-card lv${course.tier} ${statusClass}${beyond ? ' is-beyond' : ''}${requirementGap ? ' required-gap' : ''}${joined ? ' joined' : ''}`}>
      {/* Đầu thẻ: Cấp độ & Badge trạng thái (không hiện mã khóa) */}
      <div className="pu-mcard-top">
        <span className="pu-mcard-tier">Khóa {levelName(course.tier)}</span>

        <div className="pu-mcard-badges">
          {isDone && (
            <span className="pu-mcard-badge done" title="Đã được thẩm định công nhận">
              <Check size={10} strokeWidth={3} /> Đạt
            </span>
          )}
          {isInProgress && (
            <span className="pu-mcard-badge learning" title={translateUi(`Đã học ${course.progressPercent}%`)}>
              {course.progressPercent}%
            </span>
          )}
          {isPreTest && !isDone && (
            <span className="pu-mcard-badge pretest" title="Có bài kiểm tra vượt cấp để miễn học">
              <Zap size={10} /> Test
            </span>
          )}
          {isWaiting && (
            <span className="pu-mcard-badge waiting" title="Chờ đánh giá bài kiểm tra">
              <Clock size={10} /> Chờ
            </span>
          )}
          {switchInfo && (
            <span className="pu-mcard-badge attention"
              title={translateUi(`Khóa chuyển sang nội dung mới ngày ${switchInfo.date}. Học xong trước hạn để giữ kết quả.`)}>
              <Clock size={10} />{translateUi(` Đổi ${switchInfo.date}`)}</span>
          )}
          {isTarget && (
            <span className={`pu-mcard-badge ${requirementGap ? 'attention' : 'target'}`} title="Mức tối thiểu doanh nghiệp yêu cầu">
              <Target size={10} />{translateUi(" Mức yêu cầu")}</span>
          )}
        </div>
      </div>

      {/* Tên khóa học - Click để xem Đề cương */}
      <button
        type="button"
        className="pu-mcard-title-btn"
        onClick={onSelectCourse ? () => onSelectCourse(course) : undefined}
        title="Bấm để xem nhanh đề cương & điều kiện miễn học"
      >
        {toSentenceCase(course.title)}
      </button>

      {/* Thời lượng & Mô đun */}
      <div className="pu-mcard-meta">
        <span>{course.moduleCount || 3} mô đun</span>
        <span>·</span>
        <span>Ước tính ~06 giờ</span>
      </div>

      {/* Progress track nếu đang học */}
      {isInProgress && showsProgress(course) && (
        <div className="pu-mcard-prog-track">
          <div
            className="pu-mcard-prog-fill"
            style={{ width: `${course.progressPercent}%` }}
          />
        </div>
      )}

      {/* Các nút hành động nhanh */}
      <div className="pu-mcard-actions">
        {isDone ? (
          <span className="pu-mcard-done-label" title={translateUi(doneLabel(course))}>
            <Check size={11} strokeWidth={3} />{translateUi(" Đã đạt")}</span>
        ) : isPreTest ? (
          <Link
            to={PULSE_PATHS.skipTest(course.courseId)}
            className="pu-mcard-cta-btn primary"
          >
            <Zap size={11} />
            <span>Làm test →</span>
          </Link>
        ) : isInProgress ? (
          <Link
            to={PULSE_PATHS.course(course.courseId)}
            className="pu-mcard-cta-btn primary"
          >
            <span>Học tiếp →</span>
          </Link>
        ) : isWaiting ? (
          <Link
            to={PULSE_PATHS.preAssessment(course.courseId)}
            className="pu-mcard-cta-btn secondary"
          >
            <span>Xem bài thi</span>
          </Link>
        ) : isPurchaseNeeded ? (
          <span className="pu-mcard-locked-label">
            <Lock size={10} />{translateUi(" Chờ doanh nghiệp mua")}</span>
        ) : isLocked ? (
          <span className="pu-mcard-locked-label">
            <Lock size={10} />{translateUi(" Cấp ")}{course.tier - 1}{translateUi(" trước")}</span>
        ) : (
          <Link
            to={PULSE_PATHS.course(course.courseId)}
            className="pu-mcard-cta-btn primary"
          >
            <span>{beyond ? 'Học vượt →' : 'Vào học →'}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export function StatePill({ course }: { course: PulseCourseSummary }) {
  useUiLanguage();
  return <span className={`pu-state ${courseTone(course)}`}>{courseLabel(course)}</span>;
}

/** Nút hành động chính của một khóa, theo trạng thái. */
export function CourseAction({ course, tone = 'page' }: { course: PulseCourseSummary; tone?: 'page' | 'dark' }) {
  useUiLanguage();
  const primary = tone === 'dark' ? 'lime' : 'primary';
  const secondary = tone === 'dark' ? 'on-dark' : 'outline';
  const arrow = <ArrowRight size={15} aria-hidden />;
  switch (course.slotStatus) {
    case 'PRE_ASSESSMENT':
      return <PuLink to={PULSE_PATHS.skipTest(course.courseId)} kind={primary} small={tone === 'dark'}>Kiểm tra đầu vào {arrow}</PuLink>;
    case 'PRE_REVIEW':
      return <PuLink to={PULSE_PATHS.preAssessment(course.courseId)} kind={secondary} small>Xem bài đã nộp</PuLink>;
    case 'TO_LEARN':
      return <PuLink to={PULSE_PATHS.course(course.courseId)} kind={tone === 'dark' ? 'on-dark' : 'primary'} small={tone === 'dark'}>{translateUi("Bắt đầu học ")}{arrow}</PuLink>;
    case 'IN_PROGRESS':
      return <PuLink to={PULSE_PATHS.course(course.courseId)} kind={tone === 'dark' ? 'on-dark' : 'primary'} small={tone === 'dark'}>Học tiếp {arrow}</PuLink>;
    case 'FINAL_READY':
      return <PuLink to={PULSE_PATHS.final(course.courseId)} kind={primary} small={tone === 'dark'}>Làm bài cuối khóa {arrow}</PuLink>;
    case 'IN_REVIEW':
      return <PuLink to={PULSE_PATHS.final(course.courseId)} kind={secondary} small>Xem bài đã nộp</PuLink>;
    case 'RETRY_WAIT':
      return <PuLink to={PULSE_PATHS.final(course.courseId)} kind={secondary} small>Xem nhận xét</PuLink>;
    case 'NEEDS_SUPPORT':
      return <PuLink to={PULSE_PATHS.final(course.courseId)} kind={secondary} small>Xem hướng hỗ trợ</PuLink>;
    case 'PURCHASE_NEEDED':
      return <PuLink to={PULSE_PATHS.course(course.courseId)} kind={secondary} small>Xem đề cương</PuLink>;
    case 'COMPLETED':
      return <PuLink to={PULSE_PATHS.course(course.courseId)} kind="ghost" small>{translateUi("Xem khóa học")}</PuLink>;
    default:
      return null;
  }
}

/** Nhắc nhân viên mới: khóa cần bài đánh giá năng lực trước khi học. */
export function AssessFirstNote() {
  useUiLanguage();
  return (
    <span className="pu-assess-note">
      <ShieldCheck size={15} aria-hidden />
      Bạn cần làm bài đánh giá năng lực trước khi học khóa này.
    </span>
  );
}

/** Một khóa trong danh sách lĩnh vực: cấp độ, tên, trạng thái, % đã học và nút hành động. */
export function CourseRow({
  course,
  overview,
  onSelectCourse,
}: {
  course: PulseCourseSummary;
  overview: PulseOverview;
  onSelectCourse?: (course: PulseCourseSummary) => void;
}) {
  useUiLanguage();
  return (
    <div className={`pu-course-row${course.zone === 'OPTIONAL' ? ' optional' : ''}`}>
      <span className="pu-course-level">
        <b>{levelName(course.tier)}</b>
        <LevelDots level={course.tier} />
      </span>
      <div className="pu-course-main">
        <div className="pu-course-name">
          {onSelectCourse ? (
            <button
              type="button"
              className="pu-plan-course-btn"
              onClick={() => onSelectCourse(course)}
              title="Bấm để xem nhanh đề cương"
            >
              {toSentenceCase(course.title)}
            </button>
          ) : (
            <Link to={PULSE_PATHS.course(course.courseId)}>{toSentenceCase(course.title)}</Link>
          )}
          <StatePill course={course} />
        </div>
        {course.slotStatus === 'PRE_ASSESSMENT' && <AssessFirstNote />}
        <span className="pu-course-sub">
          {courseStatusText(course, overview.courses, overview.reviewer?.name, overview.person.departmentName)}
        </span>
        {showsProgress(course) && (
          <span className="pu-course-progress">
            <Bar value={course.progressPercent} label={translateUi(`Tiến độ học ${toSentenceCase(course.title)}`)} />
            <span>{course.progressPercent}% đã học</span>
          </span>
        )}
      </div>
      <div className="pu-course-cta"><CourseAction course={course} /></div>
    </div>
  );
}

export function CapNote({ domain, overview }: { domain: PulseDomain; overview: PulseOverview }) {
  useUiLanguage();
  const note = capNote(domain, overview.person.positionName, overview.person.departmentName);
  if (!note) return null;
  return (
    <div className="pu-cap-alert" role="status">
      <div className="pu-cap-alert-icon" aria-hidden="true">
        <AlertTriangle size={18} />
      </div>
      <div className="pu-cap-alert-content">
        <strong className="pu-cap-alert-title">Giới hạn phạm vi năng lực của phòng ban</strong>
        <p className="pu-cap-alert-desc">{note}</p>
      </div>
    </div>
  );
}

/** Ba ô trạng thái nhỏ (Cơ bản / Trung cấp / Nâng cao) của một lĩnh vực. */
export function DomainTrack({ courses, vertical }: { courses: PulseCourseSummary[]; vertical?: boolean }) {
  useUiLanguage();
  const ordered = [...courses].sort((a, b) => (vertical ? b.tier - a.tier : a.tier - b.tier));
  return (
    <span className={vertical ? 'pu-comp-tower' : 'pu-domain-track'} aria-hidden>
      {ordered.map((course) => <i key={course.courseId} className={`pu-tile-state ${courseTone(course)}`} />)}
    </span>
  );
}
