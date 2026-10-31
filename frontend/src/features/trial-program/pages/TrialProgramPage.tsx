import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Lock, Mic, Monitor, Send } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/shared/PageContainer';
import { useInviteTrialParticipants, useJoinTrialAsParticipant, useResendTrialInvitation, useSubmitTrialRequest, useTrialProgram } from '@/hooks/use-trial-program';
import type { TrialInviteResult, TrialParticipant, TrialParticipantRow, TrialProgram, TrialReport } from '@/services/trial-program.service';
import { apiErrorMessage } from '@/lib/utils';
import { ParticipantsEditor } from '../components/ParticipantsEditor';
import { CompetencyReport, ParticipantStatus, StageBadge, Steps } from '../components/TrialUi';
import { emptyRows, isRowEmpty, rowError } from '../lib/participant-rows';
import { BUY_COURSES_PATH } from '../lib/buy-courses';
import { formatWhen, toLocalInput } from '../lib/trial-format';
import '../trial-program.css';

const STEPS = ['Nhân viên', 'Hạn & lịch chấm', 'Làm bài & chấm', 'Kết quả'];

/** OW-T1 · Dùng thử: mời nhân viên, đặt hạn làm bài + giờ mong muốn chấm, theo dõi và xem bảng năng lực. */
export function TrialProgramPage() {
  const { data, isLoading, error } = useTrialProgram();

  return (
    <PageContainer>
      <div className="tp tp-page">
        {isLoading && <p className="tp-muted">Đang tải…</p>}
        {error && <p className="tp-notice bad">{apiErrorMessage(error, 'Không tải được trang dùng thử.')}</p>}
        {data && <TrialProgramView program={data} />}
      </div>
    </PageContainer>
  );
}

function TrialProgramView({ program }: { program: TrialProgram }) {
  const current = program.stage === 'SETUP' ? 0 : program.stage === 'REPORTED' ? 3 : 2;
  // Kết quả lần mời đầu (lỗi từng dòng, link kích hoạt ở môi trường thử) vẫn hiện sau khi chuyển sang bước theo dõi.
  const [lastInvite, setLastInvite] = useState<TrialInviteResult | null>(null);
  return (
    <>
      <header className="tp-head">
        <div>
          <span className="tp-eyebrow">Đánh giá đội ngũ · {program.organizationName}</span>
          <h1>{program.stage === 'REPORTED' ? 'Bảng năng lực của doanh nghiệp' : 'Đánh giá năng lực đội ngũ'}</h1>
        </div>
        <div className="tp-row" style={{ gap: 8, alignItems: 'center' }}>
          <Link to="/enterprise/dashboard" className="tp-btn ghost small">
            Về Tổng quan ➔
          </Link>
          <StageBadge stage={program.stage} />
        </div>
      </header>
      <Steps steps={STEPS} current={current} />
      <OwnerParticipation program={program} />
      {program.stage === 'SETUP' ? (
        <SetupView program={program} onInvited={setLastInvite} />
      ) : (
        <>
          <InviteResult result={lastInvite} />
          <TrackView program={program} />
        </>
      )}
    </>
  );
}

/**
 * Chủ doanh nghiệp tùy chọn tự làm bài (mentor chấm như nhân viên) và học thử cùng nhân viên; không chấm bài của ai.
 */
