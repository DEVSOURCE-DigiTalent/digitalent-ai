import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Camera, Clock, Mic, Monitor, Send } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/shared/PageContainer';
import {
  useCloseTrial,
  useInviteTrialParticipants,
  useJoinTrialAsParticipant,
  useResendTrialInvitation,
  useSetTrialDeadline,
  useTrialProgram,
} from '@/hooks/use-trial-program';
import type { TrialInviteResult, TrialParticipant, TrialParticipantRow, TrialProgram, TrialReportEmployee } from '@/services/trial-program.service';
import { apiErrorMessage } from '@/lib/utils';
import { ParticipantsEditor } from '../components/ParticipantsEditor';
import { ParticipantStatus, StageBadge, Steps } from '../components/TrialUi';
import { TrialReportView } from '../components/report/TrialReportView';
import { emptyRows, isRowEmpty, rowError } from '../lib/participant-rows';
import { formatWhen, LEVEL_LABELS, percentOf, toLocalInput } from '../lib/trial-format';
import '../trial-program.css';
import '../components/report/trial-report.css';

const STEPS = ['Nhân viên', 'Hạn làm bài', 'Làm bài', 'Kết quả'];
const MIN_DEADLINE_MINUTES = 30;

/** OW-T1 · Đánh giá đội ngũ: mời nhân viên, đặt hạn, theo dõi bài làm, đóng bài và xem báo cáo năng lực. */
export function TrialProgramPage() {
  const { data, isLoading, error } = useTrialProgram();

  return (
    <PageContainer>
      <div className="tp tp-page">
        {isLoading && <p className="tp-muted">Đang tải…</p>}
        {error && <p className="tp-notice bad">{apiErrorMessage(error, 'Không tải được trang đánh giá.')}</p>}
        {data && <TrialProgramView program={data} />}
      </div>
    </PageContainer>
  );
}

function TrialProgramView({ program }: { program: TrialProgram }) {
  const current = program.stage === 'SETUP' ? 0 : program.stage === 'OPEN' ? 2 : 3;
  // Kết quả lần mời đầu (lỗi từng dòng, link kích hoạt ở môi trường thử) vẫn hiện sau khi chuyển sang bước theo dõi.
  const [lastInvite, setLastInvite] = useState<TrialInviteResult | null>(null);
  return (
    <>
      <header className="tp-head">
        <div>
          <span className="tp-eyebrow">Đánh giá đội ngũ · {program.organizationName}</span>
          <h1>{program.stage === 'REPORTED' ? 'Bảng năng lực' : 'Đánh giá năng lực đội ngũ'}</h1>
        </div>
        <StageBadge stage={program.stage} />
      </header>
      <Steps steps={STEPS} current={current} />
      <OwnerParticipation program={program} />
      {program.stage === 'SETUP' ? (
        <SetupView program={program} onInvited={setLastInvite} />
      ) : (
        <>
          <InviteResult result={lastInvite} />
          {program.stage === 'OPEN' && <OpenTest program={program} />}
          {program.stage === 'REPORTED' && program.report && (
            <TrialReportView report={program.report} choicePerCell={choicePerCellOf(program)} />
          )}
          <Participants program={program} />
        </>
      )}
    </>
  );
}

const choicePerCellOf = (program: TrialProgram) =>
  Math.max(1, Math.round(program.choiceCount / Math.max(1, (program.report?.domains.length ?? 6) * 3)));

