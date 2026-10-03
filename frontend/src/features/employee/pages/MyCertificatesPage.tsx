import { Award, Download, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useCertificates } from '@/hooks/use-learning';
import { formatDate } from '@/lib/utils';

export function MyCertificatesPage() {
  const { data, isLoading } = useCertificates();

  const handleDownload = (certCode: string) => {
    toast.success(`Đang tải file PDF chứng chỉ ${certCode} (bản số hóa)...`);
  };

  const certificates = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chứng nhận của tôi"
        subtitle="Toàn bộ chứng chỉ năng lực số chính thức được tổ chức công nhận sau khi hoàn thành khóa đào tạo và bài đánh giá."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <Award className="size-16 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">Bạn chưa có chứng nhận nào</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Hãy hoàn thành các khóa học và vượt qua bài kiểm tra đánh giá năng lực để nhận chứng chỉ chính thức.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-6 hover:border-blue-400 transition group"
            >
              {/* Decorative background watermark */}
              <div className="absolute -right-8 -bottom-8 text-slate-50 group-hover:text-blue-50/50 transition pointer-events-none">
                <Award className="size-48" />
              </div>

              <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                      <Sparkles className="size-6" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {cert.certificateCode}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="size-3.5" /> Cấp ngày {formatDate(cert.issueDate)}
                      </p>
                    </div>
                  </div>
                  <LevelBadge level={cert.courseLevel} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {cert.courseTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Học viên: <span className="font-semibold text-slate-900">{cert.employeeName}</span> ({cert.employeeCode})
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-medium text-slate-500">Năng lực số xác nhận theo TT 02/2025:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cert.frameworkCompetencyCodes.map((code) => (
                      <span
                        key={code}
                        className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium"
                      >
                        TT02-{code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Xác thực bởi DigiTalent AI</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(cert.certificateCode)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition"
                >
                  <Download className="size-3.5" />
                  <span>Tải bản PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
