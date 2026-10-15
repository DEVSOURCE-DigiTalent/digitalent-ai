import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformOverview } from '@/hooks/use-platform-admin';
import type { PlatformOverview } from '@/services/platform-admin.service';
import { Box, Footer, Kpi, ListItem, LoadError, Loading, PageHead, Pill } from '../components/pulse-ui';
import { ORG_STATUS, STAGE_LABELS, auditActionLabel, auditReason, formatDate, formatDateTime, formatMoney, formatNumber } from '../components/pulse-format';

/** PA-01 · Tổng quan: the catalog version in use (the anchor), the draft, customers, trials and what needs attention. */
export function PlatformOverviewPage() {
  const { data, isLoading, error } = usePlatformOverview();

  return (
    <>
      <PageHead
        eyebrow="Quản trị nền tảng / Tổng quan"
        title="Toàn cảnh nền tảng hôm nay."
        description="Phiên bản khóa học đang dùng, khách hàng, người dùng thử và việc cần xử lý."
      />
      {isLoading && <Loading />}
      {error && <LoadError error={error} />}
      {data && (
        <>
          <div className="pa-kpis">
            <div className="surface kpi pa-kpi-anchor">
              <span>⚓ Phiên bản đang dùng</span>
              <strong>{data.currentVersionNo ? `v${data.currentVersionNo}` : '—'}</strong>
              <small>
                {data.courseCount} khóa · công bố {formatDate(data.currentVersionPublishedAt)}
              </small>
            </div>
            <Kpi
              label="Bản nháp đang soạn"
              value={data.draftVersionNo ? `v${data.draftVersionNo}` : '—'}
              hint={data.draftVersionNo ? `${data.draftNewCourseCount} khóa mới · ${data.draftEditedCourseCount} đã sửa` : 'Không có bản nháp'}
            />
            <Kpi
              label="Tổ chức"
              value={formatNumber(data.organizationCount)}
              hint={`${data.trialOrganizationCount} dùng thử · ${data.paidOrganizationCount} trả phí · ${data.suspendedOrganizationCount} tạm ngưng`}
            />
            <Kpi label="Người dùng đang dùng thử" value={formatNumber(data.trialUserCount)} hint={`${data.trialEndingSoonCount} người hết hạn trong 2 ngày`} />
            <Kpi
              label="Doanh thu suất khóa"
              value={formatMoney(data.revenue)}
              hint={`${formatNumber(data.seatsPurchased)} suất bán · ${formatNumber(data.seatsGranted)} suất cấp`}
              small
            />
          </div>

          <div className="grid-2 sideflow-layout pa-gap-top">
            <Box>
              <span className="mini-label">Việc cần xử lý</span>
              <Todos data={data} />
            </Box>
            <Box>
              <div className="pa-row-between">
                <span className="mini-label">Thao tác gần đây</span>
                <Link className="btn btn-ghost btn-small" to="/platform/audit-log">
                  Nhật ký đầy đủ →
                </Link>
              </div>
              {data.recentActivity.length === 0 ? (
                <p className="pa-empty">Chưa có thao tác nền tảng nào được ghi nhận.</p>
              ) : (
                data.recentActivity.map((a) => (
                  <ListItem
                    key={a.id}
                    title={auditActionLabel(a.action)}
                    detail={[a.entityLabel ?? a.entityType, auditReason(a.newValues), formatDateTime(a.createdAt), a.actorEmail].filter(Boolean).join(' · ')}
                  />
                ))
              )}
            </Box>
          </div>

          <div className="grid-2 sideflow-layout pa-gap-top">
            <Box>
              <div className="pa-row-between">
                <span className="mini-label">Tổ chức gần đây</span>
                <Link className="btn btn-ghost btn-small" to="/platform/organizations">
                  Tất cả tổ chức →
                </Link>
              </div>
              {data.recentOrganizations.length === 0 ? (
                <p className="pa-empty">Chưa có doanh nghiệp nào đăng ký.</p>
              ) : (
                data.recentOrganizations.map((o) => (
                  <ListItem
                    key={o.id}
                    title={<Link to={`/platform/organizations/${o.id}`}>{o.name}</Link>}
                    detail={`${o.ownerEmail ?? 'Chưa có chủ doanh nghiệp'} · ${o.employeeCount} nhân viên · tạo ${formatDate(o.createdAt)}`}
                    aside={
                      o.status === 'SUSPENDED' ? (
                        <Pill tone={ORG_STATUS.SUSPENDED.tone}>{ORG_STATUS.SUSPENDED.label}</Pill>
                      ) : (
                        <Pill tone={STAGE_LABELS[o.stage]?.tone}>{STAGE_LABELS[o.stage]?.label}</Pill>
                      )
                    }
                  />
                ))
              )}
            </Box>
            <Box>
              <span className="mini-label">Nội dung chuẩn</span>
              <ListItem
                title={<Link to="/platform/frameworks">Khung chuẩn</Link>}
                detail={`${data.frameworkCount} khung · ${data.domainCount} lĩnh vực${data.draftFrameworkCount ? ` · ${data.draftFrameworkCount} khung nháp` : ''}`}
              />
              <ListItem
                title={<Link to="/platform/versions">Khóa học trong phiên bản đang dùng</Link>}
                detail={`${data.courseCount} khóa · ${formatNumber(data.questionCount)} câu hỏi ôn tập${data.pausedCourseCount ? ` · ${data.pausedCourseCount} khóa tạm ngưng bán` : ''}`}
              />
              <ListItem
                title={<Link to="/platform/users">Người dùng</Link>}
                detail={`${formatNumber(data.userCount)} tài khoản · ${formatNumber(data.employeeCount)} nhân viên doanh nghiệp · tỷ lệ chuyển sang trả phí ${data.conversionRate}%`}
              />
            </Box>
          </div>
        </>
      )}
      <Footer />
    </>
  );
}