/** Chủ doanh nghiệp tùy chọn tự làm bài (máy chấm như nhân viên) và học thử cùng nhân viên. */
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
        <span className="tp-row">Bạn đang tham gia · <ParticipantStatus status={me.status} /></span>
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
                      ? toast.success('Bạn đã tham gia. Bài của bạn được chấm tự động như nhân viên.')
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
  const [deadline, setDeadline] = useState(defaultDeadline());
  const [result, setResult] = useState<TrialInviteResult | null>(null);
  const invite = useInviteTrialParticipants();
  const setTrialDeadline = useSetTrialDeadline();
  const filled = rows.filter((r) => !isRowEmpty(r));
  const invalid = filled.some((r) => rowError(r) !== null);
  const existing = program.participants.length;
  const deadlineError = validateDeadline(deadline);
  const busy = invite.isPending || setTrialDeadline.isPending;

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
      await setTrialDeadline.mutateAsync(new Date(deadline).toISOString());
      toast.success('Đã gửi lời mời và mở bài test');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Chưa gửi được.'));
    }
  };

  return (
    <>
      <section className="tp-card">
        <div className="tp-card-head">
          <h2>1 · Nhân viên tham gia</h2>
          {existing > 0 && <span className="tp-badge info">Đã mời {existing}</span>}
        </div>
        <ParticipantsEditor rows={rows} onChange={setRows} departments={program.departments} positions={program.positions} limit={program.maxParticipants - existing} />
        <InviteResult result={result} />
      </section>

      <section className="tp-card">
        <div className="tp-card-head"><h2>2 · Hạn làm bài</h2></div>
        <div className="tp-row" style={{ alignItems: 'flex-end' }}>
          <label className="tp-field" style={{ flex: '0 1 320px' }}>
            Hạn hoàn thành bài test
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <button type="button" className="tp-btn" disabled={busy || invalid || !!deadlineError || existing + filled.length === 0} onClick={submit}>
            <Send size={15} aria-hidden /> {busy ? 'Đang gửi…' : 'Gửi lời mời & mở bài test'}
          </button>
          {deadlineError && <span className="tp-muted">{deadlineError}</span>}
        </div>
        <ExamSummary program={program} />
      </section>
    </>
  );
}

/** Bước 3: bài đang mở — tiến độ nộp theo phòng ban, đổi hạn, đóng sớm. */
function OpenTest({ program }: { program: TrialProgram }) {
  const [editing, setEditing] = useState(false);
  const people = program.participants;
  const submitted = people.filter((p) => p.status === 'SUBMITTED').length;
  const notActivated = people.filter((p) => p.status === 'INVITED' || p.status === 'INVITE_EXPIRED').length;

  return (
    <section className="tp-card">
      <div className="tp-card-head">
        <h2>Bài test đang mở</h2>
        <div className="tp-row">
          <span className="tp-badge info"><Clock size={12} aria-hidden /> Đóng {formatWhen(program.testDeadline)}</span>
          <button type="button" className="tp-btn ghost small" onClick={() => setEditing((v) => !v)}>{editing ? 'Đóng' : 'Đổi hạn'}</button>
        </div>
      </div>
      {editing && <DeadlineForm program={program} onDone={() => setEditing(false)} />}

      <div className="tp-stats">
        <div className="tp-stat"><span>Đã nộp</span><strong>{submitted}<small className="tp-muted"> / {people.length}</small></strong></div>
        <div className="tp-stat"><span>Chưa nộp</span><strong>{people.length - submitted - notActivated}</strong></div>
        <div className="tp-stat"><span>Chưa kích hoạt</span><strong>{notActivated}</strong></div>
        <div className="tp-stat"><span>Đề</span><strong>{program.choiceCount}<small className="tp-muted"> câu</small></strong></div>
      </div>

      <SubmitProgress participants={people} />
      <CloseTest program={program} submitted={submitted} />
    </section>
  );
}

const PROGRESS = [
  { key: 'done', label: 'Đã nộp', match: (p: TrialParticipant) => p.status === 'SUBMITTED' },
  { key: 'doing', label: 'Chưa nộp', match: (p: TrialParticipant) => p.status === 'ACTIVE' },
  { key: 'todo', label: 'Chưa kích hoạt', match: (p: TrialParticipant) => p.status === 'INVITED' || p.status === 'INVITE_EXPIRED' },
] as const;

