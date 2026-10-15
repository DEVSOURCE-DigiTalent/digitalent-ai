import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { useCourseCatalog } from '@/hooks/use-assignments';
import { useCompetencyCategories } from '@/hooks/use-competencies';
import { courseCategories } from '@/features/courses/course-catalog';
import type { CourseListItem } from '@/services/assignment.service';
import {
  LEVELS,
  buildCourseTree,
  courseLevel,
  formatDuration,
  levelName,
  matchesSearch,
  type DomainBranch,
} from '../components/course-tree';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-coral': '#ef735c',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
} as React.CSSProperties;

/** One color per level, used by the tree nodes, the legend and the detail panel. */
const LEVEL_TONES: Record<number, { bg: string; fg: string; ring: string }> = {
  1: { bg: '#edf7dd', fg: '#557327', ring: '#b9dc8c' },
  2: { bg: '#e9edff', fg: '#304bdf', ring: '#aebcf6' },
  3: { bg: '#fdeee9', fg: '#c4553f', ring: '#f4b6a6' },
};

type Selection = { kind: 'course'; id: string } | { kind: 'domain'; domain: number } | null;

export function OwnerCourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState(0);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [selection, setSelection] = useState<Selection>(null);

  const { data: apiCategories = [] } = useCompetencyCategories();
  const categories = useMemo(() => courseCategories(apiCategories), [apiCategories]);
  const { data: coursesData, isLoading, isError, refetch } = useCourseCatalog({});

  const { branches, others } = useMemo(
    () => buildCourseTree(categories, coursesData?.items ?? []),
    [categories, coursesData?.items],
  );

  const query = search.trim();
  const visibleBranches = query
    ? branches.filter((branch) => matchesSearch(branch.category.name, query)
      || branch.slots.some((slot) => slot.courses.some((course) => courseMatches(course, query))))
    : branches;

  const allCourses = branches.flatMap((branch) => branch.slots.flatMap((slot) => slot.courses));
  const totalAssigned = allCourses.reduce((sum, course) => sum + course.assignedCount, 0);

  const selectedCourse = selection?.kind === 'course' ? allCourses.concat(others).find((c) => c.id === selection.id) : undefined;
  const selectedBranch = selection?.kind === 'domain'
    ? branches.find((b) => b.domain === selection.domain)
    : selectedCourse ? branches.find((b) => b.slots.some((s) => s.courses.includes(selectedCourse))) : undefined;

  const toggle = (domain: number) => setCollapsed((current) => {
    const next = new Set(current);
    if (next.has(domain)) next.delete(domain);
    else next.add(domain);
    return next;
  });

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen px-4 md:px-6 py-8"
      style={{ ...PULSE_TOKENS, background: 'radial-gradient(ellipse at 50% 0%, #eef2ff 0%, var(--po-canvas) 60%)' }}
    >
      <div className="mx-auto" style={{ maxWidth: 1220 }}>
        {/* ── Header ── */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: 'var(--po-accent)' }}>
              <i className="inline-block size-[6px] rounded-full" style={{ background: 'var(--po-coral)' }} />
              Chương trình chuẩn · Thông tư 02/2025
            </span>
            <h1 className="mt-3 text-[clamp(30px,4.4vw,48px)] font-bold leading-[1.05]" style={{ color: 'var(--po-ink)', letterSpacing: '-0.05em' }}>
              Cây khóa học <span style={{ color: 'var(--po-accent)' }}>6 miền × 3 bậc.</span>
            </h1>
            <p className="mt-3 text-[13px] leading-relaxed" style={{ color: 'var(--po-muted)', maxWidth: 640 }}>
              Mỗi miền năng lực là một nhánh, học lần lượt Cơ bản → Trung cấp → Nâng cao. Khóa Cơ bản mở toàn bộ; khóa
              Trung cấp và Nâng cao mở khi được phân công hoặc đưa vào đợt đào tạo.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Miền" value={branches.length} />
            <Stat label="Khóa học" value={allCourses.length} />
            <Stat label="Đang phân công" value={totalAssigned} />
          </dl>
        </header>

        {/* ── Toolbar ── */}
        <div
          className="mb-4 grid gap-3 rounded-[16px] border px-4 py-3"
          style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex min-w-[220px] flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 size-4" style={{ color: 'var(--po-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm miền, tên hoặc mã khóa (VD: A4-I)…"
                aria-label="Tìm khóa học"
                className="w-full rounded-[10px] border py-2 pl-9 pr-8 text-sm outline-none focus:border-[var(--po-accent)]"
                style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
              />
              {search && (
                <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setSearch('')} className="absolute right-2.5" style={{ color: 'var(--po-muted)' }}>
                  <X className="size-4" />
                </button>
              )}
            </label>
            <div className="flex gap-1 text-xs font-bold" style={{ color: 'var(--po-accent)' }}>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-[var(--po-soft)]" onClick={() => setCollapsed(new Set())}>Mở tất cả</button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-[var(--po-soft)]" onClick={() => setCollapsed(new Set(branches.map((b) => b.domain)))}>Thu gọn</button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <ChipGroup label="Bậc">
              {[{ level: 0, name: 'Tất cả' }, ...LEVELS].map(({ level, name }) => {
                const active = levelFilter === level;
                const tone = LEVEL_TONES[level];
                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLevelFilter(level)}
                    className="rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                    style={active
                      ? { background: tone?.fg ?? 'var(--po-ink)', borderColor: tone?.fg ?? 'var(--po-ink)', color: '#fff' }
                      : { background: tone?.bg ?? 'var(--po-surface)', borderColor: tone ? 'transparent' : 'var(--po-line)', color: tone?.fg ?? 'var(--po-muted)' }}
                  >
                    {level ? `${level} · ${name}` : name}
                  </button>
                );
              })}
            </ChipGroup>
          </div>
        </div>

        {isLoading ? (
          <p className="py-20 text-center text-sm" style={{ color: 'var(--po-muted)' }}>Đang tải cây khóa học…</p>
        ) : isError ? (
          <div className="rounded-[18px] border p-8 text-center text-sm" style={{ borderColor: '#fecdd3', background: '#fff1f2', color: '#be123c' }}>
            Không tải được danh mục.{' '}
            <button type="button" className="font-bold underline" onClick={() => refetch()}>Thử lại</button>
          </div>
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* ── Tree ── */}
            <section
              id="course-tree"
              className="scroll-mt-[72px] rounded-[20px] border p-4 sm:p-6"
              style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.03)' }}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl text-sm font-black text-white" style={{ background: 'var(--po-ink)' }}>
                  TT
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold" style={{ color: 'var(--po-ink)' }}>Khung năng lực số TT02/2025</p>
                  <p className="text-xs" style={{ color: 'var(--po-muted)' }}>
                    {branches.length} miền · {allCourses.length} khóa
                  </p>
                </div>
              </div>

              {visibleBranches.length === 0 ? (
                <p className="mt-6 rounded-[14px] border border-dashed p-10 text-center text-sm" style={{ borderColor: '#cfd9ee', color: 'var(--po-muted)' }}>
                  Không có miền hoặc khóa học nào khớp “{query}”.
                </p>
              ) : (
                <ul role="tree" aria-label="Cây khóa học theo miền năng lực" className="mt-2">
                  {visibleBranches.map((branch, index) => (
                    <BranchNode
                      key={branch.domain}
                      branch={branch}
                      last={index === visibleBranches.length - 1}
                      open={!!query || !collapsed.has(branch.domain)}
                      onToggle={() => toggle(branch.domain)}
                      query={matchesSearch(branch.category.name, query) ? '' : query}
                      levelFilter={levelFilter}
                      selection={selection}
                      onSelect={setSelection}
                    />
                  ))}
                </ul>
              )}

              {others.length > 0 && !query && (
                <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--po-line)' }}>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>Ngoài khung TT02</p>
                  <div className="flex flex-wrap gap-2">
                    {others.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setSelection({ kind: 'course', id: course.id })}
                        className="rounded-[10px] border px-3 py-2 text-left text-xs font-semibold"
                        style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
                      >
                        {course.code} · {course.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── Detail ── */}
            <aside className="lg:sticky lg:top-[72px]">
              {selectedCourse ? (
                <CourseDetail course={selectedCourse} branch={selectedBranch} onClose={() => setSelection(null)} />
              ) : selectedBranch ? (
                <DomainDetail branch={selectedBranch} onSelect={setSelection} onClose={() => setSelection(null)} />
              ) : (
                <Legend />
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function courseMatches(course: CourseListItem, query: string) {
  return matchesSearch(course.title, query) || matchesSearch(course.code, query);
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[88px] rounded-[14px] border px-3 py-2" style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}>
      <dd className="text-xl font-bold" style={{ color: 'var(--po-ink)' }}>{value}</dd>
      <dt className="text-[11px] font-semibold" style={{ color: 'var(--po-muted)' }}>{label}</dt>
    </div>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-bold" style={{ color: 'var(--po-muted)' }}>{label}</span>
      {children}
    </div>
  );
}

interface BranchNodeProps {
  branch: DomainBranch;
  last: boolean;
  open: boolean;
  onToggle: () => void;
  query: string;
  levelFilter: number;
  selection: Selection;
  onSelect: (selection: Selection) => void;
}

function BranchNode({ branch, last, open, onToggle, query, levelFilter, selection, onSelect }: BranchNodeProps) {
  const courseCount = branch.slots.reduce((sum, slot) => sum + slot.courses.length, 0);
  const domainSelected = selection?.kind === 'domain' && selection.domain === branch.domain;
  const panelId = `course-branch-${branch.domain}`;

  return (
    <li role="treeitem" aria-expanded={open} aria-selected={domainSelected} className="relative pl-7">
      {/* Trunk and elbow of the tree */}
      <span aria-hidden className="absolute left-[17px] top-0 w-px" style={{ height: last ? 30 : '100%', background: 'var(--po-line)' }} />
      <span aria-hidden className="absolute left-[17px] top-[30px] h-px w-[11px]" style={{ background: 'var(--po-line)' }} />

      <div
        className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[14px] border px-3 py-2.5 transition-colors"
        style={{
          borderColor: domainSelected ? 'var(--po-accent)' : 'var(--po-line)',
          background: domainSelected ? 'var(--po-soft)' : '#fbfcff',
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-controls={panelId}
          aria-label={open ? `Thu gọn ${branch.category.name}` : `Mở ${branch.category.name}`}
          className="grid size-6 place-items-center rounded-md hover:bg-white"
          style={{ color: 'var(--po-muted)' }}
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <button type="button" onClick={() => onSelect({ kind: 'domain', domain: branch.domain })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-black" style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}>
            {String(branch.domain).padStart(2, '0')}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-bold" style={{ color: 'var(--po-ink)' }}>{branch.category.name}</span>
            <span className="block text-[11px]" style={{ color: 'var(--po-muted)' }}>
              {courseCount} khóa{branch.assignedCount ? ` · ${branch.assignedCount} lượt phân công` : ''}
            </span>
          </span>
        </button>
      </div>

      {open && (
        <ol id={panelId} role="group" className="relative mt-2 grid gap-2 pb-1 pl-4 sm:grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)_16px_minmax(0,1fr)] sm:items-stretch sm:gap-1">
          {branch.slots.map((slot, index) => (
            <LevelSlotNode
              key={slot.level}
              slot={slot}
              arrow={index > 0}
              query={query}
              levelFilter={levelFilter}
              selection={selection}
              onSelect={onSelect}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

interface LevelSlotNodeProps {
  slot: { level: number; courses: CourseListItem[] };
  arrow: boolean;
  query: string;
  levelFilter: number;
  selection: Selection;
  onSelect: (selection: Selection) => void;
}

function LevelSlotNode({ slot, arrow, query, levelFilter, selection, onSelect }: LevelSlotNodeProps) {
  const tone = LEVEL_TONES[slot.level];
  const level = LEVELS.find((l) => l.level === slot.level)!;
  return (
    <>
      {arrow && (
        <li aria-hidden className="hidden items-center justify-center text-sm sm:flex" style={{ color: '#a9b5cf' }}>→</li>
      )}
      <li className="flex flex-col gap-2">
        {slot.courses.length === 0 ? (
          <div className="flex h-full min-h-[96px] flex-col justify-center rounded-[14px] border border-dashed px-3 py-2.5 text-xs" style={{ borderColor: '#d5ddec', color: 'var(--po-muted)' }}>
            <span className="font-black" style={{ color: tone.fg }}>{level.code} · {level.name}</span>
            Chưa có khóa học
          </div>
        ) : slot.courses.map((course) => {
          const selected = selection?.kind === 'course' && selection.id === course.id;
          const dimmed = (levelFilter && levelFilter !== slot.level) || (query && !courseMatches(course, query));
          const duration = formatDuration(course.estimatedDurationMinutes);
          return (
            <button
              key={course.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect({ kind: 'course', id: course.id })}
              className="flex h-full min-h-[96px] flex-col rounded-[14px] border px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:shadow-md"
              style={{
                borderColor: selected ? tone.fg : tone.ring,
                background: selected ? tone.bg : '#fff',
                boxShadow: selected ? `0 0 0 3px ${tone.bg}` : undefined,
                opacity: dimmed ? 0.35 : 1,
              }}
            >
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.08em]">
                <span className="rounded px-1.5 py-0.5" style={{ background: tone.bg, color: tone.fg }}>{level.code} · {level.name}</span>
                <span style={{ color: 'var(--po-muted)' }}>{course.code}</span>
                {course.status === 'DRAFT' && <span className="rounded px-1.5 py-0.5" style={{ background: '#f0f2f6', color: '#66748d' }}>Nháp</span>}
              </span>
              <span className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug" style={{ color: 'var(--po-ink)' }}>{course.title}</span>
              <span className="mt-auto pt-1.5 text-[11px]" style={{ color: 'var(--po-muted)' }}>
                {[`${course.modules} học phần`, duration, course.assignedCount ? `${course.assignedCount} đang học` : null].filter(Boolean).join(' · ')}
              </span>
            </button>
          );
        })}
      </li>
    </>
  );
}

function Panel({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="relative rounded-[20px] border p-5" style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.04)' }}>
      {onClose && (
        <button type="button" aria-label="Đóng" onClick={onClose} className="absolute right-3 top-3 grid size-7 place-items-center rounded-md hover:bg-[var(--po-soft)]" style={{ color: 'var(--po-muted)' }}>
          <X className="size-4" />
        </button>
      )}
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b py-2 text-xs last:border-0" style={{ borderColor: 'var(--po-line)' }}>
      <dt style={{ color: 'var(--po-muted)' }}>{label}</dt>
      <dd className="text-right font-semibold" style={{ color: 'var(--po-ink)' }}>{children}</dd>
    </div>
  );
}

function CourseDetail({ course, branch, onClose }: { course: CourseListItem; branch?: DomainBranch; onClose: () => void }) {
  const level = courseLevel(course);
  const tone = LEVEL_TONES[level] ?? LEVEL_TONES[1];
  const next = branch?.slots.find((slot) => slot.level === level + 1)?.courses[0];
  return (
    <Panel onClose={onClose}>
      <p className="pr-8 text-[11px] font-bold" style={{ color: 'var(--po-muted)' }}>
        {branch ? `Miền ${String(branch.domain).padStart(2, '0')} · ${branch.category.name}` : 'Ngoài khung TT02'}
      </p>
      <span className="mt-3 inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em]" style={{ background: tone.bg, color: tone.fg }}>
        Bậc {level} · {levelName(level)}
      </span>
      <h2 className="mt-2 text-[20px] font-bold leading-tight" style={{ color: 'var(--po-ink)', letterSpacing: '-0.03em' }}>{course.title}</h2>

      <dl className="mt-4">
        <Row label="Mã khóa">{course.code}</Row>
        <Row label="Học phần">{course.modules}</Row>
        {formatDuration(course.estimatedDurationMinutes) && <Row label="Thời lượng">{formatDuration(course.estimatedDurationMinutes)}</Row>}
        <Row label="Học trước">{course.prerequisiteTitle ?? 'Không yêu cầu'}</Row>
        <Row label="Học tiếp">{next?.title ?? (level >= 3 ? 'Bậc cao nhất' : '—')}</Row>
        <Row label="Quyền truy cập">{level === 1 ? 'Mở toàn bộ' : 'Khi được phân công'}</Row>
        <Row label="Đang phân công">{course.assignedCount} nhân viên</Row>
      </dl>

      <div className="mt-4 grid gap-2">
        <Link
          to={`/enterprise/courses/${course.id}`}
          className="rounded-[11px] px-3 py-2.5 text-center text-xs font-bold text-white"
          style={{ background: 'var(--po-accent)' }}
        >
          Xem chi tiết khóa học →
        </Link>
        <Link
          to="/enterprise/training-batches/new"
          className="rounded-[11px] border px-3 py-2.5 text-center text-xs font-bold"
          style={{ borderColor: '#cdd7f5', color: 'var(--po-accent)' }}
        >
          Đưa vào đợt đào tạo
        </Link>
      </div>
    </Panel>
  );
}

function DomainDetail({ branch, onSelect, onClose }: { branch: DomainBranch; onSelect: (s: Selection) => void; onClose: () => void }) {
  return (
    <Panel onClose={onClose}>
      <p className="text-[11px] font-bold" style={{ color: 'var(--po-muted)' }}>Miền {String(branch.domain).padStart(2, '0')}</p>
      <h2 className="mt-1 pr-8 text-[20px] font-bold leading-tight" style={{ color: 'var(--po-ink)', letterSpacing: '-0.03em' }}>{branch.category.name}</h2>
      <ol className="mt-4 grid gap-0">
        {branch.slots.map((slot, index) => {
          const tone = LEVEL_TONES[slot.level];
          return (
            <li key={slot.level} className="relative flex gap-3 pb-4 last:pb-0">
              {index < branch.slots.length - 1 && <span aria-hidden className="absolute left-[11px] top-6 bottom-0 w-px" style={{ background: 'var(--po-line)' }} />}
              <span className="grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-black" style={{ background: tone.bg, color: tone.fg }}>{slot.level}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold" style={{ color: tone.fg }}>{levelName(slot.level)}</p>
                {slot.courses.length ? slot.courses.map((course) => (
                  <button key={course.id} type="button" onClick={() => onSelect({ kind: 'course', id: course.id })} className="block text-left text-[13px] font-semibold hover:underline" style={{ color: 'var(--po-ink)' }}>
                    {course.title}
                  </button>
                )) : <p className="text-xs" style={{ color: 'var(--po-muted)' }}>Chưa có khóa học</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

function Legend() {
  return (
    <Panel>
      <h2 className="text-[15px] font-bold" style={{ color: 'var(--po-ink)' }}>Cách đọc cây</h2>
      <ul className="mt-3 grid gap-2.5 text-xs leading-relaxed" style={{ color: 'var(--po-muted)' }}>
        {LEVELS.map(({ level, code, name }) => (
          <li key={level} className="flex items-start gap-2">
            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black" style={{ background: LEVEL_TONES[level].bg, color: LEVEL_TONES[level].fg }}>{code}</span>
            <span>
              <b style={{ color: 'var(--po-ink)' }}>{name}</b> —{' '}
              {level === 1 ? 'nền tảng, mở cho mọi nhân viên.' : level === 2 ? 'vận dụng trong công việc, cần hoàn thành bậc Cơ bản.' : 'làm chủ và hướng dẫn người khác, cần bậc Trung cấp.'}
            </span>
          </li>
        ))}
        <li className="flex items-start gap-2">
          <span className="shrink-0 font-bold" style={{ color: '#a9b5cf' }}>→</span>
          <span>Mũi tên là điều kiện tiên quyết: học xong khóa bên trái mới mở khóa bên phải.</span>
        </li>
      </ul>
      <p className="mt-4 rounded-[10px] px-3 py-2 text-[11px]" style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}>
        Chọn một miền hoặc một khóa để xem lộ trình và phân công.
      </p>
    </Panel>
  );
}
