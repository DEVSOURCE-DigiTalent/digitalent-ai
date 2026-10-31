import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Copy,
  Printer,
  Search,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';
import { personalLearningService } from '@/services/personal-learning.service';
import { CertificateDocument, type IssuedCertificate } from '@/features/learner/components/CertificateDocument';
import { formatDate } from '@/features/learner/utils/format';
import { levelWithTier } from '@/lib/competency-levels';

export function PublicVerifyPage() {
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState(urlCode || '');
  const [certificate, setCertificate] = useState<IssuedCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (urlCode) {
      setInputCode(urlCode);
      verifyCode(urlCode);
    }
  }, [urlCode]);

  const verifyCode = async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mã chứng chỉ cần tra cứu.');
      setCertificate(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await personalLearningService.verifyCertificate(trimmed);
      if (res && res.code && res.issuedAt) {
        setCertificate(res as IssuedCertificate);
      } else {
        setError('Chứng chỉ đang trong trạng thái chờ phát hành hoặc chưa hoàn tất.');
        setCertificate(null);
      }
    } catch {
      setError('Không tìm thấy chứng chỉ hợp lệ với mã tra cứu này hoặc chứng chỉ đã bị thu hồi.');
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(`/verify/${inputCode.trim()}`);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-slate-100 flex flex-col justify-between selection:bg-amber-400/20">
      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          .certificate-print-sheet, .certificate-print-sheet * {
            visibility: visible;
          }
          .certificate-print-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 36px 48px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-90 transition">
            <span className="font-semibold text-lg tracking-tight">DigiTalent<sup className="text-amber-400 font-bold ml-0.5">AI</sup></span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 font-mono font-medium">Verify</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/portal" className="text-slate-400 hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="size-3.5" />
              <span>Về cổng chính</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 print:p-0">
        {/* Search Header Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="size-4" />
            <span>Cổng Tra cứu & Xác thực Chứng nhận Năng lực số</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Xác thực Chứng chỉ Số DigiTalent AI
          </h1>
          <p className="text-sm text-slate-400">
            Tra cứu tính toàn vẹn và thông tin chứng nhận năng lực số được cấp theo Khung chuẩn năng lực số Thông tư 02/2025/TT-BGDĐT.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-3 max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Nhập mã chứng chỉ (ví dụ: DTC-20261007-A2-I)..."
                className="w-full bg-white/5 border border-white/15 focus:border-amber-400/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-hidden transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? 'Đang tra...' : 'Tra cứu'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center text-slate-400 text-sm print:hidden">
            <div className="animate-spin size-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-3" />
            Đang xác thực thông tin chứng chỉ trên hệ thống...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-xl mx-auto w-full p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm flex items-start gap-3 print:hidden">
            <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Không thể xác thực</p>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Verified State */}
        {!loading && certificate && (
          <div className="space-y-6">
            {/* Status Alert Banner */}
            <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-5 sm:p-6 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div className="flex items-start gap-3.5">
                <div className="size-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">CHỨNG CHỈ HỢP LỆ VÀ CÓ HIỆU LỰC</h3>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    Chứng nhận số này được lưu trữ và chứng thực chính thức bởi Hệ thống Đánh giá & Phát triển Năng lực số DigiTalent AI.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium flex items-center gap-1.5 transition"
                >
                  <Copy className="size-3.5" />
                  <span>{copied ? 'Đã sao chép link' : 'Sao chép link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="size-3.5" />
                  <span>In / Xuất PDF</span>
                </button>
              </div>
            </div>

            {/* Quick Metadata Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs print:hidden">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <p className="text-slate-400 flex items-center gap-1.5"><User className="size-3.5 text-amber-400" /> Người được cấp</p>
                <p className="font-bold text-white mt-1 text-sm">{certificate.recipientName}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <p className="text-slate-400 flex items-center gap-1.5"><BookOpen className="size-3.5 text-amber-400" /> Khóa học</p>
                <p className="font-bold text-white mt-1 text-sm truncate" title={certificate.courseTitle}>{certificate.courseTitle}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <p className="text-slate-400 flex items-center gap-1.5"><Award className="size-3.5 text-amber-400" /> Trình độ đạt</p>
                <p className="font-bold text-white mt-1 text-sm">{levelWithTier(certificate.level, 'vi')} · {certificate.scorePercent}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <p className="text-slate-400 flex items-center gap-1.5"><Calendar className="size-3.5 text-amber-400" /> Ngày cấp</p>
                <p className="font-bold text-white mt-1 text-sm">{formatDate(certificate.issuedAt)}</p>
              </div>
            </div>

            {/* Visual Certificate Document Sheet */}
            <div className="overflow-x-auto pb-6 pt-2">
              <CertificateDocument certificate={certificate} showVerificationLink={false} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-6 text-center text-xs text-slate-500 print:hidden">
        <p>DigiTalent AI · Nền tảng Đào tạo và Phát triển Năng lực số chuẩn TT02/2025/TT-BGDĐT</p>
      </footer>
    </div>
  );
}
