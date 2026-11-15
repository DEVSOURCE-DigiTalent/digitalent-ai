import { SectionLoading } from '@/components/shared/LoadingState';
import { Modal } from '@/components/shared/Modal';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useCompetencies, useCompetencyCategories } from '@/hooks/use-competencies';
import { Empty, LoadError } from '@/features/pulse-employee/components/ui';
import { LEVEL_NAMES, pad2 } from '@/features/pulse-employee/lib/labels';
import { MANAGER_PATHS } from '../lib/paths';
import './manager-framework-dialog.css';

const LEVELS = [1, 2, 3] as const;
const HIERARCHY = ['Digital AI', 'Doanh nghiệp', 'Phòng ban', 'Vị trí'];

export function ManagerFrameworkDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="xl" className="manager-framework-dialog"
      title="Khung năng lực chung" description={translateUi('Tra cứu các lĩnh vực năng lực và cấp độ áp dụng trong doanh nghiệp.')}
      footer={<Link to={MANAGER_PATHS.capability} className="manager-framework-link">{translateUi('Xem năng lực đội ngũ')}</Link>}>
      {open && <FrameworkContent />}
    </Modal>
  );
}

function FrameworkContent() {
  useUiLanguage();
  const categories = useCompetencyCategories();
  const competencies = useCompetencies({ pageIndex: 1, pageSize: 100, status: 'ACTIVE' });
  if (categories.isLoading || competencies.isLoading) return <SectionLoading label="Đang tải khung năng lực" />;
  if (categories.isError || competencies.isError) return <LoadError message="Không tải được khung năng lực."
    onRetry={() => { void categories.refetch(); void competencies.refetch(); }} />;

  const items = competencies.data?.items ?? [];
  const domains = [...(categories.data ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      ...category,
      competencies: items
        .filter((item) => item.categoryId === category.id)
        .sort((a, b) => (a.frameworkCode ?? a.code).localeCompare(b.frameworkCode ?? b.code, 'vi', { numeric: true })),
    }));

  return (
    <div className="manager-framework-content">

      {domains.length === 0 ? (
        <Empty icon={<Layers size={24} />} title="Khung năng lực chưa được công bố.">
          Khi quản trị nền tảng công bố chuẩn chung, sáu lĩnh vực và ba mức sẽ hiển thị ở đây.
        </Empty>
      ) : (
        <div className="pm-domain-grid">
          {domains.map((domain) => (
            <article key={domain.id} className="pm-domain-card" aria-label={translateUi(domain.name)}>
              <h3>{translateUi(domain.name)}</h3>
              <p>{domain.competencies.length} {translateUi('năng lực')}</p>
              {domain.competencies.length > 0 && (
                <ul>
                  {domain.competencies.slice(0, 4).map((item) => (
                    <li key={item.id} title={translateUi(item.name)}><b>{item.frameworkCode ?? item.code}</b>{translateUi(item.name)}</li>
                  ))}
                  {domain.competencies.length > 4 && (
                    <li><details className="manager-framework-more">
                      <summary>{translateUi(`Xem thêm ${domain.competencies.length - 4} năng lực`)}</summary>
                      <ul>
                        {domain.competencies.slice(4).map((item) => (
                          <li key={item.id}><b>{item.frameworkCode ?? item.code}</b>{translateUi(item.name)}</li>
                        ))}
                      </ul>
                    </details></li>
                  )}
                </ul>
              )}
              <div className="pm-level-chips" aria-label="Ba mức">
                {LEVELS.map((level) => <span key={level}>{pad2(level)} {translateUi(LEVEL_NAMES[level])}</span>)}
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="pm-panel pm-hierarchy" aria-labelledby="pm-hierarchy-title">
        <h2 id="pm-hierarchy-title">Phạm vi áp dụng chuẩn năng lực</h2>
        <p className="pu-panel-desc">
          Chỉ quản trị nền tảng công bố nội dung chuẩn. Doanh nghiệp tự thiết kế cấp độ và vị trí; mức đã xác nhận của nhân viên
          được so với mục tiêu vị trí.
        </p>
        <ol aria-label="Thứ bậc mục tiêu">
          {HIERARCHY.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>
    </div>
  );
}