function OwnerParticipation({ program }: { program: TrialProgram }) {
  const me = program.participants.find((p) => p.isOwner);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState({ department: '', position: '' });
  const join = useJoinTrialAsParticipant();
  const listId = useId();
  const reported = program.stage === 'REPORTED';

  if (me) {
    return (
      <section className="tp-card tp-row" style={{ justifyContent: 'space-between' }}>
        <span className="tp-row">
          Bạn đang tham gia · <ParticipantStatus status={me.status} />
        </span>
        <Link to="/enterprise/me/trial-test" className="tp-btn small">
          {reported ? 'Kết quả & học thử của tôi' : 'Bài test của tôi'} <ArrowRight size={14} aria-hidden />
        </Link>
      </section>
    );
  }

  const ready = placement.department.trim() && placement.position.trim();
  return (
    <section className="tp-card">
      <div className="tp-card-head">
        <span>{reported ? 'Bạn muốn học thử cùng nhân viên?' : 'Bạn cũng muốn làm bài test và học thử?'}</span>
        {!open && <button type="button" className="tp-btn ghost small" onClick={() => setOpen(true)}>Tham gia</button>}
      </div>
      {open && (
        <div className="tp-row" style={{ alignItems: 'flex-end' }}>
          <label className="tp-field" style={{ flex: '1 1 180px' }}>
            Phòng ban
            <input list={`${listId}-d`} value={placement.department} maxLength={150} onChange={(e) => setPlacement({ ...placement, department: e.target.value })} />
          </label>
          <label className="tp-field" style={{ flex: '1 1 180px' }}>
            Vị trí
            <input list={`${listId}-p`} value={placement.position} maxLength={150} onChange={(e) => setPlacement({ ...placement, position: e.target.value })} />
          </label>
          <datalist id={`${listId}-d`}>{program.departments.map((d) => <option key={d} value={d} />)}</datalist>
          <datalist id={`${listId}-p`}>{program.positions.map((p) => <option key={p} value={p} />)}</datalist>
          <button
            type="button"
            className="tp-btn"
            disabled={!ready || join.isPending}
            onClick={() =>
              join.mutate(
                { department: placement.department.trim(), position: placement.position.trim() },
                {
                  onSuccess: ({ refreshed }) =>
                    refreshed
                      ? toast.success('Bạn đã tham gia. Mentor sẽ chấm bài của bạn như nhân viên.')
                      : toast.warning('Bạn đã tham gia. Hãy đăng xuất rồi đăng nhập lại để vào bài test.'),
                  onError: (err) => toast.error(apiErrorMessage(err, 'Chưa tham gia được.')),
                },
              )
            }
          >
            {join.isPending ? 'Đang xử lý…' : 'Xác nhận'}
          </button>
          <button type="button" className="tp-btn ghost" onClick={() => setOpen(false)}>Hủy</button>
        </div>
      )}
    </section>
  );
}

/** Bước 1–2: danh sách nhân viên + hạn làm bài, gửi một lần. */
function SetupView({ program, onInvited }: { program: TrialProgram; onInvited: (result: TrialInviteResult) => void }) {
  const [rows, setRows] = useState<TrialParticipantRow[]>(emptyRows());
  const [schedule, setSchedule] = useState(defaultSchedule());
  const [result, setResult] = useState<TrialInviteResult | null>(null);
  const invite = useInviteTrialParticipants();
  const request = useSubmitTrialRequest();
  const filled = rows.filter((r) => !isRowEmpty(r));
  const invalid = filled.some((r) => rowError(r) !== null);
  const existing = program.participants.length;
  const scheduleError = validateSchedule(schedule);
  const busy = invite.isPending || request.isPending;

  const submit = async () => {
    try {
      let invited = 0;
      if (filled.length > 0) {
        const outcome = await invite.mutateAsync(filled);
        setResult(outcome);
        onInvited(outcome);
        invited = outcome.invited.length;
        const rejected = new Set(outcome.rejected.map((r) => r.email.toLowerCase()));
        setRows(filled.filter((r) => rejected.has(r.email.trim().toLowerCase())));
      }
      if (existing + invited === 0) return;
      await request.mutateAsync(toRequest(schedule));
      toast.success('Đã gửi lời mời và đăng ký chấm');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Chưa gửi được.'));
    }
  };

  return (
    <>
      <section className="tp-card">
        <div className="tp-card-head">
          <h2>1. Nhân viên tham gia</h2>
          {existing > 0 && <span className="tp-badge info">Đã mời {existing}</span>}
        </div>
        <ParticipantsEditor rows={rows} onChange={setRows} departments={program.departments} positions={program.positions} limit={program.maxParticipants - existing} />
        <InviteResult result={result} />
      </section>

      <section className="tp-card">
        <h2>2. Hạn làm bài & lịch chấm</h2>
        <ScheduleFields value={schedule} onChange={setSchedule} />
        <ExamSummary program={program} />
      </section>

      <div className="tp-row" style={{ justifyContent: 'flex-end' }}>
        {scheduleError && <span className="tp-muted">{scheduleError}</span>}
        <button type="button" className="tp-btn" disabled={busy || invalid || !!scheduleError || existing + filled.length === 0} onClick={submit}>
          <Send size={15} aria-hidden /> {busy ? 'Đang gửi…' : 'Gửi lời mời & đăng ký chấm'}
        </button>
      </div>
    </>
  );
}

