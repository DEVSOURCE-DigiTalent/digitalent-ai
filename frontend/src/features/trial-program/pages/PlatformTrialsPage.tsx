import { useState } from 'react';
import { toast } from 'sonner';
import { useAssignMentor, useCreateMentor, useMentors, usePlatformTrials, useRegenerateTrialInsights } from '@/hooks/use-trial-program';
import type { MentorItem, PlatformTrialItem, TrialInsightStatus, TrialStage } from '@/services/trial-program.service';
import { Box, LoadError, Loading, PageHead } from '@/features/platform/components/pulse-ui';
import { errorMessage } from '@/features/platform/components/pulse-format';
import { StageBadge } from '../components/TrialUi';
import { formatWhen } from '../lib/trial-format';
import '../trial-program.css';

const TABS: { key: TrialStage | 'ALL'; label: string }[] = [
  { key: 'OPEN', label: 'Đang làm bài' },
  { key: 'REPORTED', label: 'Đã có kết quả' },
  { key: 'SETUP', label: 'Chưa đặt hạn' },
  { key: 'ALL', label: 'Tất cả' },
];

const INSIGHT: Record<TrialInsightStatus, string> = {
  PENDING: 'AI đang viết…',
  DONE: '✦ AI',
  FALLBACK: 'Câu mẫu',
};

/**
 * PA-14 · Dùng thử doanh nghiệp: theo dõi bài làm (hạn, số bài đã nộp), gợi ý AI của báo cáo (xem trạng thái, cho viết lại)
 * và mentor chấm bài cuối khóa học thử.
 */
export function PlatformTrialsPage() {
  const trials = usePlatformTrials();
  const mentors = useMentors();
  const [tab, setTab] = useState<TrialStage | 'ALL'>('OPEN');
  const items = (trials.data ?? []).filter((t) => tab === 'ALL' || t.stage === tab);
  const count = (stage: TrialStage) => (trials.data ?? []).filter((t) => t.stage === stage).length;

  return (
    <>
      <PageHead eyebrow="Nền tảng / Dùng thử" title="Doanh nghiệp dùng thử." />
      <Box>
        <div className="pa-filters pa-row-between">
          <div className="pa-tabs" role="group" aria-label="Lọc doanh nghiệp">
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
                  <th>Gợi ý báo cáo</th>
                  <th>Mentor học thử</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.organizationId}>
                    <td>
                      <strong className="pa-cell-title">{t.organizationName}</strong>
                      <small className="pa-cell-sub">{t.ownerName} · {t.ownerEmail}</small>
                    </td>
                    <td className="num"><strong>{t.submitted}</strong> / {t.participants}</td>
                    <td>{formatWhen(t.testDeadline)}</td>
                    <td><InsightCell trial={t} /></td>
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

/** Trạng thái gợi ý AI của báo cáo và nút cho AI viết lại. */
function InsightCell({ trial }: { trial: PlatformTrialItem }) {
  const regenerate = useRegenerateTrialInsights();
  if (!trial.insightStatus) return <span className="pa-cell-sub">—</span>;
  return (
    <div className="pa-chips" style={{ flexWrap: 'nowrap' }}>
      <span>{INSIGHT[trial.insightStatus]}</span>
      <button
        type="button"
        className="btn btn-outline btn-small"
        disabled={trial.insightStatus === 'PENDING' || regenerate.isPending}
        onClick={() =>
          regenerate.mutate(trial.organizationId, {
            onSuccess: () => toast.success('Đã yêu cầu viết lại gợi ý'),
            onError: (err) => toast.error(errorMessage(err)),
          })
        }
      >
        Tạo lại
      </button>
    </div>
  );
}

function MentorCell({ trial, mentors }: { trial: PlatformTrialItem; mentors: MentorItem[] }) {
  const [choice, setChoice] = useState(trial.mentorUserId ?? '');
  const assign = useAssignMentor();
  const active = mentors.filter((m) => m.status === 'ACTIVE');
  return (
    <div className="pa-chips" style={{ flexWrap: 'nowrap' }}>
      <select aria-label={`Mentor chấm bài học thử của ${trial.organizationName}`} value={choice} onChange={(e) => setChoice(e.target.value)}>
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
                <th className="num">Doanh nghiệp</th>
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
