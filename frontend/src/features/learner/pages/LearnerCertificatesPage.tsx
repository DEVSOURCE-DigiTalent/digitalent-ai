import React from 'react';
import { Award, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LearnerCert {
  id: string;
  title: string;
  issueDate: string;
  credentialUrl: string;
  verificationCode: string;
}

const mockCerts: LearnerCert[] = [
  {
    id: 'cert-dt-2026-001',
    title: 'DigiTalent AI Certified Prompt Specialist',
    issueDate: '2026-08-15',
    credentialUrl: '/verify?id=cert-dt-2026-001',
    verificationCode: 'DTAI-PRM-9831',
  },
  {
    id: 'cert-dt-2026-002',
    title: 'Foundations of Modern AI & Prompt Engineering',
    issueDate: '2026-07-20',
    credentialUrl: '/verify?id=cert-dt-2026-002',
    verificationCode: 'DTAI-FND-4412',
  },
];

export const LearnerCertificatesPage: React.FC = () => {
  return (
    <div data-testid="learner-certificates-page" className="p-6 max-w-6xl mx-auto space-y-6">
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
          Cổng tra cứu công khai
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockCerts.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-bold">
                  Chứng chỉ số đã xác minh
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>

              <h2 className="text-lg font-bold text-slate-800">{c.title}</h2>

              <div className="space-y-1 text-xs text-slate-500 border-t pt-3">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Ngày cấp: <strong className="text-slate-700">{c.issueDate}</strong>
                </p>
                <p>
                  Mã xác thực: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">{c.verificationCode}</code>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
              <Link
                to={c.credentialUrl}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
              >
                Tra cứu công khai
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700 transition"
              >
                Tải PDF chứng nhận
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
