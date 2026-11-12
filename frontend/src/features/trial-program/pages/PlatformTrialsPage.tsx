import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useAssignMentor,
  useCreateMentor,
  useMentors,
  usePlatformTrials,
} from '@/hooks/use-trial-program';
import type { MentorItem, PlatformTrialItem, TrialStage } from '@/services/trial-program.service';
import { LoadError, Loading } from '@/features/platform/components/pulse-ui';
import { errorMessage, initials } from '@/features/platform/components/pulse-format';
import { PlatformDrawer } from '@/features/platform/components/PlatformDrawer';
import { StageBadge } from '../components/TrialUi';
import { formatWhen } from '../lib/trial-format';
import {
  Building2,
  FlaskConical,
  CheckCircle2,
  Clock,
  Users,
  Search,
  X,
  ExternalLink,
  Eye,
  UserPlus,
  RefreshCw,
  Calendar,
  Mail,
  User,
  FileText,
} from 'lucide-react';
import '../trial-program.css';

type TabKey = TrialStage | 'ALL';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'REQUESTED', label: 'Chờ phân công' },
  { key: 'ASSIGNED', label: 'Đang chấm thi' },
  { key: 'REPORTED', label: 'Đã có kết quả' },
  { key: 'SETUP', label: 'Đang thiết lập' },
];

function getSlaStatus(trial: PlatformTrialItem) {
  if (trial.stage === 'REPORTED') {
    return { label: 'Đã hoàn tất', tone: 'ok' as const };
  }
  const now = Date.now();
  if (trial.testDeadline) {
    const deadline = new Date(trial.testDeadline).getTime();
    if (!Number.isNaN(deadline) && deadline < now) {
      return { label: 'Quá hạn nộp bài', tone: 'bad' as const };
    }
  }
  if (trial.preferredReviewAt) {
    const pref = new Date(trial.preferredReviewAt).getTime();
    if (!Number.isNaN(pref)) {
      if (pref < now) {
        return { label: 'Quá hạn mong muốn', tone: 'bad' as const };
      }
      if (pref - now <= 48 * 3600 * 1000) {
        return { label: 'Gấp trong 48 giờ', tone: 'warn' as const };
      }
    }
  }
  return { label: 'Đúng hạn', tone: 'neutral' as const };
}

/**
 * PA-14: Quản trị Đánh giá Dùng thử Doanh nghiệp
 * Tiếp nhận yêu cầu chấm bài, phân công Mentor, quản trị tiến độ và đội ngũ Mentor.
 */
