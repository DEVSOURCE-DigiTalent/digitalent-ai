import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Search, Sparkles, X } from 'lucide-react';
import { useCourseCatalog, usePurchaseCourseSeats } from '@/hooks/use-assignments';
import { useCompetencyCategories } from '@/hooks/use-competencies';
import { courseCategories } from '@/features/courses/course-catalog';
import type { CourseListItem } from '@/services/assignment.service';
import { CourseArtwork, CourseDomainIcon } from '../components/CourseArtwork';
import {
  LEVELS,
  buildCourseTree,
  courseLevel,
  formatDuration,
  findGapCourse,
  levelName,
  levelPricing,
  matchesSearch,
  type DomainBranch,
} from '../components/course-tree';
import { PULSE_TOKENS } from '../owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import './owner-course-catalog.css';

/** Chuẩn hóa mã khóa học chuẩn (A1..A6 <-> M1..M6) để đối chiếu chính xác. */
function canonicalCode(code?: string): string {
  if (!code) return '';
  const trimmed = code.trim().toUpperCase();
  if ((trimmed.startsWith('A') || trimmed.startsWith('M')) && trimmed.length > 2 && !isNaN(Number(trimmed[1]))) {
    return 'M' + trimmed.slice(1);
  }
  return trimmed;
}

/** One color per level, used by the tree nodes, the legend and the detail panel. */
const LEVEL_TONES: Record<number, { bg: string; fg: string; ring: string }> = {
  1: { bg: '#edf7dd', fg: '#557327', ring: '#b9dc8c' },
  2: { bg: 'var(--po-soft)', fg: '#137b84', ring: '#aebcf6' },
  3: { bg: '#fdeee9', fg: '#c4553f', ring: '#f4b6a6' },
};

type Selection = { kind: 'course'; id: string } | null;

