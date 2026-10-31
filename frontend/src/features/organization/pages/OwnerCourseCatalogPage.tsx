import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { useCourseCatalog, usePurchaseCourseSeats } from '@/hooks/use-assignments';
import { useCompetencyCategories } from '@/hooks/use-competencies';
import { courseCategories } from '@/features/courses/course-catalog';
import type { CourseListItem } from '@/services/assignment.service';
import {
  LEVELS,
  buildCourseTree,
  courseLevel,
  formatDuration,
  levelName,
  levelPricing,
  matchesSearch,
  type DomainBranch,
} from '../components/course-tree';
import { PULSE_TOKENS } from '../owner-theme';

/** One color per level, used by the tree nodes, the legend and the detail panel. */
const LEVEL_TONES: Record<number, { bg: string; fg: string; ring: string }> = {
  1: { bg: '#edf7dd', fg: '#557327', ring: '#b9dc8c' },
  2: { bg: 'var(--po-soft)', fg: '#137b84', ring: '#aebcf6' },
  3: { bg: '#fdeee9', fg: '#c4553f', ring: '#f4b6a6' },
};

type Selection = { kind: 'course'; id: string } | { kind: 'domain'; domain: number } | null;

export function OwnerCourseCatalogPage() {
  const [search, setSearch] = useState('');
  // ?level=2 → mở sẵn bộ lọc bậc (nút "Mua khóa học" của doanh nghiệp dùng thử dẫn tới khóa Trung cấp).
  const [searchParams] = useSearchParams();
  const [levelFilter, setLevelFilter] = useState(() => {
    const level = Number(searchParams.get('level'));
    return LEVELS.some((l) => l.level === level) ? level : 0;
  });
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [selection, setSelection] = useState<Selection>(null);
  const [purchaseModalCourse, setPurchaseModalCourse] = useState<CourseListItem | null>(null);

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
      className="po-owner -m-4 md:-m-6 min-h-screen px-4 md:px-6 py-8"
      style={{ ...PULSE_TOKENS, background: 'radial-gradient(ellipse at 50% 0%, var(--po-soft) 0%, var(--po-canvas) 60%)' }}
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
              Mỗi miền năng lực là một nhánh, học lần lượt Cơ bản → Trung cấp → Nâng cao. Khóa Cơ bản mở dùng thử miễn phí toàn bộ;
              khóa Trung cấp (399.000 ₫/suất) và Nâng cao (699.000 ₫/suất) là khóa trả phí, cần mua bản quyền / suất học để đào tạo (tài khoản dùng thử xem trước toàn bộ mô tả).
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
                <CourseDetail
                  course={selectedCourse}
                  branch={selectedBranch}
                  onClose={() => setSelection(null)}
                  onBuySeats={(c) => setPurchaseModalCourse(c)}
                />
              ) : selectedBranch ? (
                <DomainDetail branch={selectedBranch} onSelect={setSelection} onClose={() => setSelection(null)} />
              ) : (
                <Legend />
              )}
            </aside>
          </div>
        )}

        {purchaseModalCourse && (
          <CourseSeatPurchaseModal
            course={purchaseModalCourse}
            onClose={() => setPurchaseModalCourse(null)}
            onSuccess={() => {
              refetch();
            }}
          />
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
          background: domainSelected ? 'var(--po-soft)' : 'var(--po-raised)',
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
  const pricing = levelPricing(slot.level);
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
          const totalSeats = (course.seatsPurchased ?? 0) + (course.seatsGranted ?? 0);
          const isLicensed = level.level === 1 || course.hasLicense || totalSeats > 0;
          return (
            <button
              key={course.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect({ kind: 'course', id: course.id })}
              className="flex h-full min-h-[96px] flex-col rounded-[14px] border px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:shadow-md"
              style={{
                borderColor: selected ? tone.fg : tone.ring,
                background: selected ? tone.bg : 'var(--po-surface)',
                boxShadow: selected ? `0 0 0 3px ${tone.bg}` : undefined,
                opacity: dimmed ? 0.35 : 1,
              }}
            >
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.08em]">
                <span className="rounded px-1.5 py-0.5" style={{ background: tone.bg, color: tone.fg }}>{level.code} · {level.name}</span>
                <span style={{ color: 'var(--po-muted)' }}>{course.code}</span>
                <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  pricing.isFree
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isLicensed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {pricing.isFree ? pricing.badge : isLicensed ? `Đã có ${totalSeats} suất` : pricing.badge}
                </span>
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

function CourseDetail({
  course,
  branch,
  onClose,
  onBuySeats,
}: {
  course: CourseListItem;
  branch?: DomainBranch;
  onClose: () => void;
  onBuySeats: (course: CourseListItem) => void;
}) {
  const level = courseLevel(course);
  const tone = LEVEL_TONES[level] ?? LEVEL_TONES[1];
  const pricing = levelPricing(level);
  const next = branch?.slots.find((slot) => slot.level === level + 1)?.courses[0];
  const totalSeats = (course.seatsPurchased ?? 0) + (course.seatsGranted ?? 0);
  const isLicensed = level === 1 || course.hasLicense || totalSeats > 0;

  return (
    <Panel onClose={onClose}>
      <p className="pr-8 text-[11px] font-bold" style={{ color: 'var(--po-muted)' }}>
        {branch ? `Miền ${String(branch.domain).padStart(2, '0')} · ${branch.category.name}` : 'Ngoài khung TT02'}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em]" style={{ background: tone.bg, color: tone.fg }}>
          Bậc {level} · {levelName(level)}
        </span>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
          level === 1
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : isLicensed
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {level === 1 ? pricing.formatted : isLicensed ? `Đã có ${totalSeats} suất` : pricing.formatted}
        </span>
      </div>
      <h2 className="mt-2 text-[20px] font-bold leading-tight" style={{ color: 'var(--po-ink)', letterSpacing: '-0.03em' }}>{course.title}</h2>

      <dl className="mt-4">
        <Row label="Mã khóa">{course.code}</Row>
        <Row label="Học phần">{course.modules}</Row>
        {formatDuration(course.estimatedDurationMinutes) && <Row label="Thời lượng">{formatDuration(course.estimatedDurationMinutes)}</Row>}
        <Row label="Học trước">{course.prerequisiteTitle ?? 'Không yêu cầu'}</Row>
        <Row label="Học tiếp">{next?.title ?? (level >= 3 ? 'Bậc cao nhất' : '—')}</Row>
        <Row label="Đơn giá">{pricing.formatted}</Row>
        <Row label="Quyền truy cập">
          {level === 1
            ? 'Mở dùng thử miễn phí toàn bộ'
            : isLicensed
            ? `Đã sở hữu ${totalSeats} suất (${course.seatsAvailable ?? totalSeats} suất khả dụng)`
            : 'Chưa mua suất (Chỉ xem mô tả & đề cương)'}
        </Row>
        <Row label="Đang phân công">{course.assignedCount} nhân viên</Row>
      </dl>

      <div className="mt-4 grid gap-2">
        <Link
          to={`/enterprise/courses/${course.id}`}
          className="rounded-[11px] px-3 py-2.5 text-center text-xs font-bold text-white shadow-sm"
          style={{ background: 'var(--po-accent)' }}
        >
          {isLicensed ? 'Xem chi tiết khóa học →' : 'Xem mô tả khóa học →'}
        </Link>
        {isLicensed ? (
          <>
            <Link
              to={`/enterprise/training-batches/new?courseId=${course.id}`}
              className="rounded-[11px] border px-3 py-2.5 text-center text-xs font-bold transition-all hover:bg-slate-50"
              style={{ borderColor: '#cdd7f5', color: 'var(--po-accent)' }}
            >
              Đưa vào đợt đào tạo
            </Link>
            {level > 1 && (
              <button
                type="button"
                onClick={() => onBuySeats(course)}
                className="rounded-[11px] border px-3 py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                style={{ borderColor: 'var(--po-line)' }}
              >
                + Mua thêm suất học cho khóa này
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => onBuySeats(course)}
            className="rounded-[11px] border px-3 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:brightness-95"
            style={{ borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb' }}
          >
            <span>🔒 Mua suất học ({pricing.formatted})</span>
          </button>
        )}
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

function CourseSeatPurchaseModal({
  course,
  onClose,
  onSuccess,
}: {
  course: CourseListItem;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const level = courseLevel(course);
  const pricing = levelPricing(level);
  const [seats, setSeats] = useState(10);
  const [result, setResult] = useState<{
    orderId: string;
    totalAmount: number;
    seats: number;
    checkoutUrl?: string;
    qrCode?: string;
    createdAt?: string;
  } | null>(null);

  const purchaseMutation = usePurchaseCourseSeats();
  const totalAmount = seats * pricing.price;

  const handlePurchase = () => {
    purchaseMutation.mutate(
      { courseId: course.id, seats },
      {
        onSuccess: (data) => {
          setResult({
            orderId: data.orderId,
            totalAmount: data.totalAmount,
            seats: data.seats,
            checkoutUrl: data.checkoutUrl,
            qrCode: data.qrCode,
            createdAt: data.createdAt,
          });
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
              🔒 Bản quyền khóa học thương mại
            </span>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{course.title}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{course.code} · Bậc {level} ({levelName(level)})</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {result ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-xl">
              ✓
            </div>
            <h3 className="text-base font-bold text-slate-900">Kích hoạt suất học & Mở trần thành công!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Bạn đã trang bị thành công <b>{result.seats} suất</b> cho khóa học <b>{course.code}</b>.
              Khóa học đã được mở bản quyền và trần năng lực của doanh nghiệp đã được nâng lên <b>Bậc {level} ({levelName(level)})</b>.
            </p>
            <div className="mx-auto max-w-sm rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Mã giao dịch:</span>
                <span className="font-mono font-semibold text-slate-800">{result.orderId.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tổng chi phí:</span>
                <span className="font-bold text-emerald-800">{result.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thời gian:</span>
                <span className="text-slate-700">{result.createdAt ? new Date(result.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}</span>
              </div>
            </div>
            {result.checkoutUrl && (
              <div className="pt-2">
                <a
                  href={result.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-95"
                  style={{ background: '#2563eb' }}
                >
                  💳 Mở cổng thanh toán VietQR / PayOS
                </a>
              </div>
            )}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm"
                style={{ background: 'var(--po-accent)' }}
              >
                Hoàn tất & Bắt đầu đào tạo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700 leading-relaxed">
              💡 Doanh nghiệp của bạn đang dùng thử và được <b>miễn phí 100% toàn bộ khóa Cơ bản</b>.
              Khóa Trung cấp & Nâng cao cung cấp kỹ năng thực chiến và cấp chứng chỉ chuẩn TT02 theo từng đầu người (1 suất = 1 nhân viên).
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số lượng suất cần trang bị cho nhân sự:
              </label>
              <div className="flex items-center gap-2 mb-2">
                {[5, 10, 20, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSeats(count)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                      seats === count
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {count} suất
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={500}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-primary-600"
              />
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Đơn giá niêm yết:</span>
                <span className="font-semibold text-slate-900">{pricing.formatted}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Số lượng nhân viên đào tạo:</span>
                <span className="font-semibold text-slate-900">{seats} nhân viên</span>
              </div>
              <div className="flex justify-between border-t border-amber-200/60 pt-2 text-sm font-bold text-slate-900">
                <span>Tổng chi phí đầu tư:</span>
                <span className="text-primary-700 font-extrabold">{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {purchaseMutation.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {(purchaseMutation.error as any)?.response?.data?.message ||
                  (purchaseMutation.error as any)?.message ||
                  'Có lỗi xảy ra khi thực hiện mua suất học.'}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={purchaseMutation.isPending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105 disabled:opacity-50 flex items-center gap-1.5"
                style={{ background: 'var(--po-accent)' }}
              >
                {purchaseMutation.isPending && <span className="animate-spin inline-block size-3.5 border-2 border-white border-t-transparent rounded-full" />}
                <span>{purchaseMutation.isPending ? 'Đang xử lý...' : `Xác nhận mua suất học (${totalAmount.toLocaleString('vi-VN')} ₫)`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
