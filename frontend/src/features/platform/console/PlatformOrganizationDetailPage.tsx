import { Link, useParams } from 'react-router-dom';
import { usePlatformOrganization } from '@/hooks/use-platform-admin';
import { Footer, LoadError, Loading, PageHead, Pill } from '../components/pulse-ui';
import { ORG_STATUS, STAGE_LABELS } from '../components/pulse-format';
import { OrganizationDetailContent } from './components/OrganizationDetailContent';
import { ArrowLeft } from 'lucide-react';

/**
 * PA-06 · Toàn cảnh tổ chức: standalone 360 view of a customer tenant.
 */
export function PlatformOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePlatformOrganization(id);

  const back = (
    <Link className="btn btn-outline btn-small" to="/platform/organizations">
      <ArrowLeft size={14} style={{ marginRight: 4 }} />
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
  const statusPill = suspended
    ? { label: ORG_STATUS.SUSPENDED.label, tone: ORG_STATUS.SUSPENDED.tone }
    : { label: STAGE_LABELS[o.stage]?.label, tone: STAGE_LABELS[o.stage]?.tone };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
            Quản trị nền tảng / Hồ sơ tổ chức 360
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 4px' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
              {o.name}
            </h1>
            <Pill tone={statusPill.tone}>{statusPill.label}</Pill>
          </div>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            {o.ownerEmail ? `Chủ sở hữu: ${o.ownerEmail} · ` : ''}Quản lý gói cước, số lượng nhân sự và thao tác cấp quyền hoặc tạm ngưng.
          </p>
        </div>

        {back}
      </div>

      {id && <OrganizationDetailContent orgId={id} />}

      <Footer />
    </>
  );
}

