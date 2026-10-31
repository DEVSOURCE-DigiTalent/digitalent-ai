import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Copy,
  Printer,
  Search,
  ShieldCheck,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  Sparkles,
  Lock,
} from 'lucide-react';
import { PulsePublicShell } from '../pulse-landing/PulsePublicShell';
import { personalLearningService } from '@/services/personal-learning.service';
import { CertificateDocument, type IssuedCertificate } from '@/features/learner/components/CertificateDocument';
import { formatDate } from '@/features/learner/utils/format';
import { levelWithTier } from '@/lib/competency-levels';

const SAMPLE_CODE = 'DTC-20261007-A2-I';

/**
 * Cổng Tra Cứu & Xác Thực Chứng Chỉ Năng Lực Số Quốc Gia v3.0
 * Ngôn ngữ thiết kế: Light Pearl Glassmorphism, chuẩn Thông tư 02/2025/TT-BGDĐT.
 */
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
        setError('Chứng chỉ đang trong trạng thái chờ phát hành hoặc chưa hoàn tất thẩm định.');
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

  const handleUseSample = () => {
    setInputCode(SAMPLE_CODE);
    navigate(`/verify/${SAMPLE_CODE}`);
  };

  return (
    <PulsePublicShell>
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

      <div className="py-12 sm:py-16 px-4 max-w-5xl mx-auto flex flex-col gap-8 print:p-0" data-testid="public-verify-page">
        {/* Search Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto print:hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="size-4 text-amber-600" />
            <span>Cổng Tra cứu & Xác thực Chứng nhận Năng lực số Quốc Gia</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Xác thực Chứng chỉ Số <span className="font-serif italic font-normal text-slate-700">DigiTalent AI</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Đối soát tính toàn vẹn và mức độ thành thạo năng lực số được cấp theo Khung chuẩn năng lực số Thông tư 02/2025/TT-BGDĐT của Bộ Giáo dục & Đào tạo.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-2 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Nhập mã chứng chỉ (ví dụ: DTC-20261007-A2-I)..."
                className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-mono shadow-sm transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? 'Đang đối soát...' : 'Tra cứu ngay'}
            </button>
          </form>

          {/* Quick Sample Button */}
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500">
            <span>Chưa có mã tra cứu?</span>
            <button
              type="button"
              onClick={handleUseSample}
              className="inline-flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-4"
            >
              <Sparkles className="size-3" /> Thử mã demo: {SAMPLE_CODE}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center text-slate-600 text-sm print:hidden">
            <div className="animate-spin size-8 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
            Đang giải mã và đối soát chữ ký số trên hệ thống...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto w-full p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3.5 shadow-sm print:hidden">
            <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">Không tìm thấy hoặc mã không hợp lệ</p>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Success Verified State */}
        {!loading && certificate && (
          <div className="space-y-6">
            {/* Status Alert Banner */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200/90 p-5 sm:p-6 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm print:hidden">
              <div className="flex items-start gap-3.5">
                <div className="size-11 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      CHỨNG CHỈ HỢP LỆ VÀ CÓ HIỆU LỰC
                    </h3>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
                      ĐÃ XÁC THỰC SỐ
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Chứng nhận này được cấp phát chính thức theo Khung chuẩn năng lực số Thông tư 02/2025/TT-BGDĐT và đã được ký số lưu vết toàn vẹn.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs text-slate-800 font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Copy className="size-3.5" />
                  <span>{copied ? 'Đã sao chép liên kết' : 'Sao chép liên kết'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
                >
                  <Printer className="size-3.5" />
                  <span>In / Xuất PDF</span>
                </button>
              </div>
            </div>

            {/* Quick Metadata Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs print:hidden">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                <p className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <User className="size-3.5 text-amber-600" /> Người được cấp
                </p>
                <p className="font-bold text-slate-900 mt-1.5 text-sm sm:text-base">{certificate.recipientName}</p>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                <p className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <BookOpen className="size-3.5 text-amber-600" /> Khóa đào tạo
                </p>
                <p className="font-bold text-slate-900 mt-1.5 text-sm sm:text-base truncate" title={certificate.courseTitle}>
                  {certificate.courseTitle}
                </p>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                <p className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Award className="size-3.5 text-amber-600" /> Chuẩn năng lực
                </p>
                <p className="font-bold text-slate-900 mt-1.5 text-sm sm:text-base">
                  {levelWithTier(certificate.level, 'vi')} · {certificate.scorePercent}%
                </p>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                <p className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Calendar className="size-3.5 text-amber-600" /> Ngày cấp phát
                </p>
                <p className="font-bold text-slate-900 mt-1.5 text-sm sm:text-base">{formatDate(certificate.issuedAt)}</p>
              </div>
            </div>

            {/* Security Hash Note */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 text-xs text-slate-600 flex items-center justify-between gap-2 font-mono print:hidden">
              <span className="flex items-center gap-1.5 font-sans font-medium text-slate-500">
                <Lock className="size-3.5 text-slate-400" /> Mã băm bảo mật (SHA-256):
              </span>
              <span className="truncate max-w-[280px] sm:max-w-md text-slate-700">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </span>
            </div>

            {/* Visual Certificate Document Sheet */}
            <div className="overflow-x-auto pb-8 pt-2">
              <CertificateDocument certificate={certificate} showVerificationLink={false} />
            </div>
          </div>
        )}
      </div>
    </PulsePublicShell>
  );
}
