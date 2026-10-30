import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrganizationAction, usePlatformCourses, usePlatformOrganization } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { Box, ListItem, LoadError, Loading, Pill, ReasonField } from '../../components/pulse-ui';
import {
  LEVEL_NAMES,
  ORDER_KIND,
  ORG_STATUS,
  PLAN_CYCLE,
  PLAN_STATUS,
  ROLE_LABELS,
  STAGE_LABELS,
  USER_STATUS,
  errorMessage,
  formatDate,
  formatDateTime,
  formatMoney,
  isReasonValid,
} from '../../components/pulse-format';
import { ShieldAlert } from 'lucide-react';


type SupportAction = 'grant' | 'suspend' | 'restore';

interface OrganizationDetailContentProps {
  orgId: string;
  isDrawer?: boolean;
}

export function OrganizationDetailContent({ orgId, isDrawer }: OrganizationDetailContentProps) {
  const { data, isLoading, error } = usePlatformOrganization(orgId);
  const courses = usePlatformCourses();
  const action = useOrganizationAction(orgId);
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_ORGANIZATION_MANAGE);

  const [kind, setKind] = useState<SupportAction>('grant');
  const [courseCode, setCourseCode] = useState('');
  const [reason, setReason] = useState('');

  if (isLoading) return <Loading />;
  if (error || !data) return <LoadError error={error} />;

  const o = data.organization;
  const suspended = o.status === 'SUSPENDED';
  const paidCourses = (courses.data ?? []).filter((c) => !c.isFree);
  const selectedCourse = courseCode || paidCourses[0]?.code || '';
  const actionAllowed = kind === 'grant' ? Boolean(selectedCourse) : kind === 'suspend' ? !suspended : suspended;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload =
      kind === 'grant'
        ? ({ kind, courseCode: selectedCourse, seats: 1, reason: reason.trim() } as const)
        : ({ kind, reason: reason.trim() } as const);

    action.mutate(payload, {
      onSuccess: () => {
        setReason('');
        toast.success(
          kind === 'grant' ? `Đã cấp một suất cho ${o.name}` : kind === 'suspend' ? `Đã tạm ngưng ${o.name}` : `Đã khôi phục ${o.name}`,
        );
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isDrawer ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
        <div className="pa-bento-card" style={{ padding: 14, minHeight: 'auto' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Gói thuê bao</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{o.planName ?? 'Chưa có gói'}</div>
          <small style={{ fontSize: 11, color: '#64748b' }}>
            {[
              o.planStatus ? PLAN_STATUS[o.planStatus] ?? o.planStatus : null,
              o.planCycle ? PLAN_CYCLE[o.planCycle] ?? o.planCycle : null,
              o.seatLimit ? `Tối đa ${o.seatLimit} nhân viên` : null,
            ].filter(Boolean).join(' · ')}
          </small>
        </div>

        <div className="pa-bento-card" style={{ padding: 14, minHeight: 'auto' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Quy mô nhân sự</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
            {o.participantCount} / {o.employeeCount} <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>tham gia</span>
          </div>
          <small style={{ fontSize: 11, color: '#64748b' }}>
            {o.departmentCount} phòng ban · {o.managerCount} quản lý
          </small>
        </div>

        <div className="pa-bento-card" style={{ padding: 14, minHeight: 'auto' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Suất khóa có phí</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
            {o.seatsPurchased + o.seatsGranted} <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>suất</span>
          </div>
          <small style={{ fontSize: 11, color: '#64748b' }}>
            {o.seatsPurchased} đã mua · {o.seatsGranted} cấp quyền
          </small>
        </div>

        <div className="pa-bento-card" style={{ padding: 14, minHeight: 'auto' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Trạng thái</span>
          <div style={{ margin: '4px 0' }}>
            {suspended ? (
              <Pill tone={ORG_STATUS.SUSPENDED.tone}>{ORG_STATUS.SUSPENDED.label}</Pill>
            ) : (
              <Pill tone={STAGE_LABELS[o.stage]?.tone}>{STAGE_LABELS[o.stage]?.label ?? 'Đang hoạt động'}</Pill>
            )}
          </div>
          <small style={{ fontSize: 11, color: '#64748b' }}>
            Tạo ngày {formatDate(o.createdAt)}
          </small>
        </div>
      </div>

      {/* Courses In Use */}
      <Box>
        <div className="pa-row-between" style={{ marginBottom: 12 }}>
          <span className="mini-label" style={{ margin: 0 }}>Khóa học đang học theo cấp</span>
          <div className="pa-chips">
            {o.coursesInUseByLevel.map((n, i) => (
              <span key={i} className={`pa-level pa-level-${i + 1}`}>
                {LEVEL_NAMES[i + 1]} · {n}
              </span>
            ))}
          </div>
        </div>
        {data.coursesInUse.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
            Nhân viên chưa ghi danh khóa học nào.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Cấp</th>
                <th className="num">Tham gia</th>
                <th className="num">Hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {data.coursesInUse.map((c) => (
                <tr key={c.courseCode}>
                  <td>
                    <strong className="pa-cell-title">{c.courseTitle}</strong>
                  </td>
                  <td>
                    <span className={`pa-level pa-level-${c.level}`}>{c.levelName}</span>
                  </td>
                  <td className="num">{c.participants}</td>
                  <td className="num">{c.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>

      {/* Support Actions (Grant Seats / Suspend) */}
      {canManage && (
        <div className="surface pad" style={{ border: '1px solid #fed7aa', background: '#fffdfa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldAlert size={17} style={{ color: '#d97706' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              Thao tác vận hành & Hỗ trợ (Ghi rõ lý do kiểm toán)
            </span>
          </div>

          <form onSubmit={onSubmit}>
            <div className="inline-fields" style={{ marginBottom: 12 }}>
              <label className="field">
                Thao tác
                <select value={kind} onChange={(e) => setKind(e.target.value as SupportAction)}>
                  <option value="grant">Cấp 1 suất khóa nâng cao</option>
                  <option value="suspend">Tạm ngưng tổ chức</option>
                  <option value="restore">Khôi phục tổ chức</option>
                </select>
              </label>

              {kind === 'grant' && (
                <label className="field">
                  Khóa có phí để cấp suất
                  <select value={selectedCourse} onChange={(e) => setCourseCode(e.target.value)}>
                    {paidCourses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.domainName} · {c.levelName}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <ReasonField value={reason} onChange={setReason} />

            {kind === 'suspend' && (
              <p style={{ fontSize: 11, color: '#e11d48', margin: '4px 0 10px' }}>
                Khi tạm ngưng, tất cả nhân viên của tổ chức sẽ bị chặn đăng nhập và phiên làm việc bị ngắt ngay lập tức.
              </p>
            )}

            {!actionAllowed && kind !== 'grant' && (
              <p style={{ fontSize: 11, color: '#e11d48', margin: '4px 0 10px' }}>
                {suspended ? 'Tổ chức đã ở trạng thái tạm ngưng.' : 'Tổ chức đang hoạt động bình thường, không cần khôi phục.'}
              </p>
            )}

            <button
              className="btn btn-primary btn-small"
              type="submit"
              disabled={!actionAllowed || !isReasonValid(reason) || action.isPending}
              style={{ marginTop: 8 }}
            >
              {action.isPending ? 'Đang ghi nhận…' : 'Xác nhận thao tác hỗ trợ →'}
            </button>
          </form>
        </div>
      )}

      {/* Organization People */}
      <Box>
        <span className="mini-label" style={{ marginBottom: 12 }}>Đội ngũ nhân sự ({data.people.length})</span>
        {data.people.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
            Chưa có nhân viên nào được mời vào tổ chức.
          </p>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {data.people.map((p, i) => (
              <ListItem
                key={p.userId ?? `${p.fullName}-${i}`}
                title={p.userId ? <Link to={`/platform/users/${p.userId}`}>{p.fullName}</Link> : p.fullName}
                detail={[p.email ?? 'Chưa có email', [p.departmentName, p.positionName].filter(Boolean).join(' / ') || ROLE_LABELS[p.role]]
                  .filter(Boolean)
                  .join(' · ')}
                aside={
                  p.status === 'ACTIVE' ? (
                    <Pill tone="gray">{ROLE_LABELS[p.role] ?? p.role}</Pill>
                  ) : (
                    <Pill tone={USER_STATUS[p.status]?.tone}>{USER_STATUS[p.status]?.label ?? p.status}</Pill>
                  )
                }
              />
            ))}
          </div>
        )}
      </Box>

      {/* Seats & Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: isDrawer ? '1fr' : '1fr 1fr', gap: 16 }}>
        <Box>
          <span className="mini-label">Suất khóa theo nội dung</span>
          {data.seats.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 12, padding: '8px 0' }}>Doanh nghiệp đang học các khóa Cơ bản miễn phí.</p>
          ) : (
            data.seats.map((s) => (
              <ListItem
                key={s.courseCode}
                title={s.courseTitle}
                detail={`${s.seatsPurchased} đã mua · ${s.seatsGranted} quản trị cấp`}
                aside={<Pill>{s.seatsPurchased + s.seatsGranted} suất</Pill>}
              />
            ))
          )}
        </Box>

        <Box>
          <span className="mini-label">Lịch sử đơn hàng & cấp quyền</span>
          {data.orders.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 12, padding: '8px 0' }}>Chưa có đơn hàng hoặc cấp quyền nào.</p>
          ) : (
            data.orders.map((order) => (
              <ListItem
                key={order.id}
                title={order.courseTitle}
                detail={[ORDER_KIND[order.kind]?.label, formatDateTime(order.createdAt), order.reason, order.totalAmount > 0 ? formatMoney(order.totalAmount) : null]
                  .filter(Boolean)
                  .join(' · ')}
                aside={<Pill tone={ORDER_KIND[order.kind]?.tone}>{order.seats} suất</Pill>}
              />
            ))
          )}
        </Box>
      </div>
    </div>
  );
}
