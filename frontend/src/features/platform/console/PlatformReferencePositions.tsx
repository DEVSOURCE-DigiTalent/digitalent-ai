import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useReferencePositionLevels, useUpdateReferencePositionLevels } from '@/hooks/use-reference-position-levels';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { REFERENCE_POSITIONS, TT02_DOMAINS } from '@/lib/reference-positions';
import { errorMessage } from '../components/pulse-format';
import { Footer } from '../components/pulse-ui';
import {
  Briefcase,
  Users,
  Megaphone,
  TrendingUp,
  Calculator,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  ChevronDown,
  Layers,
} from 'lucide-react';

const LEVELS = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

const LEVEL_CONFIG: Record<number, { bg: string; color: string; border: string; desc: string; dot: string }> = {
  1: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#16a34a', desc: 'Áp dụng công cụ cơ bản' },
  2: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', dot: '#2563eb', desc: 'Thành thạo quy trình nghiệp vụ' },
  3: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', dot: '#d97706', desc: 'Tối ưu hóa & Quản trị rủi ro' },
};

const POSITION_ICONS: Record<string, { icon: typeof Briefcase; color: string; bg: string }> = {
  CEO: { icon: Briefcase, color: '#0f172a', bg: '#f1f5f9' },
  HR: { icon: Users, color: '#0284c7', bg: '#f0f9ff' },
  MARKETING: { icon: Megaphone, color: '#8b5cf6', bg: '#f5f3ff' },
  SALES_CRM: { icon: TrendingUp, color: '#d97706', bg: '#fffbeb' },
  ACCOUNTANT: { icon: Calculator, color: '#059669', bg: '#ecfdf5' },
};

export function PlatformReferencePositions() {
  const { data, isLoading, isError } = useReferencePositionLevels();
  return (
    <section className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }} aria-labelledby="reference-positions-title">
      <div className="pa-card-head" style={{ marginBottom: 18 }}>
        <div>
          <h2 id="reference-positions-title" className="panel-title" style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            Ma trận tham chiếu tiêu chuẩn Thông tư 02/2025/TT-BGDĐT
          </h2>
          <p className="panel-desc" style={{ fontSize: 13, color: '#64748b' }}>
            5 vị trí mẫu chuẩn hóa được thiết lập sẵn cho các tổ chức tham khảo khi thiết lập khung năng lực số nội bộ.
          </p>
        </div>
      </div>
      {isLoading && <p style={{ fontSize: 13, color: '#64748b' }}>Đang tải mức tham chiếu…</p>}
      {isError && <p role="alert" style={{ fontSize: 13, color: '#e11d48' }}>Chưa tải được mức tham chiếu.</p>}
      {data && <ReferenceEditor key={data.version} version={data.version} initial={data.levels} />}
    </section>
  );
}

