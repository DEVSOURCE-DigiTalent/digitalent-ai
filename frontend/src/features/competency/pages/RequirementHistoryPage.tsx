import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EmptyState, LevelBadge, PageHeader, StatusBadge, getStatusVariant } from '@/components/shared';
import { usePositionRequirements } from '@/hooks/use-competencies';
import { useJobPositions } from '@/hooks/use-job-positions';
import { INPUT_CLASS, PRIMARY_BUTTON } from '@/features/onboarding/components/styles';
import { formatDate } from '@/lib/utils';
import { diffRequirements, type RequirementChange } from '../utils/requirement-diff';

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Đang áp dụng', DRAFT: 'Bản nháp', RETIRED: 'Đã thay thế' };

const CHANGE_LABELS: Record<RequirementChange['kind'], string> = {
  ADDED: 'Thêm mới',
  REMOVED: 'Bỏ khỏi yêu cầu',
  RAISED: 'Tăng mức',
  LOWERED: 'Giảm mức',
  MANDATORY_CHANGED: 'Đổi tính bắt buộc',
};

const CHANGE_TONE: Record<RequirementChange['kind'], string> = {
  ADDED: 'text-emerald-700',
  REMOVED: 'text-red-700',
  RAISED: 'text-emerald-700',
  LOWERED: 'text-amber-700',
  MANDATORY_CHANGED: 'text-slate-700',
};

function LevelCell({ level }: { level: number }) {
  return level === 0 ? <span className="text-slate-400">—</span> : <LevelBadge level={level} />;
}

