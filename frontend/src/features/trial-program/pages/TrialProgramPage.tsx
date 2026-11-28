import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  CalendarClock,
  ChevronUp,
  ClipboardCheck,
  Clock,
  ListChecks,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserCheck,
  Users,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useInviteTrialParticipants,
  useResendTrialInvitation,
  useSubmitTrialRequest,
  useTrialProgram,
} from '@/hooks/use-trial-program';
import type {
  TrialInviteResult,
  TrialParticipant,
  TrialParticipantRow,
  TrialProgram,
} from '@/services/trial-program.service';
import { apiErrorMessage } from '@/lib/utils';
import { useCapabilityCeilings } from '@/hooks/use-capability-ceilings';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SKILL_GAP_PATH, useSurveyOver } from '@/hooks/use-survey-over';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { Modal } from '@/components/shared/Modal';
import { clearSurveyDraft, readSurveyDraft, saveSurveyDraft, SURVEY_EXPECTATION_PATH } from '../lib/survey-draft';
import { PageLoading } from '@/components/shared/LoadingState';
import { PULSE_TOKENS } from '@/features/organization/owner-theme';
import { ParticipantsEditor } from '../components/ParticipantsEditor';
import { normalizeDeadlineTime, TrialDeadlinePicker } from '../components/TrialDeadlinePicker';
import { TrialDisclosure } from '../components/TrialDisclosure';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import { OwnerSurveyAction } from '../components/OwnerSurveyAction';
import { CompetencyReport, ParticipantStatus, Steps } from '../components/OwnerTrialUi';
import { emptyRows, isRowEmpty, rowError } from '../lib/participant-rows';
import { formatWhen, toLocalInput } from '../lib/trial-format';
import '../trial-program.css';
import '../owner-team-assessment.css';
import '@/features/organization/components/owner-filter-controls.css';

/**
 * Three milestones: the owner acts in the first two; in the last one the team takes the test and the expert's
 * results arrive on this page, so waiting and results are one step whose detail says where it stands. Between the list
 * and the deadline a popup asks what the results are compared with: the levels set for departments (else the system
 * suggestion), or set them in "Khung năng lực số" and come back to the deadline with the list kept.
 */
const STEP_LABELS = ['Chọn người làm bài', 'Đặt hạn, gửi lời mời', 'Làm bài & nhận kết quả'];
/** 0 = who takes the test, 1 = deadline + invitations. */
type SetupStep = 0 | 1;
const LIST_PAGE_SIZE = 10;
/** Search and filters help from a handful of people on; pages start after LIST_PAGE_SIZE. */
const LIST_TOOLS_MIN = 6;
const NO_DEPARTMENT = '__no_department__';

const isSubmitted = (p: TrialParticipant) => p.status === 'SUBMITTED' || p.status === 'REVIEWED';
const isPastDeadline = (program: TrialProgram) => Boolean(program.testDeadline && Date.parse(program.testDeadline) <= Date.now());

type ResultPhase = 'taking' | 'grading' | 'empty' | 'reported';

/** Where step 3 stands: still taking the test, the expert is grading (everyone submitted or the deadline passed), nobody submitted, or results out. */
function resultPhase(program: TrialProgram): ResultPhase {
  if (program.stage === 'REPORTED') return 'reported';
  const total = program.participants.length;
  const submitted = program.participants.filter(isSubmitted).length;
  const expired = isPastDeadline(program);
  if (submitted > 0 && (submitted === total || expired)) return 'grading';
  return expired && submitted === 0 ? 'empty' : 'taking';
}

/** OW-T1 · Khảo sát năng lực số: mời nhân viên làm bài, theo dõi bài nộp và đọc kết quả theo 6 lĩnh vực. */
/** OW-T1. Once the organization uses the platform for real (a course bought, or converted) the survey's gaps live on
 * "Khoảng trống năng lực": the address leads there. */
export function TrialProgramPage() {
  const surveyOver = useSurveyOver();
  if (surveyOver) return <Navigate to={SKILL_GAP_PATH} replace />;
  return <TrialSurveyPage />;
}

function TrialSurveyPage() {
  useUiLanguage();
  const { data, isLoading, error } = useTrialProgram();

  return (
    <div
      className="po-owner owner-team-assessment -m-4 md:-m-6 min-h-screen text-[#17243f] relative"
      style={{
        ...PULSE_TOKENS,
        background: `
          radial-gradient(circle 800px at 90% 5%, rgba(19, 123, 132, 0.08), transparent 60%),
          radial-gradient(circle 700px at 5% 35%, rgba(56, 189, 248, 0.07), transparent 60%),
          #f8fafc
        `,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 relative z-10 max-w-[1600px] mx-auto space-y-6">
        {isLoading && <PageLoading label="Đang tải khảo sát" />}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center max-w-md mx-auto">
            <p className="text-sm font-semibold text-red-700">
              {apiErrorMessage(error, 'Không thể tải thông tin khảo sát.')}
            </p>
          </div>
        )}
        {data && <TrialProgramView program={data} />}
      </div>
    </div>
  );
}

