import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertTriangle, ClipboardList } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/shared';
import { useCompetencyGaps } from '@/hooks/use-analytics';
import type { CompetencyGapRow } from '@/services/analytics.service';

export function TeamSkillGapPage() {
  const [search, setSearch] = useState('');
  const { data: gapData, isLoading } = useCompetencyGaps();

  const gaps = gapData ?? [];
  const filteredGaps = search
    ? gaps.filter(
        (g) =>
          g.name.toLowerCase().includes(search.toLowerCase()) ||
          g.frameworkCode.toLowerCase().includes(search.toLowerCase()),
      )
    : gaps;

  const columns = [
    {
      key: 'competency',
      header: 'Năng lực số',
      cell: (row: CompetencyGapRow) => (
        <div>
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {row.frameworkCode.startsWith('CMP-') ? row.frameworkCode : `CMP-${row.frameworkCode.replace(/^TT02-/, '')}`}
          </span>
          <p className="font-semibold text-sm text-slate-900 mt-1">{row.name}</p>
        </div>
      ),
    },
    {
      key: 'gapCount',
      header: 'Số nhân sự có khoảng trống',
      cell: (row: CompetencyGapRow) => (
        <span className="font-bold text-sm text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          {row.employeesWithGap} nhân sự
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Mức độ ưu tiên đào tạo',
      cell: () => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
          <AlertTriangle className="size-3" />
          Ưu tiên cao
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: () => (
        <div className="flex items-center gap-2">
          <Link
            to="/enterprise/tasks/new"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <ClipboardList className="size-3.5" />
            <span>Giao bài thực hành</span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Khoảng trống năng lực của nhóm (Skill Gap)"
          subtitle="Phân tích mức độ chênh lệch giữa năng lực thực tế của nhân viên và yêu cầu vị trí việc làm theo Khung chuẩn năng lực số."
        />
        <Link
          to="/enterprise/tasks/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition shrink-0"
        >
          <ClipboardList className="size-4" />
          <span>Giao bài tập khắc phục Gap</span>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên năng lực…"
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredGaps}
          isLoading={isLoading}
          keyExtractor={(row) => row.competencyId}
          emptyTitle="Không có khoảng trống năng lực nào đáng kể trong nhóm!"
        />
      </div>
    </div>
  );
}