/** LCA-05: every version of a position's requirements, and what changed between two of them. */
export function RequirementHistoryPage() {
  const [params, setParams] = useSearchParams();
  const positionId = params.get('positionId') ?? '';
  const newerNo = Number(params.get('version')) || undefined;
  const olderNo = Number(params.get('compare')) || undefined;

  const positions = useJobPositions({ pageSize: 100, status: 'ACTIVE' }).data?.items ?? [];
  const overview = usePositionRequirements(positionId || undefined);
  const versions = overview.data?.versions ?? [];

  // Default comparison: the newest version against the one right before it.
  const newerVersion = newerNo ?? versions[0]?.versionNo;
  const olderVersion = olderNo ?? versions.find((v) => newerVersion !== undefined && v.versionNo < newerVersion)?.versionNo;
  const newer = usePositionRequirements(positionId || undefined, newerVersion);
  const older = usePositionRequirements(positionId && olderVersion ? positionId : undefined, olderVersion);

  const changes = newer.data ? diffRequirements(older.data, newer.data) : [];

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === 'positionId') {
      next.delete('version');
      next.delete('compare');
    }
    setParams(next, { replace: true });
  };

  return (
    <div>
      <Link to={positionId ? `/enterprise/positions/${positionId}` : '/enterprise/positions'} className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Vị trí công việc
      </Link>
      <PageHeader title="Lịch sử phiên bản yêu cầu" subtitle="Theo dõi các lần thay đổi yêu cầu năng lực của một vị trí và so sánh hai phiên bản">
        <label className="sr-only" htmlFor="history-position">Vị trí công việc</label>
        <select id="history-position" value={positionId} onChange={(e) => update('positionId', e.target.value)} className={INPUT_CLASS}>
          <option value="">Chọn vị trí…</option>
          {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </PageHeader>

      {!positionId && <EmptyState title="Chọn một vị trí" description="Chọn vị trí để xem các phiên bản yêu cầu năng lực của vị trí đó." />}
      {positionId && overview.isLoading && <p className="text-sm text-slate-500">Đang tải…</p>}
      {positionId && overview.isError && <p role="alert" className="text-sm text-red-600">Không tải được lịch sử phiên bản.</p>}
      {positionId && overview.data && versions.length === 0 && (
        <EmptyState
          title="Vị trí này chưa có phiên bản nào"
          description="Đặt yêu cầu năng lực để tạo phiên bản đầu tiên."
          action={<Link to={`/enterprise/positions/requirements?positionId=${positionId}`} className={PRIMARY_BUTTON}>Đặt yêu cầu năng lực</Link>}
        />
      )}

      {versions.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <section aria-labelledby="versions-title" className="rounded-lg border border-slate-200 bg-white">
            <h2 id="versions-title" className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Các phiên bản</h2>
            <ul className="divide-y divide-slate-100">
              {versions.map((version) => (
                <li key={version.id} className="p-4 text-sm space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">Phiên bản {version.versionNo}</span>
                    <span className="flex items-center gap-2">
                      <StatusBadge label={STATUS_LABELS[version.status] ?? version.status} variant={getStatusVariant(version.status)} />
                      {version.status === 'DRAFT' && (
                        <Link to={`/enterprise/requirements/builder?positionId=${positionId}&version=${version.versionNo}`} className="text-xs font-medium text-primary-700 hover:underline">Sửa</Link>
                      )}
                    </span>
                  </div>
                  {version.changeReason && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                      "{version.changeReason}"
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Người đổi: <strong className="text-slate-600">{version.changeUserFullName || 'Quản trị viên'}</strong></span>
                    {version.activatedAt && <span>{formatDate(version.activatedAt)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="diff-title" className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
              <h2 id="diff-title" className="mr-auto text-sm font-semibold text-slate-900">So sánh phiên bản</h2>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Cũ hơn
                <select value={olderVersion ?? ''} onChange={(e) => update('compare', e.target.value)} className={INPUT_CLASS}>
                  <option value="">Không có</option>
                  {versions.map((v) => <option key={v.id} value={v.versionNo}>v{v.versionNo}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Mới hơn
                <select value={newerVersion ?? ''} onChange={(e) => update('version', e.target.value)} className={INPUT_CLASS}>
                  {versions.map((v) => <option key={v.id} value={v.versionNo}>v{v.versionNo}</option>)}
                </select>
              </label>
            </div>

            {newer.data && (
              <div className="border-b border-slate-100 bg-slate-50/50 p-4 space-y-1">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Phiên bản {newer.data.versionNo}:</span> hiệu lực từ {formatDate(newer.data.effectiveFrom)}
                  {newer.data.activatedAt ? ` · kích hoạt ${formatDate(newer.data.activatedAt)}` : ''}
                  {newer.data.changeUserFullName ? ` bởi ${newer.data.changeUserFullName}` : ''}
                </p>
                {newer.data.changeReason && (
                  <p className="text-xs text-slate-500 italic">
                    Lý do thay đổi: "{newer.data.changeReason}"
                  </p>
                )}
              </div>
            )}

            {newer.isLoading ? (
              <p className="p-4 text-sm text-slate-500">Đang tải…</p>
            ) : changes.length === 0 ? (
              <p className="p-4 text-sm text-slate-600">
                {olderVersion ? 'Hai phiên bản này giống nhau về năng lực, mức yêu cầu và tính bắt buộc.' : 'Đây là phiên bản đầu tiên, chưa có phiên bản cũ hơn để so sánh.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Thay đổi giữa hai phiên bản</caption>
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Năng lực</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Thay đổi</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Trước</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Sau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {changes.map((change) => (
                      <tr key={change.competencyId}>
                        <th scope="row" className="px-4 py-3 text-left font-normal text-slate-800">
                          <Link to={`/enterprise/framework/${change.competencyId}`} className="hover:underline">
                            <span className="mr-2 font-mono text-xs text-slate-500">{change.frameworkCode}</span>{change.name}
                          </Link>
                        </th>
                        <td className={`px-4 py-3 font-medium ${CHANGE_TONE[change.kind]}`}>
                          {CHANGE_LABELS[change.kind]}
                          {change.kind === 'MANDATORY_CHANGED' && (change.mandatoryTo ? ' (thành bắt buộc)' : ' (thành tùy chọn)')}
                        </td>
                        <td className="px-4 py-3"><LevelCell level={change.from} /></td>
                        <td className="px-4 py-3"><LevelCell level={change.to} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
