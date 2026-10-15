import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePlatformOrganizations } from '@/hooks/use-platform-admin';
import type { PlatformOrganization } from '@/services/platform-admin.service';
import { Box, Footer, LoadError, Loading, PageHead, Pager, Pill } from '../components/pulse-ui';
import { LEVEL_NAMES, ORG_STATUS, PLAN_CYCLE, PLAN_STATUS, STAGE_LABELS, formatDate } from '../components/pulse-format';

const TABS = [
  { key: 'ALL', label: 'Tất cả', filter: {} },
  { key: 'TRIAL', label: 'Dùng thử', filter: { stage: 'TRIAL', status: 'ACTIVE' } },
  { key: 'PAID', label: 'Trả phí', filter: { stage: 'PAID', status: 'ACTIVE' } },
  { key: 'SUSPENDED', label: 'Tạm ngưng', filter: { status: 'SUSPENDED' } },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** PA-05 · Tổ chức: the businesses on the platform — plan in use, courses in use by level, employees taking part, created date. */
export function PlatformOrganizationsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialTab = (TABS.find((t) => t.key === params.get('status') || t.key === params.get('stage'))?.key ?? 'ALL') as TabKey;
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const filter = TABS.find((t) => t.key === tab)!.filter;
  const { data, isLoading, error } = usePlatformOrganizations({ search, ...filter, pageIndex, pageSize: 20 });

  const chooseTab = (key: TabKey) => {
    setTab(key);
    setPageIndex(1);
    setParams(key === 'ALL' ? {} : key === 'SUSPENDED' ? { status: key } : { stage: key }, { replace: true });
  };

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Tổ chức"
        title="Doanh nghiệp đang dùng nền tảng."
        description="Gói đang dùng, khóa học nhân viên đang học theo cấp, số nhân viên tham gia và ngày tạo. Mở một tổ chức để cấp suất hoặc tạm ngưng truy cập."
      />
      <Box>
        <div className="pa-filters pa-row-between">
          <div className="pa-tabs" role="group" aria-label="Lọc tổ chức">
            {TABS.map((t) => (
              <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => chooseTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Tìm theo tên, mã hoặc email chủ doanh nghiệp"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            aria-label="Tìm tổ chức"
          />
        </div>
        {isLoading && <Loading />}
        {error && <LoadError error={error} />}
        {data && data.items.length === 0 && <p className="pa-empty">Không có tổ chức nào khớp bộ lọc.</p>}
        {data && data.items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table pa-org-table">
                <thead>
                  <tr>
                    <th>Tổ chức</th>
                    <th>Gói đang dùng</th>
                    <th>Khóa đang dùng theo cấp</th>
                    <th className="num">Nhân viên tham gia</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((o) => (
                    <tr key={o.id} className="pa-row-link" onClick={() => navigate(`/platform/organizations/${o.id}`)}>
                      <td>
                        <Link to={`/platform/organizations/${o.id}`} onClick={(e) => e.stopPropagation()}>
                          <strong className="pa-cell-title">{o.name}</strong>
                        </Link>
                        <small className="pa-cell-sub">{o.ownerEmail ?? 'Chưa có chủ doanh nghiệp'}</small>
                      </td>
                      <td>
                        <PlanCell organization={o} />
                      </td>
                      <td>
                        <div className="pa-chips">
                          {o.coursesInUseByLevel.map((n, i) => (
                            <span key={i} className={`pa-level pa-level-${i + 1}${n === 0 ? ' pa-level-zero' : ''}`}>
                              {LEVEL_NAMES[i + 1]} · {n}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="num">
                        <strong>{o.participantCount}</strong> / {o.employeeCount}
                        <small className="pa-cell-sub">nhân viên</small>
                      </td>
                      <td>{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager pageIndex={data.pageIndex} totalPages={data.totalPages} totalItems={data.totalItems} onChange={setPageIndex} />
          </>
        )}
      </Box>
      <Footer />
    </>
  );
}

function PlanCell({ organization: o }: { organization: PlatformOrganization }) {
  const stage =
    o.status === 'SUSPENDED' ? (
      <Pill tone={ORG_STATUS.SUSPENDED!.tone}>{ORG_STATUS.SUSPENDED!.label}</Pill>
    ) : (
      <Pill tone={STAGE_LABELS[o.stage]?.tone}>{STAGE_LABELS[o.stage]?.label ?? o.stage}</Pill>
    );
  return (
    <div className="stack pa-gap-sm">
      <div className="pa-chips">
        {stage}
        <strong className="pa-cell-title">{o.planName ?? 'Chưa có gói'}</strong>
      </div>
      <small className="pa-cell-sub">
        {[
          o.planStatus && o.planStatus !== 'ACTIVE' ? (PLAN_STATUS[o.planStatus] ?? o.planStatus) : null,
          o.planCycle ? (PLAN_CYCLE[o.planCycle] ?? o.planCycle) : null,
          o.seatLimit ? `tối đa ${o.seatLimit} nhân viên` : null,
          o.planRenewsAt ? `gia hạn ${formatDate(o.planRenewsAt)}` : null,
          o.seatsPurchased + o.seatsGranted > 0 ? `${o.seatsPurchased + o.seatsGranted} suất khóa có phí` : null,
        ]
          .filter(Boolean)
          .join(' · ') || '—'}
      </small>
    </div>
  );
}
