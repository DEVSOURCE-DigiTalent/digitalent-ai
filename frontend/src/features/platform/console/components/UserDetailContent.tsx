import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformUser, useUserLockAction } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { Box, ListItem, LoadError, Loading, Pill, ReasonField } from '../../components/pulse-ui';
import {
  ROLE_LABELS,
  USER_STATUS,
  PERSONAL_PLANS,
  daysUntil,
  errorMessage,
  formatDate,
  formatDateTime,
  isReasonValid,
} from '../../components/pulse-format';
import { ShieldAlert, Clock } from 'lucide-react';

interface UserDetailContentProps {
  userId: string;
  isDrawer?: boolean;
}

export function UserDetailContent({ userId }: UserDetailContentProps) {
  const { data, isLoading, error } = usePlatformUser(userId);
  const lockAction = useUserLockAction(userId);
  const { can, user: me } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_USER_MANAGE);
  const [reason, setReason] = useState('');

  if (isLoading) return <Loading />;
  if (error || !data) return <LoadError error={error} />;

  const u = data.user;
  const locked = u.status === 'LOCKED';
  const lockable = locked || (u.role !== 'PLATFORM_ADMIN' && u.email !== me?.email && u.status !== 'INACTIVE');
  const scope = [
    u.organizationName ?? (u.role === 'PLATFORM_ADMIN' ? 'DigiTalent' : 'Tài khoản cá nhân'),
    [u.departmentName, u.positionName].filter(Boolean).join(' / '),
  ]
    .filter(Boolean)
    .join(' · ');

  const statusText = [
    u.status === 'ACTIVE'
      ? 'Đang hoạt động bình thường'
      : u.status === 'INACTIVE'
        ? 'Đã vô hiệu hóa'
        : u.isManuallyLocked
          ? 'Quản trị viên đã khóa tài khoản'
          : `Khóa tạm do nhập sai mật khẩu, tự mở lúc ${formatDateTime(u.lockedUntil)}`,
    data.organizationStatus === 'SUSPENDED' ? 'Tổ chức trực thuộc đang tạm ngưng' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    lockAction.mutate(
      { lock: !locked, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('');
          toast.success(locked ? `Đã mở khóa tài khoản ${u.email}` : `Đã khóa tài khoản ${u.email}`);
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* User Summary Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 18,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#0f172a',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {u.displayName.slice(0, 2).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{u.displayName}</h4>
            <Pill tone={USER_STATUS[u.status]?.tone}>{USER_STATUS[u.status]?.label ?? u.status}</Pill>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{u.email}</div>
          <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600, marginTop: 4 }}>
            {ROLE_LABELS[u.role] ?? u.role}
          </div>
        </div>
      </div>

      {/* Trial / Subscription State */}
      {u.planCode && (
        <div
          style={{
            padding: 14,
            background: u.trialState === 'ACTIVE' ? '#fffdfa' : '#f8fafc',
            border: `1px solid ${u.trialState === 'ACTIVE' ? '#fed7aa' : '#e2e8f0'}`,
            borderRadius: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Clock size={16} style={{ color: '#d97706' }} />
            <strong style={{ fontSize: 13, color: '#0f172a' }}>Gói dịch vụ & Dùng thử cá nhân</strong>
          </div>
          <div style={{ fontSize: 13, color: '#334155' }}>
            Gói: <strong>{PERSONAL_PLANS[u.planCode] ?? u.planCode}</strong>
          </div>
          {u.trialState === 'ACTIVE' && (
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 4 }}>
              Đang trong thời gian dùng thử Plus 7 ngày · Hết hạn vào <strong>{formatDate(u.trialEndsAt)}</strong> (còn {daysUntil(u.trialEndsAt)} ngày)
            </div>
          )}
          {u.trialState === 'ENDED' && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Đã hết hạn dùng thử vào ngày {formatDate(u.trialEndsAt)}, hiện đang sử dụng gói Miễn phí.
            </div>
          )}
        </div>
      )}

      {/* Scope and Details */}
      <Box>
        <span className="mini-label" style={{ marginBottom: 10 }}>Phạm vi & Lịch sử hoạt động</span>
        <ListItem
          title="Tổ chức / Đơn vị"
          detail={
            u.organizationId ? (
              <Link to={`/platform/organizations/${u.organizationId}`}>{scope}</Link>
            ) : (
              scope
            )
          }
        />
        <ListItem title="Trạng thái tài khoản" detail={statusText} />
        <ListItem title="Lần đăng nhập gần nhất" detail={formatDateTime(u.lastLoginAt)} />
        <ListItem title="Ngày tạo tài khoản" detail={formatDateTime(u.createdAt)} />
      </Box>

      {/* Support Actions: Lock / Unlock */}
      {canManage && (
        <div className="surface pad" style={{ border: '1px solid #fed7aa', background: '#fffdfa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldAlert size={17} style={{ color: '#d97706' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              Thao tác bảo mật tài khoản (Ghi rõ lý do kiểm toán)
            </span>
          </div>

          {!lockable ? (
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              Không thể khóa tài khoản Quản trị nền tảng, tài khoản của chính bạn hoặc tài khoản đã vô hiệu hóa.
            </p>
          ) : (
            <form onSubmit={onSubmit}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  Hành động:{' '}
                  {locked ? (
                    <span style={{ color: '#15803d' }}>Mở khóa truy cập tài khoản</span>
                  ) : (
                    <span style={{ color: '#b91c1c' }}>Khóa truy cập tài khoản</span>
                  )}
                </span>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 10px' }}>
                  {locked
                    ? 'Mở khóa sẽ cho phép người dùng đăng nhập lại vào hệ thống ngay lập tức.'
                    : 'Khi bị khóa, người dùng sẽ không thể đăng nhập và mọi phiên làm việc đang mở bị hủy.'}
                </p>
              </div>

              <ReasonField value={reason} onChange={setReason} />

              <button
                className={`btn btn-small ${locked ? 'btn-primary' : 'btn-outline'}`}
                type="submit"
                disabled={!isReasonValid(reason) || lockAction.isPending}
                style={{ marginTop: 8 }}
              >
                {lockAction.isPending ? 'Đang xử lý…' : locked ? 'Mở khóa tài khoản →' : 'Khóa tài khoản này →'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