export function PlatformTrialsPage() {
  const trials = usePlatformTrials();
  const mentors = useMentors();

  const [tab, setTab] = useState<TabKey>('ALL');
  const [search, setSearch] = useState('');
  const [mentorFilter, setMentorFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState<'ALL' | 'URGENT'>('ALL');
  const [selectedTrial, setSelectedTrial] = useState<PlatformTrialItem | null>(null);
  const [createMentorOpen, setCreateMentorOpen] = useState(false);

  const trialsList = useMemo(() => trials.data ?? [], [trials.data]);
  const mentorsList = useMemo(() => mentors.data ?? [], [mentors.data]);

  // KPI Calculations
  const requestedCount = useMemo(() => trialsList.filter((t) => t.stage === 'REQUESTED').length, [trialsList]);
  const assignedCount = useMemo(() => trialsList.filter((t) => t.stage === 'ASSIGNED').length, [trialsList]);
  const reportedCount = useMemo(() => trialsList.filter((t) => t.stage === 'REPORTED').length, [trialsList]);
  const setupCount = useMemo(() => trialsList.filter((t) => t.stage === 'SETUP').length, [trialsList]);

  const activeMentors = useMemo(() => mentorsList.filter((m) => m.status === 'ACTIVE'), [mentorsList]);
  const totalActiveTrials = useMemo(
    () => mentorsList.reduce((acc, m) => acc + (m.activeTrials || 0), 0),
    [mentorsList],
  );
  const avgLoad = useMemo(() => {
    if (activeMentors.length === 0) return 0;
    return (totalActiveTrials / activeMentors.length).toFixed(1);
  }, [activeMentors, totalActiveTrials]);

  const totalEvaluatingSubs = useMemo(() => {
    return trialsList
      .filter((t) => t.stage === 'ASSIGNED')
      .reduce((sum, t) => sum + (t.submitted || 0), 0);
  }, [trialsList]);

  // Tab count lookup
  const countForTab = (k: TabKey) => {
    if (k === 'ALL') return trialsList.length;
    if (k === 'REQUESTED') return requestedCount;
    if (k === 'ASSIGNED') return assignedCount;
    if (k === 'REPORTED') return reportedCount;
    if (k === 'SETUP') return setupCount;
    return 0;
  };

  // Filtered Trials List
  const filteredItems = useMemo(() => {
    let result = trialsList;

    // Filter by Stage Tab
    if (tab !== 'ALL') {
      result = result.filter((t) => t.stage === tab);
    }

    // Filter by Mentor
    if (mentorFilter) {
      result = result.filter((t) => t.mentorUserId === mentorFilter);
    }

    // Filter by SLA
    if (slaFilter === 'URGENT') {
      result = result.filter((t) => {
        const sla = getSlaStatus(t);
        return sla.tone === 'bad' || sla.tone === 'warn';
      });
    }

    // Filter by Search Query
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.organizationName.toLowerCase().includes(q) ||
          t.ownerName.toLowerCase().includes(q) ||
          t.ownerEmail.toLowerCase().includes(q) ||
          (t.mentorName && t.mentorName.toLowerCase().includes(q)) ||
          (t.requestNote && t.requestNote.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [trialsList, tab, mentorFilter, slaFilter, search]);

  const refetchAll = () => {
    void trials.refetch();
    void mentors.refetch();
    toast.success('Đã cập nhật dữ liệu mới nhất');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-bold text-amber-700 tracking-wider uppercase flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
            Quản trị nền tảng / Đánh giá dùng thử
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
            Yêu cầu thẩm định & Đánh giá dùng thử doanh nghiệp
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-0">
            Tiếp nhận yêu cầu thẩm định năng lực số, phân công Mentor và giám sát tiến độ công bố báo cáo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={refetchAll}
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={14} className={trials.isFetching ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-small inline-flex items-center gap-1.5"
            onClick={() => setCreateMentorOpen(true)}
          >
            <UserPlus size={14} />
            <span>Thêm Mentor</span>
          </button>
        </div>
      </div>

      {trials.isLoading && <Loading />}
      {trials.error && <LoadError error={trials.error} />}

      {/* Row 1: Executive KPI Bento Grid */}
      <div className="pa-bento-kpi-grid">
        {/* Card 1: Tổng doanh nghiệp */}
        <div className="pa-bento-card">
          <div>
            <div className="pa-bento-kpi-head">
              <div className="pa-kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <Building2 size={17} />
              </div>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                Chương trình
              </span>
            </div>
            <div className="pa-bento-kpi-title">Tổng doanh nghiệp dùng thử</div>
            <div className="pa-bento-kpi-val">{trialsList.length}</div>
          </div>
          <div className="pa-bento-kpi-sub">
            {reportedCount} đã có báo cáo · {assignedCount + requestedCount} đang hoạt động
          </div>
        </div>

        {/* Card 2: Chờ phân công Mentor */}
        <div className={`pa-bento-card ${requestedCount > 0 ? 'anchor-card' : ''}`}>
          <div>
            <div className="pa-bento-kpi-head">
              <div className="pa-kpi-icon-wrap amber">
                <Clock size={17} />
              </div>
              {requestedCount > 0 ? (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                  Cần xử lý
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">Đã sạch hàng chờ</span>
              )}
            </div>
            <div className="pa-bento-kpi-title">Chờ phân công Mentor</div>
            <div className="pa-bento-kpi-val text-amber-700">{requestedCount}</div>
          </div>
          <div className="pa-bento-kpi-sub">
            {requestedCount > 0 ? 'Yêu cầu chờ chỉ định chuyên gia chấm thi' : 'Không có yêu cầu nào tồn đọng'}
          </div>
        </div>

        {/* Card 3: Đang chấm thi */}
        <div className="pa-bento-card draft-card">
          <div>
            <div className="pa-bento-kpi-head">
              <div className="pa-kpi-icon-wrap sky">
                <FlaskConical size={17} />
              </div>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                Đang thẩm định
              </span>
            </div>
            <div className="pa-bento-kpi-title">Đang trong tiến trình chấm</div>
            <div className="pa-bento-kpi-val text-sky-800">{assignedCount}</div>
          </div>
          <div className="pa-bento-kpi-sub">
            {totalEvaluatingSubs} bài thi nhân viên đang được thẩm định
          </div>
        </div>

        {/* Card 4: Đã có kết quả */}
        <div className="pa-bento-card">
          <div>
            <div className="pa-bento-kpi-head">
              <div className="pa-kpi-icon-wrap" style={{ background: '#dcfce7', color: '#15803d' }}>
                <CheckCircle2 size={17} />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Sẵn sàng tư vấn
              </span>
            </div>
            <div className="pa-bento-kpi-title">Đã công bố báo cáo</div>
            <div className="pa-bento-kpi-val text-emerald-700">{reportedCount}</div>
          </div>
          <div className="pa-bento-kpi-sub">
            Đã sẵn sàng chuyển đổi sang các gói đào tạo chính thức
          </div>
        </div>

        {/* Card 5: Đội ngũ Mentor */}
        <div className="pa-bento-card">
          <div>
            <div className="pa-bento-kpi-head">
              <div className="pa-kpi-icon-wrap" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                <Users size={17} />
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {activeMentors.length} hoạt động
              </span>
            </div>
            <div className="pa-bento-kpi-title">Đội ngũ Mentor chuyên gia</div>
            <div className="pa-bento-kpi-val text-purple-800">{mentorsList.length}</div>
          </div>
          <div className="pa-bento-kpi-sub">
            Tải trung bình: {avgLoad} bài/mentor · {totalActiveTrials} bài đang chấm
          </div>
        </div>
      </div>

      {/* Main Section: Search, Filters & Trials Table */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        {/* Controls: Search, Tabs & Secondary Filters */}
        <div className="flex flex-col gap-4 pb-4 border-b border-slate-100">
          {/* Top row: Tabs & Search Input */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl overflow-x-auto">
              {TABS.map((t) => {
                const isActive = tab === t.key;
                const c = countForTab(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${isActive
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive
                          ? t.key === 'REQUESTED' && c > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                          : 'bg-slate-200/80 text-slate-600'
                        }`}
                    >
                      {c}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search Box */}
            <div className="relative min-w-[280px] lg:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tổ chức, người đại diện, email..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Bottom row: Sub-filters & Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Mentor Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-700">Mentor:</span>
                <select
                  value={mentorFilter}
                  onChange={(e) => setMentorFilter(e.target.value)}
                  className="py-1 px-2.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Tất cả Mentor</option>
                  {mentorsList.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName} ({m.activeTrials} bài)
                    </option>
                  ))}
                </select>
              </div>

              {/* SLA Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-700">Tiến độ:</span>
                <select
                  value={slaFilter}
                  onChange={(e) => setSlaFilter(e.target.value as 'ALL' | 'URGENT')}
                  className="py-1 px-2.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">Tất cả tiến độ</option>
                  <option value="URGENT">Chỉ xem yêu cầu cần gấp hoặc quá hạn</option>
                </select>
              </div>

              {(search || mentorFilter || slaFilter !== 'ALL' || tab !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setMentorFilter('');
                    setSlaFilter('ALL');
                    setTab('ALL');
                  }}
                  className="text-amber-700 hover:text-amber-900 font-semibold underline underline-offset-2 ml-1"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>

            <div className="font-medium">
              Hiển thị <strong>{filteredItems.length}</strong> / {trialsList.length} doanh nghiệp
            </div>
          </div>
        </div>

        {/* Trials Data Table */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <FlaskConical size={36} className="mx-auto mb-2 text-slate-300 opacity-60" />
            <p className="font-medium text-slate-600 m-0">Không tìm thấy yêu cầu dùng thử phù hợp với tiêu chí lọc.</p>
            <p className="text-slate-400 mt-1 mb-0">Thử thay đổi từ khóa tìm kiếm hoặc chọn tab trạng thái khác.</p>
          </div>
        ) : (
          <div className="table-scroll mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Doanh nghiệp & Đại diện</th>
                  <th style={{ width: '18%' }}>Tiến độ nộp bài</th>
                  <th style={{ width: '18%' }}>Thời hạn & Mong muốn</th>
                  <th style={{ width: '18%' }}>Mentor phụ trách</th>
                  <th style={{ width: '10%' }}>Trạng thái</th>
                  <th style={{ width: '8%' }} className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((t) => {
                  const sla = getSlaStatus(t);
                  const pct = Math.min(100, Math.round((t.submitted / Math.max(1, t.participants)) * 100));

                  return (
                    <tr key={t.organizationId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Doanh nghiệp & Đại diện */}
                      <td>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-800 font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {initials(t.organizationName)}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <Link
                              to={`/platform/organizations/${t.organizationId}`}
                              className="font-bold text-slate-900 hover:text-amber-700 transition-colors text-xs truncate max-w-[240px]"
                              title={t.organizationName}
                            >
                              {t.organizationName}
                            </Link>
                            <span className="text-[11px] text-slate-500 truncate max-w-[240px]">
                              {t.ownerName} · {t.ownerEmail}
                            </span>
                            {t.requestNote && (
                              <span
                                className="inline-block mt-1 text-[11px] text-slate-600 bg-slate-100/90 border border-slate-200/60 rounded px-2 py-0.5 italic line-clamp-1 max-w-[260px]"
                                title={t.requestNote}
                              >
                                &ldquo;{t.requestNote}&rdquo;
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tiến độ nộp bài */}
                      <td>
                        <div className="flex flex-col gap-1.5 pr-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                              {t.submitted} / {t.participants} nhân viên
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            {t.reviewed > 0 ? (
                              <span className="text-emerald-700 font-medium">Đã chấm: {t.reviewed} bài</span>
                            ) : (
                              <span className="text-slate-400">Chưa chấm điểm</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Thời hạn & Mong muốn */}
                      <td>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Calendar size={13} className="text-slate-400 shrink-0" />
                            <span>Hạn làm: {formatWhen(t.testDeadline)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Clock size={13} className="text-slate-400 shrink-0" />
                            <span>Mong muốn: {formatWhen(t.preferredReviewAt)}</span>
                          </div>
                          <div className="pt-0.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${sla.tone === 'bad'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : sla.tone === 'warn'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : sla.tone === 'ok'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                              {sla.label}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mentor phụ trách */}
                      <td>
                        <MentorCell trial={t} mentors={mentorsList} />
                      </td>

                      {/* Trạng thái */}
                      <td>
                        <span className="tp-vars">
                          <StageBadge stage={t.stage} />
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            onClick={() => setSelectedTrial(t)}
                            title="Xem chi tiết yêu cầu"
                          >
                            <Eye size={15} />
                          </button>
                          <Link
                            to={`/platform/organizations/${t.organizationId}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Đến hồ sơ tổ chức"
                          >
                            <ExternalLink size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Row 3: Dedicated Mentors Management Box */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 m-0">Đội ngũ Mentor chuyên gia thẩm định</h2>
              <span className="text-xs text-slate-500">
                {activeMentors.length} chuyên gia sẵn sàng tiếp nhận và chấm bài thi tự luận
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={() => setCreateMentorOpen(true)}
          >
            <UserPlus size={14} />
            <span>+ Thêm Mentor</span>
          </button>
        </div>

        {mentors.isLoading && <Loading />}
        {mentorsList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">Chưa có tài khoản Mentor nào trong hệ thống.</div>
        ) : (
          <div className="table-scroll mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Chuyên gia Mentor</th>
                  <th className="num">Bài đang chấm</th>
                  <th>Trạng thái</th>
                  <th>Ngày gia nhập</th>
                </tr>
              </thead>
              <tbody>
                {mentorsList.map((m) => (
                  <tr key={m.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {initials(m.fullName)}
                        </div>
                        <div>
                          <strong className="block text-xs font-semibold text-slate-900">{m.fullName}</strong>
                          <span className="text-[11px] text-slate-500">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="num">
                      <span className="inline-flex items-center justify-center font-bold text-xs text-purple-800 bg-purple-50 border border-purple-200/80 rounded-full px-2.5 py-0.5">
                        {m.activeTrials} bài
                      </span>
                    </td>
                    <td>
                      {m.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500">{formatWhen(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Slide-over Drawer: Trial Detail View */}
      {selectedTrial && (
        <PlatformDrawer
          isOpen={Boolean(selectedTrial)}
          onClose={() => setSelectedTrial(null)}
          title={selectedTrial.organizationName}
          icon={FlaskConical}
          badge={<StageBadge stage={selectedTrial.stage} />}
          subtitle={`Chủ doanh nghiệp: ${selectedTrial.ownerName}`}
          width={580}
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => setSelectedTrial(null)}
              >
                Đóng
              </button>
              <Link
                to={`/platform/organizations/${selectedTrial.organizationId}`}
                className="btn btn-primary btn-small inline-flex items-center gap-1"
              >
                <span>Hồ sơ tổ chức 360</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          }
        >
          <div className="flex flex-col gap-5 text-xs text-slate-700">
            {/* Contact Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="font-semibold text-slate-900">{selectedTrial.ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <span className="text-slate-600">{selectedTrial.ownerEmail}</span>
              </div>
            </div>

            {/* Request Note */}
            {selectedTrial.requestNote && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col gap-1.5">
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={13} />
                  Ghi chú từ Doanh nghiệp
                </div>
                <p className="m-0 text-slate-700 italic leading-relaxed">
                  &ldquo;{selectedTrial.requestNote}&rdquo;
                </p>
              </div>
            )}

            {/* Test Progress & Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                <span className="block text-[11px] text-slate-500 mb-0.5">Người tham gia</span>
                <strong className="text-lg font-extrabold text-slate-900">{selectedTrial.participants}</strong>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                <span className="block text-[11px] text-slate-500 mb-0.5">Đã nộp bài</span>
                <strong className="text-lg font-extrabold text-amber-600">{selectedTrial.submitted}</strong>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                <span className="block text-[11px] text-slate-500 mb-0.5">Đã chấm điểm</span>
                <strong className="text-lg font-extrabold text-emerald-600">{selectedTrial.reviewed}</strong>
              </div>
            </div>

            {/* Schedule & Milestones */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-2.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lịch trình & Thời hạn</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Bắt đầu dùng thử:</span>
                <span className="font-semibold">{formatWhen(selectedTrial.startedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Hạn làm bài thi:</span>
                <span className="font-semibold text-rose-700">{formatWhen(selectedTrial.testDeadline)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Giờ mong muốn nhận kết quả:</span>
                <span className="font-semibold text-amber-700">{formatWhen(selectedTrial.preferredReviewAt)}</span>
              </div>
              {selectedTrial.reportPublishedAt && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                  <span className="text-slate-500">Đã công bố báo cáo lúc:</span>
                  <span className="font-semibold text-emerald-700">{formatWhen(selectedTrial.reportPublishedAt)}</span>
                </div>
              )}
            </div>

            {/* Mentor Assignment Section */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col gap-2.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Phân công Mentor thẩm định</span>
                {selectedTrial.mentorName && (
                  <span className="text-emerald-700 font-semibold">{selectedTrial.mentorName}</span>
                )}
              </div>
              <MentorCell trial={selectedTrial} mentors={mentorsList} />
            </div>
          </div>
        </PlatformDrawer>
      )}

      {/* Slide-over Drawer: Create Mentor Dialog */}
      {createMentorOpen && (
        <CreateMentorDrawer
          isOpen={createMentorOpen}
          onClose={() => setCreateMentorOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Mentor Cell Component: Select & Assign Mentor with clean buttons and workload count.
 */
function MentorCell({ trial, mentors }: { trial: PlatformTrialItem; mentors: MentorItem[] }) {
  const [choice, setChoice] = useState(trial.mentorUserId ?? '');
  const assign = useAssignMentor();

  if (trial.stage === 'SETUP') {
    return <span className="text-xs text-slate-400 italic">Chưa gửi yêu cầu</span>;
  }

  if (trial.stage === 'REPORTED' && trial.mentorUserId) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
          {initials(trial.mentorName ?? 'M')}
        </div>
        <span className="text-xs font-semibold text-slate-800 truncate max-w-[130px]" title={trial.mentorName ?? ''}>
          {trial.mentorName}
        </span>
      </div>
    );
  }

  const active = mentors.filter((m) => m.status === 'ACTIVE');

  return (
    <div className="flex items-center gap-1.5 flex-nowrap">
      <select
        aria-label={`Mentor cho ${trial.organizationName}`}
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
        className="text-xs py-1 px-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-amber-500 max-w-[145px]"
      >
        <option value="">Chọn mentor</option>
        {active.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.fullName} ({m.activeTrials})
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-primary btn-small text-xs py-1 px-2.5 h-auto min-h-0 shrink-0"
        disabled={!choice || choice === trial.mentorUserId || assign.isPending}
        onClick={() =>
          assign.mutate(
            { organizationId: trial.organizationId, mentorUserId: choice },
            {
              onSuccess: () => toast.success(`Đã phân công mentor cho ${trial.organizationName}`),
              onError: (err) => toast.error(errorMessage(err)),
            },
          )
        }
      >
        {assign.isPending ? '...' : trial.mentorUserId ? 'Đổi' : 'Giao'}
      </button>
    </div>
  );
}

/**
 * Drawer tạo tài khoản Mentor mới với kiểm tra tính hợp lệ đầy đủ.
 */
function CreateMentorDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const create = useCreateMentor();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isPasswordValid = form.password.length >= 12;
  const isNameValid = form.fullName.trim().length >= 2;
  const isValid = isNameValid && isEmailValid && isPasswordValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    create.mutate(
      { fullName: form.fullName.trim(), email: form.email.trim(), password: form.password },
      {
        onSuccess: (m) => {
          toast.success(`Đã tạo tài khoản Mentor: ${m.email}`);
          setForm({ fullName: '', email: '', password: '' });
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <PlatformDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Mentor mới"
      icon={UserPlus}
      subtitle="Tạo tài khoản chuyên gia chấm thi bài làm tự luận"
      width={460}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button type="button" className="btn btn-outline btn-small" onClick={onClose} disabled={create.isPending}>
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-primary btn-small"
            disabled={!isValid || create.isPending}
            onClick={handleSubmit}
          >
            {create.isPending ? 'Đang tạo...' : 'Tạo tài khoản Mentor'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Họ và tên chuyên gia</label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Nguyễn Văn Chuyên"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Email công vụ</label>
          <input
            type="email"
            required
            placeholder="mentor@digitalent.ai"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          {form.email && !isEmailValid && (
            <span className="text-[11px] text-rose-600 mt-1 block">Email không đúng định dạng</span>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Mật khẩu khởi tạo</label>
          <input
            type="password"
            required
            placeholder="Tối thiểu 12 ký tự"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Yêu cầu bảo mật: tối thiểu 12 ký tự</span>
            <span className={form.password.length >= 12 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
              {form.password.length}/12
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 text-[11px] leading-relaxed">
          Tài khoản Mentor sau khi được tạo sẽ có quyền truy cập vào Cổng Mentor (`/mentor/trials`) để tiếp nhận và chấm bài thi tự luận của các tổ chức được phân công.
        </div>
      </form>
    </PlatformDrawer>
  );
}
