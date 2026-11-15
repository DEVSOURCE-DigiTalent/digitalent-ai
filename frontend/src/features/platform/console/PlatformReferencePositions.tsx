import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useReferencePositionLevels, useUpdateReferencePositionLevels } from '@/hooks/use-reference-position-levels';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { REFERENCE_POSITIONS, TT02_DOMAINS } from '@/lib/reference-positions';
import { errorMessage } from '../components/pulse-format';
import { Footer, LoadError } from '../components/pulse-ui';
import { PlatformReferencePositionsSkeleton } from './PlatformReferencePositionsSkeleton';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import {
  Briefcase,
  Layers,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Database,
  MessageSquare,
  Palette,
  Cpu,
} from 'lucide-react';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Cơ bản',
  2: 'Trung cấp',
  3: 'Nâng cao',
};

const POSITION_PROFILES: Record<string, { title: string; subtitle: string; code: string }> = {
  CEO: {
    title: 'Giám đốc điều hành',
    subtitle: 'Định hướng & Ra quyết định',
    code: 'CEO',
  },
  HR: {
    title: 'Quản trị nhân sự',
    subtitle: 'Tuyển dụng & Đào tạo',
    code: 'HR',
  },
  MARKETING: {
    title: 'Tiếp thị & Tăng trưởng',
    subtitle: 'Truyền thông & Khách hàng',
    code: 'MKT',
  },
  SALES_CRM: {
    title: 'Kinh doanh & CRM',
    subtitle: 'Bán hàng & Dữ liệu CRM',
    code: 'SALES',
  },
  ACCOUNTANT: {
    title: 'Tài chính & Kế toán',
    subtitle: 'Báo cáo & Kiểm soát',
    code: 'ACC',
  },
};

const DOMAIN_ICONS = [
  { icon: Database, color: '#0284c7', bg: '#f0f9ff' },
  { icon: MessageSquare, color: '#4f46e5', bg: '#eef2ff' },
  { icon: Palette, color: '#7c3aed', bg: '#f5f3ff' },
  { icon: ShieldCheck, color: '#16a34a', bg: '#f0fdf4' },
  { icon: Cpu, color: '#b45309', bg: '#fef3c7' },
  { icon: Sparkles, color: '#b91c1c', bg: '#fef2f2' },
];

const DOMAIN_PROFILES = [
  { desc: 'Duyệt, tìm kiếm, đánh giá và quản trị dữ liệu số' },
  { desc: 'Tương tác, chia sẻ và cộng tác số nơi công sở' },
  { desc: 'Phát triển, biên tập và tích hợp nội dung số' },
  { desc: 'Bảo vệ thiết bị, an toàn thông tin và dữ liệu' },
  { desc: 'Xử lý sự cố kỹ thuật và giải quyết vấn đề bằng công nghệ' },
  { desc: 'Ứng dụng AI tạo sinh, prompt engineering và tự động hóa' },
];

/**
 * PA-13 · Mẫu vị trí chuẩn doanh nghiệp (Executive Matrix Redesign).
 * Craftsman layout: Unified pa-ov-header, pa-ov-version-bar, pa-ov-kpi-grid,
 * high-density 1-click segmented level matrix, strict Anti-AI compliance.
 */
