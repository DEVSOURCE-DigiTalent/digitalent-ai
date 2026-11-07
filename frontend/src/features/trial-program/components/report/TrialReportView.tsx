import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { useTrialRoadmap } from '@/hooks/use-trial-program';
import type { TrialPlanKind, TrialReport } from '@/services/trial-program.service';
import { formatMoneyShort } from '../../lib/trial-format';
import { levelsOf, optionOf, planTotals } from '../../lib/trial-plan';
import { CompetencyMap } from './CompetencyMap';
import { DepartmentHeatmap, LevelDetails, MissedQuestions } from './ReportCharts';
import { ReportHero } from './ReportHero';
import { useIntroAnimation } from './report-hooks';
import './trial-report.css';

/**
 * Báo cáo năng lực dùng thử (OW-T1 sau khi bài đóng): đầu trang (mức năng lực số + ✦ ưu tiên) → bản đồ năng lực theo phương
 * án phạm vi → câu sai nhiều nhất + mức theo phòng ban → chi tiết theo cấp (đóng sẵn) → chọn phạm vi đào tạo ở OW-05.
 * Số liệu theo luật; ✦ AI chỉ viết ưu tiên và lý do ngắn (đã đối chiếu số).
 */
export function TrialReportView({ report, choicePerCell }: { report: TrialReport; choicePerCell: number }) {
  const roadmap = useTrialRoadmap();
  const animate = useIntroAnimation();
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [kind, setKind] = useState<TrialPlanKind>('BALANCED');
  const [focus, setFocus] = useState<number | null>(null);

  const data = roadmap.data?.available ? roadmap.data : null;
  const option = data ? optionOf(data, kind) : undefined;
  const plan = useMemo(() => (option ? levelsOf(option) : null), [option]);
  const people = useMemo(
    () => (data ? data.people.filter((p) => departmentId == null || p.departmentId === departmentId) : []),
    [data, departmentId],
  );
  const scopes = useMemo(
    () => [{ id: null, label: 'Doanh nghiệp' }, ...(data?.departments ?? []).map((d) => ({ id: d.id as string | null, label: d.name }))],
    [data],
  );
  const totals = data && plan ? planTotals(data.people, plan, data.prices) : null;
  const priorities = report.insights.priorities
    .map((p) => report.domains.findIndex((d) => d.number === p.domainNumber))
    .filter((index) => index >= 0);

  return (
    <div className={animate ? 'rp rp-anim' : 'rp'}>
      <ReportHero report={report} choicePerCell={choicePerCell} focus={focus} onFocus={setFocus} animate={animate} />

      {data && plan ? (
        <CompetencyMap
          domains={data.domains}
          people={people}
          departmentId={departmentId}
          plan={plan}
          prices={data.prices}
          reasons={kind === 'BALANCED' ? data.reasons : null}
          priorities={priorities}
          focus={focus}
          scopes={scopes}
          onScope={setDepartmentId}
          kind={kind}
          onKind={setKind}
        />
      ) : (
        <section className="tp-card"><p className="tp-muted">{roadmap.isError ? 'Chưa tải được bản đồ năng lực.' : 'Đang tải bản đồ năng lực…'}</p></section>
      )}

      <div className="rp-two">
        <MissedQuestions report={report} />
        <DepartmentHeatmap report={report} />
      </div>

      <LevelDetails report={report} />

      <section className="rp-cta" aria-label="Chọn phạm vi đào tạo">
        <strong><Compass size={22} aria-hidden /> Phạm vi đào tạo</strong>
        {totals && (
          <>
            <div className="num"><b>{totals.courses}</b><small>khóa</small></div>
            <div className="num"><b>{totals.seats}</b><small>suất</small></div>
            <div className="num"><b>{formatMoneyShort(totals.cost)}</b><small>chi phí</small></div>
          </>
        )}
        <Link to={`/enterprise/setup?plan=${kind}`}>Chọn phạm vi đào tạo <ArrowRight size={15} aria-hidden /></Link>
      </section>
    </div>
  );
}
