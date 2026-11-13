import { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { PulseOverview } from '@/services/pulse.service';
import type { MyTrialAssessment } from '@/services/trial-program.service';
import { TIER_LABELS } from '../lib/trial-format';
import '../trial-employee-results.css';

function levelName(level: number) {
  return level > 0 ? TIER_LABELS[level as 1 | 2 | 3] : 'Chưa đạt cấp nào';
}

export function TrialEmployeeResults({ assessment, overview }: {
  assessment: MyTrialAssessment;
  overview?: PulseOverview;
}) {
  useUiLanguage();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const details = assessment.domainDetails ?? [];
  const scores = details.flatMap((detail) => [
    [detail.basicCorrect, detail.basicTotal],
    [detail.intermediateCorrect, detail.intermediateTotal],
    [detail.advancedCorrect, detail.advancedTotal],
  ]);
  const total = assessment.choiceTotal ?? scores.reduce((sum, [, count]) => sum + (count ?? 0), 0);
  const correct = assessment.choiceScore ?? scores.reduce((sum, [count]) => sum + (count ?? 0), 0);
  const roadmapReady = Boolean(assessment.reportPublished && overview?.hasPosition && overview.hasTargets);
  const canTryCourses = Boolean(assessment.reportPublished && overview?.awaitingFramework);
  const attained = assessment.levels?.filter((level) => level > 0).length ?? 0;
  const targets = new Map(overview?.domains?.map((domain) => [domain.categoryId, domain.pathTop]));

  return (
    <div className="tt-container">
      <section className="tt-score-hero">
        <div className="tt-score-hero-lead">
          <span className="tt-score-hero-badge"><CheckCircle2 size={13} />{translateUi('Đã có kết quả trắc nghiệm')}</span>
          <h2 className="tt-score-hero-title">{translateUi('Báo cáo năng lực số đầu vào')}</h2>
          <p className="tt-score-hero-desc">{assessment.organizationName}</p>
        </div>
        <div className="tt-score-metrics-cluster">
          <div className="tt-score-metric-box">
            <span className="tt-score-metric-val blue">{assessment.domains.length}</span>
            <span className="tt-score-metric-lbl">{translateUi('Lĩnh vực đánh giá')}</span>
          </div>
          <div className="tt-score-metric-box tt-score-metric-box--exempt">
            <span className="tt-score-metric-val green">{attained}/{assessment.domains.length}</span>
            <span className="tt-score-metric-lbl">{translateUi('Lĩnh vực đạt từ Cơ bản')}</span>
          </div>
          <div className="tt-score-metric-box">
            <span className="tt-score-metric-val">{total > 0 ? `${correct}/${total}` : '—'}</span>
            <span className="tt-score-metric-lbl">{translateUi('Câu trắc nghiệm đúng')}</span>
          </div>
        </div>
      </section>

      {(roadmapReady || canTryCourses) && (
        <section className="tt-action-callout tt-action-callout--gap">
          <div className="tt-action-callout-left">
            <div className="tt-action-callout-icon"><Target size={22} /></div>
            <div>
              <h3 className="tt-action-callout-title">{translateUi(roadmapReady
                ? 'Lộ trình học tập của bạn đã sẵn sàng'
                : 'Đang chờ doanh nghiệp thiết lập khung năng lực')}</h3>
              <p className="tt-action-callout-desc">{translateUi(roadmapReady
                ? 'Xem các khóa học phù hợp với khung năng lực của doanh nghiệp.'
                : 'Bạn có thể học thử các khóa Cơ bản đang công khai.')}</p>
            </div>
          </div>
          <Link to={PULSE_PATHS.path} className="tt-btn-primary tt-action-callout-btn">
            {translateUi(roadmapReady ? 'Xem lộ trình học tập' : 'Xem khóa học thử')} <ArrowRight size={15} />
          </Link>
        </section>
      )}

      <section className="tt-card">
        <div className="tt-card-head">
          <div>
            <h3 className="tt-card-title">{translateUi('Kết quả chi tiết theo lĩnh vực')}</h3>
            <p className="tt-card-desc">{translateUi('Chọn một lĩnh vực để xem số câu đúng ở từng cấp.')}</p>
          </div>
        </div>
        <div className="tt-accordion-list">
          {assessment.domains.map((domain, index) => {
            const detail = details.find((item) => item.categoryId === domain.categoryId);
            const open = openCategory === domain.categoryId;
            const level = assessment.levels?.[index] ?? 0;
            const target = roadmapReady ? targets.get(domain.categoryId) : undefined;
            const tiers = [
              [detail?.basicCorrect, detail?.basicTotal],
              [detail?.intermediateCorrect, detail?.intermediateTotal],
              [detail?.advancedCorrect, detail?.advancedTotal],
            ];
            return (
              <div key={domain.categoryId} className={`tt-domain-item${open ? ' tt-domain-item--open' : ''}`}>
                <button type="button" className="tt-domain-btn" aria-expanded={open}
                  onClick={() => setOpenCategory(open ? null : domain.categoryId)}>
                  <div className="tt-domain-btn-left">
                    <span className={`tt-domain-num-badge tt-domain-num--${level > 0 ? 'passed' : 'pending'}`}>{domain.number}</span>
                    <div>
                      <div className="tt-domain-name">{domain.name}</div>
                      <div className="tt-domain-subline">
                        {translateUi('Hiện tại')}{' '}
                        <strong className="tt-domain-highlight">{translateUi(levelName(level))}</strong>
                        {target ? <span> · {translateUi('Mục tiêu')}: {translateUi(levelName(target))}</span> : null}
                      </div>
                    </div>
                  </div>
                  <ChevronDown size={18} aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
                </button>
                {open && (
                  <div className="tt-domain-body">
                    <div className="tt-tier-results-grid">
                      {tiers.map(([right, count], tier) => (
                        <div key={tier} className="tt-tier-result-card">
                          <strong>{translateUi(levelName(tier + 1))}</strong>
                          <p>{count ? `${right ?? 0}/${count} ${translateUi('câu đúng')}` : '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {assessment.reviewNote && <p className="tt-card-desc">{assessment.reviewNote}</p>}
      </section>
    </div>
  );
}
