import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Camera,
  CheckCircle2,
  Clock,
  FileCheck,
  GraduationCap,
  Mic,
  Monitor,
  Search,
  Send,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useInviteTrialParticipants,
  useJoinTrialAsParticipant,
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
import { CompetencyReport, ParticipantStatus, StageBadge, Steps } from '../components/TrialUi';
import { emptyRows, isRowEmpty, rowError } from '../lib/participant-rows';
import { formatWhen, toLocalInput } from '../lib/trial-format';
import '../trial-program.css';
import '@/features/organization/components/owner-filter-controls.css';

const STEPS = ['Nhân sự tham gia', 'Thời gian & Lịch chấm', 'Làm bài & Chấm điểm', 'Báo cáo năng lực'];

/** OW-T1 · Đánh giá đội ngũ: giao diện hiện đại, trải rộng toàn màn hình, ít chữ, không rườm rà */
export function TrialProgramPage() {
  const { data, isLoading, error } = useTrialProgram();

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen text-[#17243f] relative overflow-hidden"
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
  const current = program.stage === 'SETUP' ? 0 : program.stage === 'REPORTED' ? 3 : 2;
  const [lastInvite, setLastInvite] = useState<TrialInviteResult | null>(null);

  return (
    <div className="space-y-6">
      {/* ── Header: Đẳng cấp, Tinh tế, Ít chữ ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs mb-2">
            <span className="size-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700">{program.organizationName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17243f]">
            {program.stage === 'REPORTED' ? 'Bảng Năng Lực Đội Ngũ' : 'Đánh Giá Năng Lực Đội Ngũ'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/enterprise/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 hover:bg-white px-4 py-2.5 text-xs font-bold text-[#17243f] hover:text-[#137b84] transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
          >
            Về Tổng quan
            <ArrowRight className="size-3.5" />
          </Link>
          <StageBadge stage={program.stage} />
        </div>
      </div>

      {/* ── Stepper: Thanh tiến trình gọn gàng ── */}
      <Steps steps={STEPS} current={current} />

      {program.stage === 'SETUP' ? (
        <div className="space-y-6">
          <OwnerParticipation program={program} />
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

/**
 * Chủ doanh nghiệp tùy chọn tự làm bài (mentor chấm như nhân viên).
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-white shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="size-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-semibold text-slate-800">
            Bạn đang tham gia bài đánh giá cùng nhân viên:
          </span>
          <ParticipantStatus status={me.status} />
        </div>
        <Link
          to="/enterprise/me/trial-test"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
        >
          {reported ? 'Kết quả & bài học của tôi' : 'Vào bài đánh giá của tôi'}
          <ArrowRight size={13} />
        </Link>
      </div>
    );
  }

  const ready = placement.department.trim() && placement.position.trim();
  return (
    <div className="p-4 rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <GraduationCap className="size-4.5 text-[#137b84]" />
          <span>{reported ? 'Bạn muốn học thử cùng nhân viên?' : 'Bạn muốn cùng tham gia làm bài đánh giá năng lực?'}</span>
        </div>
        {!open && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#0e5968] font-bold text-xs transition-colors cursor-pointer"
            onClick={() => setOpen(true)}
          >
            + Tham gia cùng đội ngũ
          </button>
        )}
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-end gap-2.5 text-xs">
          <label className="flex-1 min-w-[180px] flex flex-col gap-1 text-slate-600 font-semibold">
            Phòng ban
            <input
              list={`${listId}-d`}
              value={placement.department}
              maxLength={150}
              placeholder="VD: Ban Giám đốc"
              className="h-8.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-[#137b84]"
              onChange={(e) => setPlacement({ ...placement, department: e.target.value })}
            />
          </label>
          <label className="flex-1 min-w-[180px] flex flex-col gap-1 text-slate-600 font-semibold">
            Vị trí
            <input
              list={`${listId}-p`}
              value={placement.position}
              maxLength={150}
              placeholder="VD: Tổng Giám đốc"
              className="h-8.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-[#137b84]"
              onChange={(e) => setPlacement({ ...placement, position: e.target.value })}
            />
          </label>
          <datalist id={`${listId}-d`}>{program.departments.map((d) => <option key={d} value={d} />)}</datalist>
          <datalist id={`${listId}-p`}>{program.positions.map((p) => <option key={p} value={p} />)}</datalist>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8.5 px-4 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white font-bold text-xs transition-all shadow-2xs disabled:opacity-40 cursor-pointer"
              disabled={!ready || join.isPending}
              onClick={() =>
                join.mutate(
                  { department: placement.department.trim(), position: placement.position.trim() },
                  {
                    onSuccess: ({ refreshed }) =>
                      refreshed
                        ? toast.success('Bạn đã tham gia. Mentor sẽ chấm bài của bạn như nhân viên.')
                        : toast.warning('Bạn đã tham gia. Hãy đăng xuất rồi đăng nhập lại để vào bài đánh giá.'),
                    onError: (err) => toast.error(apiErrorMessage(err, 'Chưa tham gia được.')),
                  },
                )
              }
            >
              {join.isPending ? 'Đang xử lý…' : 'Xác nhận'}
            </button>
            <button
              type="button"
              className="h-8.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
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
    <div className="space-y-6">
      {/* ── Thẻ 1: Danh sách nhân sự ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Danh sách nhân sự tham gia
            </h2>
            {existing > 0 && (
              <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold">
                Đã mời {existing} người
              </span>
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

      {/* ── Thẻ 2: Thời gian & Lịch chấm ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Thời gian làm bài & Lịch hẹn chấm
          </h2>
        </div>
        <ScheduleFields value={schedule} onChange={setSchedule} />
        <ExamSummary program={program} />
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
          {busy ? 'Đang xử lý…' : 'Gửi lời mời & đăng ký chấm'}
        </button>
      </div>
    </div>
  );
}

/** Bước 3–4: theo dõi bài làm, mời thêm, đổi lịch; bảng năng lực khi có kết quả. */
function TrackView({ program }: { program: TrialProgram }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [placement, setPlacement] = useState({ department: '', position: '' });
  const [resent, setResent] = useState<TrialInviteResult | null>(null);
  const [search, setSearch] = useState('');
  const join = useJoinTrialAsParticipant();
  const listId = useId();

  const count = (statuses: string[]) => program.participants.filter((p) => statuses.includes(p.status)).length;
  const reported = program.stage === 'REPORTED';
  const [showParticipants, setShowParticipants] = useState(!reported);
  const me = program.participants.find((p) => p.isOwner);
  const ready = placement.department.trim() && placement.position.trim();

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

  return (
    <div className="space-y-6">
      {/* ── 4 THẺ CHỈ SỐ ĐIỀU HÀNH TIẾN ĐỘ ĐÁNH GIÁ (TRẢI RỘNG 4 CỘT) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Tổng nhân sự */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Nhân sự tham gia
            </span>
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
          <div className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium">
            Đã đăng ký danh sách
          </div>
        </div>

        {/* 2. Đã kích hoạt */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xs hover:border-amber-300 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Đã kích hoạt
            </span>
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
          <div className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium">
            Đã sẵn sàng làm bài
          </div>
        </div>

        {/* 3. Đã nộp bài */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Đã nộp bài
            </span>
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
          <div className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium">
            Đã gửi bài kiểm tra
          </div>
        </div>

        {/* 4. Đã chấm điểm */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-2xs hover:border-emerald-300 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Đã chấm điểm
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-700 shadow-2xs">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {count(['REVIEWED'])}
            </span>
            <span className="text-sm text-slate-500 font-semibold">/{program.participants.length}</span>
          </div>
          <div className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium">
            Mentor hoàn tất đánh giá
          </div>
        </div>
      </div>

      {/* ── THANH LỊCH TRÌNH & THAO TÁC CỦA CHỦ DOANH NGHIỆP ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-4.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Cụm thông tin Lịch & Mentor */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Clock size={16} className="text-teal-600 shrink-0" />
              <span className="text-slate-500 font-medium">Hạn làm bài:</span>
              <strong className="text-slate-900 font-bold">{formatWhen(program.testDeadline)}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-2">
              <span className="text-slate-500 font-medium">Giờ chấm:</span>
              <strong className="text-slate-900 font-bold">{formatWhen(program.preferredReviewAt)}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-2">
              <UserCheck size={16} className="text-teal-600 shrink-0" />
              <span className="text-slate-500 font-medium">Mentor:</span>
              <strong className="text-slate-900 font-bold">{program.mentorName ?? 'DigiTalent'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {!reported && (
              <button
                type="button"
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? 'Đóng' : 'Đổi lịch'}
              </button>
            )}

            {me ? (
              <Link
                to="/enterprise/me/trial-test"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white font-bold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs"
              >
                {reported ? 'Kết quả của tôi' : 'Bài đánh giá của tôi'}
                <ArrowRight size={15} />
              </Link>
            ) : (
              !ownerOpen && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#0e5968] font-bold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  onClick={() => setOwnerOpen(true)}
                >
                  + Tự làm bài đánh giá
                </button>
              )
            )}
          </div>
        </div>

        {/* Form đổi lịch nếu đang mở */}
        {editing && (
          <div className="pt-3 border-t border-slate-100">
            <RescheduleForm program={program} onDone={() => setEditing(false)} />
          </div>
        )}

        {/* Form chủ DN tham gia */}
        {!me && ownerOpen && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-end gap-2 text-xs">
            <label className="flex-1 min-w-[160px] flex flex-col gap-1 text-slate-600 font-semibold">
              Phòng ban
              <input
                list={`${listId}-d`}
                value={placement.department}
                maxLength={150}
                placeholder="VD: Ban Giám đốc"
                className="h-8.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-[#137b84]"
                onChange={(e) => setPlacement({ ...placement, department: e.target.value })}
              />
            </label>
            <label className="flex-1 min-w-[160px] flex flex-col gap-1 text-slate-600 font-semibold">
              Vị trí
              <input
                list={`${listId}-p`}
                value={placement.position}
                maxLength={150}
                placeholder="VD: Tổng Giám đốc"
                className="h-8.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-[#137b84]"
                onChange={(e) => setPlacement({ ...placement, position: e.target.value })}
              />
            </label>
            <datalist id={`${listId}-d`}>{program.departments.map((d) => <option key={d} value={d} />)}</datalist>
            <datalist id={`${listId}-p`}>{program.positions.map((p) => <option key={p} value={p} />)}</datalist>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="h-8.5 px-4 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                disabled={!ready || join.isPending}
                onClick={() =>
                  join.mutate(
                    { department: placement.department.trim(), position: placement.position.trim() },
                    {
                      onSuccess: ({ refreshed }) =>
                        refreshed
                          ? toast.success('Bạn đã tham gia. Mentor sẽ chấm bài của bạn như nhân viên.')
                          : toast.warning('Bạn đã tham gia. Hãy đăng xuất rồi đăng nhập lại để vào bài đánh giá.'),
                      onError: (err) => toast.error(apiErrorMessage(err, 'Chưa tham gia được.')),
                    },
                  )
                }
              >
                {join.isPending ? 'Đang lưu…' : 'Xác nhận'}
              </button>
              <button
                type="button"
                className="h-8.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs transition-colors cursor-pointer"
                onClick={() => setOwnerOpen(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── BÁO CÁO NĂNG LỰC KHI ĐÃ HOÀN TẤT CHẤM (REPORTED) ── */}
      {reported && program.report && (
        <div className="space-y-6">
          <SetupFramework report={program.report} />
          <CompetencyReport report={program.report} />
        </div>
      )}

      {/* ── DANH SÁCH NHÂN VIÊN THAM GIA ĐÁNH GIÁ (COLLAPSIBLE / HIỂN THỊ PHỤ) ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white/95 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setShowParticipants((v) => !v)}
          className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Danh sách tài khoản & tiến độ tham gia ({program.participants.length})
                </h3>
                {reported && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                    Hiển thị phụ
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Tra cứu email, trạng thái kích hoạt và thời điểm gửi bài kiểm tra của từng nhân sự
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors">
              {showParticipants ? (
                <>
                  <ChevronUp size={15} /> Thu gọn danh sách
                </>
              ) : (
                <>
                  <ChevronDown size={15} /> Mở rộng danh sách ({program.participants.length})
                </>
              )}
            </span>
          </div>
        </button>

        {showParticipants && (
          <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
              <label className="owner-filter-search w-full sm:w-80">
                <Search className="size-4" aria-hidden="true" />
                <input
                  type="text"
                  aria-label="Tìm nhân viên hoặc phòng ban"
                  placeholder="Tìm nhân viên, phòng ban..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm"
                />
              </label>
              {!reported && program.participants.length < program.maxParticipants && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer shrink-0"
                  onClick={() => setAdding((v) => !v)}
                >
                  {adding ? 'Đóng' : '+ Mời thêm'}
                </button>
              )}
            </div>

            {adding && <AddParticipants program={program} onDone={() => setAdding(false)} />}
            <InviteResult result={resent} />

            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-3.5">Nhân viên</th>
                    <th className="py-3 px-3">Phòng ban · Vị trí</th>
                    <th className="py-3 px-3 text-center">Trạng thái</th>
                    <th className="py-3 px-3">Thời điểm nộp</th>
                    {!reported && <th className="py-3 px-3.5 text-center w-28">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={reported ? 4 : 5} className="py-8 text-center text-slate-400">
                        Không tìm thấy nhân viên nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p) => {
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
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * 3 bước chuẩn hóa năng lực sau đánh giá: thiết kế dạng dải ruy băng tinh tế.
 */
function SetupFramework(_props: { report: TrialReport }) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
            Lộ trình tiếp theo
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Chuẩn hóa năng lực sau đánh giá
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Bước 1 */}
        <Link
          to="/enterprise/setup?tab=positions"
          className="group flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/60 to-white hover:border-emerald-500 hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="size-10 rounded-xl bg-emerald-100/90 border border-emerald-200 text-emerald-800 grid place-items-center shrink-0 shadow-2xs">
              <Briefcase className="size-5" />
            </span>
            <div className="min-w-0">
              <strong className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block truncate">
                1. Cài đặt chuẩn vị trí
              </strong>
              <span className="text-xs sm:text-[13px] text-slate-600 font-medium block truncate mt-0.5">
                Khung chuẩn kỳ vọng
              </span>
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
              <strong className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors block truncate">
                2. Báo cáo khoảng trống
              </strong>
              <span className="text-xs sm:text-[13px] text-slate-600 font-medium block truncate mt-0.5">
                Phân tích chênh lệch
              </span>
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
              <strong className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-purple-700 transition-colors block truncate">
                3. Trang bị khóa học
              </strong>
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
    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 space-y-4 mb-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Mời thêm nhân viên tham gia
        </h3>
        <button
          type="button"
          onClick={onDone}
          className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
        >
          Đóng
        </button>
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
          {invite.isPending ? 'Đang gửi…' : `Gửi lời mời (${filled.length} người)`}
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
    <div className="space-y-3">
      <ScheduleFields value={schedule} onChange={setSchedule} />
      <div className="flex items-center justify-end gap-3 pt-1">
        {error && <span className="text-xs font-semibold text-amber-600">{error}</span>}
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white text-xs font-bold shadow-2xs disabled:opacity-40 cursor-pointer"
          disabled={!!error || request.isPending}
          onClick={() =>
            request.mutate(toRequest(schedule), {
              onSuccess: () => {
                toast.success('Đã cập nhật lịch thành công');
                onDone();
              },
              onError: (err) => toast.error(apiErrorMessage(err, 'Chưa cập nhật được.')),
            })
          }
        >
          {request.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      <label className="flex flex-col gap-1 text-slate-600 font-semibold">
        Hạn hoàn thành bài đánh giá
        <input
          type="datetime-local"
          value={value.deadline}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-[#137b84]"
          onChange={(e) => onChange({ ...value, deadline: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1 text-slate-600 font-semibold">
        Giờ mong muốn Mentor chấm
        <input
          type="datetime-local"
          value={value.review}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-[#137b84]"
          onChange={(e) => onChange({ ...value, review: e.target.value })}
        />
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1 text-slate-600 font-semibold">
        Ghi chú cho DigiTalent (không bắt buộc)
        <input
          value={value.note}
          maxLength={500}
          placeholder="VD: Ưu tiên chấm cho khối Kinh doanh trước..."
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-[#137b84]"
          onChange={(e) => onChange({ ...value, note: e.target.value })}
        />
      </label>
    </div>
  );
}

function ExamSummary({ program }: { program: TrialProgram }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
      <span className="font-semibold text-slate-700">
        Quy cách kiểm tra:
      </span>
      <span>{program.choiceCount} câu trắc nghiệm + {program.essayCount} câu tự luận (3 cấp độ)</span>
      <span className="text-slate-300">·</span>
      <span className="inline-flex items-center gap-1 text-slate-600">
        <Camera size={13} className="text-slate-400" /> Camera
      </span>
      <span className="inline-flex items-center gap-1 text-slate-600">
        <Mic size={13} className="text-slate-400" /> Micro
      </span>
      <span className="inline-flex items-center gap-1 text-slate-600">
        <Monitor size={13} className="text-slate-400" /> Chia sẻ màn hình
      </span>
    </div>
  );
}

function InviteResult({ result }: { result: TrialInviteResult | null }) {
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
          <strong className="block text-[11px] uppercase tracking-wider text-blue-800">
            Link kích hoạt tài khoản thử nghiệm:
          </strong>
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
