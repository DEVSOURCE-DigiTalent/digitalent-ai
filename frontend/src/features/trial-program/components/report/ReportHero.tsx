import { AlertTriangle } from 'lucide-react';
import type { TrialReport } from '@/services/trial-program.service';
import { formatAverage, LEVEL_LABELS, percentOf } from '../../lib/trial-format';
import { useCountUp } from './report-hooks';

const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

interface ReportHeroProps {
  report: TrialReport;
  /** Số câu mỗi (lĩnh vực, cấp) của đề. */
  choicePerCell: number;
  focus: number | null;
  onFocus: (domainIndex: number | null) => void;
  animate: boolean;
}

/** Đầu báo cáo: vòng mức năng lực số, 2 số phụ và ✦ 3 lĩnh vực ưu tiên (bấm = làm nổi trên bản đồ). */
export function ReportHero({ report, choicePerCell, focus, onFocus, animate }: ReportHeroProps) {
  const averages = report.summary.map((d) => d.average);
  const overall = averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;
  const allBasic = report.employees.filter((e) => e.levels.every((level) => level >= 1)).length;
  const bestIndex = averages.indexOf(Math.max(...averages));
  const best = report.domains[bestIndex];
  const shownOverall = useCountUp(overall, animate);
  const shownBasic = useCountUp(percentOf(allBasic, report.assessed), animate);
  const shownBest = useCountUp(averages[bestIndex] ?? 0, animate);

  return (
    <section className="rp-hero" aria-label="Tổng quan năng lực số">
      <div className="rp-score" role="img" aria-label={`Mức năng lực số ${formatAverage(overall)} trên 3`}>
        <svg className="rp-ring" viewBox="0 0 132 132" aria-hidden>
          <defs>
            <linearGradient id="rp-ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7fc7b5" />
              <stop offset="1" stopColor="#4f8de8" />
            </linearGradient>
          </defs>
          <circle className="bg" cx="66" cy="66" r={RING_RADIUS} />
          <circle className="fg" cx="66" cy="66" r={RING_RADIUS} strokeDasharray={RING_LENGTH} strokeDashoffset={RING_LENGTH * (1 - overall / 3)} transform="rotate(-90 66 66)" />
          {[1, 2].map((level) => {
            const angle = ((-90 + 120 * level) * Math.PI) / 180;
            return <line key={level} className="tk" x1={66 + 44 * Math.cos(angle)} y1={66 + 44 * Math.sin(angle)} x2={66 + 60 * Math.cos(angle)} y2={66 + 60 * Math.sin(angle)} />;
          })}
        </svg>
        <div className="v">
          <b>{formatAverage(shownOverall)}</b>
          <em>/ 3</em>
        </div>
      </div>

      <div className="rp-hstats">
        <div>
          <div className="rp-eb">Mức năng lực số</div>
          <div className="rp-lvl">
            {LEVEL_LABELS[Math.min(3, Math.floor(overall))]}
            <small>TB {report.domains.length} lĩnh vực · {report.assessed} người</small>
          </div>
        </div>
        <div className="rp-hrow2">
          <div className="rp-hs">
            <small>Đạt Cơ bản cả {report.domains.length} lĩnh vực</small>
            <b>
              {Math.round(shownBasic)}%<em>{allBasic}/{report.assessed}</em>
            </b>
            <div className="bar"><i style={{ width: `${percentOf(allBasic, report.assessed)}%` }} /></div>
          </div>
          {best && (
            <div className="rp-hs">
              <small>Mạnh nhất</small>
              <b>{formatAverage(shownBest)}</b>
              <span><span className="rp-code">M{best.number}</span> {best.name}</span>
            </div>
          )}
        </div>
      </div>

      <Priorities report={report} choicePerCell={choicePerCell} focus={focus} onFocus={onFocus} />
    </section>
  );
}

function Priorities({ report, choicePerCell, focus, onFocus }: Omit<ReportHeroProps, 'animate'>) {
  const { insights } = report;
  const byAi = insights.priorities.some((p) => p.source === 'AI');
  const source = insights.status === 'PENDING' ? '✦ AI đang viết…' : byAi ? `✦ AI · ${report.assessed} bài` : `Câu mẫu · ${report.assessed} bài`;

  return (
    <section className="rp-pri" aria-label="Lĩnh vực ưu tiên">
      <div className="rp-pri-head">
        <b>✦ Ưu tiên</b>
        <span title="Viết từ kết quả trắc nghiệm, số liệu đã đối chiếu">{source}</span>
      </div>
      {insights.priorities.length > 0 ? (
        <ol>
          {insights.priorities.map((item, rank) => {
            const index = report.domains.findIndex((d) => d.number === item.domainNumber);
            const domain = report.domains[index];
            if (!domain) return null;
            return (
              <li key={item.domainNumber}>
                <button type="button" aria-pressed={focus === index} title="Làm nổi trên bản đồ" onClick={() => onFocus(focus === index ? null : index)}>
                  <i className="rp-pno">{rank + 1}</i>
                  <span className="rp-pri-main">
                    <span className="rp-pri-name"><span className="rp-code">M{domain.number}</span><b>{domain.name}</b></span>
                    <small>{item.source === 'AI' ? '✦ ' : ''}{item.text}</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rp-pri-empty">Mọi người đã đạt mức tối đa đề xuất.</p>
      )}
      <div className="rp-pri-foot">
        <span className="tp-badge" title="Mỗi cấp của mỗi lĩnh vực có số câu này">◔ {choicePerCell} câu mỗi cấp</span>
        {report.highRisk > 0 && (
          <span className="tp-badge" title="Đã đánh dấu, vẫn tính vào kết quả">
            <AlertTriangle size={12} aria-hidden /> {report.highRisk} bài rủi ro cao
          </span>
        )}
      </div>
    </section>
  );
}
