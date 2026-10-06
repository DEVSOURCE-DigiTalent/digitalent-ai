import { Link } from 'react-router-dom';
import {
  Award, CheckCircle2, Calendar, Sparkles, Copy, BookOpen, ClipboardCheck, ShieldCheck, Target, Trophy, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, PageHeader, StatusBadge } from '@/components/shared';
import { LevelBadge } from '@/components/shared/LevelBadge';
import { useMyAchievements } from '@/hooks/use-me';
import type { MyAchievements, MyCertificate } from '@/services/me.service';
import { certificateStatus } from '@/lib/me-labels';
import { formatDate } from '@/lib/utils';

type MilestoneKind = MyAchievements['milestones'][number]['kind'];

const MILESTONE_ICONS: Record<MilestoneKind, { icon: typeof Award; color: string }> = {
  CERTIFICATE_ISSUED: { icon: Award, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  COURSE_COMPLETED: { icon: BookOpen, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  ASSESSMENT_PASSED: { icon: ClipboardCheck, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  TASK_APPROVED: { icon: Target, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  COMPETENCY_CONFIRMED: { icon: ShieldCheck, color: 'bg-purple-50 text-purple-600 border-purple-200' },
};

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã chứng chỉ ${code}.`);
  } catch {
    toast.error('Trình duyệt không cho phép sao chép. Vui lòng chọn và sao chép mã thủ công.');
  }
};

/** EM-18: Chứng chỉ & thành tựu — chứng chỉ đã cấp, năng lực đã xác nhận và các mốc phát triển. */
export function MyCertificatesPage() {
  const { data, isLoading, isError, refetch } = useMyAchievements();

  if (isLoading) {
    return (
      <div className="space-y-6" aria-label="Đang tải thành tựu">
        <div className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-12 text-slate-300 mx-auto" />}
        title="Không tải được chứng chỉ"
        description="Có lỗi khi tải dữ liệu. Vui lòng thử lại."
        action={
          <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Thử lại
          </button>
        }
      />
    );
  }

  const stats = [
    { label: 'Chứng chỉ còn hiệu lực', value: data.stats.validCertificates, icon: Award, color: 'text-amber-600 bg-amber-50' },
    { label: 'Khóa học hoàn thành', value: data.stats.completedCourses, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Bài đánh giá đạt', value: data.stats.passedAssessments, icon: ClipboardCheck, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Nhiệm vụ được duyệt', value: data.stats.approvedTasks, icon: Target, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Năng lực đã xác nhận', value: data.stats.confirmedCompetencies, icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Chứng nhận & thành tựu của tôi"
        subtitle="Chứng chỉ năng lực số được cấp khi hoàn thành khóa đào tạo và đạt bài đánh giá cuối khóa, cùng các năng lực đã được xác nhận."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Chứng chỉ đã cấp</h2>
        {data.certificates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
            <Award className="size-16 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">Bạn chưa có chứng nhận nào</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hãy hoàn thành các khóa học và vượt qua bài đánh giá cuối khóa để nhận chứng chỉ chính thức.
            </p>
            <Link to="/enterprise/me/courses" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
              Đến khóa học của tôi
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.certificates.map((cert) => <CertificateCard key={cert.id} cert={cert} />)}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Năng lực đã được xác nhận</h2>
          {data.confirmedCompetencies.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có năng lực nào được xác nhận.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.confirmedCompetencies.map((c) => (
                <li key={c.competencyId} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-slate-800 truncate">
                      <span className="font-mono text-xs font-bold text-blue-700">{c.competencyCode}</span> {c.competencyName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {c.categoryName ? `${c.categoryName} · ` : ''}xác nhận {formatDate(c.confirmedAt)}
                    </p>
                  </div>
                  <LevelBadge level={c.level} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2"><Trophy className="size-4 text-amber-500" /> Các mốc gần đây</h2>
          {data.milestones.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có mốc thành tựu nào.</p>
          ) : (
            <ol className="space-y-3">
              {data.milestones.map((m, index) => {
                const meta = MILESTONE_ICONS[m.kind] ?? MILESTONE_ICONS.COURSE_COMPLETED;
                return (
                  <li key={`${m.kind}-${m.occurredAt}-${index}`} className="flex items-start gap-3">
                    <div className={`size-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.color}`}>
                      <meta.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{m.title}</p>
                      <p className="text-xs text-slate-500">
                        {m.detail ? `${m.detail} · ` : ''}{formatDate(m.occurredAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function CertificateCard({ cert }: { cert: MyCertificate }) {
  const status = certificateStatus(cert.status);
  const valid = cert.status === 'VALID';
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-6 hover:border-blue-400 transition group">
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
                <Calendar className="size-3.5" /> Cấp ngày {formatDate(cert.issuedAt)}
              </p>
            </div>
          </div>
          <StatusBadge variant={status.variant} label={status.label} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">{cert.courseTitle}</h3>
          <p className="text-xs text-slate-600 mt-1">
            Người nhận: <span className="font-semibold text-slate-900">{cert.holderName}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Điểm bài cuối khóa</p>
            <p className="font-bold text-slate-900">{cert.score != null ? `${cert.score}%` : '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Hiệu lực đến</p>
            <p className="font-bold text-slate-900">{cert.expiresAt ? formatDate(cert.expiresAt) : 'Không thời hạn'}</p>
          </div>
          {cert.primaryCompetency && (
            <div className="col-span-2">
              <p className="text-slate-500">Năng lực chính</p>
              <p className="font-semibold text-slate-800">{cert.primaryCompetency}</p>
            </div>
          )}
        </div>

        {cert.status === 'REVOKED' && cert.revocationReason && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">Lý do thu hồi: {cert.revocationReason}</p>
        )}
      </div>

      <div className="relative pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${valid ? 'text-emerald-700' : 'text-slate-500'}`}>
          <CheckCircle2 className={`size-4 ${valid ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>{valid ? 'Chứng chỉ nội bộ do DigiTalent AI cấp' : 'Chứng chỉ không còn hiệu lực'}</span>
        </div>
        <div className="flex items-center gap-2">
          {cert.courseId && (
            <Link
              to={`/enterprise/me/courses/${cert.courseId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition"
            >
              <BookOpen className="size-3.5" /> Khóa học
            </Link>
          )}
          <button
            type="button"
            onClick={() => void copyCode(cert.certificateCode)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition"
          >
            <Copy className="size-3.5" />
            <span>Sao chép mã</span>
          </button>
        </div>
      </div>
    </div>
  );
}
