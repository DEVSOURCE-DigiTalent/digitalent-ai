import { Layers } from 'lucide-react';
import { useCompetencies, useCompetencyCategories } from '@/hooks/use-competencies';
import { Empty, LoadError, Mini, PageHead, PageSkeleton, Pill, PuLink } from '@/features/pulse-employee/components/ui';
import { LEVEL_NAMES, pad2 } from '@/features/pulse-employee/lib/labels';
import { ManagerPage } from '../components/ManagerUi';
import { MANAGER_PATHS } from '../lib/paths';

const LEVELS = [1, 2, 3] as const;
const HIERARCHY = ['Digital AI', 'Doanh nghiệp', 'Phòng ban', 'Vị trí'];

/**
 * MG-15 · Khung năng lực chung (mock `#/framework`), chỉ đọc cho quản lý: sáu lĩnh vực của chuẩn Digital AI, ba mức,
 * và cách chuẩn chung trở thành mục tiêu vị trí. Chủ doanh nghiệp sửa trần và mục tiêu ở màn của họ (OW-14).
 */
export function ManagerFrameworkPage() {
  const categories = useCompetencyCategories();
  const competencies = useCompetencies({ pageIndex: 1, pageSize: 100, status: 'ACTIVE' });

  const header = (
    <PageHead
      eyebrow="Chung chuẩn Digital AI"
      title="Sáu lĩnh vực. Ba mức rõ ràng."
      description="Đây là trần chung. Chủ doanh nghiệp đặt mục tiêu các cấp trong giới hạn đó; quản lý dùng mục tiêu ấy khi đánh giá nhân sự."
      actions={
        <>
          <Pill>Chỉ đọc</Pill>
          <PuLink to={MANAGER_PATHS.capability} kind="outline">Xem năng lực đội ngũ</PuLink>
        </>
      }
    />
  );

  if (categories.isLoading || competencies.isLoading) {
    return <ManagerPage>{header}<PageSkeleton blocks={[180, 180, 120]} /></ManagerPage>;
  }
  if (categories.isError || competencies.isError) {
    return (
      <ManagerPage>
        {header}
        <LoadError
          message="Không tải được khung năng lực."
          onRetry={() => { categories.refetch(); competencies.refetch(); }}
        />
      </ManagerPage>
    );
  }

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
    <ManagerPage testId="manager-framework">
      {header}

      {domains.length === 0 ? (
        <Empty icon={<Layers size={24} />} title="Khung năng lực chưa được công bố.">
          Khi quản trị nền tảng công bố chuẩn chung, sáu lĩnh vực và ba mức sẽ hiển thị ở đây.
        </Empty>
      ) : (
        <div className="pm-domain-grid">
          {domains.map((domain, index) => (
            <article key={domain.id} className="pm-domain-card" aria-label={domain.name}>
              <Mini>Lĩnh vực {pad2(index + 1)}</Mini>
              <h3>{domain.name}</h3>
              <p>{domain.competencies.length} năng lực · hành vi số thực tế ở ba mức.</p>
              {domain.competencies.length > 0 && (
                <ul>
                  {domain.competencies.slice(0, 4).map((item) => (
                    <li key={item.id} title={item.name}><b>{item.frameworkCode ?? item.code}</b>{item.name}</li>
                  ))}
                  {domain.competencies.length > 4 && <li>+ {domain.competencies.length - 4} năng lực khác</li>}
                </ul>
              )}
              <div className="pm-level-chips" aria-label="Ba mức">
                {LEVELS.map((level) => <span key={level}>{pad2(level)} {LEVEL_NAMES[level]}</span>)}
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="pm-panel pm-hierarchy" aria-labelledby="pm-hierarchy-title">
        <Mini>Chuẩn chung trở thành mục tiêu cá nhân như thế nào</Mini>
        <h2 id="pm-hierarchy-title">Digital AI ≥ doanh nghiệp ≥ phòng ban ≥ vị trí</h2>
        <p className="pu-panel-desc">
          Chỉ quản trị nền tảng công bố nội dung chuẩn. Doanh nghiệp tự thiết kế mức trần và vị trí; mức đã xác nhận của nhân viên
          được so với mục tiêu vị trí.
        </p>
        <ol aria-label="Thứ bậc mục tiêu">
          {HIERARCHY.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>
    </ManagerPage>
  );
}
