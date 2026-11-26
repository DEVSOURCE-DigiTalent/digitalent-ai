import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers } from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { useApplyOrganizationCatalogVersion, useOrganizationCatalogVersion } from '@/hooks/use-platform-catalog';
import { LoadError, Pill, ReasonField } from '../../components/pulse-ui';
import { LEVEL_NAMES, errorMessage, formatDate, isReasonValid } from '../../components/pulse-format';

/**
 * "Chương trình học" of an organization: the catalog version its employees learn from, and moving it to any published
 * version (newer, or older with a reason). Employees who already started a course keep the revision they started on.
 */
export function OrganizationCatalogVersionCard({ organizationId }: { organizationId: string }) {
  useUiLanguage();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const [target, setTarget] = useState<number | undefined>(undefined);
  const [reason, setReason] = useState('');
  const query = useOrganizationCatalogVersion(organizationId, target);
  const apply = useApplyOrganizationCatalogVersion(organizationId);
  const data = query.data;

  const targetNo = target ?? data?.targetVersionNo;
  const goingBack = data != null && targetNo != null && targetNo < data.versionNo;
  const isCurrent = data != null && targetNo === data.versionNo;
  const canApply = canManage && data?.provisioned && !isCurrent && !apply.isPending && (!goingBack || isReasonValid(reason));

  const onApply = () => {
    if (!data || targetNo == null) return;
    apply.mutate(
      { versionNo: targetNo, reason: goingBack ? reason.trim() : undefined },
      {
        onSuccess: (result) => {
          toast.success(translateUi(`Đã chuyển ${result.organizationName} sang v${result.versionNo}`), {
            description:
              result.changes.length > 0
                ? translateUi(`${result.changes.length} khóa có bản mới. Nhân viên học lại các khóa đó từ đầu; chứng nhận đã cấp vẫn giữ.`)
                : translateUi('Không có khóa nào khác nội dung.'),
          });
          setTarget(undefined);
          setReason('');
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <div className="pa-org-detail-card">
      <div className="pa-org-detail-card-head">
        <span className="pa-org-detail-card-title">
          <span className="pa-org-detail-icon-box" aria-hidden="true">
            <Layers size={14} />
          </span>
          {translateUi('Chương trình học')}
        </span>
        {data && (
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <Pill tone="green">{translateUi(`Đang dùng v${data.versionNo}`)}</Pill>
            {data.versionNo < data.latestVersionNo && <Pill tone="coral">{translateUi(`Có bản mới v${data.latestVersionNo}`)}</Pill>}
          </span>
        )}
      </div>

      {data?.kept && (
        <p role="status" style={{ fontSize: 13, color: 'var(--pa-ink-2)', margin: '0 0 10px', padding: '8px 10px', borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa' }}>
          {translateUi(`Doanh nghiệp giữ v${data.versionNo}, chưa áp dụng v${data.kept.versionNo}: `)}
          <strong>{data.kept.reason}</strong>
          <span style={{ color: 'var(--pa-ink-3)' }}>{` · ${[data.kept.keptBy, new Date(data.kept.keptAt).toLocaleDateString('vi-VN')].filter(Boolean).join(', ')}`}</span>
        </p>
      )}

      {query.isLoading && <p style={{ fontSize: 13, color: 'var(--pa-ink-3)', margin: 0 }}>{translateUi('Đang tải…')}</p>}
      {query.error && <LoadError error={query.error} />}

      {data && !data.provisioned && (
        <p style={{ fontSize: 13, color: 'var(--pa-ink-3)', margin: 0 }}>
          {translateUi('Tổ chức chưa có khóa học chuẩn. Khóa học được thêm khi tổ chức đăng ký, theo bản mới nhất.')}
        </p>
      )}

      {data && data.provisioned && (
        <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
          <label className="field" style={{ margin: 0 }}>
            {translateUi('Chuyển sang phiên bản')}
            <select
              value={targetNo ?? ''}
              onChange={(e) => {
                setTarget(Number(e.target.value));
                setReason('');
              }}
            >
              {data.versions.map((v) => (
                <option key={v.versionNo} value={v.versionNo}>
                  {`v${v.versionNo}`}
                  {v.versionNo === data.latestVersionNo ? translateUi(' · mới nhất') : ''}
                  {v.versionNo === data.versionNo ? translateUi(' · đang dùng') : ''}
                  {v.publishedAt ? ` · ${formatDate(v.publishedAt)}` : ''}
                </option>
              ))}
            </select>
          </label>

          {isCurrent ? (
            <p style={{ margin: 0, color: 'var(--pa-ink-3)' }}>{translateUi('Tổ chức đang dùng phiên bản này.')}</p>
          ) : (
            <div>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
                {data.changes.length > 0
                  ? translateUi(`Khóa sẽ có bản mới (${data.changes.length})`)
                  : translateUi(`Không có khóa nào khác nội dung giữa v${data.versionNo} và v${targetNo}.`)}
              </span>
              {data.changes.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                  {data.changes.map((c) => (
                    <li
                      key={c.courseId}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                      <Pill tone={c.kind === 'ADDED' ? 'green' : undefined}>{translateUi(c.kind === 'ADDED' ? 'Thêm mới' : 'Cập nhật')}</Pill>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.title}</span>
                      <span style={{ color: 'var(--pa-ink-3)' }}>· {translateUi(LEVEL_NAMES[c.level] ?? '')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!isCurrent && goingBack && canManage && (
            <div>
              <p style={{ margin: '0 0 6px', color: '#b45309' }}>
                {translateUi(`Đây là quay lại phiên bản cũ (v${data.versionNo} → v${targetNo}).`)}
              </p>
              <ReasonField value={reason} onChange={setReason} placeholder="VD: Bản mới có câu hỏi sai đáp án, quay lại bản trước trong lúc sửa." />
            </div>
          )}

          {!isCurrent && (
            <p style={{ margin: 0, color: 'var(--pa-ink-3)' }}>
              {translateUi('Nhân viên đã bắt đầu một khóa vẫn học và được chấm theo bản cũ của khóa đó; người chưa bắt đầu học bản được áp.')}{' '}
              <Link to={`/platform/versions/${targetNo}`} style={{ color: 'var(--pa-accent, #156c70)', fontWeight: 600 }}>
                {translateUi(`Xem nội dung v${targetNo}`)}
              </Link>
            </p>
          )}

          {canManage && !isCurrent && (
            <div>
              <button type="button" className="btn btn-primary" onClick={onApply} disabled={!canApply}>
                {apply.isPending ? translateUi('Đang áp dụng…') : translateUi(`Áp dụng v${targetNo} cho tổ chức`)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
