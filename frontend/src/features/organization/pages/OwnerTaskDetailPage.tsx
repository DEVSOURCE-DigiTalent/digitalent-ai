import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useIsPulseManager } from '@/features/pulse-manager/lib/use-is-pulse-manager';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { usePracticalTask } from '@/hooks/use-tasks';
import { useTaskCompetencies } from '@/hooks/use-competencies';
import { formatDate } from '@/lib/utils';
import type { RubricCriterion } from '@/services/task.service';
import { RichText } from '@/features/pulse-employee/components/RichText';
import { PULSE_TOKENS } from '../owner-theme';
import { PageLoading } from '@/components/shared/LoadingState';
import './owner-operations.css';

const SUB_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  PENDING_REVIEW: { label: 'Chờ chấm', bg: 'var(--po-soft)', fg: 'var(--po-accent-strong)' },
  APPROVED: { label: 'Đã duyệt', bg: '#ecfdf5', fg: '#16a34a' },
  REVISION_REQUESTED: { label: 'Cần sửa', bg: '#fef3c7', fg: '#d97706' },
  REJECTED: { label: 'Không đạt', bg: '#fee2e2', fg: '#dc2626' },
};

export function OwnerTaskDetailPage() {
  useUiLanguage();
  const isManager = useIsPulseManager();
  const canEvaluate = usePermission().can(PERMISSIONS.TASK_EVALUATE) && !isManager;
  const [employeePage, setEmployeePage] = useState(1);
  const { id = '' } = useParams();
  const { data: task, isLoading, isError } = usePracticalTask(id);
  const { data: competencies = [] } = useTaskCompetencies(task?.competencyIds ?? []);

  if (isLoading) {
    return <div className="po-owner -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label={translateUi("Đang tải chi tiết nhiệm vụ")} variant="detail" /></div>;
  }

  if (isError || !task) {
    return (
      <div
        className="po-owner -m-4 md:-m-6 min-h-screen px-4 md:px-6 py-20"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <div className="mx-auto text-center" style={{ maxWidth: 500 }}>
          <div
            className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl text-2xl"
            style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
          >
            ✕
          </div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--po-ink)' }}>{translateUi("Không tìm thấy bài thực hành")}</h2>
          <Link
            to="/enterprise/tasks"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--po-accent)' }}
          >
            <ArrowLeft className="size-3.5" />{translateUi(" Quay lại danh sách")}</Link>
        </div>
      </div>
    );
  }

  const assignedEmployees = task.assignedEmployees ?? [];
  const submissions = task.submissions ?? [];
  const rubricCriteria = Array.isArray(task.rubricCriteria) ? task.rubricCriteria : [];
  const employeePages = Math.max(1, Math.ceil(assignedEmployees.length / 10));
  const visibleEmployees = assignedEmployees.slice((employeePage - 1) * 10, employeePage * 10);

  return (
    <div
      className="po-owner owner-operations owner-operations--detail -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
      }}
    >
      {/* ── Hero ── */}
      <section className="manager-work-hero px-4 md:px-6 pt-6 pb-4 mx-auto" style={{ maxWidth: 1800 }}>
        <Link
          to="/enterprise/tasks"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--po-muted)' }}
        >
          <ArrowLeft className="size-3" />{translateUi(" Nhiệm vụ thực tế")}</Link>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {task.targetLevel > 0 && <span
                className="text-[9px] font-black px-1.5 py-0.5 rounded"
                style={{ background: 'var(--po-soft)', color: 'var(--po-accent-strong)' }}
              >{translateUi("Cấp ")}{task.targetLevel}
              </span>}
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={
                  task.status === 'ACTIVE'
                    ? { background: '#ecfdf5', color: '#16a34a' }
                    : { background: 'var(--po-raised)', color: 'var(--po-muted)' }
                }
              >
                {task.status === 'ACTIVE' ? translateUi('Đang mở') : translateUi('Đã đóng')}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.04em' }}
            >
              {translateUi(task.title)}
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--po-muted)' }}>{translateUi("Giao bởi ")}{task.assignedByName}{task.dueDate ? translateUi(` · Hạn ${formatDate(task.dueDate)}`) : ''}
              {task.departmentName && ` · ${task.departmentName}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px] font-bold" style={{ color: 'var(--po-accent)' }}>
            <Users className="size-3.5" /> {assignedEmployees.length}{translateUi(" nhân sự")}</div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="px-4 md:px-6 pb-8 mx-auto" style={{ maxWidth: 1800 }}>
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left: description + rubric */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <div
              className="rounded-[13px] border p-5 space-y-3"
              style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>{translateUi("Yêu cầu & bối cảnh")}</p>
              <div className="owner-operations__rich-text">
                <RichText body={task.description} />
              </div>
              <div className="pt-2" style={{ borderTop: '1px solid var(--po-line)' }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--po-muted)' }}>{translateUi("Sản phẩm đầu ra (minh chứng)")}</span>
                <div className="owner-operations__output owner-operations__rich-text mt-2">
                  <RichText body={task.expectedOutput} />
                </div>
              </div>
            </div>

            {/* Rubric */}
            <div
              className="rounded-[13px] border p-5 space-y-3"
              style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>{translateUi("Tiêu chí đánh giá")}</p>
                {rubricCriteria.length > 0 && <span className="text-[10px] font-bold" style={{ color: 'var(--po-muted)' }}>{translateUi("Tổng: ")}{rubricCriteria.reduce((s: number, r: RubricCriterion) => s + Number(r.maxPoints || 0), 0)}{translateUi(" điểm")}</span>}
              </div>
              {rubricCriteria.length === 0 && <p className="owner-operations__empty-inline">{translateUi("Nhiệm vụ này chưa có tiêu chí đánh giá.")}</p>}
              {rubricCriteria.map((r: RubricCriterion, i: number) => (
                <div
                  key={r.id || i}
                  className="rounded-[11px] border p-3 flex items-center justify-between gap-3"
                  style={{ borderColor: 'var(--po-line)', background: 'var(--po-canvas)' }}
                >
                  <div>
                    <strong className="text-xs" style={{ color: 'var(--po-ink)' }}>{translateUi(r.label)}</strong>
                    {r.description && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--po-muted)' }}>
                        {translateUi(r.description)}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold shrink-0 px-2 py-0.5 rounded"
                    style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
                  >
                    {r.maxPoints}đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: competencies */}
          <div className="space-y-4">
            <div
              className="rounded-[13px] border p-5 space-y-3"
              style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>{translateUi("Năng lực liên kết")}</p>
              <div className="flex flex-wrap gap-2">
                {task.competencyIds.length === 0 && <p className="owner-operations__empty-inline">{translateUi("Chưa liên kết năng lực.")}</p>}
                {task.competencyIds.map((cid) => {
                  const c = competencies.find((x) => x.id === cid);
                  return (
                    <span
                      key={cid}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg"
                      style={{ background: 'var(--po-soft)', color: 'var(--po-accent)', border: '1px solid var(--po-line)' }}
                    >
                      {c ? `${c.code} · ${c.name}` : cid.slice(0, 8)}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Submissions table ── */}
        <div
          className="mt-4 rounded-[13px] border overflow-hidden"
          style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between text-[11px] font-bold"
            style={{ borderBottom: '1px solid var(--po-line)', color: 'var(--po-muted)' }}
          >
            <span>{translateUi("Nhân sự & tiến độ nộp bài")}</span>
            <span>{assignedEmployees.length}{translateUi(" nhân sự")}</span>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--po-line)' }}>
            {visibleEmployees.map((emp: any) => {
              const sub = submissions.find((s: any) => s.employeeId === emp.id);
              const st = sub ? (SUB_STATUS[sub.status] ?? SUB_STATUS.PENDING_REVIEW) : null;

              return (
                <div
                  key={emp.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-8 place-items-center rounded-full text-xs font-bold shrink-0"
                      style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
                    >
                      {emp.fullName.charAt(0)}
                    </span>
                    <div>
                      <strong className="text-xs" style={{ color: 'var(--po-ink)' }}>
                        {emp.fullName}
                      </strong>
                      <span className="block font-mono text-[10px]" style={{ color: 'var(--po-muted)' }}>
                        {emp.employeeCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub ? (
                      <>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: st!.bg, color: st!.fg }}
                        >
                          {translateUi(st!.label)}
                          {sub.evaluation?.score != null && ` · ${sub.evaluation.score}đ`}
                        </span>
                        <Link
                          to={`/enterprise/reviews/${sub.id}`}
                          className="rounded-[9px] px-3 py-1.5 text-[10px] font-bold transition-transform hover:-translate-y-0.5"
                          style={
                            sub.status === 'PENDING_REVIEW'
                              ? { background: 'var(--po-accent)', color: '#fff' }
                              : { border: '1px solid var(--po-line)', color: 'var(--po-ink)' }
                          }
                        >
                          {canEvaluate && sub.status === 'PENDING_REVIEW' ? translateUi('Chấm điểm') : translateUi('Xem minh chứng')}
                        </Link>
                      </>
                    ) : (
                      <span className="text-[10px] italic" style={{ color: 'var(--po-muted)' }}>{translateUi("Chưa nộp bài")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {employeePages > 1 && <div className="owner-operations__pagination px-4 pb-4"><span>{translateUi("Trang ")}{employeePage} / {employeePages}</span><button type="button" disabled={employeePage <= 1} onClick={() => setEmployeePage((page) => page - 1)}>{translateUi("Trước")}</button><button type="button" disabled={employeePage >= employeePages} onClick={() => setEmployeePage((page) => page + 1)}>{translateUi("Sau")}</button></div>}
        </div>
      </div>
    </div>
  );
}