/** Tiến độ nộp bài theo phòng ban (thanh xếp chồng). */
function SubmitProgress({ participants }: { participants: TrialParticipant[] }) {
  const departments = [...new Set(participants.map((p) => p.departmentName ?? 'Chưa có phòng ban'))].sort();
  return (
    <div className="rp" style={{ gap: 8 }}>
      <div className="tp-card-head">
        <span className="tp-muted">Theo phòng ban</span>
        <span className="rp-key">
          {PROGRESS.map((s) => <span key={s.key}><i style={{ background: s.key === 'done' ? 'var(--tp-l3)' : s.key === 'doing' ? 'var(--tp-l1)' : 'var(--tp-l0)' }} />{s.label}</span>)}
        </span>
      </div>
      <div className="rp-stack">
        {departments.map((name) => {
          const group = participants.filter((p) => (p.departmentName ?? 'Chưa có phòng ban') === name);
          const done = group.filter(PROGRESS[0].match).length;
          return (
            <div key={name} className="rp-srow" style={{ gridTemplateColumns: '150px 1fr 48px' }}>
              <span className="lab"><span>{name}</span></span>
              <span className="rp-bar" role="img" aria-label={`${name}: ${done}/${group.length} đã nộp`}>
                {PROGRESS.map((s) => {
                  const n = group.filter(s.match).length;
                  return n > 0 ? <i key={s.key} data-state={s.key} style={{ flex: n }} title={`${s.label}: ${n}`} /> : null;
                })}
              </span>
              <b>{done}/{group.length}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** "Xem kết quả ngay": đóng bài trước hạn — hỏi lại vì người chưa nộp sẽ không làm được nữa. */
function CloseTest({ program, submitted }: { program: TrialProgram; submitted: number }) {
  const [confirming, setConfirming] = useState(false);
  const close = useCloseTrial();
  const remaining = program.participants.length - submitted;

  return (
    <div className="tp-notice tp-row" style={{ justifyContent: 'space-between' }}>
      {confirming ? (
        <>
          <span className="tp-row"><AlertTriangle size={15} aria-hidden /> Đóng bài? {remaining} người chưa nộp sẽ không làm được nữa.</span>
          <span className="tp-row">
            <button type="button" className="tp-btn ghost small" onClick={() => setConfirming(false)}>Hủy</button>
            <button
              type="button"
              className="tp-btn small"
              disabled={close.isPending}
              onClick={() =>
                close.mutate(undefined, {
                  onSuccess: (r) => toast.success(`Đã tạo báo cáo từ ${r.assessed} bài`),
                  onError: (err) => toast.error(apiErrorMessage(err, 'Chưa đóng được bài.')),
                })
              }
            >
              {close.isPending ? 'Đang tạo báo cáo…' : 'Đóng bài'}
            </button>
          </span>
        </>
      ) : (
        <>
          <span>Kết quả tự tạo khi <b>hết hạn</b> hoặc <b>đủ {program.participants.length} bài</b>.</span>
          <button type="button" className="tp-btn small" disabled={submitted === 0} onClick={() => setConfirming(true)}>
            Xem kết quả ngay ({submitted} bài)
          </button>
        </>
      )}
    </div>
  );
}

/** Danh sách nhân viên; sau khi có kết quả kèm mức 6 lĩnh vực và dấu rủi ro giám sát. */
function Participants({ program }: { program: TrialProgram }) {
  const [adding, setAdding] = useState(false);
  const [resent, setResent] = useState<TrialInviteResult | null>(null);
  const reported = program.stage === 'REPORTED';
  const results = new Map((program.report?.employees ?? []).map((e) => [e.employeeId, e]));

  return (
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
              {reported ? <th>Mức {program.report?.domains.map((d) => `M${d.number}`).join(' · ')}</th> : <th>Nộp lúc</th>}
              {!reported && <th aria-label="Thao tác" />}
            </tr>
          </thead>
          <tbody>
            {program.participants.map((p) => {
              const result = p.employeeId ? results.get(p.employeeId) : undefined;
              return (
                <tr key={p.id}>
                  <td>{p.fullName}{p.isOwner ? ' (bạn)' : ''}<small>{p.email}</small></td>
                  <td>{[p.departmentName, p.positionName].filter(Boolean).join(' · ') || '—'}</td>
                  <td><ParticipantStatus status={p.status} /></td>
                  {reported ? <td><EmployeeLevels result={result} /></td> : <td>{formatWhen(p.submittedAt)}</td>}
                  {!reported && <td>{p.invitationId && <ResendButton participant={p} onResent={setResent} />}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EmployeeLevels({ result }: { result?: TrialReportEmployee }) {
  if (!result) return <span className="tp-muted">—</span>;
  return (
    <span className="tp-row" style={{ gap: 6, flexWrap: 'nowrap' }}>
      <span className="rp-levels" role="img" aria-label={result.levels.map((l, i) => `M${i + 1} ${LEVEL_LABELS[l]}`).join(', ')}>
        {result.levels.map((level, i) => <i key={i} data-level={level} title={`M${i + 1}: ${LEVEL_LABELS[level]}`} />)}
      </span>
      <small className="tp-muted" style={{ display: 'inline' }}>{result.choiceScore}/{result.choiceTotal} · {percentOf(result.choiceScore, result.choiceTotal)}%</small>
      {result.riskLevel === 'HIGH' && <span className="tp-badge bad" title="Rủi ro giám sát cao — vẫn tính vào kết quả"><AlertTriangle size={11} aria-hidden /> rủi ro</span>}
    </span>
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
    <div className="tp-card" style={{ background: 'var(--tp-raised)' }}>
      <ParticipantsEditor rows={rows} onChange={setRows} departments={program.departments} positions={program.positions} limit={program.maxParticipants - program.participants.length} />
      <InviteResult result={result} />
      <div className="tp-row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="tp-btn" disabled={invite.isPending || filled.length === 0 || filled.some((r) => rowError(r) !== null)} onClick={send}>
          {invite.isPending ? 'Đang gửi…' : `Gửi lời mời (${filled.length} người)`}
        </button>
      </div>
    </div>
  );
}

function DeadlineForm({ program, onDone }: { program: TrialProgram; onDone: () => void }) {
  const [deadline, setDeadline] = useState(toLocalInput(program.testDeadline));
  const setTrialDeadline = useSetTrialDeadline();
  const error = validateDeadline(deadline);
  return (
    <div className="tp-row" style={{ alignItems: 'flex-end' }}>
      <label className="tp-field" style={{ flex: '0 1 320px' }}>
        Hạn hoàn thành bài test
        <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </label>
      {error && <span className="tp-muted">{error}</span>}
      <button
        type="button"
        className="tp-btn"
        disabled={!!error || setTrialDeadline.isPending}
        onClick={() =>
          setTrialDeadline.mutate(new Date(deadline).toISOString(), {
            onSuccess: () => {
              toast.success('Đã đổi hạn');
              onDone();
            },
            onError: (err) => toast.error(apiErrorMessage(err, 'Chưa đổi được hạn.')),
          })
        }
      >
        Lưu hạn
      </button>
    </div>
  );
}

function defaultDeadline() {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3);
  deadline.setHours(17, 0, 0, 0);
  return toLocalInput(deadline);
}

function validateDeadline(value: string): string | null {
  if (!value) return 'Chọn hạn làm bài.';
  if (new Date(value).getTime() < Date.now() + MIN_DEADLINE_MINUTES * 60_000) return `Hạn làm bài cần sau ít nhất ${MIN_DEADLINE_MINUTES} phút.`;
  return null;
}

function ExamSummary({ program }: { program: TrialProgram }) {
  return (
    <p className="tp-muted tp-row">
      Bài test: {program.choiceCount} câu trắc nghiệm (Cơ bản · Trung cấp · Nâng cao), chấm tự động ·
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
          {result.rejected.map((r) => <div key={r.email}>{r.email || '(trống)'}: {r.reason}</div>)}
        </div>
      )}
      {links.length > 0 && (
        <div className="tp-notice">
          <strong>Link kích hoạt (môi trường thử):</strong>
          {links.map((i) => <div key={i.email}>{i.email}: <a href={i.debugLink!}>{i.debugLink}</a></div>)}
        </div>
      )}
    </>
  );
}
