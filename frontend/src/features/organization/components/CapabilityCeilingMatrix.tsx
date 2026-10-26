import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useCapabilityCeilings,
  useUpdateDepartmentCeilings,
  useUpdateOrganizationCeilings,
} from '@/hooks/use-capability-ceilings';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useReferencePositionLevels } from '@/hooks/use-reference-position-levels';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { REFERENCE_POSITIONS } from '@/lib/reference-positions';
import { formatDateTime } from '@/lib/utils';
import type { CapabilityCeilings, CeilingDomain } from '@/services/capability-ceiling.service';
import { referenceCeilingDraft, referenceLevelForDomain, suggestedSampleForDepartment } from './reference-ceiling';
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
  const navigate = useNavigate();
  const { data: matrix, isLoading, isError } = useCapabilityCeilings();
  const { data: reference, isError: referenceError } = useReferencePositionLevels();
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.POSITION_REQUIREMENT_MANAGE);
  const saveOrganization = useUpdateOrganizationCeilings();
  const saveDepartment = useUpdateDepartmentCeilings();
  const [scope, setScope] = useState<string>(ALL);
  /** Bản nháp chưa lưu theo phạm vi. */
  const [drafts, setDrafts] = useState<Record<string, Levels>>({});
  const [referenceChoices, setReferenceChoices] = useState<Record<string, string>>({});

  const department = matrix?.departments.find((d) => d.departmentId === scope);
  const activeScope = scope === ALL || department ? scope : ALL;
  const referenceChoice = department
    ? referenceChoices[department.departmentId] ?? suggestedSampleForDepartment(department.code, department.name)
    : '';

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
    // Kiểm tra bản quyền: doanh nghiệp chưa mua bản quyền khóa học cấp cao hơn thì không được nâng trần
    const courseAtLevel = domain.courses.find((c) => c.level === target);
    const maxAllowed = domain.maxAllowedCeiling ?? 1;
    if (activeScope === ALL && target > maxAllowed && courseAtLevel?.isUnlocked === false) {
      toast.warning(
        `Khóa học ${courseAtLevel.code ?? `cấp ${target}`} chưa được mở bản quyền. Vui lòng mua suất học để nâng trần doanh nghiệp lên bậc ${target}.`,
        {
          action: {
            label: 'Trang bị suất học',
            onClick: () => {
              navigate('/enterprise/courses');
            },
          },
        }
      );
      return;
    }
    setDraft({ ...current, [domain.categoryId]: target });
  };

  const applySuggestion = () => {
    if (activeScope !== ALL && !department?.hasSuggestion) {
      toast.info('Chưa đủ mức gợi ý cho mọi miền: hãy gắn vị trí thuộc 5 mẫu tham chiếu hoặc hoàn thiện yêu cầu vị trí.');
      return;
    }
    const suggestion: Levels =
      activeScope === ALL
        ? Object.fromEntries(matrix.domains.map((d) => [d.categoryId, Math.max(1, d.suggestedCeiling)]))
        : Object.fromEntries((department?.ceilings ?? []).map((c) => [c.categoryId, c.suggested]));
    setDraft(suggestion);
  };

  const applyReference = () => {
    if (!department || reference?.levels[referenceChoice]?.length !== 6) return;
    const { draft, capped } = referenceCeilingDraft(matrix.domains, reference.levels[referenceChoice], orgSaved);
    setDraft(draft);
    if (capped) {
      toast.info('Một số mức mẫu cao hơn giới hạn doanh nghiệp nên đã được hạ theo giới hạn hiện tại.');
    }
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

  const routeLabel = activeScope === ALL ? 'khóa trong phạm vi doanh nghiệp' : `khóa được mở cho phòng ban ${department?.name}`;
  const blockedDepartments = activeScope !== ALL && !matrix.isConfigured;
  const sampleLevels = reference?.levels[referenceChoice];
  const sampleDraft = sampleLevels?.length === 6 ? referenceCeilingDraft(matrix.domains, sampleLevels, orgSaved).draft : null;

  return (
    <section className="cc-root" aria-labelledby="cc-title">
      <div className="cc-head">
        <div className="cc-title">
          <span className="cc-code" title="Bước 02 Business ceiling và 03 Department ceiling">02–03</span>
          <h2 id="cc-title">Giới hạn khóa học của doanh nghiệp và phòng ban</h2>
          {matrix.isConfigured ? (
            <span className="cc-tag ok">Đã lưu</span>
          ) : (
            <span className="cc-tag warn">Chưa lưu · đang hiển thị gợi ý</span>
          )}
        </div>
        <p>
          Chọn cấp khóa học cao nhất doanh nghiệp mở cho từng miền. Có thể giới hạn thêm cho nhân viên một phòng ban;
          mục tiêu năng lực và lộ trình cá nhân vẫn do vị trí công việc của từng người quyết định.
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
            <span><i className="route" />Khóa được mở trong phạm vi đang xem</span>
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

          {canEdit && activeScope !== ALL && department && (
            <div className="cc-sources">
              <h3>Chọn nguồn tham khảo cho {department.name}</h3>
              <p>Hai nguồn có thể khác nhau. Chọn một nguồn để đưa vào bản nháp, kiểm tra ma trận phía trên rồi lưu.</p>
              <div className="cc-source-options">
                <div className="cc-source-option">
                  <strong>Yêu cầu vị trí của doanh nghiệp</strong>
                  <small>Mức cao nhất của các năng lực trong từng miền, tổng hợp từ vị trí gắn với phòng ban. Ưu tiên yêu cầu đã công bố; vị trí chưa có yêu cầu dùng mẫu phù hợp.</small>
                  <button type="button" className="cc-btn" onClick={applySuggestion} disabled={saving || blockedDepartments || !department.hasSuggestion}>
                    Dùng gợi ý theo vị trí
                  </button>
                </div>
                <div className="cc-source-option">
                  <label htmlFor="cc-reference-sample">Mẫu DigiTalent do Admin quản lý</label>
                  <small>Chọn trực tiếp một trong 5 mẫu. Không cần vị trí đã gắn với phòng ban.</small>
                  <select
                    id="cc-reference-sample"
                    value={referenceChoice}
                    onChange={(event) => setReferenceChoices((choices) => ({ ...choices, [department.departmentId]: event.target.value }))}
                    disabled={saving || !reference}
                  >
                    <option value="">Chọn một trong 5 vị trí mẫu</option>
                    {REFERENCE_POSITIONS.map((position) => <option key={position.code} value={position.code}>{position.name}</option>)}
                  </select>
                  <button type="button" className="cc-btn" onClick={applyReference}
                    disabled={saving || blockedDepartments || !sampleDraft}>
                    Dùng mẫu đã chọn
                  </button>
                </div>
              </div>
              {!department.hasSuggestion && <p className="cc-source-status">Chưa có đủ gợi ý theo vị trí cho 6 miền. Bạn có thể dùng mẫu Admin hoặc tự chọn mức.</p>}
              {referenceError && <p className="cc-source-status">Chưa tải được mẫu Admin.</p>}
              <div className="cc-comparison-scroll">
                <table className="cc-comparison">
                  <caption>So sánh mức theo miền trước khi lưu</caption>
                  <thead><tr><th scope="col">Miền năng lực</th><th scope="col">Gợi ý vị trí</th><th scope="col">Mẫu Admin {reference ? `v${reference.version}` : ''}</th><th scope="col">Giới hạn DN</th><th scope="col">Đang xem</th></tr></thead>
                  <tbody>
                    {matrix.domains.map((domain, index) => {
                      const raw = sampleLevels?.length === 6 ? referenceLevelForDomain(domain, index, sampleLevels) : null;
                      const capped = sampleDraft?.[domain.categoryId];
                      const suggested = department.ceilings.find((ceiling) => ceiling.categoryId === domain.categoryId)?.suggested;
                      return (
                        <tr key={domain.categoryId}>
                          <th scope="row">{domain.name}</th>
                          <td>{department.hasSuggestion ? suggested : '—'}</td>
                          <td>{raw == null ? '—' : raw === capped ? raw : `${raw} → ${capped}`}</td>
                          <td>{orgSaved[domain.categoryId] ?? 0}</td>
                          <td>{current[domain.categoryId] ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <small>0 = không mở; 1 = cơ bản; 2 = trung cấp; 3 = nâng cao. Gợi ý vị trí đã xét giới hạn DN; mẫu Admin vượt giới hạn hiện “mức mẫu → mức có thể áp dụng”. Thay đổi chỉ có hiệu lực sau khi lưu.</small>
            </div>
          )}
          {canEdit && (
            <div className="cc-actions">
              <span className="hint">
                {blockedDepartments
                  ? 'Lưu trần doanh nghiệp trước khi đặt giới hạn cho phòng ban.'
                  : activeScope === ALL
                    ? 'Bấm vào ô để đặt giới hạn doanh nghiệp đến cấp đó.'
                    : department?.isCustomized
                      ? 'Phòng ban đang có giới hạn riêng.'
                      : 'Phòng ban đang kế thừa giới hạn doanh nghiệp.'}
              </span>
              <div className="btns">
                {activeScope === ALL && <button type="button" className="cc-btn" onClick={applySuggestion} disabled={saving}>Dùng mức tổng hợp theo vị trí</button>}
                {activeScope !== ALL && department?.isCustomized && (
                  <button type="button" className="cc-btn" onClick={inherit} disabled={saving}>Kế thừa giới hạn doanh nghiệp</button>
                )}
                <button type="button" className="cc-btn" onClick={() => setDraft(null)} disabled={!dirty || saving}>Hủy</button>
                <button type="button" className="cc-btn primary" onClick={save}
                  disabled={saving || blockedDepartments || (!dirty && (activeScope !== ALL || matrix.isConfigured))}>
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
            nghiệp có thể giới hạn thêm khóa học mở cho nhân viên trong từng phòng ban. Đây là phạm vi khóa được mở;
            lộ trình của mỗi nhân viên còn phụ thuộc mục tiêu của vị trí họ đảm nhiệm.
          </p>
          <div className="cc-box rule">
            <h4>Quy tắc</h4>
            <p><code>Giới hạn phòng ban ≤ Giới hạn doanh nghiệp ≤ Danh mục DigiTalent</code></p>
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
            <h4>Hai nguồn tham khảo</h4>
            <p>
              “Gợi ý theo vị trí” ưu tiên yêu cầu doanh nghiệp đã công bố cho các vị trí gắn với nhân viên hoặc phòng ban,
              rồi mới dùng mẫu cho vị trí chưa có yêu cầu; mức tổng hợp có thể khác bảng Admin. “Mẫu tham chiếu DigiTalent” lấy trực tiếp từ bảng 5 vị trí của Admin, do bạn
              chọn rõ mẫu cần dùng. Cả hai đều không vượt giới hạn doanh nghiệp và chỉ đổi phạm vi khóa sau khi bạn lưu.
              {' '}Mục tiêu học của nhân viên vẫn cần yêu cầu vị trí riêng.
              {activeScope !== ALL && department && !department.hasSuggestion && ' Phòng ban này chưa có đủ yêu cầu vị trí đã công bố cho tất cả miền; bạn vẫn có thể chọn mẫu Admin.'}
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
        const isLocked = course.isUnlocked === false;
        const state = inRoute ? 'trong lộ trình đang xem' : inOrg ? 'trong trần doanh nghiệp' : isLocked ? 'chưa mở bản quyền (cần mua suất)' : 'chỉ trong trần Digital AI';
        const className = `cc-cell${inRoute ? ' route' : inOrg ? ' dn' : ''}${course.code ? '' : ' empty'}${isLocked ? ' opacity-75' : ''}`;
        const label = course.code ? (isLocked ? `🔒 ${course.code}` : course.code) : 'Chưa có khóa';
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
