import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyLearning } from '@/hooks/use-my-learning';
import { MyLearningTabs } from '../components/MyLearningTabs';

type Filter = 'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
const filters: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'NOT_STARTED', label: 'Chưa bắt đầu' },
  { id: 'IN_PROGRESS', label: 'Đang học' },
  { id: 'COMPLETED', label: 'Đã xong' },
];

export function MyLearningPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const { data, isLoading, isError } = useMyLearning();
  const filtered = (data?.items ?? []).filter((course) =>
    (filter === 'ALL' || course.status === filter)
    && `${course.courseCode} ${course.courseTitle}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  return (
    <div className="space-y-6 pb-16">
      <PageHeader title="Khóa học của tôi" subtitle="Khóa học đã ghi danh và tiến độ thực tế của bạn." />
      <MyLearningTabs />
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-4">
        {filters.map((item) => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-lg px-3 py-2 text-xs ${filter === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{item.label}</button>)}
        <label className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"><Search className="size-4" /><input aria-label="Tìm khóa học" value={search} onChange={(event) => setSearch(event.target.value)} className="bg-transparent text-sm outline-none" placeholder="Tên hoặc mã khóa" /></label>
      </div>
      {isLoading ? <div className="h-48 rounded-xl bg-slate-100 animate-pulse" /> : isError ? <p role="alert" className="text-red-600">Không tải được khóa học của bạn.</p> : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 p-10 text-center"><BookOpen className="mx-auto size-10 text-slate-400" /><p className="mt-3">Không có khóa học phù hợp.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((course) => <article key={course.enrollmentId} className="rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex justify-between"><span className="font-mono text-xs text-blue-700">{course.courseCode}</span>{course.level > 0 && <LevelBadge level={course.level} />}</div>
            <h3 className="font-semibold">{course.courseTitle}</h3>
            <p className="flex gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock className="size-4" />{course.estimatedDurationMinutes ?? 0} phút</span><span>{course.completedLessons}/{course.totalLessons} bài</span></p>
            <div className="h-2 rounded bg-slate-100"><div className="h-full rounded bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }} /></div>
            <div className="flex items-center justify-between text-xs"><span>{Math.round(course.progressPercent)}% · {course.status === 'COMPLETED' ? 'Đã hoàn thành' : course.status === 'IN_PROGRESS' ? 'Đang học' : 'Chưa bắt đầu'}</span><Link className="flex items-center gap-1 text-blue-700 font-semibold" to={`/enterprise/me/courses/${course.courseId}`}>Vào học <PlayCircle className="size-4" /></Link></div>
          </article>)}
        </div>
      )}
    </div>
  );
}
