import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useCapabilityCeilings,
  useUpdateDepartmentCeilings,
  useUpdateOrganizationCeilings,
} from '@/hooks/use-capability-ceilings';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { formatDateTime } from '@/lib/utils';
import type { CapabilityCeilings, CeilingDomain } from '@/services/capability-ceiling.service';
import './capability-ceiling.css';

/** Phạm vi đang xem: cả doanh nghiệp hoặc id của một phòng ban. */
const ALL = 'all';

type Levels = Record<string, number>;

const sumLevels = (levels: Levels) => Object.values(levels).reduce((sum, level) => sum + level, 0);
const sameLevels = (a: Levels, b: Levels) => Object.keys(a).every((key) => a[key] === b[key]);

function organizationLevels(matrix: CapabilityCeilings): Levels {
  return Object.fromEntries(matrix.domains.map((d) => [d.categoryId, d.organizationCeiling]));
}

function departmentLevels(matrix: CapabilityCeilings, departmentId: string): Levels {
  const department = matrix.departments.find((d) => d.departmentId === departmentId);
  return Object.fromEntries((department?.ceilings ?? []).map((c) => [c.categoryId, c.level]));
}

/**
 * "Lý thuyết trần nhà" (OW-05): ma trận 6 năng lực × 3 cấp = 18 khóa là trần Digital AI; doanh nghiệp chọn trần
 * cho từng năng lực, phòng ban có thể đặt trần riêng (≤ trần doanh nghiệp). Các ô dưới trần là lộ trình.
 * Bấm vào một ô để đặt trần đến cấp đó (bấm lại ô trên cùng để hạ một cấp), rồi lưu.
 */