function TrialProgramView({ program }: { program: TrialProgram }) {
  useUiLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = useCurrentUser((state) => state.user?.id ?? '');
  const setup = program.stage === 'SETUP';
  // Back from "Khung năng lực số" (?resume=1): the deadline step, with the people listed before leaving.
  const resume = setup && searchParams.get('resume') === '1';
  const [setupStep, setSetupStep] = useState<SetupStep>(resume ? 1 : 0);
  const [rows, setRows] = useState<TrialParticipantRow[]>(() => (setup && userId && readSurveyDraft(userId)) || emptyRows());
  const [lastInvite, setLastInvite] = useState<TrialInviteResult | null>(null);
  const [choosing, setChoosing] = useState(false);
  const ceilings = useCapabilityCeilings();
  const { can } = usePermission();
  const canSetExpectation = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE);
  // Positions with their own levels (OW-05 tab 2): what the results are compared with; the others use the suggestion.
  const levelsSet = Array.isArray(ceilings.data?.positions)
    ? { set: ceilings.data.positions.filter((p) => p.isCustomized).length, total: ceilings.data.positions.length }
    : undefined;

  useEffect(() => {
    if (searchParams.get('resume') == null) return;
    const next = new URLSearchParams(searchParams);
    next.delete('resume');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // The list is kept in this tab while the owner is away (e.g. setting the expected level), until the invitations go out.
  useEffect(() => {
    if (!setup || !userId) return;
    const filled = rows.filter((row) => !isRowEmpty(row));
    if (filled.length) saveSurveyDraft(userId, filled);
    else clearSurveyDraft(userId);
  }, [rows, setup, userId]);

  const reported = program.stage === 'REPORTED';
  const total = program.participants.length;
  const submitted = program.participants.filter(isSubmitted).length;
  const drafted = total + rows.filter((r) => !isRowEmpty(r) && rowError(r) === null).length;

  const phase = resultPhase(program);
  const phaseDetail: Record<ResultPhase, string> = {
    taking: `${submitted}/${total} đã nộp`,
    grading: 'Chuyên gia đang chấm',
    empty: 'Hết hạn, chưa ai nộp',
    reported: 'Đã có kết quả',
  };
  const steps = [
    { label: STEP_LABELS[0], detail: setup ? (setupStep === 1 ? `${drafted} người` : undefined) : `${total} người` },
    { label: STEP_LABELS[1], detail: !setup && program.testDeadline ? `Hạn ${formatWhen(program.testDeadline)}` : undefined },
    { label: STEP_LABELS[2], detail: setup ? undefined : phaseDetail[phase] },
  ];
  const current = setup ? setupStep : 2;

  // Step 1 done: ask what the results are compared with (only someone who may set it is asked).
  const finishList = () => (canSetExpectation ? setChoosing(true) : setSetupStep(1));
  const keepExpectation = () => { setChoosing(false); setSetupStep(1); };
  const setOwnExpectation = () => {
    if (userId) saveSurveyDraft(userId, rows.filter((row) => !isRowEmpty(row)));
    navigate(SURVEY_EXPECTATION_PATH);
  };

  return (
    <div className="space-y-6">
      <header className="trial-page-heading">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17243f]">
          {translateUi(reported ? 'Kết quả khảo sát năng lực số' : 'Khảo sát năng lực số')}
        </h1>
      </header>

      <Steps steps={steps} current={current} complete={reported} label="Tiến độ khảo sát" />

      {setup ? (
        <SetupView program={program} rows={rows} onRowsChange={setRows} step={setupStep} onStepChange={setSetupStep}
          onFinishList={finishList} onInvited={setLastInvite} onSent={() => userId && clearSurveyDraft(userId)}
          levelsSet={levelsSet} canSetExpectation={canSetExpectation} />
      ) : (
        <div className="space-y-5">
          <InviteResult result={lastInvite} />
          {/* Once results are out, the table and chart say it; the strip is only for while people are taking the test. */}
          {levelsSet && !reported && !(program.report && program.report.assessed > 0) && (
            <ExpectationStrip levelsSet={levelsSet} canChange={canSetExpectation} />
          )}
          {reported ? <ReportedView program={program} /> : <TrackView program={program} />}
        </div>
      )}

      <ExpectationChoice open={choosing} setCount={levelsSet?.set ?? 0}
        onKeep={keepExpectation} onSetOwn={setOwnExpectation} onClose={() => setChoosing(false)} />
    </div>
  );
}

type LevelsSet = { set: number; total: number };

/** What the results are compared with, in a few words. */
const comparisonText = ({ set, total }: LevelsSet) => (set > 0
  ? `mức cần đạt của ${set}/${total} vị trí đã đặt (vị trí khác theo đề xuất của hệ thống)`
  : 'chuẩn vị trí của từng người (đề xuất của hệ thống)');

