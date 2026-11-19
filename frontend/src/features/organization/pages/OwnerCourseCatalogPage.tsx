import { canonicalCourseCode, courseCodeKey } from '@/features/courses/course-code';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ChevronRight, Lock, Plus, ShoppingCart, Sparkles, X } from 'lucide-react';
import { useCourseCatalog } from '@/hooks/use-assignments';
import { useCompetencyCategories } from '@/hooks/use-competencies';
import { courseCategories } from '@/features/courses/course-catalog';
import type { CourseListItem } from '@/services/assignment.service';
import { CourseDomainIcon } from '../components/CourseArtwork';
import {
  LEVELS,
  buildCourseTree,
  courseLevel,
  formatDuration,
  findGapCourse,
  levelName,
  levelPricing,
  type DomainBranch,
} from '../components/course-tree';
import { PULSE_TOKENS } from '../owner-theme';
import { SectionLoading } from '@/components/shared/LoadingState';
import './owner-course-catalog.css';
import './owner-course-catalog-v2.css';

/**
 * OW-23 · Khóa học as a "bánh xe năng lực số": 6 slices (domains) × 3 rings (Cơ bản inside → Nâng cao outside).
 * A course the company has is filled with its domain colour, a course to buy is an outline with a lock and its price.
 * Hover / focus previews a course in the hub, a click opens the course page; the panel beside shows one domain's
 * courses as a ladder with the cart buttons. Status switch and ?level= dim the rest of the wheel instead of hiding it.
 */
type StatusFilter = 'all' | 'toBuy' | 'owned';
type CartItem = { code: string; title: string; level: number; price: number };

const SIZE = 700;
const CENTER = SIZE / 2;
const RINGS: Record<number, [number, number]> = { 1: [128, 184], 2: [190, 246], 3: [252, 308] };
/** Same colours as [data-course-domain] in owner-course-catalog.css. */
const DOMAIN_COLORS = ['#328e9c', '#588fc0', '#9674ba', '#329b79', '#bd805b', '#716bb0'];
/** Gradient of a filled (owned) segment per domain: [inner ring, outer ring]. */
const DOMAIN_GRADIENTS: [string, string][] = [
  ['#5fd8cb', '#1f97c4'],
  ['#8fb6fb', '#4766e0'],
  ['#ee9cf7', '#8d5cf6'],
  ['#6fdea4', '#11a07a'],
  ['#fdb27a', '#e5603f'],
  ['#b6a6fb', '#6552e6'],
];
const DOMAIN_LABELS = ['Khai thác dữ liệu', 'Giao tiếp & hợp tác', 'Sáng tạo nội dung', 'An toàn số', 'Giải quyết vấn đề', 'Trí tuệ nhân tạo'];

const levelLabel = (level: number) => `Cấp ${level} · ${levelName(level)}`;
const isOwnedCourse = (course: CourseListItem) => courseLevel(course) <= 1 || Boolean(course.hasLicense || course.isPurchased);
const pickCourse = (courses: CourseListItem[]) => courses.find((course) => course.status === 'PUBLISHED') ?? courses[0];
const domainNumber = (domain: number) => String(domain).padStart(2, '0');

// ── Wheel geometry ──
const round = (n: number) => Math.round(n * 100) / 100;
const polar = (r: number, deg: number): [number, number] =>
  [round(CENTER + r * Math.cos((deg * Math.PI) / 180)), round(CENTER + r * Math.sin((deg * Math.PI) / 180))];
const domainMid = (domain: number) => -90 + (domain - 1) * 60;

function sectorPath(r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = polar(r1, a0);
  const [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1);
  const [x3, y3] = polar(r0, a0);
  return `M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`;
}

/** Arc for a curved label; on the lower half it runs the other way so the text stays upright. */
function labelArc(domain: number) {
  const mid = domainMid(domain);
  const lower = Math.sin((mid * Math.PI) / 180) > 0.01;
  const r = lower ? 332 : 320;
  const [sx, sy] = polar(r, lower ? mid + 28 : mid - 28);
  const [ex, ey] = polar(r, lower ? mid - 28 : mid + 28);
  return `M${sx} ${sy}A${r} ${r} 0 0 ${lower ? 0 : 1} ${ex} ${ey}`;
}

