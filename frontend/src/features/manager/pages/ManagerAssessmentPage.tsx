import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMySkillGap, useCalculateSkillGap } from '@/hooks/use-skill-gaps';

/** BE2 has skill-gap calculation, but no endpoint for the six-question local diagnostic. */
export function ManagerAssessmentPage() {
  const navigate = useNavigate();
  const employeeId = useCurrentUser((state) => state.user?.employeeId);
  const gap = useMySkillGap();
  const calculate = useCalculateSkillGap();

  async function runAnalysis() {
    if (!employeeId) return;
    try {
      await calculate.mutateAsync({ employeeId });
      navigate('/enterprise/me/learning-path');
    } catch { /* The API error is shown below. */ }
  }

  return <div className="mx-auto max-w-2xl p-6 space-y-5">
    <h1 className="text-2xl font-bold">Phân tích năng lực của tôi</h1>
    <p className="text-sm text-slate-600">BE2 xây dựng gợi ý học tập từ hồ sơ năng lực và lần tính khoảng trống năng lực đã lưu. Bài test 6 câu trước đây chỉ lưu trong trình duyệt nên không tạo lộ trình trên BE2.</p>
    {gap.data ? <div className="rounded-xl border p-5 space-y-2"><p>Độ bao phủ năng lực: <strong>{Math.round(gap.data.summary.coveragePercent)}%</strong></p><p>Số năng lực còn thiếu: <strong>{gap.data.summary.totalGap}</strong></p></div> : <p className="rounded-xl border p-5 text-sm">{gap.isLoading ? 'Đang tải phân tích…' : 'Chưa có phân tích năng lực được lưu trên BE2.'}</p>}
    {!employeeId && <p role="alert" className="text-sm text-amber-700">Tài khoản chưa liên kết hồ sơ nhân viên để tính khoảng trống năng lực.</p>}
    {calculate.isError && <p role="alert" className="text-sm text-red-600">BE2 không thể tính khoảng trống năng lực. Hãy kiểm tra vị trí và bộ yêu cầu năng lực của nhân viên.</p>}
    <div className="flex flex-wrap gap-3"><button type="button" disabled={!employeeId || calculate.isPending} onClick={runAnalysis} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{calculate.isPending ? 'Đang tính…' : 'Tính khoảng trống năng lực trên BE2'}</button><Link className="rounded-lg border px-4 py-2 text-sm" to="/enterprise/me/learning-path">Xem học tập của tôi</Link></div>
  </div>;
}
