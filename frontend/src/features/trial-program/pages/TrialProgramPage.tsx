import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Clock,
  Search,
  Send,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
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

const STEPS = ['Nhân sự tham gia', 'Hạn làm bài', 'Theo dõi bài làm', 'Báo cáo năng lực'];

/** OW-T1 · Đánh giá đội ngũ: giao diện hiện đại, trải rộng toàn màn hình, ít chữ, không rườm rà */
export function TrialProgramPage() {
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
          radial-gradient(circle 900px at 50% 90%, rgba(99, 102, 241, 0.05), transparent 65%),
          #f8fafc
        `,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Tràn đều toàn màn hình, max 1920px ── */}
      <div className="w-full px-5 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 relative z-10 max-w-[1920px] mx-auto space-y-6">
        {isLoading && <PageLoading label="Đang tải bài đánh giá" />}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center max-w-md mx-auto shadow-xs">
            <p className="text-xs font-bold text-red-700">
              {apiErrorMessage(error, 'Không thể tải thông tin đợt đánh giá.')}
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
  const [setupStep, setSetupStep] = useState<0 | 1>(0);
  const current = program.stage === 'SETUP' ? setupStep : program.stage === 'REPORTED' ? 3 : 2;
  const [lastInvite, setLastInvite] = useState<TrialInviteResult | null>(null);

  return (
    <div className="space-y-6">
      {/* ── Header: Đẳng cấp, Tinh tế, Ít chữ ── */}
      <div className="trial-page-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs mb-2">
            <span className="size-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700">{program.organizationName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17243f]">
            {program.stage === 'REPORTED' ? 'Kết quả đánh giá đội ngũ' : translateUi('Đánh giá đội ngũ')}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/enterprise/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 hover:bg-white px-4 py-2.5 text-xs font-bold text-[#17243f] hover:text-[#137b84] transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >{translateUi("Về Tổng quan")}<ArrowRight className="size-3.5" />
          </Link>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
            {program.stage === 'SETUP' ? translateUi('Chưa gửi') : program.stage === 'REPORTED' ? 'Đã chốt kết quả' : program.testDeadline && Date.parse(program.testDeadline) <= Date.now() ? translateUi('Đã hết hạn') : translateUi('Đang đánh giá')}
          </span>
        </div>
      </div>

      {/* ── Stepper: Thanh tiến trình gọn gàng ── */}
      <div className="trial-journey"><Steps steps={STEPS} current={current} label={translateUi("Tiến trình đánh giá")} /></div>

      {program.stage === 'SETUP' ? (
        <div className="space-y-6">
          <SetupView program={program} step={setupStep} onStepChange={setSetupStep} onInvited={setLastInvite} />
        </div>
      ) : (
        <div className="space-y-6">
          <InviteResult result={lastInvite} />
          <TrackView program={program} />
        </div>
      )}
    </div>
  );
}

/** Bước 1–2: danh sách nhân viên + hạn làm bài, gửi một lần. */
function SetupView({ program, step, onStepChange, onInvited }: {
  program: TrialProgram; step: 0 | 1; onStepChange: (step: 0 | 1) => void; onInvited: (result: TrialInviteResult) => void;
}) {
  useUiLanguage();
  const [rows, setRows] = useState<TrialParticipantRow[]>(emptyRows());
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [result, setResult] = useState<TrialInviteResult | null>(null);
  const invite = useInviteTrialParticipants();
  const request = useSubmitTrialRequest();
  const filled = rows.filter((r) => !isRowEmpty(r));
  const invalid = filled.some((r) => rowError(r) !== null);
  const existing = program.participants.length;
  const scheduleError = validateSchedule(schedule);
  const busy = invite.isPending || request.isPending;

  const submit = async () => {
    if (busy || invalid || scheduleError || existing + filled.length === 0) return;
    try {
      let invited = 0;
      if (filled.length > 0) {
        const outcome = await invite.mutateAsync({ rows: filled, testDeadline: toRequest(schedule).testDeadline });
        setResult(outcome);
        onInvited(outcome);
        invited = outcome.invited.length;
        const rejected = new Set(outcome.rejected.map((r) => r.email.toLowerCase()));
        const rejectedRows = filled.filter((r) => rejected.has(r.email.trim().toLowerCase()));
        setRows(rejectedRows.length ? rejectedRows : emptyRows(1));
        if (outcome.rejected.length) {
          onStepChange(0);
          toast.warning(`Đã mời ${outcome.invited.length} người. Kiểm tra các dòng chưa hợp lệ trước khi bắt đầu khảo sát.`);
          return;
        }
      }
      if (existing + invited === 0) return;
      await request.mutateAsync(toRequest(schedule));
      toast.success('Đã gửi lời mời và bắt đầu đợt đánh giá');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Chưa gửi được.'));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Thẻ 1: Danh sách nhân sự ── */}
      {step === 0 && <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{translateUi("Danh sách nhân sự tham gia")}</h2>
            {existing > 0 && (
              <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold">{translateUi("Đã mời ")}{existing}{translateUi(" người")}</span>
            )}
          </div>
        </div>
        <ParticipantsEditor
          rows={rows}
          onChange={setRows}
          departments={program.departments}
        />
        <InviteResult result={result} />
      </section>}

      {/* ── Hạn làm bài ── */}
      {step === 1 && <section className="mx-auto w-full max-w-[45rem] rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs sm:p-5">
        <div className="mb-3 border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{translateUi("Hạn hoàn thành đánh giá")}</h2>
        </div>
        <ScheduleFields value={schedule} onChange={setSchedule} />
      </section>}

      {/* ── Nút kích hoạt ── */}
      <div className={step === 1 ? "mx-auto flex w-full max-w-[45rem] flex-wrap items-center justify-end gap-3" : "flex flex-wrap items-center justify-end gap-3 pt-2"}>
        {step === 0 ? (
          <button type="button" className="rounded-xl bg-[#137b84] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
            disabled={busy || invalid || existing + filled.length === 0} onClick={() => onStepChange(1)}>
            {translateUi('Tiếp tục đặt hạn')}
          </button>
        ) : <>
        <button type="button" className="mr-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-teal-800"
          disabled={busy} onClick={() => onStepChange(0)}>{translateUi('Quay lại danh sách')}</button>
        {scheduleError && <p role="status" className="basis-full text-xs font-semibold text-amber-700 sm:order-last sm:text-right">{scheduleError}</p>}
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#137b84] to-[#0d9488] hover:from-[#0e5968] hover:to-[#0f766e] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#137b84]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          disabled={busy || invalid || !!scheduleError || existing + filled.length === 0}
          onClick={submit}
        >
          <Send className="size-4" />
          {busy ? translateUi('Đang xử lý…') : translateUi('Gửi lời mời & bắt đầu đánh giá')}
        </button>
        </>}
      </div>
    </div>
  );
}

/** Bước 3–4: theo dõi bài làm, mời thêm, đổi lịch; bảng năng lực khi có kết quả. */
function TrackView({ program }: { program: TrialProgram }) {
  useUiLanguage();
  const [adding, setAdding] = useState(false);
  const [resent, setResent] = useState<TrialInviteResult | null>(null);
  const [search, setSearch] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [sort, setSort] = useState<'name' | 'department' | 'status' | 'submitted'>('name');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const count = (statuses: string[]) => program.participants.filter((p) => statuses.includes(p.status)).length;
  const reported = program.stage === 'REPORTED';
  const [showParticipants, setShowParticipants] = useState(!reported);

  const filteredParticipants = program.participants.filter((p) => {
    const hasSubmitted = p.status === 'SUBMITTED' || p.status === 'REVIEWED';
    if (submissionFilter !== 'all' && hasSubmitted !== (submissionFilter === 'submitted')) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.departmentName && p.departmentName.toLowerCase().includes(q)) ||
      (p.positionName && p.positionName.toLowerCase().includes(q))
    );
  });
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (sort === 'submitted') return (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '');
    if (sort === 'status') {
      const status = (p: TrialParticipant) => !reported && p.status === 'REVIEWED' ? 'SUBMITTED' : p.status;
      return status(a).localeCompare(status(b)) || a.fullName.localeCompare(b.fullName, 'vi');
    }
    if (sort === 'department') return (a.departmentName ?? '').localeCompare(b.departmentName ?? '', 'vi') || a.fullName.localeCompare(b.fullName, 'vi');
    return a.fullName.localeCompare(b.fullName, 'vi');
  });
  const pageCount = Math.max(1, Math.ceil(sortedParticipants.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const visibleParticipants = sortedParticipants.slice((activePage - 1) * pageSize, activePage * pageSize);

  const report = program.report && program.report.assessed > 0 ? program.report : null;
  const reportView = report && (
    <CompetencyReport report={report} participantCount={program.participants.length} nextSteps={reported && <SetupFramework />} />
  );
  const participationStats = [
    { label: 'Nhân sự tham gia', value: program.participants.length },
    { label: 'Đã kích hoạt', value: count(['ACTIVE', 'SUBMITTED', 'REVIEWED']) },
    { label: 'Hoàn thành bài làm', value: count(['SUBMITTED', 'REVIEWED']) },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {reported && reportView}
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5" aria-label={translateUi('Tiến độ đánh giá')}>
        <dl className="grid grid-cols-3 gap-2">
          {participationStats.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium text-slate-600">{translateUi(label)}</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 border-t border-slate-100 pt-3">
          <span className="inline-flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <Clock size={16} className="text-teal-700" />{translateUi("Hạn hoàn thành bài đánh giá")}<strong className="font-bold text-slate-900">{program.testDeadline ? formatWhen(program.testDeadline) : 'Chưa đặt thời hạn'}</strong>
          </span>
          {!reported && <SurveyDeadline program={program} />}
        </div>
      </section>

      <OwnerSurveyAction program={program} />

      {(!program.report || program.report.assessed === 0) && <div className="trial-live-report" role="status"><span className="trial-live-report__dot" /><div><strong>{program.testDeadline && Date.parse(program.testDeadline) <= Date.now() ? 'Đã hết hạn · Chưa có bài nộp' : 'Đang chờ bài nộp đầu tiên'}</strong><p>{program.testDeadline && Date.parse(program.testDeadline) <= Date.now() ? 'Có thể điều chỉnh thời hạn để tiếp tục nhận bài.' : 'Tổng quan sẽ xuất hiện tại đây ngay khi có kết quả.'}</p></div></div>}
      {!reported && reportView}

      {/* ── DANH SÁCH NHÂN VIÊN THAM GIA ĐÁNH GIÁ (COLLAPSIBLE / HIỂN THỊ PHỤ) ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setShowParticipants((v) => !v)}
          aria-expanded={showParticipants}
          aria-controls="trial-participant-list"
          className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{translateUi("Tiến độ tham gia")}</h3>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors">
              {showParticipants ? (
                <>
                  <ChevronUp size={15} />{translateUi(" Thu gọn danh sách")}</>
              ) : (
                <>
                  <ChevronDown size={15} />{translateUi(" Mở rộng danh sách")}</>
              )}
            </span>
          </div>
        </button>

        <TrialDisclosure open={showParticipants} id="trial-participant-list">
          <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <label className="owner-filter-search w-full sm:w-80">
                  <Search className="size-4" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label={translateUi("Tìm nhân viên hoặc phòng ban")}
                    placeholder={translateUi("Tìm tên, email, phòng ban hoặc vị trí...")}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full text-sm"
                  />
                </label>
                <OwnerFilterSelect icon="filter"
                  label={translateUi('Trạng thái bài làm')}
                  value={submissionFilter}
                  onChange={(value) => { setSubmissionFilter(value); setPage(1); }}
                  options={[
                    { value: 'all', label: translateUi('Mọi trạng thái') },
                    { value: 'submitted', label: translateUi('Đã làm bài') },
                    { value: 'pending', label: translateUi('Chưa làm bài') },
                  ]}
                />
                <OwnerFilterSelect icon="sort" label={translateUi("Sắp xếp danh sách nhân viên")} value={sort} onChange={(value) => { setSort(value as typeof sort); setPage(1); }} options={[{ value: 'name', label: 'Tên nhân viên' }, { value: 'department', label: 'Phòng ban' }, { value: 'status', label: 'Trạng thái' }, { value: 'submitted', label: 'Nộp gần nhất' }]} />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                  {filteredParticipants.length ? `${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, filteredParticipants.length)} / ${filteredParticipants.length}` : '0 người'}
                </span>
                <OwnerFilterSelect label={translateUi("Số nhân viên mỗi trang")} value={String(pageSize)} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} options={[5, 10, 15, 25, 50].map((size) => ({ value: String(size), label: `${size} / trang` }))} />
                {!reported && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer shrink-0"
                    onClick={() => setAdding((v) => !v)}
                  >
                    {adding ? translateUi('Đóng') : '+ Mời thêm'}
                  </button>
                )}
              </div>
            </div>

            {adding && <AddParticipants program={program} onDone={() => setAdding(false)} />}
            <InviteResult result={resent} />

            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-3.5">{translateUi("Nhân viên")}</th>
                    <th className="py-3 px-3">{translateUi("Phòng ban · Vị trí")}</th>
                    <th className="py-3 px-3 text-center">{translateUi("Trạng thái")}</th>
                    <th className="py-3 px-3">{translateUi("Thời điểm nộp")}</th>
                    {!reported && <th className="py-3 px-3.5 text-center w-28">{translateUi("Thao tác")}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={reported ? 4 : 5} className="py-8 text-center text-slate-400">{translateUi("Không tìm thấy nhân viên nào phù hợp")}</td>
                    </tr>
                  ) : (
                    visibleParticipants.map((p) => {
                      const initials = p.fullName
                        .trim()
                        .split(/\s+/)
                        .slice(-2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#137b84] to-[#0e5968] text-white font-bold text-xs shadow-2xs shrink-0">
                                {initials}
                              </div>
                              <div>
                                <strong className="text-slate-900 block font-semibold text-xs sm:text-sm">
                                  {p.fullName}{p.isOwner ? ' (bạn)' : ''}
                                </strong>
                                <span className="text-xs text-slate-500 block font-mono">{p.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-slate-700 font-medium text-xs sm:text-sm">
                              {[p.departmentName, p.positionName].filter(Boolean).join(' · ') || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <ParticipantStatus status={!reported && p.status === 'REVIEWED' ? 'SUBMITTED' : p.status} />
                          </td>
                          <td className="py-3 px-3 text-slate-600 text-xs sm:text-sm">
                            {p.submittedAt ? formatWhen(p.submittedAt) : '—'}
                          </td>
                          {!reported && (
                            <td className="py-3 px-3.5 text-center">
                              {p.invitationId && <ResendButton participant={p} onResent={setResent} />}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredParticipants.length > pageSize && (
              <div className="tp-participant-pagination" aria-label={translateUi("Phân trang danh sách nhân viên")}>
                <div>
                  <button type="button" disabled={activePage === 1} onClick={() => setPage(activePage - 1)}>{translateUi("Trước")}</button>
                  <strong>{translateUi("Trang ")}{activePage}/{pageCount}</strong>
                  <button type="button" disabled={activePage === pageCount} onClick={() => setPage(activePage + 1)}>{translateUi("Sau")}</button>
                </div>
              </div>
            )}
          </div>
        </TrialDisclosure>
      </section>
    </div>
  );
}

function SetupFramework() {
  useUiLanguage();
  const actions = [
    { to: '/enterprise/setup?tab=ceilings', label: '1. Cài đặt chuẩn vị trí', Icon: Briefcase },
    { to: '/enterprise/skill-gap', label: '2. Báo cáo khoảng trống', Icon: TrendingUp },
    { to: '/enterprise/courses', label: '3. Trang bị khóa học', Icon: BookOpen },
  ];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-base font-bold text-slate-900">{translateUi('Lộ trình tiếp theo')}</h3>
      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        {actions.map(({ to, label, Icon }) => (
          <Link key={to} to={to} className="group flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-2.5 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-100 motion-reduce:transition-none">
            <Icon size={16} aria-hidden="true" className="shrink-0" />
            {translateUi(label)}
            <ArrowRight size={15} aria-hidden="true" className="ml-auto shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Gửi lại email mời cho nhân viên chưa kích hoạt. */
function ResendButton({ participant, onResent }: { participant: TrialParticipant; onResent: (result: TrialInviteResult) => void }) {
  useUiLanguage();
  const resend = useResendTrialInvitation();
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
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
      {resend.isPending ? translateUi('Đang gửi…') : translateUi('Gửi lại')}
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
    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 space-y-4 mb-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{translateUi("Mời thêm nhân viên tham gia")}</h3>
        <button
          type="button"
          onClick={onDone}
          className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
        >{translateUi("Đóng")}</button>
      </div>
      <ParticipantsEditor
        rows={rows}
        onChange={setRows}
        departments={program.departments}
      />
      <InviteResult result={result} />
      <div className="flex justify-end pt-2">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#137b84] hover:bg-[#0e5f66] px-5 py-2 text-xs font-bold text-white shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
  if (!s.deadline) return 'Chọn hạn làm bài.';
  const deadline = scheduleDate(s).getTime();
  if (!Number.isFinite(deadline)) return 'Chọn ngày giờ hợp lệ.';
  if (deadline <= Date.now() + 30 * 60_000) return 'Hạn làm bài cần sau ít nhất 30 phút.';
  if (deadline > Date.now() + 60 * 86400000) return 'Hạn làm bài tối đa 60 ngày.';
  return null;
}

const toRequest = (s: Schedule) => {
  const deadline = scheduleDate(s);
  return {
    testDeadline: deadline.toISOString(),
  };
};

function SurveyDeadline({ program }: { program: TrialProgram }) {
  useUiLanguage();
  const [editing, setEditing] = useState(false);
  const [schedule, setSchedule] = useState<Schedule>({ deadline: toLocalInput(program.testDeadline) });
  const request = useSubmitTrialRequest();
  const error = validateSchedule(schedule);
  return <div className="mt-3">
    <button type="button" className="text-xs font-bold text-teal-700" aria-expanded={editing} onClick={() => { setSchedule({deadline:toLocalInput(program.testDeadline)}); setEditing(!editing); }}>{editing ? translateUi('Thu gọn') : translateUi('Điều chỉnh thời hạn')}</button>
    <TrialDisclosure open={editing}><div className="flex flex-wrap items-end gap-3 pt-4">{editing && <ScheduleFields value={schedule} onChange={setSchedule} />}<button type="button" className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-40" disabled={!!error || request.isPending} onClick={() => request.mutate(toRequest(schedule),{onSuccess:()=>{setEditing(false);toast.success('Đã cập nhật hạn khảo sát.');},onError:(failure)=>toast.error(apiErrorMessage(failure,'Chưa cập nhật được thời hạn.'))})}>{request.isPending ? translateUi('Đang lưu…') : translateUi('Lưu thời hạn')}</button>{error && <span role="status" className="text-xs text-amber-700">{translateUi(error)}</span>}</div></TrialDisclosure>
  </div>;
}

function ScheduleFields({ value, onChange }: { value: Schedule; onChange: (v: Schedule) => void }) {
  return <TrialDeadlinePicker value={value.deadline} onChange={(deadline) => onChange({ deadline })} />;
}

function InviteResult({ result }: { result: TrialInviteResult | null }) {
  useUiLanguage();
  if (!result) return null;
  const links = result.invited.filter((i) => i.debugLink);
  return (
    <div className="space-y-2 text-xs">
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
          <strong className="block text-[11px] uppercase tracking-wider text-blue-800">{translateUi("Link kích hoạt tài khoản thử nghiệm:")}</strong>
          {links.map((i) => (
            <div key={i.email} className="truncate">
              <span className="font-semibold">{i.email}:</span>{' '}
              <a href={i.debugLink!} className="text-blue-700 underline font-mono text-[11px]">
                {i.debugLink}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