export function PlatformReferencePositionsPage() {
  useUiLanguage();
  const query = useReferencePositionLevels();

  const handleRefresh = () => {
    void query.refetch();
  };

  return (
    <div className={`pa-ov-stage${query.isFetching ? ' is-refreshing' : ''}`}>
      {/* Page Header */}
      <header className="pa-ov-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>Mẫu vị trí chuẩn doanh nghiệp</h1>
            {query.data?.version && (
              <span className="pa-rp-version-badge">v{query.data.version}</span>
            )}
          </div>
          <p className="pa-ov-subtitle">
            Khung thiết lập mức kỳ vọng 5 chức danh mẫu theo 6 lĩnh vực năng lực số cho các tổ chức tham chiếu.
          </p>
        </div>

        <div className="pa-ov-actions">
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={handleRefresh}
            disabled={query.isFetching}
            title="Tải lại dữ liệu mức tham chiếu từ máy chủ"
          >
            <RefreshCw size={14} className={query.isFetching ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{query.isFetching ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </div>
      </header>

      {query.isLoading && <PlatformReferencePositionsSkeleton />}
      {query.error && <LoadError error={query.error} />}

      {!query.isLoading && query.data && (
        <ReferenceMatrixView
          key={query.data.version}
          version={query.data.version}
          initial={query.data.levels}
          onRefresh={handleRefresh}
        />
      )}

      <Footer />
    </div>
  );
}

/**
 * Standalone reference positions matrix component for modular embedding.
 */
export function PlatformReferencePositions() {
  return <PlatformReferencePositionsPage />;
}

export default PlatformReferencePositionsPage;

interface ReferenceMatrixViewProps {
  version: number;
  initial: Record<string, number[]>;
  onRefresh?: () => void;
}

function ReferenceMatrixView({ version, initial }: ReferenceMatrixViewProps) {
  useUiLanguage();
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const save = useUpdateReferencePositionLevels();

  const [levels, setLevels] = useState(() =>
    Object.fromEntries(Object.entries(initial).map(([code, values]) => [code, [...values]]))
  );

  const dirty = useMemo(() => {
    return JSON.stringify(levels) !== JSON.stringify(initial);
  }, [levels, initial]);

  // Overall average across the entire matrix (30 cells)
  const overallAvg = useMemo(() => {
    let sum = 0;
    let count = 0;
    Object.values(levels).forEach((arr) => {
      arr.forEach((val) => {
        sum += val;
        count += 1;
      });
    });
    return count > 0 ? (sum / count).toFixed(1) : '2.0';
  }, [levels]);

  // Count changed cells
  const changedCount = useMemo(() => {
    let diff = 0;
    Object.keys(levels).forEach((code) => {
      const cur = levels[code] || [];
      const init = initial[code] || [];
      cur.forEach((val, idx) => {
        if (val !== init[idx]) diff += 1;
      });
    });
    return diff;
  }, [levels, initial]);

  const change = (code: string, index: number, value: number) => {
    if (!canEdit) return;
    setLevels((current) => ({
      ...current,
      [code]: current[code].map((level, i) => (i === index ? value : level)),
    }));
  };

  const onReset = () => {
    setLevels(Object.fromEntries(Object.entries(initial).map(([code, values]) => [code, [...values]])));
    toast.info('Đã khôi phục các mức năng lực ban đầu.');
  };

  const submit = async () => {
    try {
      await save.mutateAsync({ version, levels });
      toast.success('Đã lưu mẫu vị trí chuẩn cho toàn bộ tổ chức.');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div>
      {/* 4 Core Enterprise Benchmark KPI Cards (Compact) */}
      <div className="pa-ov-kpi-grid pa-kpi-compact" role="region" aria-label="Chỉ số tổng hợp mẫu vị trí chuẩn" style={{ marginBottom: 16 }}>
        {/* KPI 1: Chức danh chuẩn */}
        <div className="pa-ov-kpi-card is-tone-sky">
          <div className="pa-ov-kpi-top">
            <span className="pa-ov-kpi-label">CHỨC DANH CHUẨN</span>
            <div className="pa-kpi-icon-box" aria-hidden="true">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="pa-ov-kpi-val">{REFERENCE_POSITIONS.length} Vị trí</div>
          <div className="pa-ov-kpi-sub">CEO, HR, Marketing, Sales, Kế toán</div>
        </div>

        {/* KPI 2: Độ phủ năng lực */}
        <div className="pa-ov-kpi-card is-tone-orange">
          <div className="pa-ov-kpi-top">
            <span className="pa-ov-kpi-label">ĐỘ PHỦ NĂNG LỰC</span>
            <div className="pa-kpi-icon-box" aria-hidden="true">
              <Layers size={18} />
            </div>
          </div>
          <div className="pa-ov-kpi-val">{TT02_DOMAINS.length} Lĩnh vực</div>
          <div className="pa-ov-kpi-sub">Bao phủ 24 chuẩn năng lực số cốt lõi</div>
        </div>

        {/* KPI 3: Kỳ vọng trung bình */}
        <div className="pa-ov-kpi-card is-tone-amber">
          <div className="pa-ov-kpi-top">
            <span className="pa-ov-kpi-label">KỲ VỌNG TRUNG BÌNH</span>
            <div className="pa-kpi-icon-box" aria-hidden="true">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="pa-ov-kpi-val">
            Lv {overallAvg} <small style={{ fontSize: 14, color: 'var(--pa-ink-3)', fontWeight: 500 }}>/ 3.0</small>
          </div>
          <div className="pa-ov-kpi-sub">Toàn bộ 30 điểm đối chuẩn tham chiếu</div>
        </div>

        {/* KPI 4: Trạng thái áp dụng & đồng bộ */}
        <div className={`pa-ov-kpi-card ${dirty ? 'is-tone-amber' : 'is-tone-green'}`}>
          <div className="pa-ov-kpi-top">
            <span className="pa-ov-kpi-label">TRẠNG THÁI ÁP DỤNG</span>
            <div className="pa-kpi-icon-box" aria-hidden="true">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="pa-ov-kpi-val">
            {dirty ? (
              <span style={{ fontSize: 24, color: 'var(--pa-amber)' }}>{changedCount} Thay đổi</span>
            ) : (
              <span style={{ fontSize: 24, color: 'var(--pa-live)' }}>Sẵn sàng</span>
            )}
          </div>
          <div className="pa-ov-kpi-sub">
            {dirty ? 'Chưa lưu vào cấu hình mẫu chuẩn' : `Đã đồng bộ phiên bản v${version}`}
          </div>
        </div>
      </div>

      {/* Tier 3: Competency Matrix Panel */}
      <div className="pa-rp-panel" aria-labelledby="matrix-panel-title">
        {/* Panel Header with Integrated Inline Legend */}
        <div className="pa-rp-panel-head">
          <div className="pa-rp-panel-title-wrap">
            <h2 id="matrix-panel-title">Ma trận kỳ vọng năng lực chuẩn theo chức danh</h2>
            <p>
              Khung định vị cấp độ năng lực số chuẩn hóa, dùng làm căn cứ thiết lập lộ trình đào tạo cho tổ chức.
            </p>
          </div>

          {/* Integrated Inline Legend */}
          <div className="pa-rp-inline-legend">
            <span style={{ fontWeight: 600, color: 'var(--pa-ink)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Info size={14} style={{ color: 'var(--pa-sky)' }} /> Chú giải:
            </span>
            <span className="pa-rp-legend-pill">
              <span className="pa-rp-legend-dot" style={{ background: '#15803d' }} />
              <span><strong>Mức 1</strong>: Cơ bản</span>
            </span>
            <span className="pa-rp-legend-pill">
              <span className="pa-rp-legend-dot" style={{ background: '#1d4ed8' }} />
              <span><strong>Mức 2</strong>: Trung cấp</span>
            </span>
            <span className="pa-rp-legend-pill">
              <span className="pa-rp-legend-dot" style={{ background: '#b85c24' }} />
              <span><strong>Mức 3</strong>: Nâng cao</span>
            </span>
          </div>
        </div>

        {/* Matrix Table Wrapper */}
        <div className="pa-rp-table-wrap">
          <div className="pa-rp-table-scroll">
            <table className="pa-rp-table">
              <thead>
                <tr>
                  <th className="pa-rp-th-domain">LĨNH VỰC NĂNG LỰC SỐ</th>
                  {REFERENCE_POSITIONS.map((pos) => {
                    const profile = POSITION_PROFILES[pos.code] ?? {
                      title: pos.name,
                      subtitle: pos.description,
                      code: pos.code,
                    };
                    return (
                      <th key={pos.code} className="pa-rp-th-role">
                        <div className="pa-rp-role-title">{profile.title}</div>
                        <div className="pa-rp-role-sub">{profile.subtitle}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {TT02_DOMAINS.map((domain, index) => {
                  const domainTheme = DOMAIN_ICONS[index] ?? DOMAIN_ICONS[0];
                  const DomainIcon = domainTheme.icon;
                  const domainProfile = DOMAIN_PROFILES[index] ?? DOMAIN_PROFILES[0];

                  return (
                    <tr key={domain.number}>
                      <td className="pa-rp-td-domain">
                        <div className="pa-rp-domain-row-flex">
                          <span className="pa-rp-domain-num">
                            {String(domain.number).padStart(2, '0')}
                          </span>
                          <div
                            className="pa-rp-domain-icon"
                            style={{ background: domainTheme.bg, color: domainTheme.color }}
                          >
                            <DomainIcon size={16} />
                          </div>
                          <div className="pa-rp-domain-info">
                            <strong className="pa-rp-domain-title">
                              {translateUi(domain.name)}
                            </strong>
                            <span className="pa-rp-domain-desc">
                              {domainProfile.desc}
                            </span>
                          </div>
                        </div>
                      </td>
                      {REFERENCE_POSITIONS.map((pos) => {
                        const val = levels[pos.code]?.[index] ?? 1;

                        return (
                          <td key={pos.code} className="pa-rp-td-cell">
                            <div className="pa-rp-seg-wrap">
                              {/* Single-Click 3-Step Segmented Control */}
                              <div
                                className="pa-rp-seg-control"
                                role="group"
                                aria-label={`Mức năng lực ${pos.name} - ${domain.name}`}
                              >
                                {[1, 2, 3].map((lvl) => {
                                  const isSelected = val === lvl;
                                  return (
                                    <button
                                      key={lvl}
                                      type="button"
                                      disabled={!canEdit}
                                      onClick={() => change(pos.code, index, lvl)}
                                      className={`pa-rp-seg-btn ${isSelected ? `is-active lvl-${lvl}` : ''}`}
                                      title={`Đặt Mức ${lvl}: ${LEVEL_NAMES[lvl]}`}
                                    >
                                      {lvl}
                                    </button>
                                  );
                                })}
                              </div>
                              <span className={`pa-rp-seg-text lvl-${val}`}>
                                {LEVEL_NAMES[val]}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

              {/* Average Footprint Row */}
              <tfoot>
                <tr className="pa-rp-tfoot-tr">
                  <th className="pa-rp-tfoot-domain">
                    MỨC KỲ VỌNG TRUNG BÌNH
                  </th>
                  {REFERENCE_POSITIONS.map((pos) => {
                    const posLevels = levels[pos.code] || [];
                    const avgNum = posLevels.length
                      ? posLevels.reduce((a, b) => a + b, 0) / posLevels.length
                      : 0;
                    const avgStr = posLevels.length ? avgNum.toFixed(1) : '0.0';
                    const fillPercent = Math.min(100, Math.round((avgNum / 3) * 100));

                    return (
                      <td key={pos.code} className="pa-rp-tfoot-cell">
                        <div className="pa-rp-avg-num">
                          Lv {avgStr} <small>/ 3.0</small>
                        </div>
                        <div className="pa-rp-meter-bar" title={`Tỷ lệ đạt ${fillPercent}%`}>
                          <div
                            className="pa-rp-meter-fill"
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Tier 4: Bottom Save & Reset Action Bar */}
        {dirty && (
          <div className="pa-rp-foot-bar is-dirty">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--pa-ink-2)' }}>
              <Sparkles
                size={16}
                style={{ color: 'var(--pa-amber)', flexShrink: 0 }}
              />
              <span>
                Có <strong>{changedCount}</strong> thay đổi chưa lưu vào mẫu chuẩn.
              </span>
            </div>

            {canEdit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={onReset}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <RotateCcw size={14} />
                  Khôi phục ban đầu
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={save.isPending}
                  onClick={submit}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={15} />
                  {save.isPending ? translateUi('Đang lưu…') : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
