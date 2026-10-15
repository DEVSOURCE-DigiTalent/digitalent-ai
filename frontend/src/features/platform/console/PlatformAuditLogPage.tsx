import { useState } from 'react';
import { usePlatformAuditLogs } from '@/hooks/use-platform-admin';
import { Box, Footer, ListItem, LoadError, Loading, PageHead, Pager } from '../components/pulse-ui';
import { AUDIT_ACTIONS, auditActionLabel, auditReason, formatDateTime } from '../components/pulse-format';

/** PA-10 · Nhật ký kiểm tra (mock `#/admin/audit`): who did what, when, and why. */
export function PlatformAuditLogPage() {
  const [scope, setScope] = useState<'platform' | 'all'>('platform');
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const { data, isLoading, error } = usePlatformAuditLogs({ scope, action, search, pageIndex, pageSize: 25 });

  const filter = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPageIndex(1);
  };

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Nhật ký"
        title="Mỗi thao tác nhạy cảm đều có lý do."
        description="Các lần phát hành khung và khóa học, tạm ngưng hoặc khôi phục tổ chức, cấp suất học và khóa tài khoản được ghi tại đây."
      />
      <Box>
        <div className="pa-filters">
          <input
            type="search"
            placeholder="Tìm theo đối tượng hoặc email người làm"
            value={search}
            onChange={(e) => filter(setSearch)(e.target.value)}
            aria-label="Tìm trong nhật ký"
          />
          <select value={action} onChange={(e) => filter(setAction)(e.target.value)} aria-label="Loại thao tác">
            <option value="">Mọi thao tác</option>
            {Object.entries(AUDIT_ACTIONS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
          <select value={scope} onChange={(e) => filter(setScope)(e.target.value as 'platform' | 'all')} aria-label="Phạm vi">
            <option value="platform">Thao tác của nền tảng</option>
            <option value="all">Mọi tổ chức</option>
          </select>
        </div>
        {isLoading && <Loading />}
        {error && <LoadError error={error} />}
        {data && data.items.length === 0 && <p className="small">Chưa có thao tác nền tảng nào được ghi nhận.</p>}
        {data &&
          data.items.map((log) => (
            <ListItem
              key={log.id}
              title={auditActionLabel(log.action)}
              detail={[log.entityLabel ?? log.entityType, auditReason(log.newValues), log.organizationName, formatDateTime(log.createdAt), log.actorEmail ?? 'Hệ thống']
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        {data && <Pager pageIndex={data.pageIndex} totalPages={data.totalPages} totalItems={data.totalItems} onChange={setPageIndex} />}
      </Box>
      <Footer />
    </>
  );
}
