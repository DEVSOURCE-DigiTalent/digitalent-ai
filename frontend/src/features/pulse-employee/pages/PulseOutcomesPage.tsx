import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Award,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Target,
  Copy,
  Check,
  Search,
  Zap,
} from 'lucide-react';
import { usePulseOutcome, usePulseOutcomes, usePulseOverview } from '@/hooks/use-pulse';
import type { PulseOutcomeKind } from '@/services/pulse.service';
import { formatDate } from '@/lib/utils';
import { Empty, LoadError, PageSkeleton, PuLink } from '../components/ui';
import { pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

const KIND_LABELS: Record<PulseOutcomeKind, string> = {
  COURSE: 'Huy hiệu môn học',
  PRE_ASSESSMENT: 'Bài đánh giá đầu vào',
  CERTIFICATE: 'Chứng chỉ chuẩn chức danh',
  PRACTICAL_TASK: 'Minh chứng thực tế',
};

type OutcomeFilter = 'ALL' | 'COURSE' | 'PRE_ASSESSMENT' | 'PRACTICAL_TASK';

/**
 * Hồ sơ Chứng nhận & Minh chứng Số:
 * - Khối 1: Header trang + 4 Thẻ KPI tóm tắt năng lực số.
 * - Khối 2: Chứng chỉ Chuẩn Năng lực Chức danh (Grand Milestone) kèm Mini Domain Tracker 6 lĩnh vực.
 * - Khối 3: Thanh công cụ Lọc phân loại & Tìm kiếm mã tra cứu.
 * - Khối 4: Danh sách Huy hiệu & Chứng nhận từng môn học với thao tác 1-Click (Xem A4 & Copy link tra cứu).
 */
export function PulseOutcomesPage() {
  const { data, isLoading, error, refetch } = usePulseOutcomes();
  const { data: overview } = usePulseOverview();

  const [activeFilter, setActiveFilter] = useState<OutcomeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const position = overview?.person.positionName ?? 'Chuyên viên Kế toán tài chính';
  const totalCourses = overview?.stats.pathCourses ?? 8;
  const approvedCourses = overview?.stats.approvedPathCourses ?? 1;
  const isAllCompleted = totalCourses > 0 && approvedCourses >= totalCourses;
  const pct = totalCourses > 0 ? Math.round((approvedCourses / totalCourses) * 100) : 0;
  const domains = overview?.domains ?? [];

  const allOutcomes = data ?? [];
  const courseCerts = useMemo(() => allOutcomes.filter((o) => o.kind === 'COURSE'), [allOutcomes]);
  const preCerts = useMemo(() => allOutcomes.filter((o) => o.kind === 'PRE_ASSESSMENT'), [allOutcomes]);
  const taskCerts = useMemo(() => allOutcomes.filter((o) => o.kind === 'PRACTICAL_TASK'), [allOutcomes]);

  const handleCopyLink = (e: React.MouseEvent, refCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/verify/${refCode}`
      : `https://digitalent.vn/verify/${refCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedRef(refCode);
      setTimeout(() => setCopiedRef(null), 2000);
    });
  };

  const filteredOutcomes = useMemo(() => {
    return allOutcomes.filter((item) => {
      const matchKind = activeFilter === 'ALL' || item.kind === activeFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
        item.reference.toLowerCase().includes(query);
      return matchKind && matchQuery;
    });
  }, [allOutcomes, activeFilter, searchQuery]);

  return (
    <div className="pu-outcomes-container">
      {/* ── 1. Page Header Đồng Bộ Chuẩn Pulse (pu-workbench-header) ──────── */}
      <header className="pu-workbench-header">
        <div className="pu-path-title-block">
          <div className="pu-path-badge-pill">
            <ShieldCheck size={13} className="text-blue-800" />
            <span>Hệ thống Chứng nhận & Minh chứng Số</span>
          </div>
          <h1 className="pu-path-main-title">Chứng chỉ & Kết quả Đào tạo</h1>
          <p className="pu-path-sub-title">
            Hồ sơ văn bằng chuẩn chức danh và chứng nhận hoàn thành năng lực số trên hệ thống DigiTalent AI.
          </p>
        </div>
      </header>

      {/* ── 2. Grand Job Role Certificate Milestone Card ───────────────────── */}
      <section className="pu-job-role-cert-card" aria-label="Chứng chỉ chuẩn chức danh">
        <div className="pu-job-cert-body">
          <div className="pu-job-cert-top">
            <span className="pu-job-cert-tag">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              CHỨNG NHẬN CHUẨN NĂNG LỰC CHỨC DANH
            </span>
            <span className={`pu-job-cert-status-pill ${isAllCompleted ? 'issued' : 'in-progress'}`}>
              {isAllCompleted ? 'Đã cấp chính thức' : `Đang hoàn thiện: ${approvedCourses}/${totalCourses} khóa (${pct}%)`}
            </span>
          </div>

          <h2 className="pu-job-cert-title">
            Chuẩn Năng lực Chức danh: {position}
          </h2>

          <p className="pu-job-cert-desc">
            {isAllCompleted
              ? 'Bạn đã hoàn thành đủ các khóa học theo khung năng lực chức danh. Chứng chỉ chính thức đã được hội đồng thẩm định phê duyệt.'
              : `Chứng chỉ Chuẩn Chức danh sẽ được cấp khi bạn hoàn thành toàn bộ ${totalCourses} khóa học trong lộ trình. Hiện bạn đã đạt ${approvedCourses} khóa.`}
          </p>

          <div className="pu-job-cert-progress-row">
            <div className="pu-job-cert-bar-track">
              <div className="pu-job-cert-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="pu-job-cert-pct">{pct}%</span>
          </div>

          {/* Mini Domain Tracker: Độ phủ qua 6 Lĩnh vực chuẩn hóa */}
          {domains.length > 0 && (
            <div className="pu-mini-domain-tracker">
              <span className="pu-mini-domain-label">Độ phủ 6 Lĩnh vực:</span>
              {domains.map((d) => {
                const isMet = d.status === 'MET';
                return (
                  <span
                    key={d.categoryId || d.number}
                    className={`pu-domain-mini-pill${isMet ? ' met' : ''}`}
                    title={`Lĩnh vực 0${d.number}: ${d.name} (${isMet ? 'Đã đạt chuẩn' : 'Chưa hoàn thành'})`}
                  >
                    {isMet ? <Check size={11} strokeWidth={3} /> : <span className="text-slate-400">·</span>}
                    <span>LV 0{d.number}</span>
                  </span>
                );
              })}
            </div>
          )}

          <div className="pu-job-cert-actions">
            {isAllCompleted ? (
              <Link to={PULSE_PATHS.outcome('job-role-cert')} className="pu-btn-view-cert">
                <Award size={15} />
                <span>Xem & in chứng chỉ A4</span>
                <ArrowRight size={14} className="pu-btn-arrow" />
              </Link>
            ) : (
              <Link to={PULSE_PATHS.path} className="pu-btn-view-path">
                <Target size={15} />
                <span>Xem các khóa cần học tiếp trong lộ trình</span>
                <ArrowRight size={14} className="pu-btn-arrow" />
              </Link>
            )}
          </div>
        </div>

        <div className="pu-job-cert-visual" aria-hidden="true">
          <div className="pu-job-seal-preview">
            <ShieldCheck size={48} className="text-blue-700" />
            <span>DIGITALENT AI</span>
            <small>VERIFIED</small>
          </div>
        </div>
      </section>

      {/* ── 4. Thanh Công Cụ: Bộ Lọc Tab & Ô Tìm Kiếm Tra Cứu ─────────────── */}
      <div className="pu-outcomes-toolbar">
        <div className="pu-outcomes-tabs" role="tablist" aria-label="Bộ lọc loại chứng chỉ">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`pu-outcomes-tab-btn${activeFilter === 'ALL' ? ' active' : ''}`}
          >
            <span>Tất cả</span>
            <span className="pu-outcomes-tab-badge">{allOutcomes.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('COURSE')}
            className={`pu-outcomes-tab-btn${activeFilter === 'COURSE' ? ' active' : ''}`}
          >
            <Award size={13} />
            <span>Huy hiệu môn học</span>
            <span className="pu-outcomes-tab-badge">{courseCerts.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('PRE_ASSESSMENT')}
            className={`pu-outcomes-tab-btn${activeFilter === 'PRE_ASSESSMENT' ? ' active' : ''}`}
          >
            <Zap size={13} />
            <span>Đánh giá đầu vào</span>
            <span className="pu-outcomes-tab-badge">{preCerts.length}</span>
          </button>
          {taskCerts.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('PRACTICAL_TASK')}
              className={`pu-outcomes-tab-btn${activeFilter === 'PRACTICAL_TASK' ? ' active' : ''}`}
            >
              <span>Minh chứng thực tế</span>
              <span className="pu-outcomes-tab-badge">{taskCerts.length}</span>
            </button>
          )}
        </div>

        {/* Ô tìm kiếm nhanh */}
        <div className="pu-outcomes-search-wrap">
          <Search size={14} className="pu-outcomes-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên môn hoặc mã chứng chỉ..."
            className="pu-outcomes-search-input"
            aria-label="Tìm kiếm chứng chỉ"
          />
        </div>
      </div>

      {/* ── 4. Danh Sách Thẻ Chứng Nhận Môn Học & Thao Tác 1-Click ─────────── */}
      <section className="pu-course-badges-section" aria-labelledby="sec-badges-title">
        <div className="pu-badges-sec-head">
          <div>
            <h2 id="sec-badges-title" className="pu-badges-title">
              Danh mục Huy hiệu Môn học & Minh chứng ({filteredOutcomes.length})
            </h2>
            <p className="pu-badges-sub">
              Bản ghi công nhận chính thức qua bài thi cuối khóa hoặc bài khảo sát miễn học theo 6 lĩnh vực.
            </p>
          </div>
        </div>

        {isLoading ? (
          <PageSkeleton blocks={[180]} />
        ) : error || !data ? (
          <LoadError message={pulseErrorMessage(error, 'Không tải được kết quả đã xác nhận.')} onRetry={() => refetch()} />
        ) : filteredOutcomes.length === 0 ? (
          <Empty
            icon={<Award size={24} />}
            title={searchQuery ? 'Không tìm thấy chứng nhận phù hợp' : 'Chưa có bản ghi môn học được xác nhận'}
            action={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="pu-table-btn ghost-btn text-blue-700"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              ) : (
                <PuLink to={PULSE_PATHS.path}>Xem lộ trình của tôi →</PuLink>
              )
            }
          >
            {searchQuery
              ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
              : 'Khi mentor duyệt bài cuối khóa hoặc bài đánh giá đầu vào, bản ghi chứng nhận sẽ xuất hiện ở đây.'}
          </Empty>
        ) : (
          <div className="pu-cert-grid">
            {filteredOutcomes.map((outcome) => (
              <div
                key={outcome.id}
                className={`pu-cert-card group${outcome.kind === 'PRE_ASSESSMENT' ? ' pre-kind' : ''}`}
              >
                <div className="pu-cert-accent-bar" />

                <div className="pu-cert-body">
                  <div className="pu-cert-top">
                    <span className={`pu-cert-badge${outcome.kind === 'PRE_ASSESSMENT' ? ' pre' : ''}`}>
                      {outcome.kind === 'PRE_ASSESSMENT' ? (
                        <Zap size={13} />
                      ) : (
                        <Award size={13} />
                      )}
                      {KIND_LABELS[outcome.kind]}
                    </span>
                    <span className="pu-cert-status">
                      <span className="pu-status-dot" />
                      Đã đạt
                    </span>
                  </div>

                  {outcome.subtitle && (
                    <div className="pu-cert-domain">
                      {outcome.subtitle}
                    </div>
                  )}

                  <h3 className="pu-cert-title">
                    <Link to={PULSE_PATHS.outcome(outcome.id)} className="hover:underline text-inherit">
                      {outcome.title}
                    </Link>
                  </h3>

                  <div className="pu-cert-meta-row">
                    <span className="pu-cert-date">
                      <Calendar size={13} className="text-slate-500" />
                      {formatDate(outcome.issuedAt)}
                    </span>
                    <span className="pu-cert-ref">
                      Mã: <code>{outcome.reference}</code>
                    </span>
                  </div>
                </div>

                <div className="pu-cert-footer">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, outcome.reference)}
                    className={`pu-cert-copy-btn${copiedRef === outcome.reference ? ' copied' : ''}`}
                    title="Sao chép liên kết tra cứu chứng thực"
                  >
                    {copiedRef === outcome.reference ? (
                      <>
                        <Check size={12} strokeWidth={3} />
                        <span>Đã chép link</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Sao chép mã</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={PULSE_PATHS.outcome(outcome.id)}
                    className="pu-cert-cta"
                    title="Xem chi tiết và in bản chứng nhận A4"
                  >
                    <span>Xem chứng nhận A4</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Trang chi tiết Chứng nhận năng lực chuẩn A4 Landscape:
 * Thiết kế trang trọng theo chuẩn personal/certificates:
 * Khung viền Guilloche, QR code xác thực trực tuyến, Con dấu số vàng kim, chữ ký giám đốc học thuật.
 */
export function PulseOutcomeDetailPage() {
  const { outcomeId } = useParams<{ outcomeId: string }>();
  const { data, isLoading, error } = usePulseOutcome(outcomeId);
  const [qrSvg, setQrSvg] = useState<string>('');

  const certCode = data?.reference ?? outcomeId ?? 'DT-CERT-2026';
  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${certCode}`
    : `https://digitalent.vn/verify/${certCode}`;

  useEffect(() => {
    let active = true;
    QRCode.toString(verifyUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#1c1b16',
        light: '#00000000',
      },
    })
      .then((svg) => {
        if (active) setQrSvg(svg);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });
    return () => {
      active = false;
    };
  }, [verifyUrl]);

  if (isLoading) return <PageSkeleton blocks={[120, 480]} />;
  if (error || !data) {
    return (
      <Empty icon={<Award size={24} />} title="Không tìm thấy bản ghi" action={<PuLink to={PULSE_PATHS.outcomes} kind="outline">Tất cả kết quả</PuLink>}>
        {pulseErrorMessage(error, 'Bản ghi không tồn tại hoặc không thuộc về bạn.')}
      </Empty>
    );
  }

  return (
    <div className="pu-outcome-detail-container">
      {/* ── Top Bar (No Print) ──────────────────────────────────────────────── */}
      <div className="pu-detail-nav pu-no-print">
        <Link to={PULSE_PATHS.outcomes} className="pu-back-link">
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách chứng nhận</span>
        </Link>
        <div className="pu-detail-actions">
          <button type="button" className="pu-btn-print" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            <span>In bản chứng nhận (A4)</span>
          </button>
          {data.courseId && (
            <Link to={PULSE_PATHS.course(data.courseId)} className="pu-btn-course">
              <BookOpen className="w-4 h-4" />
              <span>Xem khóa học</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Subtitle Header (No Print) ──────────────────────────────────────── */}
      <div className="pu-detail-header pu-no-print">
        <div className="pu-detail-badge">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Bản ghi năng lực số chuẩn hóa</span>
        </div>
        <h1 className="pu-detail-h1">Chứng nhận hoàn thành năng lực</h1>
        <p className="pu-detail-desc">
          Bản ghi chính thức của doanh nghiệp, công nhận trình độ trong lộ trình phát triển nghề nghiệp trên hệ thống DigiTalent AI.
        </p>
      </div>

      {/* ── High-Fidelity A4 Landscape Certificate Sheet (Theo chuẩn personal/certificates) ── */}
      <div className="pu-cert-sheet-wrapper">
        <article
          data-testid="certificate-document"
          className="certificate-print-sheet relative mx-auto w-full max-w-[880px] overflow-hidden rounded-xl bg-[#FDFBF7] text-[#1c1917] shadow-xl border border-[#b89758]/30 transition-all select-none print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:h-screen"
          style={{ aspectRatio: '1.414 / 1' }}
        >
          {/* Background Watermark & Pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.03] flex items-center justify-center overflow-hidden"
          >
            <svg viewBox="0 0 500 500" className="w-[580px] h-[580px] text-[#b89758]">
              <circle cx="250" cy="250" r="230" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="12 12" />
              <circle cx="250" cy="250" r="200" fill="none" stroke="currentColor" strokeWidth="3" />
              <polygon points="250,70 300,180 420,195 330,280 355,400 250,340 145,400 170,280 80,195 200,180" fill="currentColor" opacity="0.4" />
            </svg>
          </div>

          {/* Outer & Inner Ornamental Borders */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-3 sm:inset-4 rounded-lg border-2 border-[#b89758]/80" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-4 sm:inset-5 rounded-md border border-[#b89758]/40" />

          {/* 4 Classical Corner Ornaments */}
          <CornerOrnament className="top-3 left-3 sm:top-4 sm:left-4" />
          <CornerOrnament className="top-3 right-3 sm:top-4 sm:right-4 rotate-90" />
          <CornerOrnament className="bottom-3 right-3 sm:bottom-4 sm:right-4 rotate-180" />
          <CornerOrnament className="bottom-3 left-3 sm:bottom-4 sm:right-4 -rotate-90" />

          {/* Content Container */}
          <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-10 text-center">
            {/* Top Header */}
            <header className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="h-[1px] w-12 bg-[#b89758]/60" />
                <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase text-[#8c6d32]">
                  {data.organizationName ?? 'CÔNG TY CỔ PHẦN CÔNG NGHỆ DIGITALENT VIỆT NAM'}
                </p>
                <span className="h-[1px] w-12 bg-[#b89758]/60" />
              </div>
              <p className="text-[9px] sm:text-[10px] tracking-wider text-[#666] font-medium">
                Hệ thống Phát triển Năng lực Số Doanh nghiệp · DigiTalent AI
              </p>

              <div className="pt-2 sm:pt-3">
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-[0.08em] text-[#1c1917]">
                  CHỨNG NHẬN HOÀN THÀNH
                </h1>
                <p className="font-serif italic text-xs sm:text-sm text-[#8c6d32] tracking-widest mt-0.5">
                  CERTIFICATE OF DIGITAL COMPETENCE COMPLETION
                </p>
              </div>
            </header>

            {/* Recipient & Achievement */}
            <div className="space-y-2 sm:space-y-3 my-auto py-2">
              <p className="text-xs sm:text-sm text-[#57534e] tracking-wide">
                Chứng nhận được trao cho:
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1917]">
                {data.holderName}
              </h2>
              <p className="text-xs sm:text-sm text-[#57534e] max-w-lg mx-auto">
                Đã hoàn thành xuất sắc yêu cầu đào tạo và đáp ứng tiêu chuẩn năng lực môn học:
              </p>
              <div className="inline-block px-4 py-1.5 rounded bg-[#f5efe6] border border-[#b89758]/40">
                <strong className="text-sm sm:text-base font-bold text-[#8c6d32]">
                  {data.title}
                </strong>
                {data.subtitle && (
                  <span className="block text-[11px] sm:text-xs text-[#57534e] mt-0.5">
                    {data.subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Footer Trio: QR Code, Digital Seal, and Signature */}
            <footer className="pt-2 sm:pt-4 border-t border-[#b89758]/30 grid grid-cols-3 items-end gap-2 text-left">
              {/* Col 1: QR & Code */}
              <div className="flex items-center gap-2.5">
                <div
                  className="size-16 sm:size-18 shrink-0 rounded bg-white p-1 border border-[#b89758]/30 shadow-xs flex items-center justify-center [&>svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                  title="Quét QR để tra cứu trực tuyến"
                />
                <div className="space-y-0.5 text-[10px] sm:text-[11px] text-[#57534e]">
                  <p className="font-medium text-[#1c1917]">Mã chứng nhận:</p>
                  <p className="font-mono font-bold tracking-tight text-[#8c6d32] text-[10.5px] sm:text-xs">
                    {data.reference}
                  </p>
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[9.5px] text-blue-700 hover:underline print:hidden"
                  >
                    <span>Tra cứu bảo chứng</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                  <p className="hidden print:block text-[8px] text-[#78716c]">Xác thực: digitalent.vn/verify</p>
                </div>
              </div>

              {/* Col 2: Digital Gold Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="size-14 sm:size-16 text-[#b89758]">
                    <circle cx="50" cy="50" r="44" fill="#fefce8" stroke="#b89758" strokeWidth="2.5" strokeDasharray="3 1" />
                    <circle cx="50" cy="50" r="37" fill="#fffbeb" stroke="#d4af37" strokeWidth="1" />
                    <circle cx="50" cy="50" r="28" fill="none" stroke="#b89758" strokeWidth="0.8" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <ShieldCheck className="size-5 sm:size-6 text-[#8c6d32]" />
                    <span className="text-[7px] font-extrabold uppercase tracking-widest text-[#8c6d32] mt-0.5">
                      VERIFIED
                    </span>
                  </div>
                </div>
                <p className="text-[8.5px] font-semibold text-[#8c6d32] uppercase tracking-wider text-center mt-1">
                  CHỨNG THỰC ĐIỆN TỬ
                </p>
              </div>

              {/* Col 3: Signature & Issue Date */}
              <div className="text-right space-y-0.5 text-[10px] sm:text-[11px] text-[#57534e]">
                <p>Ngày cấp: <strong className="text-[#1c1917]">{formatDate(data.issuedAt)}</strong></p>
                <p className="text-[9.5px] text-[#78716c]">Hội đồng Đào tạo & Thẩm định</p>
                
                {/* Simulated Signature Vector */}
                <div className="inline-block my-0.5">
                  <svg viewBox="0 0 160 48" className="h-8 w-28 text-[#1e293b] ml-auto">
                    <path
                      d="M10,38 C35,10 40,42 65,18 C78,6 88,35 110,22 C125,12 135,30 150,15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M25,25 C45,28 75,22 135,26"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeDasharray="2 4"
                    />
                  </svg>
                </div>

                <p className="font-serif font-bold text-[#1c1917] text-xs">TS. Nguyễn Minh Triết</p>
                <p className="text-[9px] text-[#78716c]">Giám đốc Học thuật DigiTalent AI</p>
              </div>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}

function CornerOrnament({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`pointer-events-none absolute size-7 sm:size-9 text-[#b89758] ${className}`}
      fill="currentColor"
    >
      <path d="M0,0 L24,0 C18,3 12,8 9,14 C6,19 3,24 0,30 L0,0 Z" opacity="0.8" />
      <path d="M4,4 L18,4 C14,6 10,10 8,14 C6,18 4,20 4,24 L4,4 Z" fill="#FDFBF7" />
      <circle cx="8" cy="8" r="2.5" fill="#8c6d32" />
      <circle cx="18" cy="2" r="1.5" fill="#b89758" />
      <circle cx="2" cy="18" r="1.5" fill="#b89758" />
    </svg>
  );
}
