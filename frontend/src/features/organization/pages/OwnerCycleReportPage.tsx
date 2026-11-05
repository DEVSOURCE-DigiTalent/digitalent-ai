import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, ArrowRight } from 'lucide-react';
import {
  useCapabilityDashboard,
  useReportsOverview,
} from '@/hooks/use-analytics';
import { ReportKpiSummary } from '../components/ReportKpiSummary';
import { ReportDomainBreakdown } from '../components/ReportDomainBreakdown';
import { CycleTimeline } from '../components/CycleTimeline';
import { PULSE_TOKENS } from '../owner-theme';

export function OwnerCycleReportPage() {
  const { data: dashboard, isLoading: dashLoading } =
    useCapabilityDashboard();
  const { data: reports, isLoading: reportsLoading } = useReportsOverview();

  const isLoading = dashLoading || reportsLoading;

  const approved = reports?.training.completedAssignments ?? 0;
  const learners = dashboard?.kpis.employees ?? 0;
  const submissions = reports?.assessment.totalAttempts ?? 0;
  const underway = reports?.training.inProgressAssignments ?? 0;

  const hasCycles = approved > 0 || underway > 0;

  const domains = useMemo(
    () =>
      (dashboard?.domains ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [dashboard],
  );

  const completionRate = reports?.training.completionRate ?? 0;

  const events = useMemo(() => {
    if (!hasCycles) return [];
    return [
      {
        step: '1',
        title: 'Đánh giá năng lực cơ sở',
        detail:
          'Nhân viên được đánh giá theo khung TT02/2025 để xác định mức hiện tại.',
      },
      {
        step: '2',
        title: 'Xác định khoảng cách năng lực',
        detail: `${dashboard?.kpis.employeesWithHigh ?? 0} nhân viên có mức thiếu hụt Cao cần ưu tiên.`,
      },
      {
        step: '3',
        title: 'Phân công khóa học',
        detail: `${reports?.training.totalAssignments ?? 0} lượt phân công, ${underway} đang học, ${approved} hoàn thành.`,
      },
      {
        step: '4',
        title: 'Đánh giá kết thúc khóa',
        detail: `${submissions} bài thi với tỷ lệ đạt ${reports?.assessment.passRate ?? 0}%.`,
      },
      {
        step: '5',
        title: 'Cập nhật năng lực',
        detail:
          'Điểm năng lực cá nhân được cập nhật sau khi Manager xác nhận kết quả.',
      },
      {
        step: '6',
        title: 'Chu kỳ tiếp theo',
        detail:
          'Khoảng cách mới được tính từ mục tiêu vị trí, gợi ý khóa tiếp theo.',
      },
    ];
  }, [hasCycles, dashboard, reports, underway, approved, submissions]);

  if (isLoading) {
    return (
      <div
        className="po-owner -m-4 md:-m-6 min-h-screen flex items-center justify-center"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <p className="text-sm" style={{ color: 'var(--po-muted)' }}>
          Đang tải báo cáo chu kỳ…
        </p>
      </div>
    );
  }

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
      }}
    >
      {/* ── Report cover (hero) ── */}
      <section
        className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8"
        style={{
          padding: '36px',
          background: 'linear-gradient(115deg, #173d49, #275967)',
          color: '#fff',
          boxShadow: '0 20px 42px rgba(29,48,102,.11)',
        }}
      >
        <div>
          <span
            className="text-[10px] font-black uppercase tracking-[0.14em]"
            style={{ color: '#ffc4a7' }}
          >
            Báo cáo chu kỳ học tập
          </span>
          <h1
            className="mt-2 font-bold leading-[1.05]"
            style={{
              fontSize: 'clamp(28px, 3.8vw, 46px)',
              letterSpacing: '-0.05em',
            }}
          >
            Báo cáo Chu kỳ Đào tạo & Năng lực
          </h1>
          <p
            className="mt-2 text-[13px] leading-relaxed"
            style={{ color: '#dbe3ff', maxWidth: 520 }}
          >
            {hasCycles
              ? `${learners} học viên · ${approved + underway} khóa trong phạm vi · Tỷ lệ hoàn thành ${completionRate}%.`
              : 'Theo dõi tiến trình và tăng trưởng năng lực số theo từng chu kỳ đào tạo.'}
          </p>
        </div>

        {hasCycles && (
          <div
            className="text-right"
            style={{
              fontSize: 60,
              fontWeight: 900,
              letterSpacing: '-0.08em',
              color: '#ffc1a6',
              lineHeight: 1,
            }}
          >
            {completionRate}%
          </div>
        )}
      </section>

      {/* ── Content ── */}
      <div className="px-4 md:px-6 py-6 mx-auto" style={{ maxWidth: 1220 }}>
        {!hasCycles ? (
          /* ── Empty state ── */
          <div
            className="mx-auto mt-8 text-center"
            style={{ maxWidth: 480 }}
          >
            <div
              className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl text-2xl"
              style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}
            >
              <BarChart3 className="size-7" />
            </div>
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.04em' }}
            >
              Báo cáo chu kỳ đầu tiên đang hình thành.
            </h2>
            <p
              className="mt-2 text-xs leading-relaxed"
              style={{ color: 'var(--po-muted)' }}
            >
              Hoàn thành quy trình đánh giá năng lực → phân công khóa học →
              Manager xác nhận kết quả. Dữ liệu sẽ tự động hiển thị.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/enterprise/skill-gap"
                className="inline-flex items-center gap-2 rounded-[11px] px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  background: 'var(--po-accent)',
                  color: '#fff',
                  boxShadow: '0 9px 18px rgba(19,123,132,.17)',
                }}
              >
                <BarChart3 className="size-4" /> Xem khoảng cách
              </Link>
              <Link
                to="/enterprise/courses"
                className="inline-flex items-center gap-2 rounded-[11px] border px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--po-line)',
                  color: 'var(--po-ink)',
                }}
              >
                <BookOpen className="size-4" /> Danh mục khóa học
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── KPI metrics ── */}
            <ReportKpiSummary
              approved={approved}
              learners={learners}
              submissions={submissions}
              underway={underway}
            />

            {/* ── Domain breakdown ── */}
            <div className="mt-4">
              <ReportDomainBreakdown
                domains={domains}
                isLoading={dashLoading}
              />
            </div>

            {/* ── Cohort table ── */}
            {reports?.training.courses &&
              reports.training.courses.length > 0 && (
                <section
                  className="mt-4 rounded-[22px] border p-6"
                  style={{
                    borderColor: 'var(--po-line)',
                    background: 'var(--po-surface)',
                    boxShadow: '0 10px 35px rgba(29,48,102,.025)',
                  }}
                >
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.12em]"
                    style={{ color: 'var(--po-accent)' }}
                  >
                    Tổng hợp khóa học
                  </span>
                  <h2
                    className="mt-2 text-xl font-semibold"
                    style={{
                      color: 'var(--po-ink)',
                      letterSpacing: '-0.045em',
                    }}
                  >
                    Tất cả khóa trong chu kỳ hiện tại.
                  </h2>

                  <div className="mt-4 overflow-x-auto">
                    <table
                      className="w-full text-xs"
                      style={{ borderCollapse: 'separate', borderSpacing: 0 }}
                    >
                      <thead>
                        <tr
                          className="text-left text-[10px] uppercase tracking-wider"
                          style={{ color: 'var(--po-muted)' }}
                        >
                          <th className="pb-2 pr-4 font-bold">Mã</th>
                          <th className="pb-2 pr-4 font-bold">Khóa học</th>
                          <th className="pb-2 pr-4 font-bold">Miền</th>
                          <th className="pb-2 pr-4 font-bold text-right">
                            Học viên
                          </th>
                          <th className="pb-2 font-bold text-right">
                            Tiến độ TB
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.training.courses.map((c) => (
                          <tr
                            key={c.id}
                            className="border-t"
                            style={{ borderColor: 'var(--po-line)' }}
                          >
                            <td
                              className="py-2.5 pr-4 font-mono font-bold"
                              style={{ color: 'var(--po-accent)' }}
                            >
                              {c.code}
                            </td>
                            <td
                              className="py-2.5 pr-4"
                              style={{ color: 'var(--po-ink)' }}
                            >
                              {c.title}
                            </td>
                            <td
                              className="py-2.5 pr-4"
                              style={{ color: 'var(--po-muted)' }}
                            >
                              {c.domainName}
                            </td>
                            <td
                              className="py-2.5 pr-4 text-right tabular-nums font-bold"
                              style={{ color: 'var(--po-ink)' }}
                            >
                              {c.learnerCount}
                            </td>
                            <td
                              className="py-2.5 text-right tabular-nums font-bold"
                              style={{
                                color:
                                  c.averageProgress >= 80
                                    ? '#16a34a'
                                    : c.averageProgress >= 40
                                      ? '#ca8a04'
                                      : 'var(--po-coral)',
                              }}
                            >
                              {c.averageProgress}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

            {/* ── Grid-2: Timeline + Growth narrative ── */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CycleTimeline events={events} />

              {/* Growth narrative */}
              <section
                className="rounded-[22px] border p-6"
                style={{
                  borderColor: 'var(--po-line)',
                  background: 'var(--po-surface)',
                  boxShadow: '0 10px 35px rgba(29,48,102,.025)',
                }}
              >
                <span
                  className="text-[10px] font-black uppercase tracking-[0.12em]"
                  style={{ color: 'var(--po-accent)' }}
                >
                  Bước tiếp theo
                </span>
                <h2
                  className="mt-2 text-xl font-semibold"
                  style={{
                    color: 'var(--po-ink)',
                    letterSpacing: '-0.045em',
                  }}
                >
                  Khóa học tiếp theo sẽ nối tiếp câu chuyện này.
                </h2>
                <p
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: 'var(--po-muted)' }}
                >
                  Mỗi khoảng cách năng lực đã thu hẹp mở ra những yêu cầu
                  tiếp theo. Hệ thống gợi ý dựa trên mức yêu cầu của vị
                  trí, mức hiện tại và lịch sử hoàn thành.
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link
                    to="/enterprise/skill-gap"
                    className="inline-flex items-center gap-2 rounded-[11px] px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                    style={{
                      background: 'var(--po-accent)',
                      color: '#fff',
                      boxShadow: '0 9px 18px rgba(19,123,132,.17)',
                    }}
                  >
                    Xem khoảng cách <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    to="/enterprise/courses"
                    className="inline-flex items-center gap-2 rounded-[11px] border px-4 py-3 text-[13px] font-bold transition-transform hover:-translate-y-0.5"
                    style={{
                      borderColor: 'var(--po-line)',
                      color: 'var(--po-ink)',
                    }}
                  >
                    Danh mục khóa học <ArrowRight className="size-4" />
                  </Link>
                </div>

                <p
                  className="mt-5 text-[11px] leading-relaxed"
                  style={{ color: '#789' }}
                >
                  Dữ liệu báo cáo phản ánh trạng thái tại thời điểm truy
                  xuất. Hoàn thành khóa học không tự động thay đổi đánh giá
                  năng lực cơ sở — Manager phải xác nhận kết quả.
                </p>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
