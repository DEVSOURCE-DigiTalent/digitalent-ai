import { PageHeader } from '@/components/shared';

interface PlaceholderPageProps {
  /** Screen ID from the UI/UX spec, e.g. ADM-02. */
  screenId: string;
  title: string;
  /** P0 / P1 / P2 from the spec's priority matrix. */
  priority?: string;
}

/** Stand-in for a screen in the sitemap that is not built yet. Replace by registering the real page. */
export function PlaceholderPage({ screenId, title, priority }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={`Màn hình ${screenId}${priority ? ` · ${priority}` : ''}`} />
      <div className="bg-white rounded-lg border border-dashed border-slate-300 p-6">
        <p className="text-sm text-slate-500">Màn hình này sẽ được xây dựng theo tài liệu UI/UX v1.0.</p>
      </div>
    </div>
  );
}
