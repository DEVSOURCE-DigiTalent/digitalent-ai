import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  FlaskConical,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { useTrialProgram } from '@/hooks/use-trial-program';
import { formatWhen } from '@/features/trial-program/lib/trial-format';
import { LevelBadge, LevelLegend } from '@/features/trial-program/components/TrialUi';
import type { TrialParticipantStatus, TrialStage } from '@/services/trial-program.service';
import '@/features/trial-program/trial-program.css';

const STEPS = ['Nhân viên', 'Hạn & lịch chấm', 'Làm bài & chấm', 'Kết quả'];

const STAGE_CONFIG: Record<TrialStage, { label: string; tone: string; desc: string }> = {
  SETUP: {
    label: 'Chưa gửi yêu cầu',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: 'Cần mời nhân viên và thiết lập hạn làm bài để gửi yêu cầu cho DigiTalent.',
  },
  REQUESTED: {
    label: 'Chờ DigiTalent phân công Mentor',
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Yêu cầu đánh giá đã được gửi. Quản trị viên DigiTalent đang phân công Mentor phụ trách.',
  },
  ASSIGNED: {
    label: 'Mentor đang chấm bài',
    tone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    desc: 'Nhân viên đang làm bài hoặc Mentor DigiTalent đang chấm điểm các bài tự luận.',
  },
  REPORTED: {
    label: 'Đã có kết quả chính thức',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Mentor đã hoàn tất chấm điểm và công bố toàn cảnh năng lực đội ngũ.',
  },
};

