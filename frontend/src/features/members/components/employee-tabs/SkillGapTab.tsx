import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Activity, BadgeCheck, BookOpen, ChevronDown, CircleAlert, Gauge, Layers3 } from 'lucide-react';
import { CourseRecommendations } from '@/features/intelligence/components/CourseRecommendations';
import { CompetencyRadarChart } from '@/features/intelligence/components/CompetencyRadarChart';
import { SeverityBadge } from '@/features/intelligence/components/SeverityBadge';
import { shouldChartByDomain, summarizeByDomain, toDomainChartItems } from '@/features/intelligence/utils/domain-summary';
import { levelLabel } from '@/lib/competency-levels';
import { formatDateTime } from '@/lib/utils';
import type { SkillGapRunDetail } from '@/services/intelligence.service';
import { MemberTabEmpty, MemberTabHeader } from './MemberTabUi';
import './member-gap.css';

interface SkillGapTabProps { run: SkillGapRunDetail | null; employeeId: string; blocker?: string | null; readOnly?: boolean }
const BLOCKER_LABELS: Record<string, string> = { NO_JOB_POSITION: 'Nhân viên chưa được xếp vị trí công việc.', NO_ACTIVE_REQUIREMENT_SET: 'Vị trí chưa kích hoạt chuẩn năng lực.', EMPLOYEE_NOT_ACTIVE: 'Nhân viên đang ở trạng thái không hoạt động.' };

