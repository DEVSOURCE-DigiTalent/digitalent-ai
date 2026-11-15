import { useMemo, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, BarChart3 } from 'lucide-react';
import type {
  PlatformCourse,
  PlatformOverview,
  PlatformSeatOrder,
} from '@/services/platform-admin.service';
import type { PlatformTrialItem } from '@/services/trial-program.service';
import { translateUi } from '@/lib/i18n';
import { formatMoney, formatNumber } from '../../components/pulse-format';

type RevenueTab = 'time' | 'course';
type DonutTab = 'orgs' | 'trials';

interface TimeBucketDatum {
  key: string;
  label: string;
  revenue: number;
  seats: number;
  orderCount: number;
}

interface CourseRevenueDatum {
  code: string;
  title: string;
  domainName: string;
  levelName: string;
  revenue: number;
  seats: number;
}

interface DonutSliceDatum {
  key: string;
  label: string;
  value: number;
  color: string;
  to: string;
}

const formatCompactMoney = (value: number): string => {
  if (value >= 1_000_000_000) {
    const num = value / 1_000_000_000;
    return `${Number.isInteger(num) ? num : num.toFixed(1)}tỷ`;
  }
  if (value >= 1_000_000) {
    const num = value / 1_000_000;
    return `${Number.isInteger(num) ? num : num.toFixed(1)}tr`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return String(value);
};

function moveTabFocus(
  event: KeyboardEvent<HTMLDivElement>,
  keys: readonly string[],
  currentKey: string,
  onSelect: (next: string) => void,
) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') {
    return;
  }
  event.preventDefault();
  let nextIdx = keys.indexOf(currentKey);
  if (event.key === 'ArrowRight') nextIdx = (nextIdx + 1) % keys.length;
  if (event.key === 'ArrowLeft') nextIdx = (nextIdx - 1 + keys.length) % keys.length;
  if (event.key === 'Home') nextIdx = 0;
  if (event.key === 'End') nextIdx = keys.length - 1;
  onSelect(keys[nextIdx]!);
}

interface RevenueColumnCardProps {
  orders: PlatformSeatOrder[];
  courses: PlatformCourse[];
  totalRevenue: number;
  seatsPurchased: number;
  isSubLoading: boolean;
}

/**
 * Primary Revenue Column Chart (<BarChart>) using Solid Clay-Orange bars (#b85c24).
 * Supports switching between Time-series buckets (from seat orders) and Course breakdown.
 */
