import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared';
import { useManagerSkillGapPage } from '../../hooks/use-manager-skill-gaps';

export function TeamSkillGapAnalyticsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const query = useManagerSkillGapPage(page, 20, search || undefined);
  const runs = query.data?.items ?? [];

  return <div className="space-y-5 pb-12"><PageHeader title="Khoảng trống năng lực nhóm" subtitle="Bản phân tích mới nhất của từng nhân viên trong phạm vi quản lý, lấy từ BE2." />
    <label className="block text-sm">Tìm nhân viên hoặc mã nhân viên<input className="mt-1 block w-full max-w-sm rounded-lg border p-2" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
    {query.isLoading ? <p>Đang tải…</p> : query.isError ? <p role="alert" className="text-red-600">Không tải được phân tích năng lực.</p> : runs.length === 0 ? <p className="rounded-xl border p-6 text-sm">Chưa có bản phân tích năng lực phù hợp. BE2 cần hồ sơ nhân viên, vị trí và bộ yêu cầu năng lực trước khi tính khoảng trống.</p> : <div className="overflow-x-auto rounded-xl border"><table className="w-full text-sm"><thead><tr className="bg-slate-50 text-left"><th className="p-3">Nhân viên</th><th className="p-3">Vị trí</th><th className="p-3">Độ bao phủ</th><th className="p-3">Khoảng trống</th><th className="p-3">Mức cao</th><th className="p-3">Chi tiết</th></tr></thead><tbody>{runs.map((run) => <tr key={run.runId} className="border-t"><td className="p-3">{run.employeeName}<span className="block text-xs text-slate-500">{run.employeeCode}</span></td><td className="p-3">{run.jobPositionName || '—'}</td><td className="p-3">{Math.round(run.coveragePercent)}%</td><td className="p-3">{run.gapCount}</td><td className="p-3">{run.highCount}</td><td className="p-3"><Link className="text-blue-600" to={`/enterprise/team/members/${run.employeeId}`}>Xem nhân viên</Link></td></tr>)}</tbody></table></div>}
    <div className="flex items-center gap-3 text-sm"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-50">Trước</button><span>Trang {page}</span><button type="button" disabled={page >= (query.data?.totalPages ?? 1)} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Sau</button></div>
  </div>;
}