export function PlatformReferencePositionsPage() {
  return (
    <>
      <div className="pa-page-header">
        <div className="pa-header-eyebrow">
          <span className="pa-eyebrow-dot" />
          QUẢN TRỊ NỀN TẢNG / MẪU VỊ TRÍ THAM CHIẾU
        </div>
        <h1 className="pa-header-title">Mức năng lực tham chiếu theo vị trí.</h1>
        <p className="pa-header-subtitle">
          Quản lý 5 mẫu vị trí chuẩn hóa của DigiTalent: Giám đốc, Nhân sự, Marketing, Kinh doanh và Kế toán theo chuẩn 6 miền năng lực số.
        </p>
      </div>

      {/* Quick Legend Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '12px 18px',
          borderRadius: 12,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          fontSize: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={15} style={{ color: '#0284c7' }} /> Chú giải mức năng lực:
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#16a34a' }} />
          <span><strong style={{ color: '#15803d' }}>Mức 1 · Cơ bản</strong> (Áp dụng công cụ)</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#2563eb' }} />
          <span><strong style={{ color: '#1d4ed8' }}>Mức 2 · Trung cấp</strong> (Thành thạo nghiệp vụ)</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#d97706' }} />
          <span><strong style={{ color: '#b45309' }}>Mức 3 · Nâng cao</strong> (Tối ưu & Quản trị)</span>
        </span>
      </div>

      <PlatformReferencePositions />
      <Footer />
    </>
  );
}

function ReferenceEditor({ version, initial }: { version: number; initial: Record<string, number[]> }) {
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const save = useUpdateReferencePositionLevels();
  const [levels, setLevels] = useState(() => Object.fromEntries(Object.entries(initial).map(([code, values]) => [code, [...values]])));
  const [activeCell, setActiveCell] = useState<{ code: string; index: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dirty = JSON.stringify(levels) !== JSON.stringify(initial);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveCell(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const change = (code: string, index: number, value: number) => {
    setLevels((current) => ({ ...current, [code]: current[code].map((level, i) => (i === index ? value : level)) }));
    setActiveCell(null);
  };

  const onReset = () => {
    setLevels(Object.fromEntries(Object.entries(initial).map(([code, values]) => [code, [...values]])));
    toast.info('Đã khôi phục mức ban đầu.');
  };

  const submit = async () => {
    try {
      await save.mutateAsync({ version, levels });
      toast.success('Đã cập nhật bảng tham chiếu cho doanh nghiệp.');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <>
      <div ref={containerRef} className="table-scroll" style={{ borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'visible' }}>
        <table className="data-table" style={{ borderCollapse: 'collapse', width: '100%', position: 'relative' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ width: 280, padding: '16px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>
                MIỀN NĂNG LỰC SỐ (TT02)
              </th>
              {REFERENCE_POSITIONS.map((position) => {
                const conf = POSITION_ICONS[position.code] ?? { icon: Briefcase, color: '#0f172a', bg: '#f1f5f9' };
                const Icon = conf.icon;
                return (
                  <th key={position.code} style={{ padding: '16px 12px', textAlign: 'center', minWidth: 140 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: conf.bg,
                          color: conf.color,
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{position.name}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TT02_DOMAINS.map((domain, index) => (
              <tr key={domain.number} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: '#f1f5f9',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {String(domain.number).padStart(2, '0')}
                    </span>
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>{domain.name}</strong>
                  </div>
                </td>
                {REFERENCE_POSITIONS.map((position) => {
                  const val = levels[position.code]?.[index] ?? 1;
                  const cfg = LEVEL_CONFIG[val] ?? LEVEL_CONFIG[1];
                  const isOpen = activeCell?.code === position.code && activeCell?.index === index;

                  return (
                    <td key={position.code} style={{ padding: '10px 12px', textAlign: 'center', position: 'relative' }}>
                      {canEdit ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            type="button"
                            onClick={() => setActiveCell(isOpen ? null : { code: position.code, index })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: cfg.bg,
                              color: cfg.color,
                              border: `1px solid ${cfg.border}`,
                              cursor: 'pointer',
                              outline: 'none',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                            }}
                            title="Bấm để chọn mức năng lực"
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                            <span>{LEVELS[val]}</span>
                            <ChevronDown size={12} style={{ opacity: 0.6 }} />
                          </button>

                          {/* Sleek Popover Selector */}
                          {isOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 100,
                                background: '#ffffff',
                                borderRadius: 10,
                                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.08)',
                                padding: 6,
                                minWidth: 170,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                textAlign: 'left',
                              }}
                            >
                              {[1, 2, 3].map((lvl) => {
                                const opt = LEVEL_CONFIG[lvl];
                                const isSelected = val === lvl;
                                return (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => change(position.code, index, lvl)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 10px',
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: isSelected ? 700 : 500,
                                      background: isSelected ? opt.bg : 'transparent',
                                      color: isSelected ? opt.color : '#334155',
                                      border: 'none',
                                      cursor: 'pointer',
                                      transition: 'background 0.15s ease',
                                    }}
                                  >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot }} />
                                      <span>Mức {lvl}: {LEVELS[lvl]}</span>
                                    </span>
                                    {isSelected && <Check size={14} style={{ color: opt.color }} />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 20,
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                          {LEVELS[val]}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {/* Average Footprint Row */}
          <tfoot>
            <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
              <td style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#475569' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={14} style={{ color: '#0284c7' }} /> MỨC NĂNG LỰC TRUNG BÌNH
                </span>
              </td>
              {REFERENCE_POSITIONS.map((pos) => {
                const posLevels = levels[pos.code] || [];
                const avg = posLevels.length ? (posLevels.reduce((a, b) => a + b, 0) / posLevels.length).toFixed(1) : '—';
                return (
                  <td key={pos.code} style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                      Lv {avg} <small style={{ color: '#64748b', fontWeight: 500 }}>/ 3.0</small>
                    </span>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Save Action Bar */}
      <div
        style={{
          marginTop: 20,
          padding: '16px 20px',
          borderRadius: 12,
          background: dirty ? '#fffbeb' : '#f8fafc',
          border: dirty ? '1px solid #fde68a' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} style={{ color: dirty ? '#d97706' : '#64748b' }} />
          <span style={{ fontSize: 13, color: '#334155' }}>
            Phiên bản ma trận tham chiếu: <strong>v{version}</strong> · {dirty ? 'Có thay đổi chưa lưu' : 'Dữ liệu đã đồng bộ'}
          </span>
        </div>

        {canEdit && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {dirty && (
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={onReset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RotateCcw size={14} />
                Khôi phục ban đầu
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!dirty || save.isPending}
              onClick={submit}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={15} />
              {save.isPending ? 'Đang lưu…' : 'Lưu bảng tham chiếu'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
