import { Link, useNavigate } from 'react-router-dom';
import { useMentorTrials } from '@/hooks/use-trial-program';
import { Box, LoadError, Loading, PageHead } from '@/features/platform/components/pulse-ui';
import { StageBadge } from '../components/TrialUi';
import { formatWhen } from '../lib/trial-format';
import '../trial-program.css';

/** MT-01 · Bài cần chấm: các doanh nghiệp dùng thử được phân công cho mentor. */
export function MentorTrialsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useMentorTrials();

  return (
    <>
      <PageHead eyebrow="Mentor" title="Doanh nghiệp cần chấm." />
      <Box>
        {isLoading && <Loading />}
        {error && <LoadError error={error} />}
        {data && data.length === 0 && <p className="pa-empty">Chưa được phân công doanh nghiệp nào.</p>}
        {data && data.length > 0 && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doanh nghiệp</th>
                  <th className="num">Đã nộp</th>
                  <th className="num">Đã chấm</th>
                  <th>Hạn làm bài</th>
                  <th>Muốn chấm lúc</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.organizationId} className="pa-row-link" onClick={() => navigate(`/platform/reviews/${t.organizationId}`)}>
                    <td>
                      <Link to={`/platform/reviews/${t.organizationId}`} onClick={(e) => e.stopPropagation()}>
                        <strong className="pa-cell-title">{t.organizationName}</strong>
                      </Link>
                      {t.requestNote && <small className="pa-cell-sub">“{t.requestNote}”</small>}
                    </td>
                    <td className="num"><strong>{t.submitted}</strong> / {t.participants}</td>
                    <td className="num">{t.reviewed}</td>
                    <td>{formatWhen(t.testDeadline)}</td>
                    <td>{formatWhen(t.preferredReviewAt)}</td>
                    <td><span className="tp-vars"><StageBadge stage={t.stage} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </>
  );
}
