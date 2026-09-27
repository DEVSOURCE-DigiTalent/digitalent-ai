import React, { useState } from 'react';
import {
  Award,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Download,
  Eye,
  X,
  QrCode,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ISSUED_CERTIFICATES, type DigitalCertificate } from '../data/learnerData';

export const LearnerCertificatesPage: React.FC = () => {
  const [selectedCert, setSelectedCert] = useState<DigitalCertificate | null>(null);

  const certificates: DigitalCertificate[] = ISSUED_CERTIFICATES;

  return (
    <div data-testid="learner-certificates-page" className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Hồ sơ chứng chỉ số</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Chứng chỉ & Huy hiệu đã đạt</h1>
          <p className="text-sm text-slate-500 mt-1">
            Các chứng chỉ số được xác thực trên hệ thống chuẩn DigiTalent AI, có giá trị công nhận khung năng lực số toàn diện.
          </p>
        </div>
        <Link
          to="/verify"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Cổng tra cứu công khai</span>
        </Link>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5 hover:border-amber-400 hover:shadow-md transition relative overflow-hidden"
          >
            {/* Background subtle watermark badge */}
            <div className="absolute -right-6 -bottom-6 text-slate-50 pointer-events-none">
              <Award className="w-36 h-36 opacity-30 text-amber-500" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Chứng chỉ số đã xác minh
                </span>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  Điểm: {c.score}/100
                </span>
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900 leading-snug">{c.title}</h2>
                <p className="text-xs text-slate-500 mt-1">{c.courseTitle}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t pt-3">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Ngày cấp: <strong className="text-slate-800">{c.issueDate}</strong>
                  <span className="text-slate-300">•</span>
                  <span>Thời hạn: {c.expiryDate}</span>
                </p>
                <p>
                  Mã xác thực:{' '}
                  <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-mono font-bold">
                    {c.verificationCode}
                  </code>
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Tiêu chuẩn: {c.frameworkStandard}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 relative z-10">
              <Link
                to={c.credentialUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>Tra cứu công khai</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCert(c)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem chứng chỉ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCert(c)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Modal Preview */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative border-4 border-amber-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Visual Content */}
            <div className="text-center space-y-4 border-2 border-slate-200 rounded-2xl p-8 bg-gradient-to-b from-amber-50/30 via-white to-amber-50/10">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  DigiTalent AI Institute • Global Certification
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  CHỨNG NHẬN HOÀN THÀNH XUẤT SẮC
                </h2>
                <p className="text-xs text-slate-500">Certificate of Professional Achievement</p>
              </div>

              <div className="py-2">
                <p className="text-xs text-slate-400">Chứng nhận này được trân trọng trao tặng cho:</p>
                <h3 className="text-2xl font-black text-blue-900 mt-1">
                  {selectedCert.recipientName}
                </h3>
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Đã hoàn thành toàn diện khóa đào tạo chuyên sâu và bài thực chiến đánh giá năng lực:
                </p>
                <h4 className="text-base font-extrabold text-slate-900">
                  {selectedCert.title}
                </h4>
                <p className="text-xs font-semibold text-emerald-700">
                  Đạt kết quả thực hành: {selectedCert.score}/100 điểm
                </p>
              </div>

              {/* QR and Verification block */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-left text-xs text-slate-600">
                <div className="space-y-1">
                  <p>
                    <strong>Mã xác thực:</strong>{' '}
                    <code className="font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                      {selectedCert.verificationCode}
                    </code>
                  </p>
                  <p>
                    <strong>Ngày cấp:</strong> {selectedCert.issueDate}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Ký số bởi: {selectedCert.issuer.signatory} ({selectedCert.issuer.title})
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <QrCode className="w-12 h-12 text-slate-800" />
                  <span className="text-[10px] text-slate-400 font-mono">Quét để xác thực</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                to={selectedCert.credentialUrl}
                className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mở trang tra cứu công khai</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>In chứng chỉ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
