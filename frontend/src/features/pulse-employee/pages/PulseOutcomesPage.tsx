import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Award,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Target,
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

/**
 * Hồ sơ Chứng nhận & Minh chứng Số:
 * - Khối 1: Chứng chỉ Chuẩn Năng lực Chức danh (cấp khi hoàn thành đủ 8/8 khóa học).
 * - Khối 2: Danh sách Huy hiệu & Chứng nhận từng môn học đã đạt chuẩn.
 */
export function PulseOutcomesPage() {
  const { data, isLoading, error, refetch } = usePulseOutcomes();
  const { data: overview } = usePulseOverview();

  const position = overview?.person.positionName ?? 'Chuyên viên Kế toán tài chính';
  const totalCourses = overview?.stats.pathCourses ?? 8;
  const approvedCourses = overview?.stats.approvedPathCourses ?? 1;
  const isAllCompleted = totalCourses > 0 && approvedCourses >= totalCourses;
  const pct = totalCourses > 0 ? Math.round((approvedCourses / totalCourses) * 100) : 0;

  return (
    <div className="pu-outcomes-container">
      {/* ── 1. Page Header ─────────────────────────────────────────────────── */}
      <div className="pu-outcomes-header">
        <div className="pu-outcomes-header-badge">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Hồ sơ chứng nhận & Minh chứng số</span>
        </div>
        <h1 className="pu-outcomes-h1">Chứng chỉ & Kết quả đào tạo</h1>
        <p className="pu-outcomes-desc">
          Theo dõi chứng nhận hoàn thành đào tạo theo chức danh và hồ sơ minh chứng năng lực của bạn.
        </p>
      </div>

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
            Chuẩn Năng lực Vị trí: {position}
          </h2>

          <p className="pu-job-cert-desc">
            {isAllCompleted
              ? 'Bạn đã hoàn thành đủ 8/8 khóa học theo khung năng lực chức danh. Chứng chỉ chính thức đã được hội đồng thẩm định phê duyệt.'
              : `Chứng chỉ Chuẩn Chức danh sẽ được cấp khi bạn hoàn thành toàn bộ ${totalCourses} khóa học trong lộ trình. Hiện bạn đã đạt ${approvedCourses} khóa.`}
          </p>

          <div className="pu-job-cert-progress-row">
            <div className="pu-job-cert-bar-track">
              <div className="pu-job-cert-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="pu-job-cert-pct">{pct}%</span>
          </div>

          <div className="pu-job-cert-actions">
            {isAllCompleted ? (
              <Link to={PULSE_PATHS.outcome('job-role-cert')} className="pu-btn-view-cert">
                <Award size={15} />
                <span>Xem & in chứng chỉ A4</span>
              </Link>
            ) : (
              <Link to={PULSE_PATHS.path} className="pu-btn-view-path">
                <Target size={15} />
                <span>Xem các khóa cần học tiếp trong lộ trình →</span>
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

      {/* ── 3. Danh sách Huy hiệu & Bản ghi kết quả từng môn học ────────────── */}
      <section className="pu-course-badges-section" aria-labelledby="sec-badges-title">
        <div className="pu-badges-sec-head">
          <div>
            <h2 id="sec-badges-title" className="pu-badges-title">
              Huy hiệu hoàn thành môn học & Minh chứng ({data?.length || 0})
            </h2>
            <p className="pu-badges-sub">
              Bản ghi công nhận cho từng khóa học đã vượt qua bài đánh giá đầu vào hoặc thi cuối khóa.
            </p>
          </div>
        </div>

        {isLoading ? (
          <PageSkeleton blocks={[180]} />
        ) : error || !data ? (
          <LoadError message={pulseErrorMessage(error, 'Không tải được kết quả đã xác nhận.')} onRetry={() => refetch()} />
        ) : data.length === 0 ? (
          <Empty icon={<Award size={24} />} title="Chưa có bản ghi môn học được xác nhận" action={<PuLink to={PULSE_PATHS.path}>Xem lộ trình của tôi →</PuLink>}>
            Khi mentor duyệt bài cuối khóa hoặc bài đánh giá đầu vào, bản ghi chứng nhận sẽ xuất hiện ở đây.
          </Empty>
        ) : (
          <div className="pu-cert-grid">
            {data.map((outcome) => (
              <Link key={outcome.id} to={PULSE_PATHS.outcome(outcome.id)} className="pu-cert-card group">
                <div className="pu-cert-accent-bar" />

                <div className="pu-cert-body">
                  <div className="pu-cert-top">
                    <span className="pu-cert-badge">
                      <Award className="w-3.5 h-3.5 text-blue-700" />
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
                    {outcome.title}
                  </h3>

                  <div className="pu-cert-meta-row">
                    <span className="pu-cert-date">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(outcome.issuedAt)}
                    </span>
                    <span className="pu-cert-ref">
                      Mã: <code>{outcome.reference}</code>
                    </span>
                  </div>
                </div>

                <div className="pu-cert-footer">
                  <span className="pu-cert-cta">
                    Xem chứng nhận A4
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
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