export function OwnerTrialAssessmentWidget() {
  const { data: program, isLoading, isError } = useTrialProgram();
  const [showEmployees, setShowEmployees] = useState(false);

  if (isLoading || isError || !program) {
    return null;
  }

  const count = (statuses: TrialParticipantStatus[]) =>
    program.participants.filter((p) => statuses.includes(p.status)).length;

  const currentStep =
    program.stage === 'SETUP' ? 0 : program.stage === 'REPORTED' ? 3 : 2;

  const stageMeta = STAGE_CONFIG[program.stage];

  // ─────────────────────────────────────────────────────────────
  // GIAI ĐOẠN ĐÃ CÔNG BỐ KẾT QUẢ (REPORTED)
  // ─────────────────────────────────────────────────────────────
  if (program.stage === 'REPORTED' && program.report) {
    const report = program.report;
    const weakest = [...report.summary]
      .filter((d) => d.level < 2)
      .sort((a, b) => a.average - b.average)
      .slice(0, 2);

    return (
      <section
        className="rounded-[22px] border p-6 overflow-hidden relative"
        style={{
          borderColor: 'var(--po-line)',
          background: 'var(--po-surface)',
          boxShadow: '0 10px 35px rgba(29,48,102,.025)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-600">
                  Kết quả Đánh giá
                </span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stageMeta.tone}`}>
                  {stageMeta.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Bức tranh Năng lực Đội ngũ Toàn diện
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/enterprise/trial"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Xem chi tiết đợt thi
              <ExternalLink className="size-3.5" />
            </Link>
            <Link
              to="/enterprise/capability"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#304bdf] text-white text-xs font-bold hover:bg-[#203bbf] transition-colors shadow-xs"
            >
              Xem Ma trận Khoảng cách
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Khuyến nghị & Định hướng Đào tạo Nổi bật */}
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white p-5 border border-indigo-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Sparkles className="size-4" />
            </div>
            <div>
              <strong className="text-sm font-bold text-indigo-950 block">
                Định hướng nâng cao năng lực cho doanh nghiệp
              </strong>
              <p className="text-xs text-indigo-800/90 leading-relaxed mt-0.5 max-w-2xl">
                {weakest.length > 0 ? (
                  <>
                    Dựa trên bài chấm của Mentor, đội ngũ của bạn đã nắm vững mức Cơ bản. Nên tập trung đẩy mạnh đào tạo Trung cấp cho 2 lĩnh vực còn yếu nhất:{' '}
                    <span className="font-semibold text-indigo-950">
                      {weakest.map((w) => w.name).join(' và ')}
                    </span>
                    .
                  </>
                ) : (
                  'Đội ngũ có mức độ sẵn sàng số cao đồng đều qua cả 6 lĩnh vực theo chuẩn Thông tư 02.'
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              to="/enterprise/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <BookOpen className="size-3.5" />
              Chọn khóa học đào tạo
            </Link>
          </div>
        </div>

        {/* Bảng Năng lực 6 Lĩnh vực */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">
              Phân bố năng lực qua 6 lĩnh vực ({report.assessed} nhân sự đã thẩm định)
            </h3>
            <LevelLegend />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="tp-table w-full">
              <thead>
                <tr className="bg-slate-50/70">
                  <th className="text-left py-2.5 px-3">Lĩnh vực chuẩn Thông tư 02</th>
                  <th className="py-2.5 px-3">Phân bố cấp độ</th>
                  <th className="num py-2.5 px-3">Điểm TB</th>
                  <th className="num py-2.5 px-3">Mức chung</th>
                </tr>
              </thead>
              <tbody>
                {report.summary.map((row) => (
                  <tr key={row.categoryId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {row.number}. {row.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="tp-dist">
                        {row.counts.map((n, level) =>
                          n > 0 ? (
                            <i
                              key={level}
                              data-level={level}
                              style={{ width: `${(n / Math.max(1, report.assessed)) * 100}%` }}
                            />
                          ) : null,
                        )}
                      </div>
                    </td>
                    <td className="num py-2.5 px-3 font-semibold text-slate-700">
                      {row.average.toFixed(1)}
                    </td>
                    <td className="num py-2.5 px-3">
                      <LevelBadge level={row.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nút Xem chi tiết từng nhân viên */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowEmployees((v) => !v)}
            className="text-xs font-bold text-[#304bdf] hover:underline inline-flex items-center gap-1"
          >
            {showEmployees ? 'Thu gọn danh sách nhân viên' : `Xem chi tiết mức năng lực của ${report.employees.length} nhân viên`}
            <ArrowRight className={`size-3.5 transition-transform ${showEmployees ? 'rotate-90' : ''}`} />
          </button>

          <span className="text-[11px] text-slate-400">
            Mentor: {program.mentorName ?? 'Mentor DigiTalent'} · Công bố: {formatWhen(report.publishedAt)}
          </span>
        </div>

        {/* Bảng chi tiết nhân viên (khi mở rộng) */}
        {showEmployees && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="tp-table w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-2 px-3">Họ tên nhân viên</th>
                  <th className="text-left py-2 px-3">Phòng ban · Vị trí</th>
                  {report.domains.map((d) => (
                    <th key={d.categoryId} className="num py-2 px-2" title={d.name}>
                      LV{d.number}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.employees.map((e) => (
                  <tr key={e.employeeId} className="border-t border-slate-100">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{e.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {[e.departmentName, e.positionName].filter(Boolean).join(' · ') || '—'}
                    </td>
                    {e.levels.map((level, i) => (
                      <td key={i} className="num py-2.5 px-2">
                        <LevelBadge level={level} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // GIAI ĐOẠN ĐANG TIẾN HÀNH (SETUP / REQUESTED / ASSIGNED)
  // ─────────────────────────────────────────────────────────────
  return (
    <section
      className="rounded-[22px] border p-6 overflow-hidden relative"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FlaskConical className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-600">
                Đánh giá ban đầu
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stageMeta.tone}`}>
                {stageMeta.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Chiến dịch Đánh giá Năng lực Đội ngũ
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/enterprise/members"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Users className="size-3.5" />
            Mời nhân sự
          </Link>
          <Link
            to="/enterprise/trial"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#304bdf] text-white text-xs font-bold hover:bg-[#203bbf] transition-colors shadow-xs"
          >
            Chi tiết & Đặt lịch
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="my-5">
        <ol className="tp-steps" aria-label="Tiến trình đánh giá">
          {STEPS.map((step, index) => {
            const state = index < currentStep ? 'done' : index === currentStep ? 'current' : 'todo';
            return (
              <li key={step} data-state={state}>
                <b>{state === 'done' ? <Check size={13} strokeWidth={3} /> : index + 1}</b>
                <span>{step}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Nhân sự tham gia</span>
          <strong className="text-2xl font-bold text-slate-900 block mt-0.5">
            {program.participants.length}
          </strong>
          <small className="text-[10px] text-slate-400">Tối đa {program.maxParticipants} người</small>
        </div>

        <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Đã kích hoạt</span>
          <strong className="text-2xl font-bold text-blue-600 block mt-0.5">
            {count(['ACTIVE', 'SUBMITTED', 'REVIEWED'])}
          </strong>
          <small className="text-[10px] text-slate-400">Đã mở tài khoản</small>
        </div>

        <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Đã nộp bài</span>
          <strong className="text-2xl font-bold text-amber-600 block mt-0.5">
            {count(['SUBMITTED', 'REVIEWED'])}
          </strong>
          <small className="text-[10px] text-slate-400">Đã thi trắc nghiệm & tự luận</small>
        </div>

        <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Mentor đã chấm</span>
          <strong className="text-2xl font-bold text-emerald-600 block mt-0.5">
            {count(['REVIEWED'])}
          </strong>
          <small className="text-[10px] text-slate-400">Đã cho điểm tự luận</small>
        </div>
      </div>

      {/* Lịch & Mentor Info */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-slate-400" />
            Hạn làm bài: <strong className="text-slate-800">{formatWhen(program.testDeadline)}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-400" />
            Giờ mong muốn chấm: <strong className="text-slate-800">{formatWhen(program.preferredReviewAt)}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserCheck className="size-3.5 text-slate-400" />
            Mentor:{' '}
            <strong className="text-indigo-600 font-semibold">
              {program.mentorName ?? 'Chờ DigiTalent phân công'}
            </strong>
          </span>
        </div>

        <Link
          to="/enterprise/trial"
          className="text-[#304bdf] font-bold hover:underline inline-flex items-center gap-1 shrink-0"
        >
          Quản lý đợt thi <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
