import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Info } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared';
import { useTrialResult } from '@/hooks/use-enterprise-trial';
import { MyCompetencyTabs } from '../components/MyCompetencyTabs';

function badge(classification: string) {
  if (classification === 'insufficient_data') return 'bg-slate-100 text-slate-700 border-slate-200';
  if (classification === 'gap') return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-emerald-50 text-emerald-800 border-emerald-200';
}

export function MySkillGapPage() {
  const result = useTrialResult();
  const items = result.data?.items ?? [];
  const gaps = items.filter((item) => item.classification === 'gap');
  const unknown = items.filter((item) => item.classification === 'insufficient_data');

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeader
          title="Khoảng trống năng lực của tôi"
          subtitle="Kết quả diagnostic được tính trên server theo version tiêu chuẩn đã freeze khi bắt đầu bài đánh giá."
        />
        <Link to="/enterprise/me/learning-path" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
          <BookOpen className="size-4" />
          Xem lộ trình bồi dưỡng
        </Link>
      </div>

      <MyCompetencyTabs />

      {result.isLoading ? (
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      ) : !result.data ? (
        <EmptyState
          icon={<Info className="mx-auto size-12 text-slate-300" />}
          title="Chưa có kết quả diagnostic"
          description="Hoàn thành bài đánh giá đầu vào để hệ thống tạo skill gap server-side."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-medium text-slate-500">Có gap</div>
              <div className="mt-1 text-3xl font-black text-amber-600">{gaps.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-medium text-slate-500">Chưa đủ dữ liệu</div>
              <div className="mt-1 text-3xl font-black text-slate-700">{unknown.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-medium text-slate-500">Calculation</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{result.data.calculationVersion}</div>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.competencyId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">{item.competencyId}</span>
                      <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${badge(item.classification)}`}>
                        {item.classification === 'insufficient_data' ? 'Chưa đủ dữ liệu' : item.classification === 'gap' ? 'Có khoảng trống' : 'Đạt chuẩn'}
                      </span>
                    </div>
                    <h2 className="mt-2 text-base font-bold text-slate-950">{item.name}</h2>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                    {item.currentLevel === null ? 'Không suy luận cấp độ' : `Hiện tại ${item.currentLevel} → Yêu cầu ${item.requiredLevel}`}
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {item.classification === 'gap' ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />}
                  <p>{item.basis}</p>
                </div>
              </article>
            ))}
          </div>

          <Link to="/enterprise/me/learning-path" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700">
            Xem học phần được đề xuất từ gap
            <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </div>
  );
}