/** Bước 3–4: theo dõi bài làm, mời thêm, đổi lịch; bảng năng lực khi có kết quả. */
function TrackView({ program }: { program: TrialProgram }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [resent, setResent] = useState<TrialInviteResult | null>(null);
  const count = (statuses: string[]) => program.participants.filter((p) => statuses.includes(p.status)).length;
  const reported = program.stage === 'REPORTED';

  return (
    <>
      <div className="tp-stats">
        <Stat label="Nhân viên" value={program.participants.length} />
        <Stat label="Đã kích hoạt" value={count(['ACTIVE', 'SUBMITTED', 'REVIEWED'])} />
        <Stat label="Đã nộp bài" value={count(['SUBMITTED', 'REVIEWED'])} />
        <Stat label="Đã chấm" value={count(['REVIEWED'])} />
      </div>

      <section className="tp-card">
        <div className="tp-card-head">
          <h2>Lịch</h2>
          {!reported && <button type="button" className="tp-btn ghost small" onClick={() => setEditing((v) => !v)}>{editing ? 'Đóng' : 'Đổi lịch'}</button>}
        </div>
        {editing ? (
          <RescheduleForm program={program} onDone={() => setEditing(false)} />
        ) : (
          <div className="tp-grid-2">
            <Info label="Hạn làm bài" value={formatWhen(program.testDeadline)} />
            <Info label="Giờ mong muốn chấm" value={formatWhen(program.preferredReviewAt)} />
            <Info label="Mentor" value={program.mentorName ?? 'Chờ DigiTalent phân công'} />
          </div>
        )}
      </section>

      {reported && program.report && (
        <>
          <BuyCourses report={program.report} />
          <CompetencyReport report={program.report} />
        </>
      )}

      <section className="tp-card">
        <div className="tp-card-head">
          <h2>Nhân viên</h2>
          {!reported && program.participants.length < program.maxParticipants && (
            <button type="button" className="tp-btn ghost small" onClick={() => setAdding((v) => !v)}>{adding ? 'Đóng' : '+ Mời thêm'}</button>
          )}
        </div>
        {adding && <AddParticipants program={program} onDone={() => setAdding(false)} />}
        <InviteResult result={resent} />
        <div className="tp-table-wrap">
          <table className="tp-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Phòng ban · Vị trí</th>
                <th>Trạng thái</th>
                <th>Nộp lúc</th>
                {!reported && <th aria-label="Thao tác" />}
              </tr>
            </thead>
            <tbody>
              {program.participants.map((p) => (
                <tr key={p.id}>
                  <td>{p.fullName}{p.isOwner ? ' (bạn)' : ''}<small>{p.email}</small></td>
                  <td>{[p.departmentName, p.positionName].filter(Boolean).join(' · ') || '—'}</td>
                  <td><ParticipantStatus status={p.status} /></td>
                  <td>{formatWhen(p.submittedAt)}</td>
                  {!reported && (
                    <td>
                      {p.invitationId && <ResendButton participant={p} onResent={setResent} />}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/**
 * Sau khi có bảng năng lực: nhân viên đang học thử Cơ bản, doanh nghiệp mua khóa Trung cấp / Nâng cao để đi tiếp.
 * Gợi ý hai lĩnh vực thấp nhất còn dưới Trung cấp.
 */
function BuyCourses({ report }: { report: TrialReport }) {
  const weakest = [...report.summary].filter((d) => d.level < 2).sort((a, b) => a.average - b.average).slice(0, 2);
  return (
    <section className="tp-buy" aria-labelledby="tp-buy-title">
      <span className="tp-buy-icon" aria-hidden><Lock size={18} /></span>
      <div>
        <strong id="tp-buy-title">Nâng đội ngũ lên Trung cấp, Nâng cao</strong>
        <span>
          Nhân viên đang học thử {report.summary.length} khóa Cơ bản.
          {weakest.length > 0 && ` Nên ưu tiên: ${weakest.map((d) => d.name).join(', ')}.`}
        </span>
      </div>
      <Link to={BUY_COURSES_PATH} className="tp-btn light">Mua khóa học <ArrowRight size={15} aria-hidden /></Link>
    </section>
  );
}

/** Gửi lại email mời (link mới, lời mời cũ hết hiệu lực) cho nhân viên chưa kích hoạt. */
function ResendButton({ participant, onResent }: { participant: TrialParticipant; onResent: (result: TrialInviteResult) => void }) {
  const resend = useResendTrialInvitation();
  return (
    <button
      type="button"
      className="tp-btn ghost small"
      disabled={resend.isPending}
      onClick={() =>
        resend.mutate(participant.invitationId!, {
          onSuccess: (result) => {
            toast.success(`Đã gửi lại lời mời tới ${participant.email}`);
            onResent({ invited: [{ email: participant.email, fullName: participant.fullName, debugLink: result.debugLink }], rejected: [] });
          },
          onError: (err) => toast.error(apiErrorMessage(err, 'Chưa gửi lại được.')),
        })
      }
    >
      {resend.isPending ? 'Đang gửi…' : 'Gửi lại'}
    </button>
  );
}

function AddParticipants({ program, onDone }: { program: TrialProgram; onDone: () => void }) {
  const [rows, setRows] = useState<TrialParticipantRow[]>(emptyRows(1));
  const [result, setResult] = useState<TrialInviteResult | null>(null);
  const invite = useInviteTrialParticipants();
  const filled = rows.filter((r) => !isRowEmpty(r));
  const send = () =>
    invite.mutate(filled, {
      onSuccess: (outcome) => {
        setResult(outcome);
        const rejected = new Set(outcome.rejected.map((r) => r.email.toLowerCase()));
        const left = filled.filter((r) => rejected.has(r.email.trim().toLowerCase()));
        setRows(left.length ? left : emptyRows(1));
        if (outcome.invited.length) toast.success(`Đã mời ${outcome.invited.length} người`);
        if (!outcome.rejected.length && !outcome.invited.some((i) => i.debugLink)) onDone();
      },
      onError: (err) => toast.error(apiErrorMessage(err, 'Chưa mời được.')),
    });
  return (
    <div className="tp" style={{ gap: 10 }}>
      <ParticipantsEditor rows={rows} onChange={setRows} departments={program.departments} positions={program.positions} limit={program.maxParticipants - program.participants.length} />
      <InviteResult result={result} />
      <div className="tp-row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="tp-btn" disabled={invite.isPending || filled.length === 0 || filled.some((r) => rowError(r) !== null)} onClick={send}>
          {invite.isPending ? 'Đang gửi…' : `Gửi lời mời (${filled.length})`}
        </button>
      </div>
    </div>
  );
}

function RescheduleForm({ program, onDone }: { program: TrialProgram; onDone: () => void }) {
  const [schedule, setSchedule] = useState({
    deadline: toLocalInput(program.testDeadline),
    review: toLocalInput(program.preferredReviewAt),
    note: program.requestNote ?? '',
  });
  const request = useSubmitTrialRequest();
  const error = validateSchedule(schedule);
  return (
    <div className="tp" style={{ gap: 10 }}>
      <ScheduleFields value={schedule} onChange={setSchedule} />
      <div className="tp-row" style={{ justifyContent: 'flex-end' }}>
        {error && <span className="tp-muted">{error}</span>}
        <button
          type="button"
          className="tp-btn"
          disabled={!!error || request.isPending}
          onClick={() =>
            request.mutate(toRequest(schedule), {
              onSuccess: () => {
                toast.success('Đã cập nhật lịch');
                onDone();
              },
              onError: (err) => toast.error(apiErrorMessage(err, 'Chưa cập nhật được.')),
            })
          }
        >
          Lưu lịch
        </button>
      </div>
    </div>
  );
}

type Schedule = { deadline: string; review: string; note: string };

function defaultSchedule(): Schedule {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3);
  deadline.setHours(17, 0, 0, 0);
  const review = new Date(deadline);
  review.setDate(review.getDate() + 1);
  review.setHours(9, 0, 0, 0);
  return { deadline: toLocalInput(deadline), review: toLocalInput(review), note: '' };
}

function validateSchedule(s: Schedule): string | null {
  if (!s.deadline || !s.review) return 'Chọn hạn làm bài và giờ chấm.';
  const deadline = new Date(s.deadline).getTime();
  if (deadline < Date.now() + 30 * 60_000) return 'Hạn làm bài cần sau ít nhất 30 phút.';
  if (new Date(s.review).getTime() < deadline) return 'Giờ chấm phải sau hạn làm bài.';
  return null;
}

const toRequest = (s: Schedule) => ({
  testDeadline: new Date(s.deadline).toISOString(),
  preferredReviewAt: new Date(s.review).toISOString(),
  note: s.note.trim() || null,
});

function ScheduleFields({ value, onChange }: { value: Schedule; onChange: (v: Schedule) => void }) {
  return (
    <div className="tp-grid-2">
      <label className="tp-field">
        Hạn hoàn thành bài test
        <input type="datetime-local" value={value.deadline} onChange={(e) => onChange({ ...value, deadline: e.target.value })} />
      </label>
      <label className="tp-field">
        Giờ mong muốn mentor chấm
        <input type="datetime-local" value={value.review} onChange={(e) => onChange({ ...value, review: e.target.value })} />
      </label>
      <label className="tp-field" style={{ gridColumn: '1 / -1' }}>
        Ghi chú cho DigiTalent (không bắt buộc)
        <input value={value.note} maxLength={500} placeholder="VD: ưu tiên chấm phòng Kế toán trước" onChange={(e) => onChange({ ...value, note: e.target.value })} />
      </label>
    </div>
  );
}

function ExamSummary({ program }: { program: TrialProgram }) {
  return (
    <p className="tp-muted tp-row">
      Bài test: {program.choiceCount} câu trắc nghiệm + {program.essayCount} tự luận (Cơ bản · Trung cấp · Nâng cao) ·
      <Camera size={14} aria-hidden /> camera <Mic size={14} aria-hidden /> micro <Monitor size={14} aria-hidden /> chia sẻ màn hình
    </p>
  );
}

function InviteResult({ result }: { result: TrialInviteResult | null }) {
  if (!result) return null;
  const links = result.invited.filter((i) => i.debugLink);
  return (
    <>
      {result.rejected.length > 0 && (
        <div className="tp-notice bad" role="alert">
          {result.rejected.map((r) => (
            <div key={r.email}>{r.email || '(trống)'}: {r.reason}</div>
          ))}
        </div>
      )}
      {links.length > 0 && (
        <div className="tp-notice">
          <strong>Link kích hoạt (môi trường thử):</strong>
          {links.map((i) => (
            <div key={i.email}>{i.email}: <a href={i.debugLink!}>{i.debugLink}</a></div>
          ))}
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="tp-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="tp-field">
      {label}
      <strong style={{ color: 'var(--tp-fg)', fontSize: 14 }}>{value}</strong>
    </div>
  );
}