/** Arc under a domain name (the chosen domain's band). */
function bandArc(mid: number) {
  const r = 326;
  const [sx, sy] = polar(r, mid - 27);
  const [ex, ey] = polar(r, mid + 27);
  return `M${sx} ${sy}A${r} ${r} 0 0 1 ${ex} ${ey}`;
}

/** Rotation that lays text along the ring at this angle, kept between -90° and 90° so it stays upright. */
function labelTurn(mid: number) {
  const turn = (((mid + 90) % 180) + 180) % 180;
  return turn > 90 ? turn - 180 : turn;
}

function mix(a: string, b: string, share: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const channel = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - share) + ((pb >> shift) & 255) * share);
  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}

const shortPrice = (price: number) => (price >= 1_000_000 ? `${(price / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr` : `${Math.round(price / 1000)}k`);

export function OwnerCourseCatalogPage() {
  useUiLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gapCode = searchParams.get('gap') ?? '';
  const gapTargetLevel = Number(searchParams.get('level'));
  const focusCode = searchParams.get('focus') ?? '';
  // ?level=2 → that ring stands out (the trial owner's "Mua khóa học" button leads to the Intermediate courses); removable.
  const [levelFilter, setLevelFilter] = useState(() => {
    const level = Number(searchParams.get('level'));
    return !gapCode && LEVELS.some((l) => l.level === level) ? level : 0;
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [spotDomain, setSpotDomain] = useState(1);
  const [preview, setPreview] = useState<CourseListItem | null>(null);

  const { data: apiCategories = [] } = useCompetencyCategories();
  const categories = useMemo(() => courseCategories(apiCategories), [apiCategories]);
  const { data: coursesData, isLoading, isError, refetch } = useCourseCatalog({});
  const { branches, others } = useMemo(() => buildCourseTree(categories, coursesData?.items ?? []), [categories, coursesData?.items]);
  const allCourses = useMemo(() => branches.flatMap((branch) => branch.slots.flatMap((slot) => slot.courses)), [branches]);
  const everyCourse = useMemo(() => allCourses.concat(others), [allCourses, others]);
  const branchOf = (course: CourseListItem) => branches.find((branch) => branch.slots.some((slot) => slot.courses.includes(course)));

  const gapCourse = findGapCourse(branches, gapCode, gapTargetLevel);
  const focusCourse = focusCode
    ? everyCourse.find((course) => course.id === focusCode) ?? everyCourse.find((course) => courseCodeKey(course.code) === courseCodeKey(focusCode))
    : undefined;
  const referred = gapCourse ?? focusCourse;
  const referredDomain = referred ? branchOf(referred)?.domain : undefined;

  // Courses picked in "Khung năng lực số" (?selected=M1-I,M2-A): the paid ones not owned yet start in the cart.
  const selectedParam = searchParams.get('selected');
  const appliedSelected = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedParam || allCourses.length === 0 || appliedSelected.current === selectedParam) return;
    appliedSelected.current = selectedParam;
    const codes = new Set(selectedParam.split(',').map(courseCodeKey).filter(Boolean));
    const picked = allCourses.filter((course) => codes.has(courseCodeKey(course.code)) && !isOwnedCourse(course));
    setCart(new Map(picked.map((course) => [canonicalCourseCode(course.code), toCartItem(course)])));
  }, [selectedParam, allCourses]);

  useEffect(() => {
    if (!referred) return;
    setLevelFilter(0);
    setStatusFilter('all');
    if (referredDomain) setSpotDomain(referredDomain);
    const timer = window.setTimeout(() => document.getElementById('gap-target-course')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    return () => window.clearTimeout(timer);
  }, [referred, referredDomain]);

  const matches = (course: CourseListItem) =>
    (!levelFilter || courseLevel(course) === levelFilter)
    && (statusFilter === 'all' || (statusFilter === 'owned') === isOwnedCourse(course));
  const ownedCount = allCourses.filter(isOwnedCourse).length;
  const toBuy = allCourses.filter((course) => !isOwnedCourse(course));

  const toggleCart = (course: CourseListItem) => setCart((current) => {
    const next = new Map(current);
    const code = canonicalCourseCode(course.code);
    if (next.has(code)) next.delete(code);
    else next.set(code, toCartItem(course));
    return next;
  });
  const addToCart = (list: CourseListItem[]) => setCart((current) => new Map([...current, ...list.map((course) => [canonicalCourseCode(course.code), toCartItem(course)] as const)]));
  const addAllToBuy = () => addToCart(toBuy);
  const allInCart = toBuy.length > 0 && toBuy.every((course) => cart.has(canonicalCourseCode(course.code)));
  const cartTotal = [...cart.values()].reduce((sum, item) => sum + item.price, 0);
  const spot = branches.find((branch) => branch.domain === spotDomain) ?? branches[0];
  const hubCourse = preview ?? referred ?? null;

  return (
    <div className="po-owner course-catalog-page ck-page -m-4 md:-m-6 min-h-screen" style={{ ...PULSE_TOKENS }}>
      <div className="course-catalog-container ck-container" data-cart={cart.size > 0 || undefined}>
        <header className="ck-header">
          <h1 className="font-bold tracking-[-0.03em] heading-gradient">{translateUi('Khóa học')}</h1>
          <div className="ck-tools">
            <div className="ck-segment" role="group" aria-label={translateUi('Trạng thái')}>
              {([['all', 'Tất cả'], ['toBuy', 'Chưa mua'], ['owned', 'Đã có']] as const).map(([value, name]) => (
                <button key={value} type="button" data-tone={value} aria-pressed={statusFilter === value} onClick={() => setStatusFilter(value)}>
                  {translateUi(name)}
                </button>
              ))}
            </div>
            {levelFilter > 0 && (
              <button type="button" className="ck-level-filter" data-level={levelFilter} onClick={() => setLevelFilter(0)}
                aria-label={translateUi(`Bỏ lọc ${levelLabel(levelFilter)}`)}>
                {translateUi(`Chỉ ${levelLabel(levelFilter)}`)}<X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        {gapCode && !isLoading && !isError && (
          <div className="course-gap-context" data-course-domain={referredDomain} role="status">
            <span className="course-gap-context-icon"><Sparkles size={18} /></span>
            <div><strong>{gapCourse ? translateUi(`Khóa học bù đắp cho năng lực ${gapCode}`) : translateUi(`Chưa tìm thấy khóa học cho năng lực ${gapCode}`)}</strong><span>{gapCourse ? `${canonicalCourseCode(gapCourse.code)} · ${gapCourse.title} · ${levelName(gapTargetLevel)}` : translateUi('Bạn có thể xem các cấp độ khác trong lĩnh vực này.')}</span></div>
            <Link to="/enterprise/skill-gap">{translateUi('← Về khoảng trống năng lực')}</Link>
          </div>
        )}
        {focusCode && !gapCode && !isLoading && !isError && (
          <div className="course-gap-context" data-course-domain={referredDomain} role="status">
            <span className="course-gap-context-icon"><BookOpen size={18} /></span>
            <div><strong>{focusCourse ? translateUi('Khóa học đề xuất cho nhân viên') : translateUi('Chưa tìm thấy khóa học')}</strong><span>{focusCourse ? `${canonicalCourseCode(focusCourse.code)} · ${focusCourse.title}` : translateUi(`Mã khóa học ${focusCode}`)}</span></div>
            <Link to="/enterprise/skill-gap">{translateUi('← Về khoảng trống năng lực')}</Link>
          </div>
        )}

        {isLoading ? (
          <SectionLoading label={translateUi('Đang tải khóa học')} />
        ) : isError ? (
          <div className="ck-error">{translateUi('Không tải được danh mục.')}{' '}
            <button type="button" onClick={() => refetch()}>{translateUi('Thử lại')}</button>
          </div>
        ) : (
          <div className="ck-stage">
            <div className="ck-wheel-wrap">
              <div className="ck-wheel">
                <CourseWheel branches={branches} matches={matches} previewId={hubCourse?.id} referredId={referred?.id} spotDomain={spot?.domain}
                  onPreview={setPreview} onSpot={setSpotDomain} onOpen={(course) => navigate(`/enterprise/courses/${course.id}`)} />
                <div className="ck-hub" data-course-domain={hubCourse ? branchOf(hubCourse)?.domain : undefined}>
                  {hubCourse ? <HubPreview course={hubCourse} inCart={cart.has(canonicalCourseCode(hubCourse.code))} /> : (
                    <>
                      <strong className="ck-hub__num">{ownedCount}<small>/{allCourses.length}</small></strong>
                      <span className="ck-hub__caption">{translateUi('khóa học đã có')}</span>
                      {toBuy.length > 0 && (
                        <button type="button" className="ck-hub__all" onClick={addAllToBuy} disabled={allInCart}>
                          {allInCart ? <><Check size={13} aria-hidden="true" />{translateUi('Đã thêm cả vào giỏ')}</> : <><Plus size={13} aria-hidden="true" />{translateUi(`Thêm cả ${toBuy.length} khóa vào giỏ`)}</>}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {spot && (
              <DomainSpotlight branches={branches} branch={spot} onPick={setSpotDomain} matches={matches} referredId={referred?.id}
                cart={cart} onToggleCart={toggleCart} onAddMany={addToCart} others={others} />
            )}
          </div>
        )}
      </div>

      {cart.size > 0 && (
        <div className="ck-cart" role="region" aria-label={translateUi('Giỏ khóa học')}>
          <span className="ck-cart__count" title={translateUi(`${cart.size} khóa`)}><ShoppingCart size={16} aria-hidden="true" />{cart.size}</span>
          <div className="ck-cart__copy">
            <strong>{`${cartTotal.toLocaleString('vi-VN')} ₫`}</strong>
            <span>{[...cart.values()].map((item) => translateUi(item.title)).join(' · ')}</span>
          </div>
          <button type="button" className="ck-cart__clear" onClick={() => setCart(new Map())}>{translateUi('Bỏ hết')}</button>
          <Link className="ck-cart__pay" to={`/enterprise/courses/checkout?courses=${encodeURIComponent([...cart.keys()].join(','))}`}>
            {translateUi('Thanh toán & Ký online')}<ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}

function toCartItem(course: CourseListItem): CartItem {
  const level = courseLevel(course);
  return { code: canonicalCourseCode(course.code), title: course.title, level, price: levelPricing(level, course.price).price };
}

function statusText(course: CourseListItem) {
  const level = courseLevel(course);
  if (level <= 1) return 'Miễn phí';
  return isOwnedCourse(course) ? 'Đã mua' : levelPricing(level, course.price).badge;
}

/** The wheel itself: slices = domains, rings = levels; a segment is a link to its course. */
function CourseWheel({ branches, matches, previewId, referredId, spotDomain, onPreview, onSpot, onOpen }: {
  branches: DomainBranch[];
  matches: (course: CourseListItem) => boolean;
  previewId?: string;
  referredId?: string;
  spotDomain?: number;
  onPreview: (course: CourseListItem | null) => void;
  onSpot: (domain: number) => void;
  onOpen: (course: CourseListItem) => void;
}) {
  useUiLanguage();
  const hoverTimer = useRef<number | undefined>(undefined);
  // With a finger the first tap shows the course (hub + panel), a second tap on the same course opens it.
  const pointerType = useRef('mouse');
  const armed = useRef<string | null>(null);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label={translateUi('Bánh xe khóa học: 6 lĩnh vực, vòng trong Cơ bản, vòng ngoài Nâng cao')}>
      <defs>
        {DOMAIN_GRADIENTS.map(([from, to], index) => (
          <radialGradient key={from} id={`ck-fill-${index + 1}`} gradientUnits="userSpaceOnUse" cx={CENTER} cy={CENTER} r={RINGS[3][1]}>
            <stop offset="0.4" stopColor={from} />
            <stop offset="0.72" stopColor={mix(from, to, 0.55)} />
            <stop offset="1" stopColor={to} />
          </radialGradient>
        ))}
        {/* The chosen domain's label sits on a band in its own gradient */}
        {DOMAIN_GRADIENTS.map(([from, to], index) => (
          <linearGradient key={to} id={`ck-band-${index + 1}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={mix(from, to, 0.35)} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        ))}
        <filter id="ck-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" /></filter>
        {branches.map((branch) => <path key={branch.domain} id={`ck-arc-${branch.domain}`} d={labelArc(branch.domain)} />)}
      </defs>
      <circle className="ck-wheel__guide" cx={CENTER} cy={CENTER} r={RINGS[3][1] + 4} />
      {branches.map((branch) => {
        const color = DOMAIN_COLORS[branch.domain - 1] ?? DOMAIN_COLORS[0];
        const mid = domainMid(branch.domain);
        // Ring labels run along the ring (tangent), turned so they never read upside down.
        const turn = labelTurn(mid);
        return (
          <g
            key={branch.domain}
            className="ck-slice"
            data-spot={branch.domain === spotDomain || undefined}
            style={{ '--sx': `${round(Math.cos((mid * Math.PI) / 180) * 9)}px`, '--sy': `${round(Math.sin((mid * Math.PI) / 180) * 9)}px` } as React.CSSProperties}
          >
            {/* The domain shown in the panel: a blurred halo behind it and a coloured band under its name */}
            <path className="ck-slice__glow" d={sectorPath(RINGS[1][0] - 10, RINGS[3][1] + 14, mid - 31, mid + 31)} fill={DOMAIN_GRADIENTS[branch.domain - 1]?.[1] ?? color} filter="url(#ck-blur)" aria-hidden="true" />
            <path className="ck-slice__band" d={bandArc(mid)} stroke={`url(#ck-band-${branch.domain})`} aria-hidden="true" onClick={() => onSpot(branch.domain)} />
            <text className="ck-slice__label" onClick={() => onSpot(branch.domain)} aria-hidden="true" style={{ '--label': mix(color, '#14233a', 0.42) } as React.CSSProperties}>
              <textPath href={`#ck-arc-${branch.domain}`} startOffset="50%" textAnchor="middle">
                {`${domainNumber(branch.domain)} · ${translateUi(DOMAIN_LABELS[branch.domain - 1] ?? branch.category.name)}`}
              </textPath>
            </text>
            {LEVELS.map(({ level }, ringIndex) => {
              const [r0, r1] = RINGS[level];
              const pad = (3 / ((r0 + r1) / 2)) * (180 / Math.PI);
              const path = sectorPath(r0, r1, mid - 30 + pad, mid + 30 - pad);
              const [lx, ly] = polar((r0 + r1) / 2, mid);
              const course = pickCourse(branch.slots.find((slot) => slot.level === level)?.courses ?? []);
              if (!course) {
                return <path key={level} className="ck-seg__empty" d={path} aria-hidden="true" />;
              }
              const owned = isOwnedCourse(course);
              const status = statusText(course);
              const delay = `${(branch.domain - 1) * 70 + ringIndex * 90}ms`;
              const dx = round(Math.cos((mid * Math.PI) / 180) * 7);
              const dy = round(Math.sin((mid * Math.PI) / 180) * 7);
              return (
                <g
                  key={level}
                  className="ck-seg"
                  role="link"
                  tabIndex={0}
                  data-owned={owned || undefined}
                  data-dim={!matches(course) || undefined}
                  data-active={course.id === previewId || undefined}
                  data-referred={course.id === referredId || undefined}
                  aria-label={`${translateUi(course.title)} · ${translateUi(levelLabel(level))} · ${translateUi(owned ? status : `Chưa mua · ${status}`)}`}
                  style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: delay } as React.CSSProperties}
                  onMouseEnter={() => {
                    onPreview(course);
                    window.clearTimeout(hoverTimer.current);
                    hoverTimer.current = window.setTimeout(() => onSpot(branch.domain), 350);
                  }}
                  onMouseLeave={() => { window.clearTimeout(hoverTimer.current); if (pointerType.current !== 'touch') onPreview(null); }}
                  onFocus={() => { onPreview(course); onSpot(branch.domain); }}
                  onBlur={() => { if (pointerType.current !== 'touch') onPreview(null); }}
                  onPointerDown={(event) => { pointerType.current = event.pointerType; }}
                  onClick={() => {
                    if (pointerType.current === 'touch' && armed.current !== course.id) {
                      armed.current = course.id;
                      onPreview(course);
                      onSpot(branch.domain);
                      return;
                    }
                    onOpen(course);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(course); }
                  }}
                >
                  <path
                    className="ck-seg__shape"
                    d={path}
                    fill={owned ? `url(#ck-fill-${branch.domain})` : mix(color, '#ffffff', 0.92)}
                    stroke={owned ? '#ffffff' : color}
                    strokeWidth={owned ? 3 : undefined}
                  />
                  <g className="ck-seg__label" transform={`translate(${lx} ${ly}) rotate(${turn})`} style={{ color: owned ? '#ffffff' : mix(color, '#14233a', 0.35) }} aria-hidden="true">
                    <text className="ck-seg__text" x={0} y={-2} textAnchor="middle">{levelName(level)}</text>
                    {owned ? <Check x={-7} y={4} size={14} strokeWidth={3} /> : (
                      <>
                        <Lock x={-25} y={5} size={12} strokeWidth={2.5} />
                        <text className="ck-seg__sub" x={7} y={16} textAnchor="middle">{shortPrice(levelPricing(level, course.price).price)}</text>
                      </>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function HubPreview({ course, inCart }: { course: CourseListItem; inCart: boolean }) {
  useUiLanguage();
  const level = courseLevel(course);
  const owned = isOwnedCourse(course);
  const duration = formatDuration(course.estimatedDurationMinutes);
  return (
    <>
      <span className="ck-hub__level" data-level={level}>{translateUi(levelLabel(level))}</span>
      <strong className="ck-hub__title">{translateUi(course.title)}</strong>
      <span className="ck-hub__meta">{[translateUi(`${course.modules} học phần`), duration].filter(Boolean).join(' · ')}</span>
      <span className="ck-hub__status" data-tone={owned ? 'owned' : 'buy'}>
        {owned ? <Check size={13} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
        {translateUi(inCart ? 'Trong giỏ' : statusText(course))}
      </span>
      <span className="ck-hub__hint">{translateUi('Chạm lần nữa để mở')}</span>
    </>
  );
}

/** One domain beside the wheel: a domain picker, then its courses as a ladder (Cơ bản → Nâng cao), each a link. */
function DomainSpotlight({ branches, branch, onPick, matches, referredId, cart, onToggleCart, onAddMany, others }: {
  branches: DomainBranch[];
  branch: DomainBranch;
  onPick: (domain: number) => void;
  matches: (course: CourseListItem) => boolean;
  referredId?: string;
  cart: Map<string, CartItem>;
  onToggleCart: (course: CourseListItem) => void;
  onAddMany: (courses: CourseListItem[]) => void;
  others: CourseListItem[];
}) {
  useUiLanguage();
  const courses = branch.slots.flatMap((slot) => slot.courses);
  const missing = courses.filter((course) => !isOwnedCourse(course));
  const missingTotal = missing.reduce((sum, course) => sum + levelPricing(courseLevel(course), course.price).price, 0);
  const missingInCart = missing.length > 0 && missing.every((course) => cart.has(canonicalCourseCode(course.code)));
  return (
    <aside className="ck-spot" data-course-domain={branch.domain} aria-label={translateUi(`Lĩnh vực ${domainNumber(branch.domain)} · ${branch.category.name}`)}>
      <div className="ck-picker" role="group" aria-label={translateUi('Chọn lĩnh vực')}>
        {branches.map((item) => {
          return (
            <button key={item.domain} type="button" data-course-domain={item.domain} aria-pressed={item.domain === branch.domain} onClick={() => onPick(item.domain)}
              aria-label={translateUi(`Lĩnh vực ${domainNumber(item.domain)} · ${item.category.name}`)} title={translateUi(item.category.name)}>
              <CourseDomainIcon domain={item.domain} size={17} />
            </button>
          );
        })}
      </div>

      <header className="ck-spot__head">
        <span className="ck-spot__name">
          <small>{translateUi(`Lĩnh vực ${domainNumber(branch.domain)}`)}</small>
          <strong>{translateUi(branch.category.name)}</strong>
        </span>
      </header>

      <ol className="ck-steps">
        {LEVELS.map(({ level }) => {
          const slotCourses = branch.slots.find((slot) => slot.level === level)?.courses ?? [];
          if (slotCourses.length === 0) {
            return <li key={level} className="ck-step ck-step--none" data-level={level}><span className="ck-step__dot">{level}</span><span>{translateUi(`${levelLabel(level)} · chưa có khóa`)}</span></li>;
          }
          return slotCourses.map((course) => (
            <SpotStep key={course.id} course={course} domain={branch.domain} dim={!matches(course)} referred={course.id === referredId}
              inCart={cart.has(canonicalCourseCode(course.code))} onToggleCart={() => onToggleCart(course)} />
          ));
        })}
      </ol>

      <div className="ck-spot__foot" data-full={missing.length === 0 || undefined}>
        {missing.length === 0 ? (
          <span><Check size={15} aria-hidden="true" />{translateUi('Đủ cả 3 cấp cho lĩnh vực này')}</span>
        ) : (
          <>
            <span>{translateUi(`Còn ${missing.length} khóa · ${missingTotal.toLocaleString('vi-VN')} ₫ để đủ lĩnh vực`)}</span>
            <button type="button" onClick={() => onAddMany(missing)} disabled={missingInCart}>
              {missingInCart ? <><Check size={14} aria-hidden="true" />{translateUi('Đã trong giỏ')}</> : <><ShoppingCart size={14} aria-hidden="true" />{translateUi('Mua đủ lĩnh vực')}</>}
            </button>
          </>
        )}
      </div>

      {others.length > 0 && (
        <div className="ck-others">
          <strong>{translateUi('Khóa học khác')}</strong>
          {others.map((course) => (
            <Link key={course.id} to={`/enterprise/courses/${course.id}`}>{translateUi(course.title)}<ChevronRight size={14} aria-hidden="true" /></Link>
          ))}
        </div>
      )}
    </aside>
  );
}

function SpotStep({ course, domain, dim, referred, inCart, onToggleCart }: {
  course: CourseListItem;
  domain: number;
  dim: boolean;
  referred: boolean;
  inCart: boolean;
  onToggleCart: () => void;
}) {
  useUiLanguage();
  const level = courseLevel(course);
  const owned = isOwnedCourse(course);
  const code = canonicalCourseCode(course.code);
  const duration = formatDuration(course.estimatedDurationMinutes);
  return (
    <li className="ck-step" data-level={level} data-owned={owned || undefined} data-dim={dim || undefined} data-cart={inCart || undefined}>
      <span className="ck-step__dot" aria-hidden="true">{owned ? <Check size={13} /> : level}</span>
      <Link
        to={`/enterprise/courses/${course.id}`}
        id={referred ? 'gap-target-course' : undefined}
        className={`ck-step__link${referred ? ' course-gap-target' : ''}`}
        data-domain={domain}
        data-course-domain={domain}
        aria-current={referred || undefined}
      >
        <small>{levelName(level)}</small>
        <strong>{translateUi(course.title)}</strong>
        <span className="ck-step__meta">
          {[translateUi(`${course.modules} học phần`), duration].filter(Boolean).join(' · ')}
          {course.status === 'DRAFT' && <em>{translateUi('Nháp')}</em>}
        </span>
        <span className="ck-step__status" data-tone={owned ? 'owned' : 'buy'}>
          {owned ? <Check size={13} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}{translateUi(statusText(course))}
        </span>
      </Link>
      {!owned && (
        <button type="button" className="ck-step__cart" aria-pressed={inCart} onClick={onToggleCart}
          aria-label={translateUi(inCart ? `Bỏ ${code} khỏi giỏ` : `Thêm ${code} vào giỏ`)}>
          {inCart ? <><Check size={13} aria-hidden="true" />{translateUi('Trong giỏ')}</> : <><Plus size={13} aria-hidden="true" />{translateUi('Thêm vào giỏ')}</>}
        </button>
      )}
    </li>
  );
}