export function CapabilityCeilingMatrix() {
  const { data: matrix, isLoading, isError } = useCapabilityCeilings();
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE);
  const saveOrganization = useUpdateOrganizationCeilings();
  const saveDepartment = useUpdateDepartmentCeilings();
  const [scope, setScope] = useState<string>(ALL);
  /** Bản nháp chưa lưu theo phạm vi. */
  const [drafts, setDrafts] = useState<Record<string, Levels>>({});

  const department = matrix?.departments.find((d) => d.departmentId === scope);
  const activeScope = scope === ALL || department ? scope : ALL;

  const saved = useMemo(() => {
    if (!matrix) return {};
    return activeScope === ALL ? organizationLevels(matrix) : departmentLevels(matrix, activeScope);
  }, [matrix, activeScope]);

  if (isLoading) {
    return (
      <section className="cc-root">
        <p className="cc-note">Đang tải ma trận trần nhà…</p>
      </section>
    );
  }

  if (isError || !matrix) {
    return (
      <section className="cc-root">
        <p className="cc-note">Chưa tải được ma trận trần nhà. Vui lòng thử lại sau.</p>
      </section>
    );
  }

  const orgSaved = organizationLevels(matrix);
  const current = drafts[activeScope] ?? saved;
  const dirty = Boolean(drafts[activeScope]) && !sameLevels(current, saved);
  const saving = saveOrganization.isPending || saveDepartment.isPending;
  /** Trần doanh nghiệp đang áp cho phạm vi: bản nháp khi xem cả doanh nghiệp, bản đã lưu khi xem phòng ban. */
  const orgCeiling = activeScope === ALL ? current : orgSaved;
  const routeCount = sumLevels(current);
  const orgCount = sumLevels(orgCeiling);

  const setDraft = (levels: Levels | null) =>
    setDrafts((all) => {
      const next = { ...all };
      if (levels && !sameLevels(levels, saved)) next[activeScope] = levels;
      else delete next[activeScope];
      return next;
    });

  const pick = (domain: CeilingDomain, level: number) => {
    if (!canEdit || saving) return;
    const now = current[domain.categoryId] ?? 0;
    const target = level === now ? level - 1 : level;
    if (activeScope !== ALL && target > (orgSaved[domain.categoryId] ?? 0)) {
      toast.error('Trần phòng ban không được cao hơn trần doanh nghiệp ở bất kỳ năng lực nào.');
      return;
    }
    setDraft({ ...current, [domain.categoryId]: target });
  };

  const applySuggestion = () => {
    const suggestion: Levels =
      activeScope === ALL
        ? Object.fromEntries(matrix.domains.map((d) => [d.categoryId, Math.max(1, d.suggestedCeiling)]))
        : Object.fromEntries((department?.ceilings ?? []).map((c) => [c.categoryId, c.suggested]));
    setDraft(suggestion);
  };

  const save = async () => {
    const ceilings = Object.entries(current).map(([categoryId, level]) => ({ categoryId, level }));
    try {
      if (activeScope === ALL) {
        const result = await saveOrganization.mutateAsync(ceilings);
        toast.success(
          result?.adjustedDepartmentCount
            ? `Đã lưu trần doanh nghiệp và hạ trần của ${result.adjustedDepartmentCount} phòng ban theo trần mới.`
            : 'Đã lưu trần doanh nghiệp.',
        );
      } else {
        await saveDepartment.mutateAsync({ departmentId: activeScope, data: { ceilings } });
        toast.success(`Đã lưu trần phòng ban ${department?.name ?? ''}.`.trim());
      }
      setDraft(null);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được trần năng lực.'));
    }
  };

  const inherit = async () => {
    if (activeScope === ALL) return;
    try {
      await saveDepartment.mutateAsync({ departmentId: activeScope, data: { inherit: true, ceilings: [] } });
      setDraft(null);
      toast.success(`${department?.name ?? 'Phòng ban'} dùng lại trần doanh nghiệp.`);
    } catch (error) {
      toast.error(organizationErrorMessage(error, 'Chưa lưu được trần năng lực.'));
    }
  };

  const routeLabel = activeScope === ALL ? 'khóa trong lộ trình cả doanh nghiệp' : `khóa trong lộ trình ${department?.name}`;
  const blockedDepartments = activeScope !== ALL && !matrix.isConfigured;

  return (
    <section className="cc-root" aria-labelledby="cc-title">
      <div className="cc-head">
        <div className="cc-title">
          <span className="cc-code" title="Bước 02 Business ceiling và 03 Department ceiling">02–03</span>
          <h2 id="cc-title">Trần năng lực doanh nghiệp và phòng ban</h2>
          {matrix.isConfigured ? (
            <span className="cc-tag ok">Đã lưu</span>
          ) : (
            <span className="cc-tag warn">Chưa lưu · đang hiển thị gợi ý</span>
          )}
        </div>
        <p>
          Chọn cấp cao nhất doanh nghiệp mở cho từng năng lực, rồi thu hẹp cho từng phòng ban nếu cần. Các ô nằm dưới
          trần là lộ trình học và là cơ sở báo giá.
        </p>
      </div>

      <div className="cc-grid">
        <div className="cc-card">
          <div className="cc-seg" role="group" aria-label="Phạm vi lộ trình">
            <button type="button" aria-pressed={activeScope === ALL} onClick={() => setScope(ALL)}>
              Cả doanh nghiệp
              {drafts[ALL] && <i aria-label="chưa lưu" />}
            </button>
            {matrix.departments.map((d) => (
              <button
                key={d.departmentId}
                type="button"
                aria-pressed={activeScope === d.departmentId}
                onClick={() => setScope(d.departmentId)}
                title={d.isCustomized ? 'Có trần riêng' : 'Kế thừa trần doanh nghiệp'}
              >
                {d.name}
                {drafts[d.departmentId] && <i aria-label="chưa lưu" />}
              </button>
            ))}
          </div>

          <div className="cc-mx" role="group" aria-label="Ma trận năng lực nhân cấp độ">
            <div />
            {matrix.levels.map((level) => (
              <div key={level.level} className="hd">
                Cấp {level.level}
                <br />
                <span>{level.name}</span>
              </div>
            ))}
            {matrix.domains.map((domain) => {
              const routeLevel = current[domain.categoryId] ?? 0;
              const dnLevel = orgCeiling[domain.categoryId] ?? 0;
              return (
                <DomainRow
                  key={domain.categoryId}
                  domain={domain}
                  routeLevel={routeLevel}
                  dnLevel={dnLevel}
                  isDepartment={activeScope !== ALL}
                  editable={canEdit && !blockedDepartments}
                  onPick={pick}
                />
              );
            })}
          </div>

          <div className="cc-legend">
            <span><i className="route" />Lộ trình đang xem</span>
            <span><i className="dn" />Trong trần doanh nghiệp</span>
            <span><i />Chỉ trong trần Digital AI</span>
          </div>

          <div className="cc-stats">
            <div><b>{routeCount}</b><span>{routeLabel}</span></div>
            <div><b>{orgCount}</b><span>khóa trong trần doanh nghiệp</span></div>
            <div><b>{matrix.platformCourseCount}</b><span>khóa trong trần Digital AI</span></div>
          </div>

          <p className="cc-note">
            Mã trong ô là khóa chuẩn của năng lực ở cấp đó (F, I, A là cơ bản, trung cấp, nâng cao).
            {matrix.updatedAt && ` Cập nhật ${formatDateTime(matrix.updatedAt)}${matrix.updatedByName ? ` bởi ${matrix.updatedByName}` : ''}.`}
          </p>

          {canEdit && (
            <div className="cc-actions">
              <span className="hint">
                {blockedDepartments
                  ? 'Lưu trần doanh nghiệp trước khi đặt trần cho phòng ban.'
                  : activeScope === ALL
                    ? 'Bấm vào ô để đặt trần doanh nghiệp đến cấp đó.'
                    : department?.isCustomized
                      ? 'Phòng ban đang có trần riêng.'
                      : 'Phòng ban đang kế thừa trần doanh nghiệp.'}
              </span>
              <div className="btns">
                <button type="button" className="cc-btn" onClick={applySuggestion} disabled={saving || blockedDepartments}>
                  Dùng gợi ý từ vị trí
                </button>
                {activeScope !== ALL && department?.isCustomized && (
                  <button type="button" className="cc-btn" onClick={inherit} disabled={saving}>
                    Kế thừa trần doanh nghiệp
                  </button>
                )}
                <button type="button" className="cc-btn" onClick={() => setDraft(null)} disabled={!dirty || saving}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="cc-btn primary"
                  onClick={save}
                  disabled={saving || blockedDepartments || (!dirty && (activeScope !== ALL || matrix.isConfigured))}
                >
                  {saving ? 'Đang lưu…' : activeScope === ALL ? 'Lưu trần doanh nghiệp' : 'Lưu trần phòng ban'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="cc-side">
          <p>
            Ma trận {matrix.domains.length} năng lực × {matrix.platformMaxLevel} cấp độ chứa đủ {matrix.platformCourseCount}{' '}
            khóa và chính là trần năng lực số của Digital AI. Mỗi doanh nghiệp chọn trần riêng cho từng năng lực; doanh
            nghiệp lớn có thể đặt thêm trần cho từng phòng ban. Các ô nằm dưới trần chính là lộ trình, nên ít ô hơn cũng
            là chi phí thấp hơn.
          </p>
          <div className="cc-box rule">
            <h4>Quy tắc</h4>
            <p><code>Trần phòng ban ≤ Trần doanh nghiệp ≤ Trần Digital AI</code></p>
            <p>
              Xét riêng từng năng lực. Hệ thống chặn khi đặt trần phòng ban cao hơn trần doanh nghiệp ở bất kỳ năng lực
              nào; hạ trần doanh nghiệp sẽ hạ theo trần phòng ban đang cao hơn.
            </p>
          </div>
          <div className="cc-box warnbox">
            <h4>Lưu ý về dữ liệu</h4>
            <p>
              Dùng thử chỉ có số liệu cấp cơ bản. Các ô cấp 2 và 3 trong lộ trình dựa trên mong muốn của doanh nghiệp,
              chưa có số liệu đo thật.
            </p>
          </div>
          <div className="cc-box info">
            <h4>Gợi ý từ vị trí</h4>
            <p>
              Gợi ý lấy mức yêu cầu cao nhất của các vị trí đã công bố yêu cầu năng lực
              {activeScope === ALL ? ' trong doanh nghiệp' : ` thuộc ${department?.name}`}, không vượt trần doanh nghiệp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DomainRow({
  domain,
  routeLevel,
  dnLevel,
  isDepartment,
  editable,
  onPick,
}: {
  domain: CeilingDomain;
  routeLevel: number;
  dnLevel: number;
  isDepartment: boolean;
  editable: boolean;
  onPick: (domain: CeilingDomain, level: number) => void;
}) {
  return (
    <>
      <div className="rl">
        {domain.name}
        <small>{isDepartment ? `PB ${routeLevel} · DN ${dnLevel}` : `trần DN ${dnLevel}`}</small>
      </div>
      {domain.courses.map((course) => {
        const inRoute = course.level <= routeLevel;
        const inOrg = course.level <= dnLevel;
        const state = inRoute ? 'trong lộ trình đang xem' : inOrg ? 'trong trần doanh nghiệp' : 'chỉ trong trần Digital AI';
        const className = `cc-cell${inRoute ? ' route' : inOrg ? ' dn' : ''}${course.code ? '' : ' empty'}`;
        const label = course.code ?? 'Chưa có khóa';
        const title = `${course.code ? `${course.code} · ${course.title}` : 'Chưa có khóa'}: ${state}`;
        return editable ? (
          <button
            key={course.level}
            type="button"
            className={className}
            title={title}
            aria-label={`${domain.name}, cấp ${course.level}: ${state}. Bấm để đặt trần đến cấp này.`}
            onClick={() => onPick(domain, course.level)}
          >
            {label}
          </button>
        ) : (
          <div key={course.level} className={className} title={title}>
            {label}
          </div>
        );
      })}
    </>
  );
}