function Todos({ data }: { data: PlatformOverview }) {
  const items: { key: string; tag: ReactNode; text: string; to: string; action: string }[] = [];
  if (data.draftVersionNo) {
    const changed = data.draftNewCourseCount + data.draftEditedCourseCount;
    items.push({
      key: 'draft',
      tag: <span className="pill pa-pill-violet">v{data.draftVersionNo}</span>,
      text: changed
        ? `Bản nháp v${data.draftVersionNo} có ${changed} khóa thay đổi chưa công bố.`
        : `Bản nháp v${data.draftVersionNo} đang mở, chưa có khóa nào thay đổi.`,
      to: `/platform/versions/${data.draftVersionNo}`,
      action: 'Mở bản nháp',
    });
  }
  if (data.trialEndingSoonCount > 0) {
    items.push({
      key: 'trial',
      tag: <Pill>Dùng thử</Pill>,
      text: `${data.trialEndingSoonCount} người dùng thử hết hạn trong 2 ngày.`,
      to: '/platform/users?trial=ENDING_SOON',
      action: 'Xem danh sách',
    });
  }
  if (data.suspendedOrganizationCount > 0) {
    items.push({
      key: 'suspended',
      tag: <Pill tone="coral">Tạm ngưng</Pill>,
      text: `${data.suspendedOrganizationCount} tổ chức đang tạm ngưng.`,
      to: '/platform/organizations?status=SUSPENDED',
      action: 'Xem tổ chức',
    });
  }
  if (data.lockedUserCount > 0) {
    items.push({
      key: 'locked',
      tag: <Pill tone="coral">Bị khóa</Pill>,
      text: `${data.lockedUserCount} tài khoản bị khóa bởi quản trị.`,
      to: '/platform/users?status=LOCKED',
      action: 'Xem tài khoản',
    });
  }
  if (data.draftFrameworkCount > 0) {
    items.push({
      key: 'framework',
      tag: <span className="pill pa-pill-violet">Khung</span>,
      text: `${data.draftFrameworkCount} khung chuẩn còn ở bản nháp.`,
      to: '/platform/frameworks',
      action: 'Xem khung',
    });
  }
  if (data.pausedCourseCount > 0) {
    items.push({
      key: 'paused',
      tag: <Pill tone="gray">Tạm ngưng bán</Pill>,
      text: `${data.pausedCourseCount} khóa đang tạm ngưng bán.`,
      to: '/platform/commerce',
      action: 'Xem đơn giá',
    });
  }

  if (items.length === 0) return <p className="pa-empty">Không có việc tồn đọng.</p>;
  return (
    <ul className="pa-check-list">
      {items.map((item) => (
        <li key={item.key}>
          {item.tag}
          <div className="pa-row-between pa-grow">
            <span>{item.text}</span>
            <Link className="btn btn-light btn-small" to={item.to}>
              {item.action}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