export function SkillGapTab({ run, employeeId, blocker }: SkillGapTabProps) {
  useUiLanguage();
  if (!run) {
    return <div><MemberTabHeader title={translateUi("Khoảng trống năng lực")} icon={<Activity size={21} />} /><MemberTabEmpty title="Chưa có kết quả phân tích" description={translateUi(blocker ? translateUi(BLOCKER_LABELS[blocker]) ?? blocker : 'Cần có chuẩn vị trí và dữ liệu năng lực để tính khoảng trống.')} icon={<Activity size={27} />} /></div>;
  }

  const domains = summarizeByDomain(run.items);
  const chartItems = shouldChartByDomain(run.items) ? toDomainChartItems(domains) : run.items;
  const summary = run.summary;
  const stats = [
    { label: 'Năng lực yêu cầu', value: summary.totalRequired, tone: 'blue', icon: <Layers3 size={20} /> },
    { label: 'Đã đạt', value: summary.totalMet, tone: 'green', icon: <BadgeCheck size={20} /> },
    { label: 'Khoảng trống', value: summary.totalGap, tone: 'coral', icon: <CircleAlert size={20} /> },
    { label: 'Tỷ lệ đáp ứng', value: `${summary.coveragePercent.toFixed(1)}%`, tone: 'teal', icon: <Gauge size={20} /> },
  ];

  return <div className="member-gap-view">
    <MemberTabHeader title={translateUi("Khoảng trống năng lực")} icon={<Activity size={21} />} />
    <div className="member-gap-context"><span>{run.jobPositionName} · chuẩn v{run.requirementSetVersionNo}</span><span>Cập nhật {formatDateTime(run.generatedAt)}</span></div>

    <div className="member-gap-stats">
      {stats.map((stat) => <div key={stat.label} className={`member-gap-stat member-gap-stat--${stat.tone}`}><span className="member-gap-stat-icon" aria-hidden="true">{stat.icon}</span><span className="member-gap-stat-label">{translateUi(stat.label)}</span><strong>{stat.value}</strong></div>)}
    </div>

    <div className="member-gap-dashboard">
      <section className="member-gap-panel member-gap-chart" aria-label="So sánh năng lực theo miền">
        <div className="member-gap-panel-heading"><h3>Yêu cầu và mức đã xác nhận</h3><span>Trung bình theo miền năng lực</span></div>
        <CompetencyRadarChart items={chartItems} height={350} requiredLabel="Mức yêu cầu" confirmedLabel="Đã xác nhận" />
      </section>
      <section className="member-gap-panel member-gap-domain-panel" aria-label="Tóm tắt theo miền">
        <div className="member-gap-panel-heading"><h3>Theo miền năng lực</h3><span>{domains.length}{translateUi(" miền")}</span></div>
        <div className="member-gap-domains">
          {domains.map((domain, index) => <div className="member-gap-domain" key={domain.key}>
            <div className="member-gap-domain-top"><span className="member-gap-domain-number">{String(index + 1).padStart(2, '0')}</span><strong>{translateUi(domain.name)}</strong><span className="member-gap-domain-count">{domain.gapCount}{translateUi(" thiếu")}</span></div>
            <div className="member-gap-domain-track" role="img" aria-label={translateUi(`${domain.name}: mức đã xác nhận trung bình ${domain.averageLevel.toFixed(1)} trên 3`)}><i style={{ width: `${Math.min(100, domain.averageLevel / 3 * 100)}%` }} /><b style={{ left: `${Math.min(100, domain.requiredLevel / 3 * 100)}%` }} /></div>
            <small>{translateUi("Đã xác nhận ")}{domain.averageLevel.toFixed(1)} / 3 · yêu cầu {levelLabel(domain.requiredLevel)}</small>
          </div>)}
        </div>
        <div className="member-gap-severity" aria-label="Mức độ khoảng trống"><span><i className="is-high" />{summary.highCount}{translateUi(" cao")}</span><span><i className="is-medium" />{summary.mediumCount}{translateUi(" trung bình")}</span><span><i className="is-low" />{summary.lowCount}{translateUi(" thấp")}</span></div>
      </section>
    </div>

    <section className="member-gap-panel member-gap-details">
      <div className="member-gap-panel-heading"><div><h3>Chi tiết khoảng trống</h3><p>Chọn một miền để xem các năng lực cần ưu tiên.</p></div><span>{run.items.length}{translateUi(" năng lực")}</span></div>
      <div className="member-gap-groups">
        {domains.map((domain, index) => <details className="member-gap-group" key={domain.key}>
          <summary>
            <span className="member-gap-group-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="member-gap-group-copy"><strong>{translateUi(domain.name)}</strong><small>{translateUi("Yêu cầu ")}{levelLabel(domain.requiredLevel)} · đã xác nhận trung bình {domain.averageLevel.toFixed(1)}</small></span>
            <span className="member-gap-group-count">{domain.gapCount}{translateUi(" khoảng trống")}</span>
            <ChevronDown size={18} className="member-gap-group-chevron" />
          </summary>
          <div className="member-gap-items">
            {domain.items.map((item) => <article className="member-gap-item" key={item.competencyId}>
              <div className="member-gap-item-name"><span className="member-gap-item-code">{item.frameworkCode ?? item.competencyCode}</span><strong>{item.competencyName}</strong>{item.mandatory && <small>{translateUi("Bắt buộc")}</small>}</div>
              <div className="member-gap-item-level"><small>Hiện tại → yêu cầu</small><span>{levelLabel(item.currentLevel)} <b>→</b> {levelLabel(item.requiredLevel)}</span></div>
              <div className="member-gap-item-score"><small>{translateUi("Thiếu")}</small><strong>{item.gapSteps}</strong></div>
              <div className="member-gap-item-score"><small>Ưu tiên · {item.weightPercent}%</small><strong>{item.priorityScore.toFixed(1)}</strong></div>
              <SeverityBadge severity={item.severity} />
            </article>)}
          </div>
        </details>)}
      </div>
    </section>

    <details className="member-gap-panel member-gap-courses member-tab-accordion">
      <summary><span className="member-gap-course-title"><BookOpen size={19} />{translateUi("Khóa học đề xuất")}</span></summary>
      <div className="member-tab-accordion-body"><CourseRecommendations employeeId={employeeId} compact /></div>
    </details>
  </div>;
}
