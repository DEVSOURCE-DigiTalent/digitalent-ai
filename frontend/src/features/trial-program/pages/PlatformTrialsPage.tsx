import { useState } from 'react';
import { toast } from 'sonner';
import { useAssignMentor, useCreateMentor, useMentors, usePlatformTrials } from '@/hooks/use-trial-program';
import type { MentorItem, PlatformTrialItem, TrialStage } from '@/services/trial-program.service';
import { Box, LoadError, Loading, PageHead } from '@/features/platform/components/pulse-ui';
import { errorMessage } from '@/features/platform/components/pulse-format';
import { StageBadge } from '../components/TrialUi';
import { formatWhen } from '../lib/trial-format';
import '../trial-program.css';

const TABS: { key: TrialStage | 'ALL'; label: string }[] = [
  { key: 'REQUESTED', label: 'Chờ phân công' },
  { key: 'ASSIGNED', label: 'Đang chấm' },
  { key: 'REPORTED', label: 'Đã có kết quả' },
  { key: 'ALL', label: 'Tất cả' },
];

/** PA-14 · Dùng thử doanh nghiệp: yêu cầu chấm bài (hạn làm bài, giờ mong muốn chấm), phân công mentor, tài khoản mentor. */
export function PlatformTrialsPage() {
  const trials = usePlatformTrials();
  const mentors = useMentors();
  const [tab, setTab] = useState<TrialStage | 'ALL'>('REQUESTED');
  const items = (trials.data ?? []).filter((t) => tab === 'ALL' || t.stage === tab);
  const count = (stage: TrialStage) => (trials.data ?? []).filter((t) => t.stage === stage).length;

  return (
    <>
      <PageHead eyebrow="Nền tảng / Dùng thử" title="Yêu cầu chấm bài dùng thử." />
      <Box>
        <div className="pa-filters pa-row-between">
          <div className="pa-tabs" role="group" aria-label="Lọc yêu cầu">
            {TABS.map((t) => (
              <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)}>
                {t.label}
                {t.key !== 'ALL' && count(t.key) > 0 ? ` (${count(t.key)})` : ''}
              </button>
            ))}
          </div>
        </div>
        {trials.isLoading && <Loading />}
        {trials.error && <LoadError error={trials.error} />}
        {trials.data && items.length === 0 && <p className="pa-empty">Không có doanh nghiệp nào.</p>}
        {items.length > 0 && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doanh nghiệp</th>
                  <th className="num">Đã nộp</th>
                  <th>Hạn làm bài</th>
                  <th>Muốn chấm lúc</th>
                  <th>Mentor</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.organizationId}>
                    <td>
                      <strong className="pa-cell-title">{t.organizationName}</strong>
                      <small className="pa-cell-sub">{t.ownerName} · {t.ownerEmail}</small>
                      {t.requestNote && <small className="pa-cell-sub">“{t.requestNote}”</small>}
                    </td>
                    <td className="num">
                      <strong>{t.submitted}</strong> / {t.participants}
                      {t.reviewed > 0 && <small className="pa-cell-sub">đã chấm {t.reviewed}</small>}
                    </td>
                    <td>{formatWhen(t.testDeadline)}</td>
                    <td>{formatWhen(t.preferredReviewAt)}</td>
                    <td><MentorCell trial={t} mentors={mentors.data ?? []} /></td>
                    <td><span className="tp-vars"><StageBadge stage={t.stage} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>
      <MentorsBox mentors={mentors.data} loading={mentors.isLoading} />
    </>
  );
}

function MentorCell({ trial, mentors }: { trial: PlatformTrialItem; mentors: MentorItem[] }) {
  const [choice, setChoice] = useState(trial.mentorUserId ?? '');
  const assign = useAssignMentor();
  if (trial.stage === 'SETUP') return <span className="pa-cell-sub">Chưa gửi yêu cầu</span>;
  if (trial.stage === 'REPORTED') return <span>{trial.mentorName}</span>;
  const active = mentors.filter((m) => m.status === 'ACTIVE');
  return (
    <div className="pa-chips" style={{ flexWrap: 'nowrap' }}>
      <select aria-label={`Mentor cho ${trial.organizationName}`} value={choice} onChange={(e) => setChoice(e.target.value)}>
        <option value="">Chọn mentor</option>
        {active.map((m) => (
          <option key={m.userId} value={m.userId}>{m.fullName} ({m.activeTrials})</option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-primary btn-small"
        disabled={!choice || choice === trial.mentorUserId || assign.isPending}
        onClick={() =>
          assign.mutate(
            { organizationId: trial.organizationId, mentorUserId: choice },
            { onSuccess: () => toast.success('Đã phân công mentor'), onError: (err) => toast.error(errorMessage(err)) },
          )
        }
      >
        {trial.mentorUserId ? 'Đổi' : 'Giao'}
      </button>
    </div>
  );
}

function MentorsBox({ mentors, loading }: { mentors?: MentorItem[]; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const create = useCreateMentor();
  const valid = form.fullName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && form.password.length >= 12;
  return (
    <Box>
      <div className="pa-row-between">
        <h2 style={{ margin: 0, fontSize: 17 }}>Mentor</h2>
        <button type="button" className="btn btn-outline btn-small" onClick={() => setOpen((v) => !v)}>{open ? 'Đóng' : '+ Thêm mentor'}</button>
      </div>
      {open && (
        <form
          className="pa-chips"
          style={{ margin: '12px 0', alignItems: 'flex-end' }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            create.mutate(
              { fullName: form.fullName.trim(), email: form.email.trim(), password: form.password },
              {
                onSuccess: (m) => {
                  toast.success(`Đã tạo ${m.email}`);
                  setForm({ fullName: '', email: '', password: '' });
                  setOpen(false);
                },
                onError: (err) => toast.error(errorMessage(err)),
              },
            );
          }}
        >
          <input aria-label="Họ tên mentor" placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input aria-label="Email mentor" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input aria-label="Mật khẩu ban đầu" type="password" placeholder="Mật khẩu (≥ 12 ký tự)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" className="btn btn-primary btn-small" disabled={!valid || create.isPending}>Tạo</button>
        </form>
      )}
      {loading && <Loading />}
      {mentors && mentors.length === 0 && <p className="pa-empty">Chưa có mentor.</p>}
      {mentors && mentors.length > 0 && (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mentor</th>
                <th className="num">Đang chấm</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mentors.map((m) => (
                <tr key={m.userId}>
                  <td>
                    <strong className="pa-cell-title">{m.fullName}</strong>
                    <small className="pa-cell-sub">{m.email}</small>
                  </td>
                  <td className="num">{m.activeTrials}</td>
                  <td>{m.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Box>
  );
}