export function OwnerCourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const gapCode = searchParams.get('gap') ?? '';
  const gapDomain = Number(gapCode.split('.')[0]);
  const gapTargetLevel = Number(searchParams.get('level'));
  const focusCode = searchParams.get('focus') ?? '';
  // ?level=2 → mở sẵn bộ lọc bậc (nút "Mua khóa học" của doanh nghiệp dùng thử dẫn tới khóa Trung cấp).
  const [levelFilter, setLevelFilter] = useState(() => {
    const level = Number(searchParams.get('level'));
    return LEVELS.some((l) => l.level === level) ? level : 0;
  });
  const [activeDomain, setActiveDomain] = useState<number | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [purchaseModalCourse, setPurchaseModalCourse] = useState<CourseListItem | null>(null);
  const appliedSelectedParam = useRef<string | null>(null);

  // Danh sách mã khóa học được chọn trước từ trang Thiết lập Khung năng lực (?selected=M1-I,M2-A...)
  const selectedParam = searchParams.get('selected');
  const preselectedCodes = useMemo(() => {
    if (!selectedParam) return new Set<string>();
    return new Set(
      selectedParam
        .split(',')
        .map((c) => canonicalCode(c))
        .filter(Boolean)
    );
  }, [selectedParam]);

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
  const activeBranch = visibleBranches.find((branch) => branch.domain === activeDomain) ?? visibleBranches[0];

  const allCourses = branches.flatMap((branch) => branch.slots.flatMap((slot) => slot.courses));
  const gapCourse = findGapCourse(branches, gapCode, gapTargetLevel);
  const focusCourse = focusCode ? allCourses.concat(others).find((course) => canonicalCode(course.code) === canonicalCode(focusCode)) : undefined;
  const visibleOthers = query ? others.filter((course) => courseMatches(course, query)) : others;
  const totalAssigned = allCourses.reduce((sum, course) => sum + course.assignedCount, 0);

  const defaultCourse = (levelFilter ? activeBranch?.slots.find((slot) => slot.level === levelFilter)?.courses : activeBranch?.slots.flatMap((slot) => slot.courses))?.find((course) => course.status === 'PUBLISHED');
  const selectedCourse = selection ? allCourses.concat(others).find((course) => course.id === selection.id) : defaultCourse;
  const selectedBranch = selectedCourse ? branches.find((branch) => branch.slots.some((slot) => slot.courses.includes(selectedCourse))) : activeBranch;
  const displaySelection = selectedCourse ? { kind: 'course' as const, id: selectedCourse.id } : null;

  // Tự động chọn khóa học đầu tiên trong danh sách chọn trước để hiện thông tin chi tiết ngay lập tức
  useEffect(() => {
    if (!selectedParam) { appliedSelectedParam.current = null; return; }
    if (selectedParam && appliedSelectedParam.current !== selectedParam && preselectedCodes.size > 0 && allCourses.length > 0) {
      const match = allCourses.find((c) => preselectedCodes.has(canonicalCode(c.code)));
      if (match) {
        appliedSelectedParam.current = selectedParam;
        setSelection({ kind: 'course', id: match.id });
        const branch = branches.find((item) => item.slots.some((slot) => slot.courses.includes(match)));
        if (branch) setActiveDomain(branch.domain);
      }
    }
  }, [preselectedCodes, selectedParam, allCourses, branches]);

  useEffect(() => {
    if (!gapCode || !gapCourse) return;
    setSelection({ kind: 'course', id: gapCourse.id });
    setActiveDomain(gapDomain);
    const timer = window.setTimeout(() => document.getElementById('gap-target-course')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    return () => window.clearTimeout(timer);
  }, [gapCode, gapCourse, gapDomain]);

  useEffect(() => {
    if (!focusCode || !focusCourse) return;
    setSelection({ kind: 'course', id: focusCourse.id });
    const branch = branches.find((item) => item.slots.some((slot) => slot.courses.some((course) => course.id === focusCourse.id)));
    if (branch) setActiveDomain(branch.domain);
    const timer = window.setTimeout(() => document.getElementById('gap-target-course')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    return () => window.clearTimeout(timer);
  }, [focusCode, focusCourse, branches]);

  return (
    <div
      className="po-owner course-catalog-page -m-4 md:-m-6 min-h-screen"
      style={{ ...PULSE_TOKENS }}
    >
      <div className="course-catalog-container">
        {/* ── Header ── */}
        <header className="course-catalog-header mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] mb-1.5" style={{ color: 'var(--po-accent)' }}>
              <i className="inline-block size-[6px] rounded-full" style={{ background: 'var(--po-coral)' }} />
              Chương trình chuẩn · Thông tư 02/2025
            </span>
            <h1 className="font-bold tracking-[-0.03em] heading-gradient">
              Khóa học năng lực số
            </h1>
          </div>
          <dl className="course-catalog-stats grid grid-cols-3 gap-2 text-center">
            <Stat label="Miền" value={branches.length} />
            <Stat label="Khóa học" value={allCourses.length} />
            <Stat label="Đang phân công" value={totalAssigned} />
          </dl>
        </header>

        {gapCode && !isLoading && !isError && (
          <div className="course-gap-context" role="status">
            <span className="course-gap-context-icon"><Sparkles size={18} /></span>
            <div><strong>{gapCourse ? `Khóa học bù đắp cho năng lực ${gapCode}` : `Chưa tìm thấy khóa học cho năng lực ${gapCode}`}</strong><span>{gapCourse ? `${gapCourse.code} · ${gapCourse.title} · ${levelName(gapTargetLevel)}` : 'Bạn có thể xem các cấp độ khác trong lĩnh vực này.'}</span></div>
            <Link to="/enterprise/skill-gap">← Về khoảng trống năng lực</Link>
          </div>
        )}
        {focusCode && !gapCode && !isLoading && !isError && <div className="course-gap-context" role="status"><span className="course-gap-context-icon"><BookOpen size={18} /></span><div><strong>{focusCourse ? 'Khóa học đề xuất cho nhân viên' : 'Chưa tìm thấy khóa học'}</strong><span>{focusCourse ? `${focusCourse.code} · ${focusCourse.title}` : `Mã khóa học ${focusCode}`}</span></div><Link to="/enterprise/skill-gap">← Về khoảng trống năng lực</Link></div>}

        {/* ── Banner làm nổi bật các khóa học đã chọn từ Khung năng lực ── */}
        {preselectedCodes.size > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-xs">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Khóa học đã chọn từ Thiết lập Khung năng lực ({preselectedCodes.size} khóa)
                  </h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-800 border border-amber-300">
                    Đang làm nổi bật
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {Array.from(preselectedCodes).map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200 shadow-xs"
                    >
                      <span>{code}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
              <Link
                to="/enterprise/setup"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                ← Về Khung năng lực
              </Link>
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('selected');
                  setSearchParams(next, { replace: true });
                }}
                className="rounded-xl border border-amber-200 bg-amber-100/70 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-200 transition-colors"
              >
                Tắt làm nổi bật
              </button>
              <Link
                to={`/enterprise/courses/checkout?courses=${encodeURIComponent(Array.from(preselectedCodes).join(','))}`}
                className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-105 transition-all flex items-center gap-1.5"
                style={{ background: 'var(--po-accent)' }}
              >
                <span>Thanh toán & Ký online ({preselectedCodes.size} khóa) →</span>
              </Link>
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div
          className="course-catalog-toolbar mb-4 grid gap-3 rounded-[16px] border px-4 py-3"
          style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)' }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <label className="owner-filter-search relative flex min-w-[220px] flex-1 items-center">
              <Search className="pointer-events-none size-4" style={{ color: 'var(--po-muted)' }} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelection(null); }}
                placeholder="Tìm miền, tên hoặc mã khóa (VD: A4-I)…"
                aria-label="Tìm khóa học"
                className="w-full text-sm"
              />
              {search && (
                <button type="button" aria-label="Xóa tìm kiếm" onClick={() => { setSearch(''); setSelection(null); }} className="owner-filter-search__clear" style={{ color: 'var(--po-muted)' }}>
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <ChipGroup label="Cấp độ">
              {[{ level: 0, name: 'Tất cả' }, ...LEVELS].map(({ level, name }) => {
                const active = levelFilter === level;
                const tone = LEVEL_TONES[level];
                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={active}
                    onClick={() => { setLevelFilter(level); setSelection(null); }}
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
          <SectionLoading label="Đang tải khóa học" />
        ) : isError ? (
          <div className="rounded-[18px] border p-8 text-center text-sm" style={{ borderColor: '#fecdd3', background: '#fff1f2', color: '#be123c' }}>
            Không tải được danh mục.{' '}
            <button type="button" className="font-bold underline" onClick={() => refetch()}>Thử lại</button>
          </div>
        ) : (
          <>
            <nav className="course-domain-nav" aria-label="Lĩnh vực năng lực">
              {visibleBranches.map((branch) => (
                <button key={branch.domain} type="button" aria-current={activeBranch?.domain === branch.domain ? 'true' : undefined} onClick={() => { setActiveDomain(branch.domain); setSelection(null); }}>
                  <span className="course-domain-number"><CourseDomainIcon domain={branch.domain} size={19} /><small>{String(branch.domain).padStart(2, '0')}</small></span>
                  <span className="course-domain-info"><strong>{branch.category.name}</strong><small>{branch.slots.reduce((sum, slot) => sum + slot.courses.length, 0)} khóa học{branch.assignedCount ? ` · ${branch.assignedCount} phân công` : ''}</small></span>
                  {branch.slots.some((slot) => slot.courses.some((course) => preselectedCodes.has(canonicalCode(course.code)))) && <span className="course-domain-selected">Đã chọn</span>}
                </button>
              ))}
              {visibleBranches.length === 0 && <p>{visibleOthers.length ? 'Khóa học phù hợp nằm ngoài khung TT02.' : `Không có lĩnh vực hoặc khóa học nào khớp “${query}”.`}</p>}
            </nav>
            <div className="course-catalog-main">
            <section id="course-tree" className="course-domain-panel scroll-mt-[72px]">
              {activeBranch && <BranchNode
                branch={activeBranch}
                query={matchesSearch(activeBranch.category.name, query) ? '' : query}
                levelFilter={levelFilter}
                selection={displaySelection}
                onSelect={setSelection}
                preselectedCodes={preselectedCodes}
                gapCourseId={gapCourse?.id ?? focusCourse?.id}
              />}

              {visibleOthers.length > 0 && (
                <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--po-line)' }}>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-muted)' }}>Ngoài khung TT02</p>
                  <div className="flex flex-wrap gap-2">
                    {visibleOthers.map((course) => (
                      <button
                        key={course.id}
                        id={course.id === focusCourse?.id ? 'gap-target-course' : undefined}
                        type="button"
                        onClick={() => setSelection({ kind: 'course', id: course.id })}
                        className={`rounded-[10px] border px-3 py-2 text-left text-xs font-semibold ${course.id === focusCourse?.id ? 'course-gap-target' : ''}`}
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
            <aside className="course-catalog-detail lg:sticky lg:top-[84px]">
              {selectedCourse ? (
                <CourseDetail
                  course={selectedCourse}
                  branch={selectedBranch}
                  onBuySeats={(c) => setPurchaseModalCourse(c)}
                />
              ) : <div className="course-detail-empty"><BookOpen size={26} /><strong>Chọn khóa học</strong><span>Chi tiết sẽ hiển thị tại đây.</span></div>}
            </aside>
            </div>
          </>
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
  query: string;
  levelFilter: number;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  preselectedCodes: Set<string>;
  gapCourseId?: string;
}

function BranchNode({ branch, query, levelFilter, selection, onSelect, preselectedCodes, gapCourseId }: BranchNodeProps) {
  const courseCount = branch.slots.reduce((sum, slot) => sum + slot.courses.length, 0);
  return (
    <div>
      <div className="course-domain-panel-heading">
        <span>{String(branch.domain).padStart(2, '0')}</span>
        <div><h2>{branch.category.name}</h2><p>{courseCount} khóa học · 3 cấp độ</p></div>
      </div>
        <ol role="group" aria-label={`Khóa học ${branch.category.name}`} className="course-level-grid">
          {branch.slots.map((slot, index) => (
            <LevelSlotNode
              key={slot.level}
              slot={slot}
              domain={branch.domain}
              arrow={index > 0}
              query={query}
              levelFilter={levelFilter}
              selection={selection}
              onSelect={onSelect}
              preselectedCodes={preselectedCodes}
              gapCourseId={gapCourseId}
            />
          ))}
        </ol>
    </div>
  );
}

interface LevelSlotNodeProps {
  slot: { level: number; courses: CourseListItem[] };
  domain: number;
  arrow: boolean;
  query: string;
  levelFilter: number;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  preselectedCodes: Set<string>;
  gapCourseId?: string;
}

function LevelSlotNode({ slot, domain, arrow, query, levelFilter, selection, onSelect, preselectedCodes, gapCourseId }: LevelSlotNodeProps) {
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
          const isPreselected = preselectedCodes.has(canonicalCode(course.code));
          const isGapTarget = course.id === gapCourseId;
          const dimmed = (levelFilter && levelFilter !== slot.level) || (query && !courseMatches(course, query));
          const duration = formatDuration(course.estimatedDurationMinutes);
          const totalSeats = (course.seatsPurchased ?? 0) + (course.seatsGranted ?? 0);
          const isLicensed = level.level === 1 || course.hasLicense || totalSeats > 0;
          return (
            <button
              key={course.id}
              id={isGapTarget ? 'gap-target-course' : undefined}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect({ kind: 'course', id: course.id })}
              className={`flex h-full min-h-[96px] flex-col rounded-[14px] border px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:shadow-md ${isGapTarget ? 'course-gap-target' : ''}`}
              style={{
                borderColor: isPreselected ? '#f59e0b' : selected ? tone.fg : tone.ring,
                background: isPreselected ? '#fffdf7' : selected ? tone.bg : 'var(--po-surface)',
                boxShadow: isPreselected
                  ? '0 0 0 3px rgba(245, 158, 11, 0.4), 0 8px 22px -4px rgba(245, 158, 11, 0.25)'
                  : selected
                  ? `0 0 0 3px ${tone.bg}`
                  : undefined,
                opacity: dimmed ? 0.35 : 1,
              }}
            >
              <CourseArtwork domain={domain} level={slot.level} compact />
              {isPreselected && (
                <span className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white shadow-xs animate-pulse">
                  <Sparkles className="size-2.5" />
                  Đã chọn từ Khung năng lực
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.08em]">
                <span className="rounded px-1.5 py-0.5" style={{ background: tone.bg, color: tone.fg }}>{level.code} · {level.name}</span>
                <span style={{ color: isPreselected ? '#b45309' : 'var(--po-muted)', fontWeight: isPreselected ? 800 : undefined }}>
                  {course.code}
                </span>
                <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  pricing.isFree
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isLicensed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isPreselected
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
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
}: {
  course: CourseListItem;
  branch?: DomainBranch;
  onBuySeats?: (course: CourseListItem) => void;
}) {
  const level = courseLevel(course);
  const tone = LEVEL_TONES[level] ?? LEVEL_TONES[1];
  const pricing = levelPricing(level);
  const totalSeats = (course.seatsPurchased ?? 0) + (course.seatsGranted ?? 0);
  const isLicensed = level === 1 || course.hasLicense || totalSeats > 0;

  return (
    <Panel>
      <CourseArtwork domain={branch?.domain ?? 0} level={level} />
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
        <Row label="Điều kiện">{course.prerequisiteTitle ?? 'Không yêu cầu'}</Row>
        {level > 1 && isLicensed && <Row label="Suất khả dụng">{course.seatsAvailable ?? totalSeats}</Row>}
        <Row label="Phân công">{course.assignedCount} nhân viên</Row>
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
              <Link
                to={`/enterprise/courses/checkout?courses=${encodeURIComponent(course.code)}`}
                className="rounded-[11px] border px-3 py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all block"
                style={{ borderColor: 'var(--po-line)' }}
              >
                + Mua thêm suất & Ký online
              </Link>
            )}
          </>
        ) : (
          <Link
            to={`/enterprise/courses/checkout?courses=${encodeURIComponent(course.code)}`}
            className="rounded-[11px] border px-3 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:brightness-95"
            style={{ borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb' }}
          >
            <span>🔒 Mua suất học & Ký online ({pricing.formatted}) →</span>
          </Link>
        )}
      </div>
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
