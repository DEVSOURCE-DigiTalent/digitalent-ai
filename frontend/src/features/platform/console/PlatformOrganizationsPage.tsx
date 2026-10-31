import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePlatformOrganizations } from '@/hooks/use-platform-admin';
import type { PlatformOrganization } from '@/services/platform-admin.service';
import { Box, Footer, LoadError, Loading, Pager, Pill } from '../components/pulse-ui';
import {
  ORG_STATUS,
  PLAN_CYCLE,
  PLAN_STATUS,
  STAGE_LABELS,
  formatDate,
} from '../components/pulse-format';
import { PlatformDrawer } from '../components/PlatformDrawer';
import { OrganizationDetailContent } from './components/OrganizationDetailContent';
import {
  Building2,
  Search,
  Plus,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';

const TABS = [
  { key: 'ALL', label: 'Tất cả tổ chức', filter: {} },
  { key: 'TRIAL', label: 'Đang dùng thử', filter: { stage: 'TRIAL', status: 'ACTIVE' } },
  { key: 'PAID', label: 'Đã mua khóa', filter: { stage: 'PAID', status: 'ACTIVE' } },
  { key: 'SUSPENDED', label: 'Tạm ngưng', filter: { status: 'SUSPENDED' } },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** PA-05 · Quản trị Tổ chức: list of customer tenants with In-Context Slide-in Drawer (PA-06). */
export function PlatformOrganizationsPage() {
  const [params, setParams] = useSearchParams();
  const initialTab = (TABS.find((t) => t.key === params.get('status') || t.key === params.get('stage'))?.key ?? 'ALL') as TabKey;
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [drawerOrgId, setDrawerOrgId] = useState<string | null>(null);

  const filter = TABS.find((t) => t.key === tab)!.filter;
  const { data, isLoading, error } = usePlatformOrganizations({ search, ...filter, pageIndex, pageSize: 20 });

  const chooseTab = (key: TabKey) => {
    setTab(key);
    setPageIndex(1);
    setParams(key === 'ALL' ? {} : key === 'SUSPENDED' ? { status: key } : { stage: key }, { replace: true });
  };

  const selectedOrg = data?.items.find((o) => o.id === drawerOrgId);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
            Quản trị nền tảng / Khách hàng doanh nghiệp
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '6px 0 4px' }}>
            Doanh nghiệp đang dùng nền tảng.
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Quản trị gói thuê bao, số lượng nhân sự tham gia, phân bổ khóa học theo cấp và cấp suất nâng cao.
          </p>
        </div>

        {/* Split Button Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <Link
              to="/business/try"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-small"
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              <Plus size={14} style={{ marginRight: 4 }} />
              Thêm tổ chức
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-small"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: '1px solid rgba(255, 255, 255, 0.25)', padding: '0 8px' }}
              title="Nhập danh sách doanh nghiệp từ tệp Excel/CSV"
              onClick={() => alert('Chức năng nhập tệp hàng loạt (Excel/CSV) dành cho dự án đào tạo đối tác lớn.')}
            >
              <FileSpreadsheet size={14} />
            </button>
          </div>
        </div>
      </div>

      <Box>
        <div className="pa-filters pa-row-between" style={{ alignItems: 'center', marginBottom: 18 }}>
          {/* Modern Tab Pills */}
          <div className="pa-tabs" role="group" aria-label="Lọc tổ chức">
            {TABS.map((t) => (
              <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => chooseTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', minWidth: 280, flex: 'none' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder="Tìm theo tên, mã hoặc email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(1);
              }}
              style={{ paddingLeft: 34, height: 40, width: '100%' }}
              aria-label="Tìm tổ chức"
            />
          </div>
        </div>

        {isLoading && <Loading />}
        {error && <LoadError error={error} />}
        {data && data.items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
            <Building2 size={36} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Không có tổ chức nào khớp bộ lọc</div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>Thử tìm kiếm với từ khóa khác hoặc chuyển tab.</p>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table pa-org-table">
                <thead>
                  <tr>
                    <th>Tổ chức & Chủ sở hữu</th>
                    <th>Gói thuê bao & hạn dùng</th>
                    <th>Khóa học theo cấp</th>
                    <th className="num">Nhân sự tham gia</th>
                    <th>Ngày tạo</th>
                    <th style={{ width: 100 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((o) => (
                    <tr
                      key={o.id}
                      className="pa-row-link"
                      onClick={() => setDrawerOrgId(o.id)}
                      title="Bấm để mở ngăn kéo xem hồ sơ 360"
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 9,
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#2563eb',
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Building2 size={18} />
                          </div>
                          <div>
                            <strong className="pa-cell-title" style={{ fontSize: 13, color: '#0f172a' }}>{o.name}</strong>
                            <small className="pa-cell-sub">{o.ownerEmail ?? 'Chưa gán chủ sở hữu'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <PlanCell organization={o} />
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: o.coursesInUseByLevel[0] ? '#f0fdf4' : '#f8fafc', color: o.coursesInUseByLevel[0] ? '#16a34a' : '#94a3b8', border: '1px solid', borderColor: o.coursesInUseByLevel[0] ? '#bbf7d0' : '#e2e8f0', fontWeight: 600 }}>
                            Cơ bản · {o.coursesInUseByLevel[0] ?? 0}
                          </span>
                          <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: o.coursesInUseByLevel[1] ? '#eff6ff' : '#f8fafc', color: o.coursesInUseByLevel[1] ? '#2563eb' : '#94a3b8', border: '1px solid', borderColor: o.coursesInUseByLevel[1] ? '#bfdbfe' : '#e2e8f0', fontWeight: 600 }}>
                            Trung cấp · {o.coursesInUseByLevel[1] ?? 0}
                          </span>
                          <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: o.coursesInUseByLevel[2] ? '#fffbeb' : '#f8fafc', color: o.coursesInUseByLevel[2] ? '#d97706' : '#94a3b8', border: '1px solid', borderColor: o.coursesInUseByLevel[2] ? '#fde68a' : '#e2e8f0', fontWeight: 600 }}>
                            Nâng cao · {o.coursesInUseByLevel[2] ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="num">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <div>
                            <strong style={{ color: '#0f172a' }}>{o.participantCount}</strong> / {o.employeeCount}
                          </div>
                          <small className="pa-cell-sub">nhân viên</small>
                        </div>
                      </td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerOrgId(o.id);
                          }}
                          style={{ padding: '4px 8px', fontSize: 11 }}
                        >
                          Chi tiết →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager pageIndex={data.pageIndex} totalPages={data.totalPages} totalItems={data.totalItems} onChange={setPageIndex} />
          </>
        )}
      </Box>

      {/* Slide-in Drawer PA-06 */}
      <PlatformDrawer
        isOpen={Boolean(drawerOrgId)}
        onClose={() => setDrawerOrgId(null)}
        title={selectedOrg?.name ?? 'Chi tiết tổ chức'}
        subtitle={selectedOrg?.ownerEmail ? `Chủ sở hữu: ${selectedOrg.ownerEmail}` : 'Hồ sơ 360 doanh nghiệp'}
        icon={Building2}
        badge={
          selectedOrg && (
            selectedOrg.status === 'SUSPENDED' ? (
              <Pill tone={ORG_STATUS.SUSPENDED.tone}>{ORG_STATUS.SUSPENDED.label}</Pill>
            ) : (
              <Pill tone={STAGE_LABELS[selectedOrg.stage]?.tone}>{STAGE_LABELS[selectedOrg.stage]?.label ?? 'Đang hoạt động'}</Pill>
            )
          )
        }
        footer={
          drawerOrgId ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Link
                to={`/platform/organizations/${drawerOrgId}`}
                className="btn btn-ghost btn-small"
                target="_blank"
                rel="noreferrer"
              >
                Mở toàn màn hình <ExternalLink size={13} style={{ marginLeft: 4 }} />
              </Link>
              <button type="button" className="btn btn-outline btn-small" onClick={() => setDrawerOrgId(null)}>
                Đóng
              </button>
            </div>
          ) : undefined
        }
      >
        {drawerOrgId && <OrganizationDetailContent orgId={drawerOrgId} isDrawer />}
      </PlatformDrawer>

      <Footer />
    </>
  );
}

