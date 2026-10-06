import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEmployee } from '@/hooks/use-employees';
import { useSkillGapRun, useSkillGapRuns } from '@/hooks/use-skill-gaps';
import { useAssignments } from '@/hooks/use-assignments';

export function TeamMemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const employee = useEmployee(id || '');
  const runs = useSkillGapRuns({ employeeId: id, pageIndex: 1, pageSize: 1, latestOnly: true });
  const latestRun = useSkillGapRun(runs.data?.items[0]?.runId);
  const assignments = useAssignments({ employeeId: id, pageIndex: 1, pageSize: 20 });

  if (employee.isLoading) return <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />;
  if (employee.isError || !employee.data) return <div role="alert" className="rounded-xl border border-red-200 p-6">Không tải được thành viên trong phạm vi quản lý. <Link className="text-blue-600" to="/enterprise/team/members">Quay lại danh sách</Link></div>;
  const person = employee.data;

  return <div className="space-y-6 pb-12"><Link to="/enterprise/team/members" className="inline-flex items-center gap-2 text-sm text-blue-600"><ArrowLeft className="size-4" />Thành viên nhóm</Link>
    <header className="rounded-xl border p-6"><p className="font-mono text-xs text-slate-500">{person.employeeCode}</p><h1 className="text-2xl font-bold">{person.fullName}</h1><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p>Email: {person.workEmail || '—'}</p><p>Phòng ban: {person.departmentName || '—'}</p><p>Vị trí: {person.positionName || person.jobPositionName || '—'}</p><p>Trạng thái: {person.status}</p></div></header>
    <section className="rounded-xl border p-6 space-y-3"><h2 className="font-bold">Năng lực và khoảng trống</h2>{runs.isLoading || latestRun.isLoading ? <p>Đang tải…</p> : runs.isError || latestRun.isError ? <p role="alert" className="text-red-600">Không tải được phân tích năng lực.</p> : !latestRun.data ? <p className="text-sm text-slate-500">Chưa có lần phân tích năng lực trên BE2.</p> : <><p className="text-sm">Độ bao phủ: {Math.round(latestRun.data.summary.coveragePercent)}% · {latestRun.data.summary.totalGap} khoảng trống</p><div className="space-y-2">{latestRun.data.items.filter((item) => item.gapSteps > 0).map((item) => <div key={item.competencyId} className="rounded-lg border p-3 text-sm"><strong>{item.frameworkCode || item.competencyCode} · {item.competencyName}</strong><span className="ml-2 text-amber-700">Thiếu {item.gapSteps} cấp</span></div>)}</div></>}</section>
    <section className="rounded-xl border p-6 space-y-3"><h2 className="font-bold">Khóa học được giao</h2>{assignments.isLoading ? <p>Đang tải…</p> : assignments.isError ? <p role="alert" className="text-red-600">Không tải được phân công đào tạo.</p> : (assignments.data?.items.length ?? 0) === 0 ? <p className="text-sm text-slate-500">Chưa có phân công đào tạo.</p> : assignments.data?.items.map((item) => <Link key={item.id} to={`/enterprise/team/training/${item.id}`} className="block rounded-lg border p-3 text-sm"><strong>{item.courseCode} · {item.courseTitle}</strong><span className="ml-2 text-slate-500">{item.progressPercent}% · {item.status}</span></Link>)}</section>
  </div>;
}