/**
 * After the list: what will the results be compared with (the dashed line of the chart)? Keep what is in force — the
 * levels set for departments, else the system suggestion — or set the department levels in "Khung năng lực số".
 */
function ExpectationChoice({ open, setCount, onKeep, onSetOwn, onClose }: {
  open: boolean;
  setCount: number;
  onKeep: () => void;
  onSetOwn: () => void;
  onClose: () => void;
}) {
  useUiLanguage();
  return (
    <Modal open={open} onClose={onClose} size="md" title="Kết quả sẽ so với mức nào?"
      description="Kết quả khảo sát (đường nét đứt trên biểu đồ) và lộ trình học của nhân viên sẽ theo mức này. Đổi lúc nào cũng được.">
      <div className="trial-choice">
        <button type="button" className="trial-choice__option" data-recommended onClick={onKeep}>
          <span className="trial-choice__icon" aria-hidden="true"><Sparkles size={18} /></span>
          <span className="trial-choice__copy">
            <strong>{translateUi(setCount > 0 ? 'Dùng mức các vị trí đã đặt' : 'Dùng đề xuất của hệ thống')}<em>{translateUi('Nhanh nhất')}</em></strong>
            <span>{translateUi(setCount > 0
              ? `${setCount} vị trí đã đặt mức; vị trí khác theo đề xuất của hệ thống. Tiếp tục đặt hạn ngay.`
              : 'Mỗi người theo chuẩn vị trí của mình. Tiếp tục đặt hạn ngay.')}</span>
          </span>
          <ArrowRight size={16} className="trial-choice__arrow" aria-hidden="true" />
        </button>
        <button type="button" className="trial-choice__option" onClick={onSetOwn}>
          <span className="trial-choice__icon" aria-hidden="true"><SlidersHorizontal size={18} /></span>
          <span className="trial-choice__copy">
            <strong>{translateUi('Tự đặt ở Khung năng lực số')}</strong>
            <span>{translateUi('Đặt mức cần đạt cho từng vị trí. Danh sách vừa nhập được giữ lại.')}</span>
          </span>
          <ArrowRight size={16} className="trial-choice__arrow" aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
}

/** What the results are compared with, above the progress / results, with a link to the position levels. */
function ExpectationStrip({ levelsSet, canChange }: { levelsSet: LevelsSet; canChange: boolean }) {
  useUiLanguage();
  return (
    <div className="trial-expect-strip" data-mode={levelsSet.set > 0 ? 'POSITION' : 'NONE'}>
      <Target size={16} aria-hidden="true" />
      <p>
        {translateUi('Kết quả được so với')} <strong>{translateUi(comparisonText(levelsSet))}</strong>
        {levelsSet.set === 0 && <span>{translateUi(' · bạn chưa đặt mức cho vị trí nào')}</span>}
      </p>
      {canChange && (
        <Link to={SURVEY_EXPECTATION_PATH} className="trial-secondary-button">
          {translateUi(levelsSet.set > 0 ? 'Đổi mức vị trí' : 'Đặt mức cho vị trí')}
        </Link>
      )}
    </div>
  );
}

/** What the employees will do and what the owner gets back, before anyone is invited. */
function SurveyFacts({ program }: { program: TrialProgram }) {
  useUiLanguage();
  const perDomain = Math.round((program.choiceCount ?? 0) / 6);
  const facts = [
    program.choiceCount > 0 && {
      Icon: ListChecks,
      title: program.essayCount > 0 ? `${program.choiceCount} câu trắc nghiệm + ${program.essayCount} bài viết` : `${program.choiceCount} câu trắc nghiệm`,
      note: `${perDomain} câu mỗi lĩnh vực`,
    },
    { Icon: Video, title: 'Làm trên máy tính', note: 'Bật camera, micro và chia sẻ màn hình khi làm bài' },
    { Icon: UserCheck, title: 'Chuyên gia DigiTalent duyệt', note: 'Kết quả gửi về trang này' },
    { Icon: BarChart3, title: 'Bạn nhận được', note: 'Mức năng lực của từng người ở 6 lĩnh vực' },
  ].filter(Boolean) as { Icon: typeof Video; title: string; note: string }[];

  return (
    <dl className="trial-facts" aria-label={translateUi('Về bài khảo sát')}>
      {facts.map(({ Icon, title, note }) => (
        <div key={title}>
          <Icon size={20} aria-hidden="true" />
          <dt>{translateUi(title)}</dt>
          <dd>{translateUi(note)}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Bước 1–2: danh sách người làm bài, rồi (sau hộp hỏi mức so sánh) hạn nộp và gửi lời mời một lần. */
function SetupView({ program, rows, onRowsChange, step, onStepChange, onFinishList, onInvited, onSent, levelsSet, canSetExpectation }: {
  program: TrialProgram;
  rows: TrialParticipantRow[];
  onRowsChange: (rows: TrialParticipantRow[]) => void;
  step: SetupStep;
  onStepChange: (step: SetupStep) => void;
  /** Step 1 done: asks about the expected level, then opens the deadline. */
  onFinishList: () => void;
  onInvited: (result: TrialInviteResult) => void;
  /** Invitations sent: the kept list is no longer needed. */
  onSent: () => void;
  /** undefined while unknown (not loaded). */
  levelsSet?: LevelsSet;
  canSetExpectation: boolean;
}) {
  useUiLanguage();
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [result, setResult] = useState<TrialInviteResult | null>(null);
  const invite = useInviteTrialParticipants();
  const request = useSubmitTrialRequest();
  const filled = rows.filter((r) => !isRowEmpty(r));
  const invalidCount = filled.filter((r) => rowError(r) !== null).length;
  const invalid = invalidCount > 0;
  const existing = program.participants.length;
  const scheduleError = validateSchedule(schedule);
  const busy = invite.isPending || request.isPending;
  const nobody = existing + filled.length === 0;
  const listHint = nobody ? 'Nhập ít nhất 1 người để tiếp tục.' : invalid ? `${invalidCount} dòng còn thiếu thông tin.` : null;

  const submit = async () => {
    if (busy || invalid || scheduleError || nobody) return;
    try {
      let invited = 0;
      if (filled.length > 0) {
        const outcome = await invite.mutateAsync({ rows: filled, testDeadline: toRequest(schedule).testDeadline });
        setResult(outcome);
        onInvited(outcome);
        invited = outcome.invited.length;
        const rejected = new Set(outcome.rejected.map((r) => r.email.toLowerCase()));
        const rejectedRows = filled.filter((r) => rejected.has(r.email.trim().toLowerCase()));
        onRowsChange(rejectedRows.length ? rejectedRows : emptyRows(1));
        if (outcome.rejected.length) {
          onStepChange(0);
          toast.warning(`Đã mời ${outcome.invited.length} người. Sửa các dòng chưa hợp lệ rồi gửi lại.`);
          return;
        }
      }
      if (existing + invited === 0) return;
      await request.mutateAsync(toRequest(schedule));
      onSent();
      toast.success('Đã gửi lời mời. Nhân viên có thể bắt đầu làm bài.');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Chưa gửi được.'));
    }
  };

  if (step === 0) {
    return (
      <div className="space-y-5">
        <SurveyFacts program={program} />
        <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{translateUi('Danh sách người làm bài')}</h2>
            {existing > 0 && <span className="text-[13px] font-semibold text-slate-600">{translateUi(`Đã mời ${existing} người`)}</span>}
          </div>
          <ParticipantsEditor rows={rows} onChange={onRowsChange} departments={program.departments} />
          <InviteResult result={result} />
        </section>
        <div className="trial-setup-footer">
          {listHint && <p role="status">{translateUi(listHint)}</p>}
          <button type="button" className="trial-primary-button" disabled={busy || invalid || nobody} onClick={onFinishList}>
            {translateUi('Tiếp tục đặt hạn')}<ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  const deadline = scheduleError ? null : toRequest(schedule).testDeadline;
  return (
    <div className="mx-auto w-full max-w-[45rem] space-y-4">
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs sm:p-5">
        <h2 className="mb-3 border-b border-slate-100 pb-3 text-base sm:text-lg font-bold text-slate-900">{translateUi('Hạn nộp bài')}</h2>
        <ScheduleFields value={schedule} onChange={setSchedule} />
      </section>
      {levelsSet && (
        <p className="trial-expect-line">
          <Target size={15} aria-hidden="true" />
          <span>{translateUi('Kết quả sẽ so với:')} <strong>{translateUi(comparisonText(levelsSet))}</strong></span>
          {canSetExpectation && <Link to={SURVEY_EXPECTATION_PATH}>{translateUi('Đổi')}</Link>}
        </p>
      )}
      <p className="trial-send-summary" aria-live="polite">
        <Send size={16} aria-hidden="true" />
        <span>
          {filled.length > 0
            ? <>{translateUi('Gửi email mời tới')} <strong>{filled.length} {translateUi('người')}</strong></>
            : <><strong>{existing} {translateUi('người')}</strong> {translateUi('đã được mời')}</>}
          {deadline && <> · {translateUi('làm bài đến')} <strong>{formatWhen(deadline)}</strong></>}
        </span>
      </p>
      <div className="trial-setup-footer">
        <button type="button" className="trial-secondary-button mr-auto" disabled={busy} onClick={() => onStepChange(0)}>{translateUi('Quay lại danh sách')}</button>
        {scheduleError && <p role="status">{translateUi(scheduleError)}</p>}
        <button type="button" className="trial-primary-button" disabled={busy || invalid || !!scheduleError || nobody} onClick={submit}>
          <Send size={16} aria-hidden="true" />
          {busy ? translateUi('Đang gửi…') : translateUi('Gửi lời mời & bắt đầu khảo sát')}
        </button>
      </div>
    </div>
  );
}

type StatusGroup = 'all' | 'submitted' | 'pending' | 'inactive';
type StatusSegment = { key: Exclude<StatusGroup, 'all'>; count: number };
const GROUP_LABELS: Record<Exclude<StatusGroup, 'all'>, string> = { submitted: 'Đã nộp', pending: 'Chưa nộp', inactive: 'Chưa kích hoạt' };

/**
 * Tiến độ nộp bài và chú thích trong một dải: mỗi nhóm có nhãn + số người ngay trên đoạn màu của mình (rộng theo số người).
 * Bấm một nhóm để lọc danh sách bên dưới, bấm lại để bỏ lọc.
 */
function StatusStrip({ segments, value, onChange }: { segments: StatusSegment[]; value: StatusGroup; onChange: (group: StatusGroup) => void }) {
  useUiLanguage();
  return (
    <div className="trial-status-strip" role="group" aria-label={translateUi('Lọc danh sách theo trạng thái')} data-filtered={value !== 'all' || undefined}>
      {segments.map(({ key, count }) => (
        <button key={key} type="button" className="trial-status-strip__item" data-group={key} aria-pressed={value === key}
          disabled={count === 0 && value !== key} style={{ flexGrow: count }}
          title={translateUi(value === key ? 'Bấm lại để xem tất cả' : 'Bấm để lọc danh sách')}
          onClick={() => onChange(value === key ? 'all' : key)}>
          <span className="trial-status-strip__label">{translateUi(GROUP_LABELS[key])} <strong>{count}</strong></span>
          <span className="trial-status-strip__bar" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/** Bước 3, chờ kết quả: ai đã nộp, hạn nộp, mời thêm, khi nào có kết quả; kết quả tạm thời khi đã có bài chấm. */
function TrackView({ program }: { program: TrialProgram }) {
  useUiLanguage();
  const total = program.participants.length;
  const submitted = program.participants.filter(isSubmitted).length;
  const notActivated = program.participants.filter((p) => p.status === 'INVITED' || p.status === 'INVITE_EXPIRED').length;
  const notSubmitted = total - submitted - notActivated;
  const expired = isPastDeadline(program);
  const phase = resultPhase(program);
  const report = program.report && program.report.assessed > 0 ? program.report : null;
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [group, setGroup] = useState<StatusGroup>('all');
  const segments: StatusSegment[] = [
    { key: 'submitted', count: submitted },
    { key: 'pending', count: notSubmitted },
    { key: 'inactive', count: notActivated },
  ];

  return (
    <div className="space-y-5">
      <section aria-labelledby="trial-progress-title" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div>
            <h2 id="trial-progress-title" className="text-base sm:text-lg font-bold text-slate-900">{translateUi('Tiến độ làm bài')}</h2>
            <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
              <Clock size={15} className="text-teal-700" aria-hidden="true" />
              {translateUi('Hạn nộp:')} <strong className="font-semibold text-slate-900">{program.testDeadline ? formatWhen(program.testDeadline) : translateUi('Chưa đặt')}</strong>
              {expired && <span className="tp-badge bad">{translateUi('Đã hết hạn')}</span>}
            </p>
          </div>
          <button type="button" className="trial-secondary-button" aria-expanded={editingDeadline} aria-controls="trial-deadline-editor"
            onClick={() => setEditingDeadline((open) => !open)}>
            <CalendarClock size={15} aria-hidden="true" />
            {editingDeadline ? translateUi('Đóng') : translateUi('Đổi hạn nộp')}
          </button>
        </div>
        <SurveyDeadline program={program} open={editingDeadline} onSaved={() => setEditingDeadline(false)} />
        <StatusStrip segments={segments} value={group} onChange={setGroup} />
        {phase !== 'empty' && (
          <p className="trial-next-note" data-phase={phase}>
            {phase === 'grading' ? <UserCheck size={16} aria-hidden="true" /> : <ClipboardCheck size={16} aria-hidden="true" />}
            <span>{translateUi(phase === 'grading'
              ? 'Chuyên gia DigiTalent đang chấm bài. Kết quả chính thức sẽ hiện ngay trên trang này.'
              : 'Khi mọi người nộp xong hoặc hết hạn, hệ thống sẽ trả kết quả đánh giá.')}</span>
          </p>
        )}
        <ParticipantList program={program} closed={false} group={group} onGroupChange={setGroup} />
      </section>

      <OwnerSurveyAction program={program} />

      {/* Results only count papers the expert has graded; until then the note above says when they come. */}
      {report ? (
        <CompetencyReport report={report} participantCount={total} provisional />
      ) : phase === 'empty' ? (
        <div className="trial-live-report" role="status">
          <span className="trial-live-report__dot" aria-hidden="true" />
          <p>{translateUi('Chưa có bài nộp nào. Đổi hạn nộp để nhân viên tiếp tục làm bài.')}</p>
        </div>
      ) : null}
    </div>
  );
}

/** Bước 3, đã có kết quả: bảng kết quả lên đầu, việc nên làm tiếp; danh sách người làm bài chỉ còn khi không ai nộp. */
function ReportedView({ program }: { program: TrialProgram }) {
  useUiLanguage();
  const [showList, setShowList] = useState(false);
  const total = program.participants.length;
  const submitted = program.participants.filter(isSubmitted).length;
  const report = program.report && program.report.assessed > 0 ? program.report : null;

  return (
    <div className="space-y-5">
      {report
        ? <CompetencyReport report={report} participantCount={total} />
        : <div className="trial-live-report" role="status"><span className="trial-live-report__dot" aria-hidden="true" /><p>{translateUi('Đợt khảo sát đã kết thúc mà không có bài nộp nào.')}</p></div>}
      <OwnerSurveyAction program={program} />
      {/* With results the per-person table already lists who took part; the participant list stays only when nobody submitted. */}
      {!report && <section className="rounded-2xl border border-slate-200/90 bg-white/95 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowList((v) => !v)}
          aria-expanded={showList}
          aria-controls="trial-participant-list"
          className="w-full flex items-center justify-between gap-3 p-5 sm:p-6 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
              <Users size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{translateUi('Danh sách người làm bài')}</h3>
              <p className="mt-0.5 text-[13px] text-slate-600">{translateUi(`${submitted}/${total} người đã nộp`)}</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-bold text-slate-700">
            {showList ? <><ChevronUp size={15} aria-hidden="true" />{translateUi('Thu gọn')}</> : <><ChevronDown size={15} aria-hidden="true" />{translateUi('Xem')}</>}
          </span>
        </button>
        <TrialDisclosure open={showList} id="trial-participant-list">
          <div className="px-5 pb-5 sm:px-6 sm:pb-6"><ParticipantList program={program} closed /></div>
        </TrialDisclosure>
      </section>}
    </div>
  );
}

/** Danh sách người làm bài: chưa nộp lên đầu khi đang khảo sát, đã nộp lên đầu khi đã có kết quả. */
function ParticipantList({ program, closed, group, onGroupChange }: {
  program: TrialProgram;
  closed: boolean;
  /** Set by the status strip above the list (survey still open); without it the list keeps its own status menu. */
  group?: StatusGroup;
  onGroupChange?: (group: StatusGroup) => void;
}) {
  useUiLanguage();
  const [adding, setAdding] = useState(false);
  const [resent, setResent] = useState<TrialInviteResult | null>(null);
  const [search, setSearch] = useState('');
  const [ownFilter, setOwnFilter] = useState<StatusGroup>('all');
  const filter = group ?? ownFilter;
  const setFilter = onGroupChange ?? setOwnFilter;
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [pagedFilter, setPagedFilter] = useState(filter);
  if (pagedFilter !== filter) { setPagedFilter(filter); setPage(1); }

  // Same three groups as the progress bar; once the survey is closed, everyone who did not submit is one group.
  const groupOf = (p: TrialParticipant) => (isSubmitted(p) ? 'submitted' : closed || p.status === 'ACTIVE' ? 'pending' : 'inactive');
  const departmentOf = (p: TrialParticipant) => p.departmentName?.trim() || NO_DEPARTMENT;
  const departmentCounts = program.participants.reduce((counts, p) =>
    counts.set(departmentOf(p), (counts.get(departmentOf(p)) ?? 0) + 1), new Map<string, number>());
  const departmentNames = [...departmentCounts.keys()].sort((a, b) =>
    Number(a === NO_DEPARTMENT) - Number(b === NO_DEPARTMENT) || a.localeCompare(b, 'vi'));
  const activeDepartment = departmentCounts.has(department) ? department : '';
  const inDepartment = program.participants.filter((p) => !activeDepartment || departmentOf(p) === activeDepartment);
  const groupCount = (group: string) => inDepartment.filter((p) => groupOf(p) === group).length;

  const order = (p: TrialParticipant) => (isSubmitted(p) ? (closed ? 0 : 2) : p.status === 'ACTIVE' ? 1 : closed ? 2 : 0);
  const query = search.trim().toLowerCase();
  const rows = inDepartment
    .filter((p) => filter === 'all' || groupOf(p) === filter)
    .filter((p) => !query || [p.fullName, p.email, p.departmentName, p.positionName].some((v) => v?.toLowerCase().includes(query)))
    .sort((a, b) => order(a) - order(b) || a.fullName.localeCompare(b.fullName, 'vi'));
  const pageCount = Math.max(1, Math.ceil(rows.length / LIST_PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const visible = rows.slice((activePage - 1) * LIST_PAGE_SIZE, activePage * LIST_PAGE_SIZE);
  const showTools = program.participants.length >= LIST_TOOLS_MIN;
  const groupLabel = (key: Exclude<StatusGroup, 'all'>) => translateUi(closed && key === 'pending' ? 'Không nộp bài' : GROUP_LABELS[key]);
  const groups: Exclude<StatusGroup, 'all'>[] = closed ? ['submitted', 'pending'] : ['submitted', 'pending', 'inactive'];

  return (
    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
      {(showTools || !closed) && (
        <div className="trial-list-toolbar">
          {showTools && (
            <div className="trial-list-toolbar__fields">
              <label className="owner-filter-search">
                <Search className="size-4" aria-hidden="true" />
                <input
                  type="text"
                  aria-label={translateUi('Tìm người làm bài')}
                  placeholder={translateUi('Tìm tên, email, phòng ban...')}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </label>
              {!onGroupChange && (
                <OwnerFilterSelect
                  icon="filter"
                  label={translateUi('Lọc theo trạng thái')}
                  value={filter}
                  onChange={(value) => setFilter(value as StatusGroup)}
                  options={[
                    { value: 'all', label: `${translateUi('Tất cả trạng thái')} (${inDepartment.length})` },
                    ...groups.map((key) => ({ value: key, label: `${groupLabel(key)} (${groupCount(key)})` })),
                  ]}
                />
              )}
              {departmentNames.length > 1 && (
                <OwnerFilterSelect
                  icon="filter"
                  label={translateUi('Lọc theo phòng ban')}
                  value={activeDepartment}
                  onChange={(value) => { setDepartment(value); setPage(1); }}
                  options={[
                    { value: '', label: `${translateUi('Tất cả phòng ban')} (${program.participants.length})` },
                    ...departmentNames.map((name) => ({
                      value: name,
                      label: `${name === NO_DEPARTMENT ? translateUi('Chưa có phòng ban') : name} (${departmentCounts.get(name)})`,
                    })),
                  ]}
                />
              )}
            </div>
          )}
          {onGroupChange && filter !== 'all' && (
            <button type="button" className="trial-filter-chip" aria-label={`${translateUi('Bỏ lọc')} ${groupLabel(filter)}`} onClick={() => setFilter('all')}>
              {groupLabel(filter)} ({groupCount(filter)})
              <X size={14} aria-hidden="true" />
            </button>
          )}
          {!closed && (
            <button type="button" className="trial-secondary-button ml-auto" aria-expanded={adding} onClick={() => setAdding((v) => !v)}>
              {adding ? translateUi('Đóng') : translateUi('+ Mời thêm')}
            </button>
          )}
        </div>
      )}

      {adding && <AddParticipants program={program} onDone={() => setAdding(false)} />}
      <InviteResult result={resent} />

      <div className="relative overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 font-bold text-slate-600">
            <tr>
              <th className="py-3 px-3.5">{translateUi('Nhân viên')}</th>
              <th className="hidden py-3 px-3 sm:table-cell">{translateUi('Phòng ban')}</th>
              <th className="hidden py-3 px-3 sm:table-cell">{translateUi('Vị trí')}</th>
              <th className="py-3 px-3 text-center">{translateUi('Trạng thái')}</th>
              <th className="hidden py-3 px-3 sm:table-cell">{translateUi('Nộp lúc')}</th>
              {!closed && <th className="py-3 px-3.5 text-center"><span className="sr-only">{translateUi('Thao tác')}</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length === 0 ? (
              <tr><td colSpan={closed ? 5 : 6} className="py-8 text-center text-slate-500">{translateUi('Không tìm thấy người phù hợp')}</td></tr>
            ) : visible.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3.5">
                  <strong className="block text-sm font-semibold text-slate-900">{p.fullName}{p.isOwner ? translateUi(' (bạn)') : ''}</strong>
                  <span className="block text-xs text-slate-600">{p.email}</span>
                  <span className="mt-0.5 block text-xs text-slate-600 sm:hidden">{[p.departmentName, p.positionName].filter(Boolean).join(' · ')}</span>
                </td>
                <td className="hidden py-3 px-3 text-slate-700 sm:table-cell">{p.departmentName || '—'}</td>
                <td className="hidden py-3 px-3 text-slate-700 sm:table-cell">{p.positionName || '—'}</td>
                <td className="py-3 px-3 text-center">
                  <ParticipantStatus status={!closed && p.status === 'REVIEWED' ? 'SUBMITTED' : p.status} closed={closed} />
                </td>
                <td className="hidden py-3 px-3 text-slate-700 sm:table-cell">{p.submittedAt ? formatWhen(p.submittedAt) : '—'}</td>
                {!closed && (
                  <td className="py-3 px-3.5 text-center">
                    {p.invitationId && <ResendButton participant={p} onResent={setResent} />}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="tp-participant-pagination" aria-label={translateUi('Phân trang danh sách người làm bài')}>
          <div>
            <button type="button" disabled={activePage === 1} onClick={() => setPage(activePage - 1)}>{translateUi('Trước')}</button>
            <strong>{translateUi('Trang ')}{activePage}/{pageCount}</strong>
            <button type="button" disabled={activePage === pageCount} onClick={() => setPage(activePage + 1)}>{translateUi('Sau')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Gửi lại email mời cho người chưa kích hoạt tài khoản. */
function ResendButton({ participant, onResent }: { participant: TrialParticipant; onResent: (result: TrialInviteResult) => void }) {
  useUiLanguage();
  const resend = useResendTrialInvitation();
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
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
      {resend.isPending ? translateUi('Đang gửi…') : translateUi('Gửi lại lời mời')}
    </button>
  );
}

function AddParticipants({ program, onDone }: { program: TrialProgram; onDone: () => void }) {
  useUiLanguage();
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
    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 space-y-4">
      <h3 className="text-sm font-bold text-slate-900">{translateUi('Mời thêm người làm bài')}</h3>
      <ParticipantsEditor rows={rows} onChange={setRows} departments={program.departments} />
      <InviteResult result={result} />
      <div className="flex justify-end">
        <button
          type="button"
          className="trial-primary-button"
          disabled={invite.isPending || filled.length === 0 || filled.some((r) => rowError(r) !== null)}
          onClick={send}
        >
          {invite.isPending ? translateUi('Đang gửi…') : translateUi(`Gửi lời mời (${filled.length} người)`)}
        </button>
      </div>
    </div>
  );
}

type Schedule = { deadline: string };

function defaultSchedule(): Schedule {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3);
  deadline.setHours(17, 0, 0, 0);
  return { deadline: toLocalInput(deadline) };
}

function scheduleDate(s: Schedule) {
  const [day, time = ''] = s.deadline.split('T');
  const normalizedTime = normalizeDeadlineTime(time);
  return new Date(normalizedTime ? day + 'T' + normalizedTime : NaN);
}

function validateSchedule(s: Schedule): string | null {
  if (!s.deadline) return 'Chọn hạn nộp bài.';
  const deadline = scheduleDate(s).getTime();
  if (!Number.isFinite(deadline)) return 'Chọn ngày giờ hợp lệ.';
  if (deadline <= Date.now() + 30 * 60_000) return 'Hạn nộp cần sau ít nhất 30 phút.';
  if (deadline > Date.now() + 60 * 86400000) return 'Hạn nộp tối đa 60 ngày.';
  return null;
}

const toRequest = (s: Schedule) => ({ testDeadline: scheduleDate(s).toISOString() });

/** Form đổi hạn nộp, mở bằng nút "Đổi hạn nộp" ở đầu khung tiến độ; mỗi lần mở bắt đầu từ hạn hiện tại. */
function SurveyDeadline({ program, open, onSaved }: { program: TrialProgram; open: boolean; onSaved: () => void }) {
  useUiLanguage();
  const [schedule, setSchedule] = useState<Schedule>({ deadline: toLocalInput(program.testDeadline) });
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSchedule({ deadline: toLocalInput(program.testDeadline) });
  }
  const request = useSubmitTrialRequest();
  const error = validateSchedule(schedule);
  return (
    <div id="trial-deadline-editor">
      <TrialDisclosure open={open}>
        <div className="trial-deadline-editor">
          {open && <ScheduleFields value={schedule} onChange={setSchedule} />}
          <div className="trial-deadline-editor__actions">
            <button type="button" className="trial-primary-button" disabled={!!error || request.isPending}
              onClick={() => request.mutate(toRequest(schedule), {
                onSuccess: () => { onSaved(); toast.success('Đã đổi hạn nộp.'); },
                onError: (failure) => toast.error(apiErrorMessage(failure, 'Chưa đổi được hạn nộp.')),
              })}>
              {request.isPending ? translateUi('Đang lưu…') : translateUi('Lưu hạn mới')}
            </button>
            {error && <span role="status" className="text-[13px] text-amber-800">{translateUi(error)}</span>}
          </div>
        </div>
      </TrialDisclosure>
    </div>
  );
}

function ScheduleFields({ value, onChange }: { value: Schedule; onChange: (v: Schedule) => void }) {
  return <TrialDeadlinePicker value={value.deadline} onChange={(deadline) => onChange({ deadline })} />;
}

function InviteResult({ result }: { result: TrialInviteResult | null }) {
  useUiLanguage();
  if (!result) return null;
  const links = result.invited.filter((i) => i.debugLink);
  return (
    <div className="space-y-2 text-[13px]">
      {result.rejected.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 space-y-1" role="alert">
          {result.rejected.map((r) => (
            <div key={r.email}>
              <strong>{r.email || '(trống)'}:</strong> {r.reason}
            </div>
          ))}
        </div>
      )}
      {links.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-blue-900 space-y-1">
          <strong className="block text-xs font-bold text-blue-800">{translateUi('Link kích hoạt tài khoản (môi trường thử nghiệm):')}</strong>
          {links.map((i) => (
            <div key={i.email} className="truncate">
              <span className="font-semibold">{i.email}:</span>{' '}
              <a href={i.debugLink!} className="text-blue-700 underline text-xs">{i.debugLink}</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
