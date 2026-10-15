import { Link } from 'react-router-dom';
import { usePlatformOverview } from '@/hooks/use-platform-admin';
import { Box, Footer, Kpi, ListItem, LoadError, Loading, PageHead, Pill } from '../components/pulse-ui';
import { ORG_STATUS, STAGE_LABELS, auditActionLabel, auditReason, formatDateTime, formatMoney, formatNumber } from '../components/pulse-format';

const MODULES = [
  { to: '/platform/framework', label: 'Khung chuẩn', desc: 'Duy trì chuẩn sáu lĩnh vực' },
  { to: '/platform/curriculum', label: 'Chương trình học', desc: 'Khóa học, câu hỏi và phiên bản phát hành' },
  { to: '/platform/organizations', label: 'Khách hàng', desc: 'Hỗ trợ tổ chức và quyền truy cập' },
  { to: '/platform/users', label: 'Người dùng', desc: 'Tài khoản và lịch sử hỗ trợ' },
  { to: '/platform/commerce', label: 'Đơn hàng và giá', desc: 'Quyền truy cập và giá theo mức khóa học' },
  { to: '/platform/audit-log', label: 'Nhật ký kiểm tra', desc: 'Lý do và lịch sử phiên bản' },
];

/** PA-01 · Tổng quan (mock `#/admin`), followed by the customer numbers the operating flow asks for. */
export function PlatformOverviewPage() {
  const { data, isLoading, error } = usePlatformOverview();

  return (
    <>
      <PageHead
        eyebrow="Quản trị nền tảng / Pulse"
        title="Duy trì chuẩn chung và hỗ trợ khách hàng."
        description="Việc phát hành khung, khóa học, định giá và hỗ trợ thuộc nền tảng. Doanh nghiệp chỉ xem nội dung đã công bố."
      />
      {isLoading && <Loading />}
      {error && <LoadError error={error} />}
      {data && (
        <>
          <div className="grid-3">
            <Kpi label="Khung chuẩn đã phát hành" value={`v${data.frameworkVersion}.0`} hint={data.frameworkHasDraft ? 'Có bản nháp chưa công bố' : 'Sáu lĩnh vực số'} />
            <Kpi label="Khóa học chuẩn" value={data.courseCount} hint="Sáu lĩnh vực × ba mức" />
            <Kpi label="Suất có phí đã ghi nhận" value={formatNumber(data.seatsPurchased + data.seatsGranted)} hint={`${data.seatsPurchased} đã mua · ${data.seatsGranted} quản trị cấp`} />
          </div>
          <div className="sideflow-admin-links">
            {MODULES.map((m) => (
              <Link key={m.to} to={m.to}>
                <span className="mini-label">Nền tảng</span>
                <strong>{m.label}</strong>
                <small>{m.desc}</small>
                <em>Mở ↗</em>
              </Link>
            ))}
          </div>

          <div className="section-subhead">
            <div>
              <h2>Khách hàng</h2>
              <p>Doanh nghiệp dùng thử và đã mua khóa, người dùng và các ca cần chú ý.</p>
            </div>
          </div>
          <div className="grid-4">
            <Kpi label="Doanh nghiệp" value={formatNumber(data.organizationCount)} hint={`${data.trialOrganizationCount} dùng thử · ${data.paidOrganizationCount} đã mua`} />
            <Kpi label="Tỷ lệ chuyển sang trả phí" value={`${data.conversionRate}%`} hint="Có ít nhất một suất đã mua" />
            <Kpi label="Doanh thu suất khóa" value={formatMoney(data.revenue)} hint={`${data.employeeCount} nhân viên · ${data.userCount} tài khoản`} small />
            <Kpi
              label="Cần chú ý"
              value={data.suspendedOrganizationCount + data.lockedUserCount}
              hint={`${data.suspendedOrganizationCount} tổ chức tạm ngưng · ${data.lockedUserCount} tài khoản bị khóa`}
            />
          </div>
          <div className="grid-2 sideflow-layout" style={{ marginTop: 16 }}>
            <Box>
              <span className="mini-label">Tổ chức gần đây</span>
              {data.recentOrganizations.length === 0 ? (
                <p className="small">Chưa có doanh nghiệp nào đăng ký.</p>
              ) : (
                data.recentOrganizations.map((o) => (
                  <ListItem
                    key={o.id}
                    title={<Link to={`/platform/organizations/${o.id}`}>{o.name}</Link>}
                    detail={`${o.ownerEmail ?? 'Chưa có chủ doanh nghiệp'} · ${o.employeeCount} nhân viên · ${o.departmentCount} phòng ban`}
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
              <span className="mini-label">Nhật ký gần đây</span>
              {data.recentActivity.length === 0 ? (
                <p className="small">Chưa có thao tác nền tảng nào được ghi nhận.</p>
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
        </>
      )}
      <Footer />
    </>
  );
}
