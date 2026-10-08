import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Users,
  GraduationCap,
  ClipboardCheck,
  Award,
} from 'lucide-react';
import { PageContainer, PageHeader, ScoreCard } from '@/components/shared';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { useCapabilityDashboard } from '@/hooks/use-analytics';
import { CompetencyRadarChart } from '@/features/intelligence/components/CompetencyRadarChart';
import { formatDate, formatDateTime } from '@/lib/utils';
import { auditActionLabel, SYSTEM_ACTOR } from '@/features/members/member-labels';

/**
 * OW-01: Organization Dashboard (UI/UX spec v2.1 §3.2, §10).
 * Redesigned with Enterprise "Mực & Giấy" theme tokens.
 */
export function OrganizationOverviewPage() {
  const { data: orgData, isLoading: orgLoading, isError: orgError } = useOrganizationOverview();
  const { data: capData, isLoading: capLoading } = useCapabilityDashboard();

  if (orgLoading || capLoading) {
    return (
      <PageContainer width="wide">
        <p className="text-sm text-ent-fg-3 py-8">Đang tải bảng điều khiển tổ chức…</p>
      </PageContainer>
    );
  }

  if (orgError || !orgData) {
    return (
      <PageContainer width="wide">
        <p role="alert" className="text-sm text-ent-bad py-8">
          Không tải được thông tin bảng điều khiển tổ chức.
        </p>
      </PageContainer>
    );
  }

  const seatsFull = orgData.seats.limit !== null && orgData.seats.used >= orgData.seats.limit;
  const kpis = capData?.kpis;
  const radarItems = capData?.domains.map((d) => ({
    competencyName: d.name,
    requiredLevel: d.averageRequired,
    currentLevel: d.averageCurrent,
  })) ?? [];

  return (
    <PageContainer width="wide" className="space-y-6">
      <div className="space-y-1">
        <PageHeader
          title="Tổng quan tổ chức"
          description={`${orgData.name} · Bảng điều khiển nhân lực và năng lực số`}
        />
        <p className="font-landing-serif italic text-sm text-ent-fg-3 -mt-4">
          Chào mừng trở lại, theo dõi tiến độ nâng cao năng lực số của tổ chức hôm nay.
        </p>
      </div>

      {!orgData.setupCompleted && (
        <div
          role="status"
          className="flex items-center justify-between rounded-lg border border-[var(--ent-warn)] bg-[var(--ent-warn-soft)] px-4 py-3 text-sm text-ent-warn"
        >
          <span>Việc thiết lập tổ chức chưa hoàn tất. Vui lòng hoàn thành các bước để hệ thống vận hành tối ưu.</span>
          <Link to="/setup" className="font-semibold underline hover:opacity-90">
            Tiếp tục thiết lập &rarr;
          </Link>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        <ScoreCard
          label="Thành viên hoạt động"
          value={orgData.members.active}
          subtitle={`${orgData.members.inactive} vô hiệu · ${orgData.members.pending} chờ kích hoạt`}
        />
        <ScoreCard
          label="Người dùng đã kích hoạt"
          value={orgData.seats.limit === null ? `${orgData.seats.used} người dùng` : `${orgData.seats.used} / ${orgData.seats.limit} người dùng`}
          variant={seatsFull ? 'danger' : 'default'}
          subtitle={seatsFull ? 'Đã hết hạn mức: cần nâng gói' : 'Theo gói đăng ký'}
        />
        <ScoreCard
          label="Tỷ lệ đáp ứng năng lực"
          value={kpis ? `${kpis.averageCoverage.toFixed(1)}%` : '—'}
          variant={kpis && kpis.averageCoverage >= 80 ? 'success' : kpis && kpis.averageCoverage >= 50 ? 'warning' : 'danger'}
          subtitle="Trung bình toàn tổ chức"
        />
        <ScoreCard
          label="Đợt đào tạo đang chạy"
          value={orgData.runningBatches ?? 0}
          subtitle="Theo dõi tiến độ học tập"
        />
        <ScoreCard
          label="Minh chứng chờ duyệt"
          value={orgData.pendingReviews ?? 0}
          variant={(orgData.pendingReviews ?? 0) > 0 ? 'warning' : 'success'}
          subtitle="Nhiệm vụ thực tế đã nộp"
        />
        <ScoreCard
          label="Gói dịch vụ"
          value={orgData.plan?.name ?? '—'}
          subtitle={orgData.plan?.renewsAt ? `Gia hạn ${formatDate(orgData.plan.renewsAt)}` : 'Đang hoạt động'}
        />
      </div>

      {/* ── Main Grid 1: Org Structure & 6 Competency Domains ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cơ cấu nhân sự theo tổ chức */}
        <section aria-labelledby="org-structure-title" className="rounded-lg border border-ent-line bg-ent-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 id="org-structure-title" className="text-base font-semibold text-ent-fg">
                Cơ cấu nhân sự theo tổ chức
              </h2>
              <p className="text-xs text-ent-fg-3">Phòng ban và các vị trí công việc chuẩn hóa</p>
            </div>
            <Link
              to="/enterprise/positions"
              className="text-xs font-medium text-ent-accent hover:underline"
            >
              Danh mục vị trí &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-ent-line bg-ent-raised p-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ent-fg font-medium">Nhân sự chính thức đang hoạt động</span>
                <span className="font-bold text-ent-accent tabular-nums">{orgData.members.active} thành viên</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ent-fg font-medium">Lời mời đang chờ kích hoạt</span>
                <span className="font-semibold text-ent-fg-3 tabular-nums">{orgData.members.pending} tài khoản</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ent-fg font-medium">Hạn mức tài khoản theo gói</span>
                <span className="font-semibold text-ent-fg tabular-nums">{orgData.seats.limit ? `${orgData.seats.limit} người dùng` : 'Không giới hạn'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-ent-line pt-3 text-xs text-ent-fg-3 flex justify-between items-center">
            <span>Tiêu chuẩn năng lực áp dụng trực tiếp theo từng vị trí công việc.</span>
            <Link to="/enterprise/requirements" className="font-medium text-ent-accent hover:underline">
              Yêu cầu vị trí &rarr;
            </Link>
          </div>
        </section>

        {/* 6 Miền năng lực TT02 */}
        <section aria-labelledby="radar-title" className="rounded-lg border border-ent-line bg-ent-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 id="radar-title" className="text-base font-semibold text-ent-fg">
                Năng lực số theo 6 miền TT02
              </h2>
              <p className="text-xs text-ent-fg-3">So sánh Trình độ năng lực yêu cầu vs Trình độ hiện tại</p>
            </div>
            <Link to="/enterprise/framework" className="text-xs font-medium text-ent-accent hover:underline">
              Khung TT02 &rarr;
            </Link>
          </div>

          {radarItems.length > 0 ? (
            <CompetencyRadarChart
              items={radarItems}
              requiredLabel="Trình độ yêu cầu trung bình"
              confirmedLabel="Trình độ đang đạt trung bình"
              height={260}
            />
          ) : (
            <p className="py-8 text-center text-sm text-ent-fg-3">Chưa có dữ liệu miền năng lực.</p>
          )}
        </section>
      </div>

      {/* ── Main Grid 2: Nhân sự cần chú ý & Mức sẵn sàng ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nhân sự có khoảng trống mức cao */}
        <section aria-labelledby="risk-title" className="rounded-lg border border-ent-line bg-ent-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 id="risk-title" className="text-base font-semibold text-ent-fg">
                Nhân sự cần chú ý (Khoảng trống mức cao)
              </h2>
              <p className="text-xs text-ent-fg-3">Ưu tiên bổ sung đào tạo hoặc giao nhiệm vụ thực tế</p>
            </div>
            <Link to="/enterprise/skill-gap" className="text-xs font-medium text-ent-accent hover:underline">
              Phân tích khoảng trống &rarr;
            </Link>
          </div>

          {!capData?.atRisk || capData.atRisk.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="size-8 text-ent-ok mb-2" />
              <p className="text-sm font-medium text-ent-fg">Không có nhân viên nào có khoảng trống mức cao.</p>
              <p className="text-xs text-ent-fg-3">Tất cả nhân sự đều đang đáp ứng tốt yêu cầu vị trí.</p>
            </div>
          ) : (
            <ol className="divide-y divide-ent-line">
              {capData.atRisk.slice(0, 4).map((person) => (
                <li key={person.employeeId} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <Link
                      to={`/enterprise/members/${person.employeeId}`}
                      className="font-medium text-ent-fg hover:underline"
                    >
                      {person.name}
                    </Link>
                    <p className="text-xs text-ent-fg-3 truncate">{person.departmentName}</p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <span className="font-semibold text-ent-bad block">{person.highCount} khoảng trống cao</span>
                    <span className="text-ent-fg-3 tabular-nums">đáp ứng {person.coveragePercent.toFixed(1)}%</span>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-4 flex flex-wrap gap-3 border-t border-ent-line pt-3 text-xs">
            <Link to="/enterprise/training-batches" className="font-medium text-ent-accent hover:underline">
              Đợt đào tạo
            </Link>
            <span className="text-ent-fg-3">·</span>
            <Link to="/enterprise/tasks" className="font-medium text-ent-accent hover:underline">
              Nhiệm vụ thực tế
            </Link>
            <span className="text-ent-fg-3">·</span>
            <Link to="/enterprise/reviews" className="font-medium text-ent-accent hover:underline">
              Duyệt minh chứng
            </Link>
          </div>
        </section>

        {/* Mức sẵn sàng thiết lập */}
        <section aria-labelledby="setup-title" className="rounded-lg border border-ent-line bg-ent-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="setup-title" className="text-base font-semibold text-ent-fg">
              Mức sẵn sàng thiết lập tổ chức
            </h2>
            <span className="text-xs text-ent-fg-3 tabular-nums">
              {orgData.setup.filter((s) => s.done).length} / {orgData.setup.length} hoàn thành
            </span>
          </div>
          <ul className="divide-y divide-ent-line">
            {orgData.setup.map((item) => (
              <li key={item.key} className="flex items-start gap-3 py-2.5">
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ent-ok" aria-label="Đã xong" />
                ) : (
                  <Circle className="mt-0.5 size-5 shrink-0 text-ent-fg-3" aria-label="Chưa xong" />
                )}
                <div className="min-w-0 flex-1">
                  <Link to={item.path} className="text-sm font-medium text-ent-fg hover:underline">
                    {item.label}
                  </Link>
                  <p className="text-xs text-ent-fg-3">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Quick Actions Bar ── */}
      <section className="rounded-lg border border-ent-line bg-ent-raised p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ent-fg-3 mb-3">
          Lối tắt tác vụ chính
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            to="/enterprise/members"
            className="flex items-center gap-2.5 rounded-lg border border-ent-line bg-ent-card px-3.5 py-2.5 text-sm font-medium text-ent-fg hover:bg-ent-raised transition-colors"
          >
            <Users className="size-4 text-ent-accent" />
            <span>Thành viên</span>
          </Link>
          <Link
            to="/enterprise/competency-profiles"
            className="flex items-center gap-2.5 rounded-lg border border-ent-line bg-ent-card px-3.5 py-2.5 text-sm font-medium text-ent-fg hover:bg-ent-raised transition-colors"
          >
            <Award className="size-4 text-[var(--ent-level-2)]" />
            <span>Ma trận năng lực</span>
          </Link>
          <Link
            to="/enterprise/training-batches"
            className="flex items-center gap-2.5 rounded-lg border border-ent-line bg-ent-card px-3.5 py-2.5 text-sm font-medium text-ent-fg hover:bg-ent-raised transition-colors"
          >
            <GraduationCap className="size-4 text-ent-accent" />
            <span>Đợt đào tạo</span>
          </Link>
          <Link
            to="/enterprise/tasks"
            className="flex items-center gap-2.5 rounded-lg border border-ent-line bg-ent-card px-3.5 py-2.5 text-sm font-medium text-ent-fg hover:bg-ent-raised transition-colors"
          >
            <ClipboardCheck className="size-4 text-ent-warn" />
            <span>Nhiệm vụ thực tế</span>
          </Link>
        </div>
      </section>

      {/* ── Hoạt động gần đây ── */}
      <section aria-labelledby="activity-title" className="rounded-lg border border-ent-line bg-ent-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="activity-title" className="text-base font-semibold text-ent-fg">
            Hoạt động gần đây
          </h2>
          <Link to="/enterprise/settings/audit-log" className="text-xs font-medium text-ent-accent hover:underline">
            Xem nhật ký kiểm toán &rarr;
          </Link>
        </div>
        {orgData.recentActivity.length === 0 ? (
          <p className="text-sm text-ent-fg-3">Chưa có hoạt động nào được ghi lại.</p>
        ) : (
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orgData.recentActivity.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-ent-line bg-ent-raised p-3 text-sm">
                <p className="font-medium text-ent-fg">
                  {auditActionLabel(entry.action)}: {entry.targetLabel}
                </p>
                <p className="text-xs text-ent-fg-3 mt-1">
                  {entry.actorName ?? SYSTEM_ACTOR} · {formatDateTime(entry.at)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </PageContainer>
  );
}
