import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Award, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatDate } from '../utils/format';
import { levelWithTier } from '@/lib/competency-levels';
import type { PersonalCertificate } from '@/services/personal-learning.service';

export type IssuedCertificate = PersonalCertificate & { code: string; issuedAt: string };

interface CertificateDocumentProps {
  certificate: IssuedCertificate;
  showVerificationLink?: boolean;
}

/**
 * CertificateDocument: Mẫu chứng chỉ năng lực số chuẩn A4 Landscape (297x210)
 * Tuân thủ chuẩn Khung năng lực số công dân TT02/2025/TT-BGDĐT.
 * Tích hợp: Khung viền Guilloche nghệ thuật, QR code xác thực trực tuyến,
 * Con dấu số vàng kim (Gold Digital Seal), và chữ ký số thẩm định.
 */
export function CertificateDocument({ certificate, showVerificationLink = true }: CertificateDocumentProps) {
  const [qrSvg, setQrSvg] = useState<string>('');

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${certificate.code}`
    : `https://digitalent.vn/verify/${certificate.code}`;

  useEffect(() => {
    let active = true;
    QRCode.toString(verifyUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#1c1b16',
        light: '#00000000', // transparent background
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

  return (
    <article
      data-testid="certificate-document"
      className="certificate-print-sheet relative mx-auto w-full max-w-[880px] overflow-hidden rounded-xl bg-[#FDFBF7] text-[#1c1917] shadow-xl border border-[#b89758]/30 transition-all select-none print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-full print:h-screen"
      style={{
        aspectRatio: '1.414 / 1', // Tỷ lệ chuẩn A4 Ngang (Landscape)
      }}
    >
      {/* ── Background Watermark & Pattern ── */}
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

      {/* ── Outer & Inner Ornamental Borders ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 sm:inset-4 rounded-lg border-2 border-[#b89758]/80" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-4 sm:inset-5 rounded-md border border-[#b89758]/40" />

      {/* ── 4 Classical Corner Ornaments (SVG) ── */}
      <CornerOrnament className="top-3 left-3 sm:top-4 sm:left-4" />
      <CornerOrnament className="top-3 right-3 sm:top-4 sm:right-4 rotate-90" />
      <CornerOrnament className="bottom-3 right-3 sm:bottom-4 sm:right-4 rotate-180" />
      <CornerOrnament className="bottom-3 left-3 sm:bottom-4 sm:left-4 -rotate-90" />

      {/* ── Content Container (Thực tế A4 layout) ── */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-10 text-center">
        {/* Top Header */}
        <header className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-12 bg-[#b89758]/60" />
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase text-[#8c6d32]">
              HỆ THỐNG PHÁT TRIỂN NĂNG LỰC SỐ QUỐC GIA · DIGITALENT AI
            </p>
            <span className="h-[1px] w-12 bg-[#b89758]/60" />
          </div>
          <p className="text-[9px] sm:text-[10px] tracking-wider text-[#666] font-medium">
            Căn cứ Khung chuẩn năng lực số ban hành theo Thông tư số 02/2025/TT-BGDĐT
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

        {/* Recipient Section */}
        <section className="my-auto py-2 sm:py-3 space-y-1.5">
          <p className="text-xs sm:text-sm text-[#57534e] italic font-serif">
            Chứng nhận này được trang trọng trao tặng cho
          </p>
          <div className="inline-block relative">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0f172a] px-6 py-0.5">
              {certificate.recipientName}
            </h2>
            <div className="mx-auto mt-1 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-[#b89758] to-transparent" />
          </div>

          <p className="mx-auto max-w-[620px] text-xs sm:text-sm leading-relaxed text-[#44403c] pt-2">
            Đã hoàn thành xuất sắc chương trình đào tạo và đạt chuẩn sát hạch năng lực số của khóa học
          </p>
          <p className="text-sm sm:text-base font-bold text-[#1c1917] tracking-tight">
            {certificate.courseCode} · {certificate.courseTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] sm:text-xs text-[#57534e]">
            <span className="inline-flex items-center gap-1 rounded bg-[#b89758]/10 px-2.5 py-0.5 font-medium text-[#8c6d32] border border-[#b89758]/25">
              <Award className="size-3.5" />
              {levelWithTier(certificate.level, 'vi')}
            </span>
            <span>·</span>
            <span>{certificate.domainName}</span>
            <span>·</span>
            <span className="font-semibold text-emerald-700">Điểm đánh giá: {certificate.scorePercent}%</span>
          </div>

          {/* Competencies Verified */}
          <div className="mx-auto mt-3 max-w-xl rounded-lg bg-[#FAF7EE]/90 border border-[#b89758]/20 p-2 sm:p-2.5 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8c6d32] mb-1 text-center">
              Các năng lực số thành phần được xác nhận (Framework TT02)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-[#44403c]">
              {certificate.competencies.map((c) => (
                <div key={c.code} className="flex items-start gap-1.5 truncate">
                  <CheckCircle className="size-3 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-mono font-semibold text-[#8c6d32] shrink-0">{c.code}</span>
                  <span className="truncate text-[10.5px]" title={c.name}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Trio: Verification QR, Digital Seal, and Signature */}
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
                {certificate.code}
              </p>
              {showVerificationLink && (
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[9.5px] text-blue-700 hover:underline print:hidden"
                >
                  <span>Tra cứu bảo chứng</span>
                  <ExternalLink className="size-2.5" />
                </a>
              )}
              <p className="hidden print:block text-[8px] text-[#78716c]">Xác thực: digitalent.vn/verify</p>
            </div>
          </div>

          {/* Col 2: Digital Gold Seal */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Gold Embossed Badge SVG */}
              <svg viewBox="0 0 100 100" className="size-14 sm:size-16 text-[#b89758]">
                {/* Sunburst seal contour */}
                <circle cx="50" cy="50" r="44" fill="#fefce8" stroke="#b89758" strokeWidth="2.5" strokeDasharray="3 1" />
                <circle cx="50" cy="50" r="37" fill="#fffbeb" stroke="#d4af37" strokeWidth="1" />
                {/* Circular text path simulation */}
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
            <p>Ngày cấp: <strong className="text-[#1c1917]">{formatDate(certificate.issuedAt)}</strong></p>
            <p className="text-[9.5px] text-[#78716c]">Hội đồng Thẩm định & Viện Đào tạo</p>
            
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
