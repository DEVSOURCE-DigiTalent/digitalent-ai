import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrganizationAction, usePlatformCourses, usePlatformOrganization } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { Box, Footer, Kpi, ListItem, LoadError, Loading, PageHead, Pill, ReasonField } from '../components/pulse-ui';
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
} from '../components/pulse-format';

type SupportAction = 'grant' | 'suspend' | 'restore';

/**
 * PA-06 · Toàn cảnh tổ chức (mock `#/admin/customers`): plan, KPIs, the courses employees learn by level, one support
 * form with a required reason, people, seats and orders.
 */
export function PlatformOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePlatformOrganization(id);
  const courses = usePlatformCourses();
  const action = useOrganizationAction(id ?? '');
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_ORGANIZATION_MANAGE);

  const [kind, setKind] = useState<SupportAction>('grant');
  const [courseCode, setCourseCode] = useState('');
  const [reason, setReason] = useState('');

  const back = (
    <Link className="btn btn-outline btn-small" to="/platform/organizations">
      Tất cả tổ chức
    </Link>
  );

  if (isLoading || error || !data) {
    return (
      <>
        <PageHead eyebrow="Nền tảng / Toàn cảnh tổ chức" title="Hỗ trợ doanh nghiệp với lý do rõ ràng." actions={back} />
        {isLoading ? <Loading /> : <LoadError error={error} />}
      </>
    );
  }

  const o = data.organization;
  const suspended = o.status === 'SUSPENDED';
  const paidCourses = (courses.data ?? []).filter((c) => !c.isFree);
  const selectedCourse = courseCode || paidCourses[0]?.code || '';
  const statusPill = suspended
    ? { label: ORG_STATUS.SUSPENDED.label, tone: ORG_STATUS.SUSPENDED.tone }
    : { label: STAGE_LABELS[o.stage]?.label, tone: STAGE_LABELS[o.stage]?.tone };
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
    <>
      <PageHead
        eyebrow="Nền tảng / Toàn cảnh tổ chức"
        title="Hỗ trợ doanh nghiệp với lý do rõ ràng."
        description="Cấp suất có phí hoặc tạm ngưng truy cập sẽ tạo mục nhật ký."
        actions={<Pill tone={statusPill.tone}>{statusPill.label}</Pill>}
      />
      <div className="grid-4">
        <Kpi label="Tổ chức" value={o.name} hint={`Chủ doanh nghiệp: ${o.ownerEmail ?? 'chưa có'} · tạo ${formatDate(o.createdAt)}`} small />
        <Kpi
          label="Gói đang dùng"
          value={o.planName ?? 'Chưa có gói'}
          hint={[o.planStatus ? PLAN_STATUS[o.planStatus] ?? o.planStatus : null, o.planCycle ? PLAN_CYCLE[o.planCycle] ?? o.planCycle : null, o.seatLimit ? `tối đa ${o.seatLimit} nhân viên` : null, o.planRenewsAt ? `gia hạn ${formatDate(o.planRenewsAt)}` : null]
            .filter(Boolean)
            .join(' · ')}
          small
        />
        <Kpi label="Nhân viên tham gia" value={`${o.participantCount} / ${o.employeeCount}`} hint={`Trên ${o.departmentCount} phòng ban · ${o.managerCount} quản lý`} />
        <Kpi label="Suất có phí" value={o.seatsPurchased + o.seatsGranted} hint={`${o.seatsPurchased} đã mua / ${o.seatsGranted} quản trị cấp`} />
      </div>
      <Box className="pa-gap-top">
        <div className="pa-row-between">
          <span className="mini-label">Khóa đang dùng theo cấp</span>
          <div className="pa-chips">
            {o.coursesInUseByLevel.map((n, i) => (
              <span key={i} className={`pa-level pa-level-${i + 1}`}>
                {LEVEL_NAMES[i + 1]} · {n}
              </span>
            ))}
          </div>
        </div>
        {data.coursesInUse.length === 0 ? (
          <p className="pa-empty">Nhân viên chưa ghi danh khóa nào.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Cấp</th>
                  <th className="num">Nhân viên tham gia</th>
                  <th className="num">Đã hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                {data.coursesInUse.map((c) => (
                  <tr key={c.courseCode}>
                    <td>
                      <strong className="pa-cell-title">{c.courseTitle}</strong>
                      <small className="pa-cell-sub">{c.courseCode}</small>
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
          </div>
        )}
      </Box>
      {canManage && (
        <Box>
          <span className="mini-label">Thao tác hỗ trợ · Lý do bắt buộc</span>
          <form onSubmit={onSubmit}>
            <div className="inline-fields">
              <label className="field">
                Thao tác
                <select value={kind} onChange={(e) => setKind(e.target.value as SupportAction)}>
                  <option value="grant">Cấp một suất khóa có phí</option>
                  <option value="suspend">Tạm ngưng tổ chức</option>
                  <option value="restore">Khôi phục tổ chức</option>
                </select>
              </label>
              <label className="field">
                Khóa có phí để cấp suất
                <select value={selectedCourse} onChange={(e) => setCourseCode(e.target.value)} disabled={kind !== 'grant'}>
                  {paidCourses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.domainName} · {c.levelName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <ReasonField value={reason} onChange={setReason} />
            {kind === 'suspend' && <p className="field-hint">Khi tạm ngưng, thành viên không đăng nhập được và phiên đang mở bị kết thúc.</p>}
            {!actionAllowed && kind !== 'grant' && (
              <p className="field-hint pa-error">{suspended ? 'Tổ chức đang tạm ngưng.' : 'Tổ chức đang hoạt động, không cần khôi phục.'}</p>
            )}
            <button className="btn btn-primary" type="submit" disabled={!actionAllowed || !isReasonValid(reason) || action.isPending}>
              {action.isPending ? 'Đang ghi…' : 'Ghi nhận thao tác hỗ trợ →'}
            </button>
          </form>
        </Box>
      )}
      <Box>
        <span className="mini-label">Nhân sự tổ chức</span>
        {data.people.length === 0 ? (
          <p className="small">Chưa có nhân viên nào được mời.</p>
        ) : (
          data.people.map((p, i) => (
            <ListItem
              key={p.userId ?? `${p.fullName}-${i}`}
              title={p.userId ? <Link to={`/platform/users/${p.userId}`}>{p.fullName}</Link> : p.fullName}
              detail={[p.email ?? 'Chưa có tài khoản', [p.departmentName, p.positionName].filter(Boolean).join(' / ') || ROLE_LABELS[p.role]]
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
          ))
        )}
      </Box>
      <div className="grid-2 sideflow-layout">
        <Box>
          <span className="mini-label">Suất theo khóa</span>
          {data.seats.length === 0 ? (
            <p className="small">Doanh nghiệp đang học các khóa Cơ bản miễn phí.</p>
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
          <span className="mini-label">Đơn hàng và cấp suất</span>
          {data.orders.length === 0 ? (
            <p className="small">Khóa đã mua hoặc suất do quản trị viên cấp sẽ hiển thị ở đây.</p>
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
      <Footer />
    </>
  );
}