function PlanCell({ organization: o }: { organization: PlatformOrganization }) {
  const stage =
    o.status === 'SUSPENDED' ? (
      <Pill tone={ORG_STATUS.SUSPENDED.tone}>{ORG_STATUS.SUSPENDED.label}</Pill>
    ) : (
      <Pill tone={STAGE_LABELS[o.stage]?.tone}>{STAGE_LABELS[o.stage]?.label ?? o.stage}</Pill>
    );

  return (
    <div className="stack pa-gap-sm">
      <div className="pa-chips">
        {stage}
        <strong className="pa-cell-title" style={{ fontSize: 13 }}>{o.planName ?? 'Chưa có gói'}</strong>
      </div>
      <small className="pa-cell-sub">
        {[
          o.planStatus && o.planStatus !== 'ACTIVE' ? (PLAN_STATUS[o.planStatus] ?? o.planStatus) : null,
          o.planCycle ? (PLAN_CYCLE[o.planCycle] ?? o.planCycle) : null,
          o.seatLimit ? `Tối đa ${o.seatLimit} nhân sự` : null,
          o.planRenewsAt ? `Gia hạn ${formatDate(o.planRenewsAt)}` : null,
          o.seatsPurchased + o.seatsGranted > 0 ? `${o.seatsPurchased + o.seatsGranted} suất có phí` : null,
        ]
          .filter(Boolean)
          .join(' · ') || '—'}
      </small>
    </div>
  );
}

