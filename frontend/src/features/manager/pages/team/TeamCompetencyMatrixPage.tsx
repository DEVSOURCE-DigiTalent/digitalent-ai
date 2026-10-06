import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared';
import { useManagerSkillGapMatrix } from '../../hooks/use-manager-skill-gaps';

export function TeamCompetencyMatrixPage() {
  const [page, setPage] = useState(1);
  const query = useManagerSkillGapMatrix(page);
  const rows = query.data?.details ?? [];
  const competencies = Array.from(new Map(rows.flatMap((run) => run.items).map((item) => [item.competencyId, item])).values());

  return <div className="space-y-5 pb-12"><PageHeader title="Ma trận năng lực nhóm" subtitle="Dữ liệu từ các bản phân tích khoảng trống năng lực mới nhất trên BE2." />
    {query.isLoading ? <p>Đang tải ma trận…</p> : query.isError ? <p role="alert" className="text-red-600">Không tải được ma trận năng lực.</p> : rows.length === 0 ? <p className="rounded-xl border p-6 text-sm">Chưa có bản phân tích năng lực của thành viên trong phạm vi quản lý. Hãy chạy phân tích trước.</p> : <div className="overflow-x-auto rounded-xl border"><table className="min-w-full text-sm"><thead><tr className="bg-slate-50"><th className="sticky left-0 bg-slate-50 p-3 text-left">Nhân viên</th>{competencies.map((item) => <th key={item.competencyId} className="min-w-36 p-3 text-left" title={item.competencyName}>{item.frameworkCode || item.competencyCode}</th>)}</tr></thead><tbody>{rows.map((run) => <tr key={run.runId} className="border-t"><td className="sticky left-0 bg-white p-3"><Link className="font-semibold text-blue-600" to={`/enterprise/team/members/${run.employeeId}`}>{run.employeeName}</Link><span className="block text-xs text-slate-500">{run.employeeCode}</span></td>{competencies.map((competency) => { const line = run.items.find((item) => item.competencyId === competency.competencyId); return <td key={competency.competencyId} className="p-3 text-xs">{line ? `${line.currentLevel ?? '—'} / ${line.requiredLevel}` : '—'}{line && line.gapSteps > 0 && <span className="block text-amber-700">Thiếu {line.gapSteps} cấp</span>}</td>; })}</tr>)}</tbody></table></div>}
    <div className="flex items-center gap-3 text-sm"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-50">Trước</button><span>Trang {page}</span><button type="button" disabled={page >= (query.data?.totalPages ?? 1)} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Sau</button></div>
  </div>;
}
