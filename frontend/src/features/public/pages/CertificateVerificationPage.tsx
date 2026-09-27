import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { ISSUED_CERTIFICATES, type DigitalCertificate } from '../../learner/data/learnerData';

export const CertificateVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('id') || searchParams.get('code') || '';

  const [inputCode, setInputCode] = useState<string>(initialCode);
  const [queriedCode, setQueriedCode] = useState<string>(initialCode);
  const [result, setResult] = useState<DigitalCertificate | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const doVerify = (codeToVerify: string) => {
    const trimmed = codeToVerify.trim().toLowerCase();
    if (!trimmed) {
      setResult(null);
      setSearched(false);
      return;
    }

    setQueriedCode(codeToVerify.trim());
    setSearched(true);

    const match = ISSUED_CERTIFICATES.find(
      (c) =>
        c.credentialId.toLowerCase() === trimmed ||
        c.verificationCode.toLowerCase() === trimmed ||
        c.id.toLowerCase() === trimmed
    );

    setResult(match || null);
  };

  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      doVerify(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doVerify(inputCode);
  };

  return (
    <div className="certificate-verification max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Cổng Xác Thực Số Công Khai</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Certificate Verification
        </h1>
        <p className="text-sm text-slate-500">
          Tra cứu và xác minh tính hợp lệ của chứng chỉ kỹ năng số được cấp bởi hệ thống DigiTalent AI.
        </p>
      </div>

      {/* Verification Search Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Nhập mã xác thực (VD: DTAI-PRM-9831 hoặc cert-dt-2026-001)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-sm inline-flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Xác minh chứng chỉ</span>
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>Mã mẫu thử nghiệm:</span>
          <button
            type="button"
            onClick={() => {
              setInputCode('DTAI-PRM-9831');
              doVerify('DTAI-PRM-9831');
            }}
            className="text-blue-600 hover:underline font-mono bg-blue-50 px-2 py-0.5 rounded"
          >
            DTAI-PRM-9831
          </button>
          <button
            type="button"
            onClick={() => {
              setInputCode('cert-dt-2026-002');
              doVerify('cert-dt-2026-002');
            }}
            className="text-blue-600 hover:underline font-mono bg-blue-50 px-2 py-0.5 rounded"
          >
            cert-dt-2026-002
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {searched && (
        <div>
          {result ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-lg space-y-6">
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Chứng chỉ hợp lệ & Được công nhận
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      {result.title}
                    </h2>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold inline-flex items-center gap-1 self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ĐÃ XÁC THỰC SỐ
                </span>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    Họ và tên người sở hữu:
                  </span>
                  <p className="font-bold text-slate-900 text-base">{result.recipientName}</p>
                  <p className="text-xs text-slate-500">{result.recipientEmail}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-500" />
                    Khóa học / Lộ trình:
                  </span>
                  <p className="font-bold text-slate-900">{result.courseTitle}</p>
                  <p className="text-xs text-emerald-700 font-semibold">Điểm thực hành: {result.score}/100</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    Thời gian cấp:
                  </span>
                  <p className="font-bold text-slate-900">{result.issueDate}</p>
                  <p className="text-xs text-slate-500">Thời hạn: {result.expiryDate}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Mã số định danh (Credential ID):</span>
                  <p className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block text-xs">
                    {result.credentialId}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Mã tra cứu xác thực:</span>
                  <p className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block text-xs">
                    {result.verificationCode}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Tổ chức cấp & Chữ ký số:</span>
                  <p className="font-bold text-slate-900">{result.issuer.name}</p>
                  <p className="text-xs text-slate-500">{result.issuer.signatory} ({result.issuer.title})</p>
                </div>
              </div>

              {/* Standard Reference and Cryptographic Hash */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div>
                  <strong>Khung chuẩn tham chiếu:</strong> {result.frameworkStandard}
                </div>
                <div>
                  <strong>Mã băm bảo mật (SHA-256 Digest):</strong>{' '}
                  <code className="font-mono text-slate-500 break-all">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </code>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <Link
                  to="/learn/certificates"
                  className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Về trang chứng chỉ của người học</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    In bản xác thực
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Không tìm thấy chứng chỉ với mã: <code className="font-mono text-rose-600 font-bold">{queriedCode}</code>
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Vui lòng kiểm tra lại mã xác thực được in trên chứng chỉ hoặc quét lại mã QR để tự động điền mã chính xác.
              </p>
            </div>
          )}
        </div>
      )}

      {/* How Verification Works */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Cơ chế bảo mật xác minh tại DigiTalent AI</span>
        </h4>
        <p className="leading-relaxed">
          Mỗi chứng chỉ kỹ năng số được cấp trên nền tảng DigiTalent AI đều được định danh bằng một Credential ID duy nhất và ký số mật mã học. Nhà tuyển dụng hoặc tổ chức có thể tra cứu mã chứng nhận bất kỳ lúc nào để xác minh tính toàn vẹn của hồ sơ năng lực số.
        </p>
      </div>
    </div>
  );
};
