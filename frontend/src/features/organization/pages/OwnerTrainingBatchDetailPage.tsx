import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Play, CheckSquare, Ban, BookOpen, Users, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/shared/Modal';
import {
  useTrainingBatch,
  useCompleteTrainingBatch,
  useCancelTrainingBatch,
  useActivateTrainingBatch,
} from '@/hooks/use-training-batches';
import { PULSE_TOKENS } from '../owner-theme';
import { PageLoading } from '@/components/shared/LoadingState';
import './owner-operations.css';

const STATUS_MAP: Record<string, { label: string; bg: string; fg: string }> = {
  RUNNING: { label: 'Đang diễn ra', bg: 'var(--po-soft)', fg: 'var(--po-accent-strong)' },
  SCHEDULED: { label: 'Đã lên lịch', bg: '#fef3c7', fg: '#d97706' },
  COMPLETED: { label: 'Hoàn thành', bg: '#ecfdf5', fg: '#16a34a' },
  CANCELLED: { label: 'Đã hủy', bg: '#fee2e2', fg: '#dc2626' },
  DRAFT: { label: 'Bản nháp', bg: 'var(--po-raised)', fg: 'var(--po-muted)' },
};

type Tab = 'courses' | 'participants' | 'analytics';

export function OwnerTrainingBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('courses');
  const [participantPage, setParticipantPage] = useState(1);
  const [dialogAction, setDialogAction] = useState<'activate' | 'complete' | 'cancel' | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: batch, isLoading } = useTrainingBatch(id);
  const completeMutation = useCompleteTrainingBatch();
  const cancelMutation = useCancelTrainingBatch();
  const activateMutation = useActivateTrainingBatch();

  if (isLoading) {
    return <div className="po-owner -m-4 md:-m-6 min-h-screen" style={PULSE_TOKENS}><PageLoading label="Đang tải chi tiết đợt đào tạo" variant="detail" /></div>;
  }

  if (!batch) {
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
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--po-ink)' }}
          >
            Không tìm thấy đợt đào tạo
          </h2>
          <Link
            to="/enterprise/training-batches"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--po-accent)' }}
          >
            <ArrowLeft className="size-3.5" /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const courses = batch.courses || [];
  const participants = batch.participants || [];
  const participantPages = Math.max(1, Math.ceil(participants.length / 10));
  const visibleParticipants = participants.slice((participantPage - 1) * 10, participantPage * 10);
  const completedParticipants = participants.filter((p) => p.isFullyCompleted);
  const status = STATUS_MAP[batch.status] ?? STATUS_MAP.DRAFT;

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(batch.id);
      toast.success('Đã bắt đầu đợt đào tạo.');
      setDialogAction(null);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể bắt đầu đợt đào tạo.');
    }
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(batch.id);
      toast.success('Đã hoàn thành đợt đào tạo.');
      setDialogAction(null);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hoàn thành đợt.');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ id: batch.id, reason: cancelReason.trim() || undefined });
      toast.success('Đã hủy đợt đào tạo.');
      setDialogAction(null);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hủy đợt.');
    }
  };

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'courses', label: 'Khóa học', count: courses.length },
    { key: 'participants', label: 'Học viên', count: participants.length },
    { key: 'analytics', label: 'Phân tích' },
  ];

  return (
    <div
      className="po-owner owner-operations owner-operations--detail -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
      }}
    >
      {/* ── Hero ── */}
      <section
        className="px-4 md:px-6 pt-6 pb-4 mx-auto"
        style={{ maxWidth: 1800 }}
      >
        <Link
          to="/enterprise/training-batches"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold mb-4 transition-opacity hover:opacity-70"
          style={{ color: 'var(--po-muted)' }}
        >
          <ArrowLeft className="size-3" /> Đợt đào tạo
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="font-mono text-[10px] font-bold rounded px-1.5 py-0.5"
                style={{
                  background: 'var(--po-soft)',
                  color: 'var(--po-accent)',
                }}
              >
                {batch.code}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: status.bg, color: status.fg }}
              >
                {status.label}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.04em] heading-gradient">
              {batch.name}
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--po-muted)' }}>
              {batch.startDate} → {batch.endDate}
              {batch.createdByName && ` · Tạo bởi ${batch.createdByName}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {batch.status === 'DRAFT' && (
              <button
                type="button"
                onClick={() => setDialogAction('activate')}
                disabled={activateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-[11px] px-4 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'var(--po-accent)', color: '#fff' }}
              >
                <Play className="size-3.5" /> Bắt đầu
              </button>
            )}
            {batch.status === 'RUNNING' && (
              <button
                type="button"
                onClick={() => setDialogAction('complete')}
                disabled={completeMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-[11px] border px-4 py-2.5 text-xs font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                style={{ borderColor: '#bbf7d0', background: '#ecfdf5', color: '#16a34a' }}
              >
                <CheckSquare className="size-3.5" /> Kết thúc
              </button>
            )}
            {batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => setDialogAction('cancel')}
                disabled={cancelMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-[11px] border px-4 py-2.5 text-xs font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                style={{ borderColor: '#fecaca', background: '#fee2e2', color: '#dc2626' }}
              >
                <Ban className="size-3.5" /> Hủy
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── KPI strip ── */}
      <div
        className="px-4 md:px-6 py-3 mx-auto"
        style={{ maxWidth: 1800 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: 'Khóa học', value: `${courses.length} khóa` },
            { icon: Users, label: 'Học viên', value: `${participants.length} nhân sự`, accent: true },
            { icon: CheckSquare, label: 'Hoàn thành', value: `${completedParticipants.length}/${participants.length}` },
            { label: 'Tiến độ đợt', value: `${batch.overallProgressPercent}%`, accent: true },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-[13px] border p-4"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
              }}
            >
              <span
                className="text-[10px] font-bold block"
                style={{ color: 'var(--po-muted)' }}
              >
                {kpi.label}
              </span>
              <strong
                className="text-lg block mt-1"
                style={{
                  color: kpi.accent ? 'var(--po-accent)' : 'var(--po-ink)',
                }}
              >
                {kpi.value}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── Description ── */}
      {batch.description && (
        <div className="px-4 md:px-6 mx-auto" style={{ maxWidth: 1800 }}>
          <div
            className="rounded-[13px] border p-4 text-xs leading-relaxed"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
              color: 'var(--po-muted)',
            }}
          >
            <strong style={{ color: 'var(--po-ink)' }}>Mục tiêu:</strong>{' '}
            {batch.description}
          </div>
        </div>
      )}

      {/* ── Info banner for mock ── */}
      {import.meta.env.VITE_USE_MOCK !== 'true' && batch.status !== 'CANCELLED' && (
        <div className="px-4 md:px-6 mt-3 mx-auto" style={{ maxWidth: 1800 }}>
          <div
            className="rounded-[11px] border p-4 text-xs"
            style={{ borderColor: '#fdddb6', background: '#fff7ed', color: '#c2410c' }}
          >
            Chưa có khóa học nào được giao cho học viên.{' '}
            <Link to="/enterprise/assignments" className="font-bold underline">
              Giao khóa học
            </Link>{' '}
            để phân công.
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="px-4 md:px-6 mx-auto mt-4" style={{ maxWidth: 1800 }}>
        <div
          className="flex gap-1 rounded-[11px] border p-1"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="flex-1 rounded-lg px-3 py-2 text-[11px] font-bold transition-colors text-center"
              style={
                tab === t.key
                  ? { background: 'var(--po-soft)', color: 'var(--po-accent)' }
                  : { color: 'var(--po-muted)' }
              }
            >
              {t.label}
              {t.count != null && (
                <span className="ml-1 opacity-60">({t.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div
        className="px-4 md:px-6 pb-8 mt-4 mx-auto"
        style={{ maxWidth: 1800 }}
      >
        {/* COURSES */}
        {tab === 'courses' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((crs) => (
              <div
                key={crs.id}
                className="rounded-[13px] border p-4 flex flex-col justify-between"
                style={{
                  borderColor: 'var(--po-line)',
                  background: 'var(--po-surface)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-mono text-[10px] font-bold rounded px-1.5 py-0.5"
                      style={{
                        background: 'var(--po-soft)',
                        color: 'var(--po-accent)',
                      }}
                    >
                      {crs.code}
                    </span>
                    {crs.level > 0 && (
                      <span
                        className="text-[9px] font-black px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--po-soft)', color: 'var(--po-accent-strong)' }}
                      >
                        LV{crs.level}
                      </span>
                    )}
                  </div>
                  <strong
                    className="block text-xs line-clamp-2"
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {crs.title}
                  </strong>
                  {crs.durationMinutes > 0 && (
                    <small className="text-[10px]" style={{ color: 'var(--po-muted)' }}>
                      {crs.durationMinutes} phút
                    </small>
                  )}
                </div>
                <div
                  className="mt-3 pt-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid var(--po-line)' }}
                >
                  <span className="text-[10px] font-bold" style={{ color: 'var(--po-muted)' }}>
                    Tỷ lệ đạt:{' '}
                    <strong style={{ color: '#16a34a' }}>{crs.completionRate}%</strong>
                  </span>
                  <Link
                    to={`/enterprise/courses/${crs.id}?tab=pathway&batchId=${batch.id}&batchName=${encodeURIComponent(batch.name)}`}
                    className="text-[10px] font-bold inline-flex items-center gap-1 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--po-accent)' }}
                  >
                    Chi tiết <ExternalLink className="size-2.5" />
                  </Link>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-xs col-span-full py-8 text-center" style={{ color: 'var(--po-muted)' }}>
                Đợt đào tạo chưa có khóa học nào.
              </p>
            )}
          </div>
        )}

        {/* PARTICIPANTS */}
        {tab === 'participants' && (
          <div
            className="rounded-[13px] border overflow-hidden"
            style={{
              borderColor: 'var(--po-line)',
              background: 'var(--po-surface)',
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between text-[11px] font-bold"
              style={{
                borderBottom: '1px solid var(--po-line)',
                color: 'var(--po-muted)',
              }}
            >
              <span>{participants.length} học viên tham gia</span>
              <span>
                Đạt toàn bộ:{' '}
                <strong style={{ color: '#16a34a' }}>
                  {completedParticipants.length}
                </strong>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--po-line)' }}>
                    {['Học viên', 'Phòng ban', 'Vị trí', 'Khóa', 'Tiến độ', 'Trạng thái'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 font-bold"
                          style={{ color: 'var(--po-muted)' }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleParticipants.map((p) => (
                    <tr
                      key={p.employeeId}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--po-line)' }}
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/enterprise/competency-profiles/${p.employeeId}`}
                          className="font-bold hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--po-ink)' }}
                        >
                          {p.employeeName}
                        </Link>
                        <span
                          className="block font-mono text-[10px]"
                          style={{ color: 'var(--po-muted)' }}
                        >
                          {p.employeeCode}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--po-muted)' }}>
                        {p.departmentName || '–'}
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ color: 'var(--po-muted)' }}>
                          {p.positionName || '–'}
                        </span>
                        {p.jobGrade && (
                          <span
                            className="ml-1.5 font-bold rounded px-1 py-0.5"
                            style={{
                              background: 'var(--po-soft)',
                              color: 'var(--po-accent)',
                              fontSize: 9,
                            }}
                          >
                            {p.jobGrade}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: 'var(--po-ink)' }}>
                        {p.completedCoursesCount}/{p.totalCoursesCount}
                      </td>
                      <td className="px-4 py-3" style={{ width: 110 }}>
                        <div className="space-y-1">
                          <span className="font-bold" style={{ color: 'var(--po-ink)' }}>
                            {p.progressPercent}%
                          </span>
                          <div
                            className="h-[5px] w-full rounded-full overflow-hidden"
                            style={{ background: 'var(--po-line)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${p.progressPercent}%`,
                                background: p.isFullyCompleted
                                  ? '#16a34a'
                                  : 'var(--po-accent)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={
                            p.isFullyCompleted
                              ? { background: '#ecfdf5', color: '#16a34a' }
                              : p.progressPercent > 0
                                ? { background: 'var(--po-soft)', color: 'var(--po-accent-strong)' }
                                : { background: 'var(--po-raised)', color: 'var(--po-muted)' }
                          }
                        >
                          {p.isFullyCompleted
                            ? 'Hoàn thành'
                            : p.progressPercent > 0
                              ? 'Đang học'
                              : 'Chưa bắt đầu'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {participantPages > 1 && <div className="owner-operations__pagination px-4 pb-4"><span>Trang {participantPage} / {participantPages}</span><button type="button" disabled={participantPage <= 1} onClick={() => setParticipantPage((page) => page - 1)}>Trước</button><button type="button" disabled={participantPage >= participantPages} onClick={() => setParticipantPage((page) => page + 1)}>Sau</button></div>}
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div
              className="rounded-[13px] border p-5 space-y-4"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
                boxShadow: '0 10px 35px rgba(29,48,102,.025)',
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: 'var(--po-muted)' }}
              >
                Phân bố tiến độ
              </p>
              {[
                {
                  label: 'Hoàn thành 100%',
                  count: completedParticipants.length,
                  color: '#16a34a',
                },
                {
                  label: 'Đang học (1–99%)',
                  count: participants.filter(
                    (p) => p.progressPercent > 0 && !p.isFullyCompleted,
                  ).length,
                  color: 'var(--po-accent)',
                },
                {
                  label: 'Chưa bắt đầu',
                  count: participants.filter(
                    (p) => p.progressPercent === 0,
                  ).length,
                  color: 'var(--po-line)',
                },
              ].map((item) => {
                const pct =
                  participants.length > 0
                    ? Math.round((item.count / participants.length) * 100)
                    : 0;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold" style={{ color: 'var(--po-ink)' }}>
                        {item.label}
                      </span>
                      <span style={{ color: 'var(--po-muted)' }}>
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div
                      className="h-[5px] rounded-full overflow-hidden"
                      style={{ background: 'var(--po-line)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="rounded-[13px] border p-5 space-y-3"
              style={{
                borderColor: 'var(--po-line)',
                background: 'var(--po-surface)',
                boxShadow: '0 10px 35px rgba(29,48,102,.025)',
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.12em]"
                style={{ color: 'var(--po-muted)' }}
              >
                Cấu hình đợt
              </p>
              {[
                { k: 'Mã đợt', v: batch.code, mono: true },
                { k: 'Ngày bắt đầu', v: batch.startDate },
                { k: 'Hạn hoàn thành', v: batch.endDate },
                { k: 'Trạng thái', v: status.label },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex justify-between py-2 text-[11px]"
                  style={{ borderBottom: '1px solid var(--po-line)' }}
                >
                  <span style={{ color: 'var(--po-muted)' }}>{row.k}</span>
                  <strong
                    className={row.mono ? 'font-mono' : ''}
                    style={{ color: 'var(--po-ink)' }}
                  >
                    {row.v}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Modal open={dialogAction !== null} onClose={() => setDialogAction(null)} title={dialogAction === 'activate' ? 'Bắt đầu đợt đào tạo' : dialogAction === 'complete' ? 'Kết thúc đợt đào tạo' : 'Hủy đợt đào tạo'} description={batch.name} footer={<><button type="button" className="owner-operations__secondary" onClick={() => setDialogAction(null)}>Quay lại</button><button type="button" className={dialogAction === 'cancel' ? 'owner-operations__danger' : 'owner-operations__primary'} disabled={activateMutation.isPending || completeMutation.isPending || cancelMutation.isPending || (dialogAction === 'cancel' && !cancelReason.trim())} onClick={() => { if (dialogAction === 'activate') void handleActivate(); if (dialogAction === 'complete') void handleComplete(); if (dialogAction === 'cancel') void handleCancel(); }}>{dialogAction === 'activate' ? 'Bắt đầu' : dialogAction === 'complete' ? 'Kết thúc đợt' : 'Xác nhận hủy'}</button></>}><p className="text-sm leading-relaxed">{dialogAction === 'activate' ? 'Đợt đào tạo sẽ chuyển sang trạng thái đang diễn ra.' : dialogAction === 'complete' ? 'Đợt đào tạo sẽ được đánh dấu hoàn thành.' : 'Đợt đào tạo sẽ ngừng hoạt động. Vui lòng ghi rõ lý do hủy.'}</p>{dialogAction === 'cancel' && <label className="mt-4 block text-sm font-semibold">Lý do hủy<textarea className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" rows={3} value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Nhập lý do hủy đợt đào tạo" /></label>}</Modal>
    </div>
  );
}
