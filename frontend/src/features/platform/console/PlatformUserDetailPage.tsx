import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformUser, useUserLockAction } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { Box, Footer, ListItem, LoadError, Loading, PageHead, Pill, ReasonField } from '../components/pulse-ui';
import { ROLE_LABELS, USER_STATUS, auditActionLabel, auditReason, errorMessage, formatDateTime, isReasonValid } from '../components/pulse-format';

/** PA-08 · Chi tiết người dùng (mock `#/admin/users/<id>`): identity and scope, then a support action with a reason. */
export function PlatformUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePlatformUser(id);
  const lockAction = useUserLockAction(id ?? '');
  const { can, user: me } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_USER_MANAGE);
  const [reason, setReason] = useState('');

  const back = (
    <Link className="btn btn-outline" to="/platform/users">
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
  const locked = u.status === 'LOCKED';
  const lockable = locked || (u.role !== 'PLATFORM_ADMIN' && u.email !== me?.email && u.status !== 'INACTIVE');
  const scope = [u.organizationName ?? (u.role === 'PLATFORM_ADMIN' ? 'DigiTalent' : 'Tài khoản cá nhân'), [u.departmentName, u.positionName].filter(Boolean).join(' / ')]
    .filter(Boolean)
    .join(' · ');
  const statusText = [
    u.status === 'ACTIVE'
      ? 'Đăng nhập được'
      : u.status === 'INACTIVE'
        ? 'Đã vô hiệu hóa'
        : u.isManuallyLocked
          ? 'Quản trị nền tảng đã khóa'
          : `Khóa tạm do nhập sai mật khẩu, tự mở lúc ${formatDateTime(u.lockedUntil)}`,
    data.organizationStatus === 'SUSPENDED' ? 'tổ chức đang tạm ngưng nên không đăng nhập được' : null,
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
          toast.success(locked ? `Đã mở khóa ${u.email}` : `Đã khóa ${u.email}`);
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Chi tiết người dùng"
        title={u.displayName}
        description="Xem vai trò, phạm vi và lịch sử gần đây trước khi thực hiện thao tác hỗ trợ tài khoản."
        actions={back}
      />
      <div className="grid-2 sideflow-layout">
        <Box>
          <span className="mini-label">Danh tính và phạm vi</span>
          <h2 className="panel-title">{ROLE_LABELS[u.role] ?? u.role}</h2>
          <ListItem title="Email" detail={u.email} />
          <ListItem
            title="Phạm vi"
            detail={u.organizationId ? <Link to={`/platform/organizations/${u.organizationId}`}>{scope}</Link> : scope}
          />
          <ListItem title="Trạng thái" detail={statusText} aside={<Pill tone={USER_STATUS[u.status]?.tone}>{USER_STATUS[u.status]?.label}</Pill>} />
          <ListItem title="Đăng nhập gần nhất" detail={formatDateTime(u.lastLoginAt)} />
          <ListItem title="Tạo tài khoản" detail={formatDateTime(u.createdAt)} />
        </Box>
        <Box>
          <span className="mini-label">Thao tác hỗ trợ</span>
          <h2 className="panel-title">Ghi rõ lý do.</h2>
          {!canManage ? (
            <p className="field-hint">Bạn chỉ có quyền xem tài khoản này.</p>
          ) : !lockable ? (
            <p className="field-hint">Không khóa tài khoản quản trị nền tảng, tài khoản của chính bạn hoặc tài khoản đã vô hiệu hóa tại đây.</p>
          ) : (
            <form onSubmit={onSubmit}>
              <label className="field">
                Thao tác
                <select value={locked ? 'unlock' : 'lock'} disabled>
                  <option value="lock">Khóa truy cập tài khoản</option>
                  <option value="unlock">Mở khóa truy cập tài khoản</option>
                </select>
              </label>
              <ReasonField value={reason} onChange={setReason} placeholder="Vì sao cần thao tác này?" />
              <button className="btn btn-primary" type="submit" disabled={!isReasonValid(reason) || lockAction.isPending}>
                {lockAction.isPending ? 'Đang ghi…' : locked ? 'Mở khóa tài khoản →' : 'Khóa tài khoản →'}
              </button>
            </form>
          )}
          <p className="field-hint">Khóa sẽ kết thúc phiên đang mở và chặn đăng nhập cho tới khi được mở khóa.</p>
          <div className="divider" />
          <span className="mini-label">Lịch sử hỗ trợ</span>
          {data.supportHistory.length === 0 ? (
            <p className="small">Chưa có thao tác hỗ trợ nào với tài khoản này.</p>
          ) : (
            data.supportHistory.map((h, i) => (
              <ListItem
                key={`${h.createdAt}-${i}`}
                title={auditActionLabel(h.action)}
                detail={[auditReason(h.newValues), formatDateTime(h.createdAt), h.actorEmail].filter(Boolean).join(' · ')}
              />
            ))
          )}
        </Box>
      </div>
      <Footer />
    </>
  );
}
