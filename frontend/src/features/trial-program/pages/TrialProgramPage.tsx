import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Clock,
  FileCheck,
  Search,
  Send,
  TrendingUp,
  Users,
  Zap,
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
  TrialReport,
} from '@/services/trial-program.service';
import { apiErrorMessage } from '@/lib/utils';
import { PULSE_TOKENS } from '@/features/organization/owner-theme';
import { ParticipantsEditor } from '../components/ParticipantsEditor';
import { TrialDisclosure } from '../components/TrialDisclosure';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import { OwnerSurveyAction } from '../components/OwnerSurveyAction';
import { CompetencyReport, ParticipantStatus, Steps } from '../components/TrialUi';
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
        {isLoading && (
          <div className="flex items-center justify-center min-h-[350px]">
            <div className="size-8 rounded-full border-3 border-[#137b84] border-t-transparent animate-spin" />
          </div>
        )}
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
  const current = program.stage === 'SETUP' ? 0 : program.stage === 'REPORTED' ? 3 : 2;
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
          <SetupView program={program} onInvited={setLastInvite} />
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
function SetupView({ program, onInvited }: { program: TrialProgram; onInvited: (result: TrialInviteResult) => void }) {
  useUiLanguage();
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
        const outcome = await invite.mutateAsync({ rows: filled, testDeadline: toRequest(schedule).testDeadline });
        setResult(outcome);
        onInvited(outcome);
        invited = outcome.invited.length;
        const rejected = new Set(outcome.rejected.map((r) => r.email.toLowerCase()));
        setRows(filled.filter((r) => rejected.has(r.email.trim().toLowerCase())));
        if (outcome.rejected.length) {
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
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-xs space-y-4">
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
          positions={program.positions}
          limit={program.maxParticipants - existing}
        />
        <InviteResult result={result} />
      </section>

      {/* ── Hạn làm bài ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{translateUi("Hạn hoàn thành đánh giá")}</h2>
        </div>
        <ScheduleFields value={schedule} onChange={setSchedule} />
      </section>

      {/* ── Nút kích hoạt ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {scheduleError && <span className="text-xs font-semibold text-amber-600">{scheduleError}</span>}
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#137b84] to-[#0d9488] hover:from-[#0e5968] hover:to-[#0f766e] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#137b84]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          disabled={busy || invalid || !!scheduleError || existing + filled.length === 0}
          onClick={submit}
        >
          <Send className="size-4" />
          {busy ? translateUi('Đang xử lý…') : translateUi('Gửi lời mời & bắt đầu đánh giá')}
        </button>
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
  const [sort, setSort] = useState<'name' | 'department' | 'status' | 'submitted'>('name');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const count = (statuses: string[]) => program.participants.filter((p) => statuses.includes(p.status)).length;
  const reported = program.stage === 'REPORTED';
  const [showParticipants, setShowParticipants] = useState(!reported);

  const filteredParticipants = program.participants.filter((p) => {
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
    if (sort === 'status') return a.status.localeCompare(b.status) || a.fullName.localeCompare(b.fullName, 'vi');
    if (sort === 'department') return (a.departmentName ?? '').localeCompare(b.departmentName ?? '', 'vi') || a.fullName.localeCompare(b.fullName, 'vi');
    return a.fullName.localeCompare(b.fullName, 'vi');
  });
  const pageCount = Math.max(1, Math.ceil(sortedParticipants.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const visibleParticipants = sortedParticipants.slice((activePage - 1) * pageSize, activePage * pageSize);

  return (
    <div className="space-y-6">
      <div className="trial-participation-stats grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. Tổng nhân sự */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{translateUi("Nhân sự tham gia")}</span>
            <div className="size-8 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-[#137b84] shadow-2xs">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {program.participants.length}
            </span>
            <span className="text-sm text-slate-500 font-semibold">/ {program.maxParticipants}</span>
          </div>
          <div className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium">{translateUi("Đã đăng ký danh sách")}</div>
        </div>

        {/* 2. Đã kích hoạt */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xs hover:border-amber-300 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{translateUi("Đã kích hoạt")}</span>
            <div className="size-8 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-700 shadow-2xs">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {count(['ACTIVE', 'SUBMITTED', 'REVIEWED'])}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              ({Math.round((count(['ACTIVE', 'SUBMITTED', 'REVIEWED']) / Math.max(1, program.participants.length)) * 100)}%)
            </span>
          </div>
          <div className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium">{translateUi("Đã sẵn sàng làm bài")}</div>
        </div>

        {/* Người đã nộp hoặc được chấm cùng thuộc một nhóm hoàn thành bài làm. */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{translateUi("Hoàn thành bài làm")}</span>
            <div className="size-8 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-700 shadow-2xs">
              <FileCheck size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {count(['SUBMITTED', 'REVIEWED'])}
            </span>
            <span className="text-sm text-slate-500 font-semibold">/{program.participants.length}</span>
          </div>
          <div className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium">{translateUi("Đã nộp bài đánh giá")}</div>
        </div>
      </div>

      <section className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/90 to-white px-5 py-4 shadow-2xs">
        <span className="inline-flex items-center gap-2 text-sm text-slate-700">
          <Clock size={16} className="text-teal-700" />{translateUi("Hạn hoàn thành bài đánh giá")}<strong className="font-bold text-slate-900">{program.testDeadline ? formatWhen(program.testDeadline) : 'Chưa đặt thời hạn'}</strong>
        </span>
        {!reported && <SurveyDeadline program={program} />}
      </section>

      <OwnerSurveyAction program={program} />

      {(!program.report || program.report.assessed === 0) && <div className="trial-live-report" role="status"><span className="trial-live-report__dot" /><div><strong>{program.testDeadline && Date.parse(program.testDeadline) <= Date.now() ? 'Đã hết hạn · Chưa có bài nộp' : 'Đang chờ bài nộp đầu tiên'}</strong><p>{program.testDeadline && Date.parse(program.testDeadline) <= Date.now() ? 'Có thể điều chỉnh thời hạn để tiếp tục nhận bài.' : 'Tổng quan sẽ xuất hiện tại đây ngay khi có kết quả.'}</p></div></div>}
      {/* Tổng quan trực tiếp; chỉ mở thiết lập khung sau khi kết quả đã chốt. */}
      {program.report && program.report.assessed > 0 && (
        <div className="space-y-6">
          <div className="trial-live-report" role="status"><span className="trial-live-report__dot" /><div><strong>{reported ? 'Kết quả đã chốt' : 'Tổng quan đang cập nhật'}</strong><p>{program.report.assessed}/{program.participants.length} người có kết quả{reported ? ' · Đợt khảo sát đã kết thúc.' : ' · Tự cập nhật khi có bài nộp mới.'}</p></div></div>
          {reported && <SetupFramework report={program.report} />}
          <CompetencyReport report={program.report} />
        </div>
      )}

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
                <OwnerFilterSelect label={translateUi("Sắp xếp danh sách nhân viên")} value={sort} onChange={(value) => { setSort(value as typeof sort); setPage(1); }} options={[{ value: 'name', label: 'Tên nhân viên' }, { value: 'department', label: 'Phòng ban' }, { value: 'status', label: 'Trạng thái' }, { value: 'submitted', label: 'Nộp gần nhất' }]} />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                  {filteredParticipants.length ? `${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, filteredParticipants.length)} / ${filteredParticipants.length}` : '0 người'}
                </span>
                <OwnerFilterSelect label={translateUi("Số nhân viên mỗi trang")} value={String(pageSize)} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} options={[5, 10, 15, 25, 50].map((size) => ({ value: String(size), label: `${size} / trang` }))} />
                {!reported && program.participants.length < program.maxParticipants && (
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
                            <ParticipantStatus status={p.status} />
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

/**
 * 3 bước chuẩn hóa năng lực sau đánh giá: thiết kế dạng dải ruy băng tinh tế.
 */
function SetupFramework(_props: { report: TrialReport }) {
  useUiLanguage();
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">{translateUi("Lộ trình tiếp theo")}</span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{translateUi("Chuẩn hóa năng lực sau đánh giá")}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Bước 1 */}
        <Link
          to="/enterprise/setup?tab=ceilings"
          className="group flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/60 to-white hover:border-emerald-500 hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="size-10 rounded-xl bg-emerald-100/90 border border-emerald-200 text-emerald-800 grid place-items-center shrink-0 shadow-2xs">
              <Briefcase className="size-5" />
            </span>
            <div className="min-w-0">
              <strong className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block truncate">{translateUi("1. Cài đặt chuẩn vị trí")}</strong>
              <span className="text-xs sm:text-[13px] text-slate-600 font-medium block truncate mt-0.5">{translateUi("Khung chuẩn kỳ vọng")}</span>
            </div>
          </div>
          <ArrowRight size={16} className="text-emerald-600 shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Bước 2 */}
        <Link
          to="/enterprise/skill-gap"
          className="group flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/60 to-white hover:border-blue-500 hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="size-10 rounded-xl bg-blue-100/90 border border-blue-200 text-blue-800 grid place-items-center shrink-0 shadow-2xs">
              <TrendingUp className="size-5" />
            </span>
            <div className="min-w-0">
              <strong className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors block truncate">{translateUi("2. Báo cáo khoảng trống")}</strong>
              <span className="text-xs sm:text-[13px] text-slate-600 font-medium block truncate mt-0.5">{translateUi("Phân tích chênh lệch")}</span>
            </div>
          </div>
          <ArrowRight size={16} className="text-blue-600 shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Bước 3 */}
        <Link
          to="/enterprise/courses"
          className="group flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-purple-200/90 bg-gradient-to-r from-purple-50/60 to-white hover:border-purple-500 hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="size-10 rounded-xl bg-purple-100/90 border border-purple-200 text-purple-800 grid place-items-center shrink-0 shadow-2xs">
              <BookOpen className="size-5" />
            </span>
            <div className="min-w-0">
              <strong className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-purple-700 transition-colors block truncate">{translateUi("3. Trang bị khóa học")}</strong>
              <span className="text-xs sm:text-[13px] text-slate-600 font-medium block truncate mt-0.5">
                Đào tạo đúng điểm nghẽn
              </span>
            </div>
          </div>
          <ArrowRight size={16} className="text-purple-600 shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
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
        positions={program.positions}
        limit={program.maxParticipants - program.participants.length}
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

function validateSchedule(s: Schedule): string | null {
  if (!s.deadline) return 'Chọn hạn làm bài.';
  const deadline = new Date(s.deadline).getTime();
  if (!Number.isFinite(deadline)) return 'Chọn ngày giờ hợp lệ.';
  if (deadline < Date.now() + 30 * 60_000) return 'Hạn làm bài cần sau ít nhất 30 phút.';
  if (deadline > Date.now() + 60 * 86400000) return 'Hạn làm bài tối đa 60 ngày.';
  return null;
}

const toRequest = (s: Schedule) => {
  const deadline = new Date(s.deadline);
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
    <TrialDisclosure open={editing}><div className="flex flex-wrap items-end gap-3 pt-4"><ScheduleFields value={schedule} onChange={setSchedule}/><button type="button" className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-40" disabled={!!error || request.isPending} onClick={() => request.mutate(toRequest(schedule),{onSuccess:()=>{setEditing(false);toast.success('Đã cập nhật hạn khảo sát.');},onError:(failure)=>toast.error(apiErrorMessage(failure,'Chưa cập nhật được thời hạn.'))})}>{request.isPending?translateUi('Đang lưu…'):'Lưu thời hạn'}</button>{error&&<span role="status" className="text-xs text-amber-700">{translateUi(error)}</span>}</div></TrialDisclosure>
  </div>;
}

function ScheduleFields({ value, onChange }: { value: Schedule; onChange: (v: Schedule) => void }) {
  useUiLanguage();
  return (
    <div className="text-xs">
      <label className="flex max-w-md flex-col gap-1 text-slate-600 font-semibold">{translateUi("Hạn hoàn thành bài đánh giá")}<input
          type="datetime-local"
          value={value.deadline}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-[#137b84]"
          onChange={(e) => onChange({ ...value, deadline: e.target.value })}
        />
      </label>
    </div>
  );
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