export function RevenueColumnCard({
  orders,
  courses,
  totalRevenue,
  seatsPurchased,
  isSubLoading,
}: RevenueColumnCardProps) {
  const paidOrders = useMemo(
    () => orders.filter((order) => order.kind === 'PURCHASE' && order.totalAmount > 0),
    [orders],
  );

  const paidCourses = useMemo<CourseRevenueDatum[]>(() => {
    return [...courses]
      .filter((course) => course.revenue > 0 || course.seatsPurchased > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map((course) => ({
        code: course.code,
        title: course.title,
        domainName: course.domainName,
        levelName: course.levelName,
        revenue: course.revenue,
        seats: course.seatsPurchased,
      }));
  }, [courses]);

  const timeBuckets = useMemo<TimeBucketDatum[]>(() => {
    if (paidOrders.length === 0) return [];
    const monthKeys = new Set(
      paidOrders.map((order) => {
        const dt = new Date(order.createdAt);
        return `${dt.getFullYear()}-${dt.getMonth()}`;
      }),
    );
    const groupByDay = monthKeys.size <= 1;
    const map = new Map<string, TimeBucketDatum>();

    const sorted = [...paidOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    for (const order of sorted) {
      const dt = new Date(order.createdAt);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      const key = groupByDay ? `${year}-${month}-${day}` : `${year}-${month}`;
      const label = groupByDay ? `${day}/${month}` : `T${dt.getMonth() + 1}/${String(year).slice(-2)}`;

      const existing = map.get(key);
      if (existing) {
        existing.revenue += order.totalAmount;
        existing.seats += order.seats;
        existing.orderCount += 1;
      } else {
        map.set(key, {
          key,
          label,
          revenue: order.totalAmount,
          seats: order.seats,
          orderCount: 1,
        });
      }
    }
    return Array.from(map.values()).slice(-10);
  }, [paidOrders]);

  const defaultTab: RevenueTab = timeBuckets.length > 0 ? 'time' : paidCourses.length > 0 ? 'course' : 'time';
  const [selectedTab, setSelectedTab] = useState<RevenueTab | null>(null);
  const activeTab = selectedTab ?? defaultTab;

  const levelTotals = useMemo(() => {
    let mid = 0;
    let adv = 0;
    for (const c of courses) {
      if (c.level === 2) mid += c.revenue;
      if (c.level === 3) adv += c.revenue;
    }
    return { mid, adv };
  }, [courses]);

  const hasChartData = activeTab === 'time' ? timeBuckets.length > 0 : paidCourses.length > 0;

  return (
    <section className="pa-ov-panel" aria-label="Biểu đồ cột doanh thu suất học">
      <div className="pa-ov-panel-head">
        <div>
          <h2 className="pa-ov-panel-title">Doanh thu suất học</h2>
          <p className="pa-ov-panel-sub">
            {formatMoney(totalRevenue)} · {formatNumber(seatsPurchased)} suất bán
          </p>
        </div>

        <div
          className="pa-ov-tablist"
          role="tablist"
          aria-label="Chế độ biểu đồ doanh thu"
          onKeyDown={(e) => moveTabFocus(e, ['time', 'course'], activeTab, (k) => setSelectedTab(k as RevenueTab))}
        >
          <button
            type="button"
            role="tab"
            id="pa-rev-tab-time"
            aria-selected={activeTab === 'time'}
            tabIndex={activeTab === 'time' ? 0 : -1}
            className="pa-ov-tab"
            onClick={() => setSelectedTab('time')}
          >
            {translateUi('Theo thời gian')}
          </button>
          <button
            type="button"
            role="tab"
            id="pa-rev-tab-course"
            aria-selected={activeTab === 'course'}
            tabIndex={activeTab === 'course' ? 0 : -1}
            className="pa-ov-tab"
            onClick={() => setSelectedTab('course')}
          >
            {translateUi('Theo khóa học')}
          </button>
        </div>
      </div>

      {isSubLoading && !hasChartData ? (
        <div className="pa-ov-chart-loading" role="status" aria-label="Đang tải dữ liệu biểu đồ doanh thu">
          <div className="pa-ov-sk-barchart">
            {[46, 72, 58, 86, 62].map((h, i) => (
              <div key={i} className="pa-ov-sk-bar-col">
                <div className="pa-ov-sk-block pa-ov-sk-bar" style={{ height: `${h}%` }} />
                <div className="pa-ov-sk-block pa-ov-sk-line" style={{ width: 28, height: 12, marginTop: 8 }} />
              </div>
            ))}
          </div>
        </div>
      ) : !hasChartData ? (
        <div className="pa-ov-empty-state">
          <span className="pa-ov-empty-icon" aria-hidden="true">
            <BarChart3 size={22} />
          </span>
          <p className="pa-ov-empty-text">
            {activeTab === 'time'
              ? 'Chưa có đơn mua suất học trả phí nào phát sinh trong kỳ.'
              : 'Chưa có khóa học nào phát sinh doanh thu bán suất.'}{' '}
            Kiểm tra biểu giá hoặc đơn hàng tại mục Đơn giá và Suất học.
          </p>
          <Link to="/platform/commerce" className="btn btn-outline btn-small inline-flex items-center gap-1.5">
            <span>Mở Đơn giá &amp; Suất học</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div role="tabpanel" aria-labelledby={activeTab === 'time' ? 'pa-rev-tab-time' : 'pa-rev-tab-course'}>
          <div className="pa-ov-chart-canvas">
            <ResponsiveContainer width="100%" height={264} minWidth={0} initialDimension={{ width: 560, height: 264 }}>
              {activeTab === 'time' ? (
                <BarChart data={timeBuckets} margin={{ top: 14, right: 12, left: 4, bottom: 4 }} barCategoryGap="24%">
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCompactMoney}
                    tick={{ fill: '#475569', fontSize: 12.5, fontWeight: 500 }}
                    width={54}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(184, 92, 36, 0.06)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const datum = payload[0]!.payload as TimeBucketDatum;
                      return (
                        <div className="pa-ov-tooltip">
                          <div className="pa-ov-tooltip-title">Kỳ {datum.label}</div>
                          <div className="pa-ov-tooltip-row">
                            <span>Doanh thu</span>
                            <strong>{formatMoney(datum.revenue)}</strong>
                          </div>
                          <div className="pa-ov-tooltip-row">
                            <span>Suất bán</span>
                            <strong>{formatNumber(datum.seats)} suất ({datum.orderCount} đơn)</strong>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#b85c24"
                    activeBar={{ fill: '#9e4b19', stroke: '#7c2d12', strokeWidth: 1.5 }}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              ) : (
                <BarChart data={paidCourses} margin={{ top: 14, right: 12, left: 4, bottom: 4 }} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="code"
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCompactMoney}
                    tick={{ fill: '#475569', fontSize: 12.5, fontWeight: 500 }}
                    width={54}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(184, 92, 36, 0.06)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const datum = payload[0]!.payload as CourseRevenueDatum;
                      return (
                        <div className="pa-ov-tooltip">
                          <div className="pa-ov-tooltip-title">{datum.code}: {datum.title}</div>
                          <div className="pa-ov-tooltip-sub">{datum.domainName} · {datum.levelName}</div>
                          <div className="pa-ov-tooltip-row">
                            <span>Doanh thu</span>
                            <strong>{formatMoney(datum.revenue)}</strong>
                          </div>
                          <div className="pa-ov-tooltip-row">
                            <span>Suất bán</span>
                            <strong>{formatNumber(datum.seats)} suất</strong>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#b85c24"
                    activeBar={{ fill: '#9e4b19', stroke: '#7c2d12', strokeWidth: 1.5 }}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="pa-ov-chart-foot">
            <div className="pa-ov-foot-metrics">
              <span>
                Trung cấp: <strong>{formatMoney(levelTotals.mid)}</strong>
              </span>
              <span className="pa-ov-foot-sep" aria-hidden="true">·</span>
              <span>
                Nâng cao: <strong>{formatMoney(levelTotals.adv)}</strong>
              </span>
            </div>
            <Link to="/platform/commerce" className="pa-box-link">
              <span>Chi tiết giao dịch</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

interface OrganizationDonutCardProps {
  data: PlatformOverview;
  trials: PlatformTrialItem[];
}

/**
 * Companion Donut Chart showing Organization Status breakdown and Trial Review Pipeline.
 */
export function OrganizationDonutCard({ data, trials }: OrganizationDonutCardProps) {
  const [activeTab, setActiveTab] = useState<DonutTab>('orgs');

  const orgSlices = useMemo<DonutSliceDatum[]>(() => [
    {
      key: 'paid',
      label: 'Đang trả phí',
      value: data.paidOrganizationCount,
      color: '#15803d',
      to: '/platform/organizations?stage=PAID',
    },
    {
      key: 'trial',
      label: 'Đang dùng thử',
      value: data.trialOrganizationCount,
      color: '#b45309',
      to: '/platform/organizations?stage=TRIAL',
    },
    {
      key: 'suspended',
      label: 'Tạm ngưng',
      value: data.suspendedOrganizationCount,
      color: '#b91c1c',
      to: '/platform/organizations?status=SUSPENDED',
    },
  ], [data.paidOrganizationCount, data.suspendedOrganizationCount, data.trialOrganizationCount]);

  const trialSlices = useMemo<DonutSliceDatum[]>(() => {
    const requested = trials.filter((t) => t.stage === 'REQUESTED').length;
    const assigned = trials.filter((t) => t.stage === 'ASSIGNED').length;
    const reported = trials.filter((t) => t.stage === 'REPORTED').length;
    const setup = trials.filter((t) => t.stage === 'SETUP').length;
    return [
      { key: 'requested', label: 'Chờ phân công mentor', value: requested, color: '#b45309', to: '/platform/trials' },
      { key: 'assigned', label: 'Đang chấm thẩm định', value: assigned, color: '#b85c24', to: '/platform/trials' },
      { key: 'reported', label: 'Đã công bố kết quả', value: reported, color: '#15803d', to: '/platform/trials' },
      { key: 'setup', label: 'Đang thiết lập bài thử', value: setup, color: '#64748b', to: '/platform/trials' },
    ];
  }, [trials]);

  const activeSlices = activeTab === 'orgs' ? orgSlices : trialSlices;
  const nonZeroSlices = activeSlices.filter((s) => s.value > 0);
  const totalCount = activeTab === 'orgs' ? data.organizationCount : trials.length;
  const centerPrimary = activeTab === 'orgs' ? `${data.conversionRate}%` : formatNumber(trials.length);
  const centerLabel = activeTab === 'orgs' ? 'Chuyển đổi' : 'Hồ sơ thử';

  return (
    <section className="pa-ov-panel" aria-label="Cơ cấu tổ chức và tiến độ dùng thử">
      <div className="pa-ov-panel-head">
        <div>
          <h2 className="pa-ov-panel-title">
            {activeTab === 'orgs' ? 'Cơ cấu tổ chức' : 'Tiến độ dùng thử'}
          </h2>
          <p className="pa-ov-panel-sub">
            {activeTab === 'orgs'
              ? `${formatNumber(data.organizationCount)} tổ chức · ${formatNumber(data.employeeCount)} nhân sự`
              : `${formatNumber(trials.length)} hồ sơ dùng thử`}
          </p>
        </div>

        <div
          className="pa-ov-tablist"
          role="tablist"
          aria-label="Chế độ cơ cấu tổ chức"
          onKeyDown={(e) => moveTabFocus(e, ['orgs', 'trials'], activeTab, (k) => setActiveTab(k as DonutTab))}
        >
          <button
            type="button"
            role="tab"
            id="pa-donut-tab-orgs"
            aria-selected={activeTab === 'orgs'}
            tabIndex={activeTab === 'orgs' ? 0 : -1}
            className="pa-ov-tab"
            onClick={() => setActiveTab('orgs')}
          >
            {translateUi('Tổ chức')}
          </button>
          <button
            type="button"
            role="tab"
            id="pa-donut-tab-trials"
            aria-selected={activeTab === 'trials'}
            tabIndex={activeTab === 'trials' ? 0 : -1}
            className="pa-ov-tab"
            onClick={() => setActiveTab('trials')}
          >
            {translateUi('Dùng thử')}
          </button>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="pa-ov-empty-state">
          <p className="pa-ov-empty-text">
            {activeTab === 'orgs'
              ? 'Chưa có tổ chức khách hàng nào trên hệ thống.'
              : 'Chưa có doanh nghiệp nào gửi hồ sơ dùng thử.'}{' '}
            Mở danh sách tổ chức để tạo mới hoặc theo dõi trạng thái.
          </p>
          <Link to={activeTab === 'orgs' ? '/platform/organizations' : '/platform/trials'} className="btn btn-outline btn-small">
            {activeTab === 'orgs' ? 'Xem danh sách tổ chức' : 'Mở hàng đợi dùng thử'}
          </Link>
        </div>
      ) : (
        <div role="tabpanel" aria-labelledby={activeTab === 'orgs' ? 'pa-donut-tab-orgs' : 'pa-donut-tab-trials'}>
          <div className="pa-ov-donut-layout">
            <div className="pa-ov-donut-box">
              <ResponsiveContainer width="100%" height={200} minWidth={0} initialDimension={{ width: 200, height: 200 }}>
                <PieChart>
                  <Pie
                    data={nonZeroSlices}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={nonZeroSlices.length > 1 ? 3 : 0}
                    strokeWidth={0}
                  >
                    {nonZeroSlices.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const slice = payload[0]!.payload as DonutSliceDatum;
                      const pct = totalCount > 0 ? Math.round((slice.value / totalCount) * 100) : 0;
                      return (
                        <div className="pa-ov-tooltip">
                          <div className="pa-ov-tooltip-title">{slice.label}</div>
                          <div className="pa-ov-tooltip-row">
                            <span>Số lượng</span>
                            <strong>{formatNumber(slice.value)} ({pct}%)</strong>
                          </div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pa-ov-donut-center" aria-hidden="true">
                <span className="pa-ov-donut-val">{centerPrimary}</span>
                <span className="pa-ov-donut-lbl">{centerLabel}</span>
              </div>
            </div>

            <div className="pa-ov-legend-list">
              {activeSlices.map((slice) => {
                const pct = totalCount > 0 ? Math.round((slice.value / totalCount) * 100) : 0;
                return (
                  <Link key={slice.key} to={slice.to} className="pa-ov-legend-row">
                    <span className="pa-ov-legend-dot" style={{ background: slice.color }} aria-hidden="true" />
                    <span className="pa-ov-legend-name">{slice.label}</span>
                    <span className="pa-ov-legend-count">
                      <strong>{formatNumber(slice.value)}</strong>
                      <span className="pa-ov-legend-pct">({pct}%)</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pa-ov-chart-foot">
            <span className="pa-ov-foot-note">Chọn dòng để lọc nhanh</span>
            <Link to={activeTab === 'orgs' ? '/platform/organizations' : '/platform/trials'} className="pa-box-link">
              <span>{activeTab === 'orgs' ? 'Quản lý tổ chức' : 'Mở đánh giá dùng thử'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

