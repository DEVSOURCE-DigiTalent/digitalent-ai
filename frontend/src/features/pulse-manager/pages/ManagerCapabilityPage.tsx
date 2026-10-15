import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useManagedDepartment } from '@/hooks/use-managed-department';
import { useEmployeeCapability, useWorkforce } from '@/hooks/use-workforce';
import { BLOCKER_LABELS } from '@/services/workforce.service';
import { Bar, Empty, LoadError, Mini, PageHead, PageSkeleton, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { levelName } from '@/features/pulse-employee/lib/labels';
import { ManagerPage, NoDepartment } from '../components/ManagerUi';
import { buildCapability, type LevelStatus } from '../lib/capability';
import { MANAGER_PATHS } from '../lib/paths';

const STATUS_PILL: Record<LevelStatus, { label: (gap: number) => string; tone: 'green' | 'coral' | 'gray' }> = {
  MET: { label: () => 'Đạt mục tiêu', tone: 'green' },
  GAP: { label: (gap) => `Còn ${gap} mức`, tone: 'coral' },
  PENDING: { label: () => 'Chưa xác nhận mức', tone: 'gray' },
  OUTSIDE_PATH: { label: () => 'Ngoài lộ trình', tone: 'gray' },
};

const level = (value: number | null | undefined) => (value && value > 0 ? `L${value}` : 'Đang chờ');

/**
 * MG-05 · Năng lực đội ngũ (mock `#/gap`): mức hiện tại đã xác nhận bên cạnh mục tiêu vị trí, theo từng nhân viên
 * trong phòng ban. Năng lực chưa đo hiển thị "Chưa xác nhận mức" và không bị tính là khoảng trống.
 */
export function ManagerCapabilityPage() {
  const { department, isLoading: deptLoading, isError: deptError, refetch: refetchDept } = useManagedDepartment();
  const team = useWorkforce({ departmentId: department?.id, pageIndex: 1, pageSize: 100 }, Boolean(department));
  const people = (team.data?.items ?? []).filter((row) => !row.departmentId || row.departmentId === department?.id);
  const [picked, setPicked] = useState<string>();
  const selectedId = people.some((p) => p.id === picked) ? picked : people[0]?.id;
  const selected = people.find((p) => p.id === selectedId);
  const capability = useEmployeeCapability(selectedId);

  if (deptLoading || (department && team.isLoading)) {
    return <ManagerPage><PageSkeleton blocks={[120, 110, 230, 420]} /></ManagerPage>;
  }
  if (deptError || team.isError) {
    return (
      <ManagerPage>
        <LoadError
          message="Không tải được nhân sự của phòng ban."
          onRetry={() => (deptError ? refetchDept() : team.refetch())}
        />
      </ManagerPage>
    );
  }
  if (!department) {
    return <ManagerPage><PageHead eyebrow="Năng lực đội ngũ" title="Xem tiến độ đã xác nhận bên cạnh mục tiêu." /><NoDepartment /></ManagerPage>;
  }

  const { domains, summary } = buildCapability(capability.data?.competencies ?? []);
  const measuredPeople = people.filter((p) => p.hasSnapshot).length;
  const recommendation = capability.data?.recommendations?.[0];

  return (
    <ManagerPage testId="manager-capability">
      <PageHead
        eyebrow={`Năng lực đội ngũ · ${department.name}`}
        title="Xem tiến độ đã xác nhận bên cạnh mục tiêu."
        description="Mức đầu vào, năng lực đã xác nhận và mục tiêu vị trí luôn hiển thị cùng nhau. Chỉ nhân viên phòng ban của bạn."
        actions={<Pill>{measuredPeople}/{people.length} nhân viên đã đo</Pill>}
      />

      {people.length === 0 ? (
        <Empty icon={<BarChart3 size={24} />} title="Phòng ban chưa có nhân viên.">
          Khi chủ doanh nghiệp xếp nhân viên vào phòng {department.name}, năng lực của họ sẽ hiển thị ở đây.
        </Empty>
      ) : (
        <>
          <section className="pm-summary" aria-label="Tóm tắt năng lực của nhân viên đang xem">
            <div>
              <span>Mức hiện tại đã xác nhận</span>
              <div><strong>{capability.isSuccess ? summary.measured : '—'}</strong><small>/ {capability.isSuccess ? summary.targets : '—'} năng lực đã xác nhận</small></div>
            </div>
            <div className="warm">
              <span>Khoảng cách đã xác nhận</span>
              <div><strong>{capability.isSuccess ? summary.gaps : '—'}</strong><small>chỉ tính năng lực đã đo</small></div>
            </div>
            <div>
              <span>Mục tiêu vị trí</span>
              <div><strong>{capability.isSuccess ? summary.targets : '—'}</strong><small>năng lực vị trí yêu cầu</small></div>
            </div>
          </section>

          <div className="pm-picker">
            <section className="pm-panel">
              <Mini>Chọn một nhân viên</Mini>
              <label className="pu-field">
                Nhân sự
                <select value={selectedId} onChange={(e) => setPicked(e.target.value)}>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}{p.jobPositionName ? ` · ${p.jobPositionName}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              {selected && (
                <div className="pm-person">
                  <strong>{selected.jobPositionName ?? 'Chưa gán vị trí'} / {department.name}</strong>
                  <small>Mục tiêu vị trí ≤ Trần phòng ban ≤ Trần doanh nghiệp ≤ Digital AI</small>
                  <div style={{ marginTop: 12 }}>
                    <Bar
                      value={selected.coveragePercent ?? 0}
                      label={`Độ phủ mục tiêu ${Math.round(selected.coveragePercent ?? 0)}%`}
                    />
                  </div>
                  <small>
                    {selected.hasSnapshot
                      ? `Độ phủ mục tiêu ${Math.round(selected.coveragePercent ?? 0)}%`
                      : selected.blocker
                        ? BLOCKER_LABELS[selected.blocker] ?? 'Chưa có bản đo năng lực'
                        : 'Chưa có bản đo năng lực'}
                  </small>
                </div>
              )}
              {selected && (
                <div className="pu-row" style={{ marginTop: 14 }}>
                  <PuLink to={MANAGER_PATHS.member(selected.id)} kind="outline" small>Hồ sơ nhân viên</PuLink>
                  <PuLink to={MANAGER_PATHS.matrix} kind="ghost" small>Ma trận năng lực nhóm</PuLink>
                </div>
              )}
            </section>

            <section className="pm-panel">
              <Mini>Khóa học tiếp theo được đề xuất</Mini>
              {capability.isLoading ? (
                <PageSkeleton blocks={[120]} />
              ) : recommendation ? (
                <>
                  <h2 className="pu-panel-title">{recommendation.title}</h2>
                  <p className="pu-panel-desc">
                    Đề xuất dựa trên khoảng cách đã xác nhận
                    {recommendation.reasons[0] ? ` ở ${recommendation.reasons[0].competencyName}` : ''}. Hoàn thành khóa học không tự
                    thay đổi mức năng lực — mức chỉ đổi khi bài cuối khóa hoặc minh chứng được duyệt.
                  </p>
                  <PuLink to={MANAGER_PATHS.training} small>Xem tiến độ đào tạo →</PuLink>
                </>
              ) : (
                <p className="pu-panel-desc" style={{ marginTop: 10 }}>
                  Chưa có đề xuất. Đề xuất chỉ xuất hiện khi nhân viên đã có khoảng cách được xác nhận; năng lực chưa đo vẫn đang chờ.
                </p>
              )}
            </section>
          </div>

          <section className="pm-panel" aria-labelledby="pm-current-title">
            <div className="pm-panel-head">
              <div>
                <h2 id="pm-current-title">Hiện tại → mục tiêu vị trí</h2>
                <p>Từng năng lực của {selected?.fullName ?? 'nhân viên'}, nhóm theo sáu lĩnh vực.</p>
              </div>
              {capability.isSuccess && <Pill tone={summary.pending > 0 ? 'gray' : 'green'}>{summary.pending > 0 ? `${summary.pending} năng lực đang chờ đo` : 'Đã đo đủ'}</Pill>}
            </div>
            {capability.isLoading ? (
              <PageSkeleton blocks={[60, 60, 60, 60]} />
            ) : capability.isError ? (
              <LoadError message="Không tải được hồ sơ năng lực của nhân viên này." onRetry={() => capability.refetch()} />
            ) : domains.length === 0 ? (
              <p className="pu-panel-desc">
                Vị trí của nhân viên chưa có bộ yêu cầu năng lực đang áp dụng, nên chưa có mục tiêu để so sánh.
              </p>
            ) : (
              <>
                {domains.map((domain) => (
                  <div key={domain.name} className="pm-domain">
                    <div className="pm-domain-head">
                      <h3>{domain.name}</h3>
                      <small>{domain.rows.filter((r) => r.status === 'GAP').length} khoảng cách đã xác nhận</small>
                    </div>
                    {domain.rows.map((row) => {
                      const pill = STATUS_PILL[row.status];
                      return (
                        <div key={row.competencyId} className="pm-level-row">
                          <div>
                            <strong>{row.frameworkCode} · {row.name}</strong>
                            <small>{row.confirmedAt ? `Xác nhận ${new Date(row.confirmedAt).toLocaleDateString('vi-VN')}` : 'Chưa có minh chứng xác nhận'}</small>
                          </div>
                          <div
                            className="pm-levels"
                            aria-label={`Hiện tại ${levelName(row.currentLevel)}, mục tiêu ${row.requiredLevel > 0 ? levelName(row.requiredLevel) : 'không yêu cầu'}`}
                          >
                            Hiện tại <b className={row.status === 'PENDING' ? 'pending' : undefined}>{level(row.currentLevel)}</b>
                            → Mục tiêu{' '}
                            {row.requiredLevel > 0 ? <b className="target">{level(row.requiredLevel)}</b> : <b className="pending">—</b>}
                          </div>
                          <Pill tone={pill.tone}>{pill.label(Math.max(0, row.requiredLevel - (row.currentLevel ?? 0)))}</Pill>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div className="pm-legend">
                  <span>Mức hiện tại đã xác nhận</span>
                  <span className="target">Mục tiêu vị trí</span>
                  <span className="pending">Chưa xác nhận / ngoài lộ trình</span>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </ManagerPage>
  );
}
