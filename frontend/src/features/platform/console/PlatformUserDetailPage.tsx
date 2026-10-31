import { Link, useParams } from 'react-router-dom';
import { usePlatformUser } from '@/hooks/use-platform-admin';
import { Box, Footer, ListItem, LoadError, Loading, PageHead, Pill } from '../components/pulse-ui';
import { USER_STATUS, auditActionLabel, auditReason, formatDateTime } from '../components/pulse-format';
import { UserDetailContent } from './components/UserDetailContent';
import { ArrowLeft, History } from 'lucide-react';

/** PA-08 · Chi tiết người dùng: standalone view with UserDetailContent and full audit history. */
export function PlatformUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePlatformUser(id);

  const back = (
    <Link className="btn btn-outline btn-small" to="/platform/users">
      <ArrowLeft size={14} style={{ marginRight: 4 }} />
      Tất cả người dùng
    </Link>
  );

  if (isLoading || error || !data) {
    return (
      <>
        <PageHead eyebrow="Nền tảng / Chi tiết người dùng" title="Người dùng" actions={back} />
        {isLoading ? <Loading /> : <LoadError error={error} />}
      </>
    );
  }

  const u = data.user;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
            Quản trị nền tảng / Hồ sơ người dùng
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 4px' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
              {u.displayName}
            </h1>
            <Pill tone={USER_STATUS[u.status]?.tone}>{USER_STATUS[u.status]?.label ?? u.status}</Pill>
          </div>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            {u.email} · Xem chi tiết phân quyền, phạm vi đơn vị và thực hiện thao tác khóa/mở khóa tài khoản có kiểm toán.
          </p>
        </div>

        {back}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 20 }}>
        <div>
          {id && <UserDetailContent userId={id} />}
        </div>

        <div>
          <Box>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <History size={16} style={{ color: '#d97706' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Lịch sử hỗ trợ & Thao tác kiểm toán</span>
            </div>

            {data.supportHistory.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                Chưa có thao tác hỗ trợ nào được ghi nhận cho tài khoản này.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.supportHistory.map((h, i) => (
                  <ListItem
                    key={`${h.createdAt}-${i}`}
                    title={auditActionLabel(h.action)}
                    detail={[auditReason(h.newValues), formatDateTime(h.createdAt), h.actorEmail].filter(Boolean).join(' · ')}
                  />
                ))}
              </div>
            )}
          </Box>
        </div>
      </div>

      <Footer />
    </>
  );
}

