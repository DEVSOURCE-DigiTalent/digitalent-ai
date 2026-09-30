import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Target, CheckCircle2, ChevronRight, Award, ShieldAlert, Sparkles, Cpu, Database, Cloud, Lock, Code2 } from 'lucide-react';
import { levelFromDigComp, levelLabelViFromDigComp } from '@/lib/competency-levels';
import { CAREER_ROLES, type CareerRole } from '../../public/data/careerData';
import type { DiagnosticResult } from '../data/learnerData';

export const LearnerTargetPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role');

  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => {
    return queryRole || localStorage.getItem('digitalent_target_role') || 'ai-engineer';
  });

  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  useEffect(() => {
    if (queryRole) {
      setSelectedRoleId(queryRole);
      localStorage.setItem('digitalent_target_role', queryRole);
    }
  }, [queryRole]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('digitalent_diagnostic_result');
      if (stored) {
        setDiagnosticResult(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const activeRole: CareerRole =
    CAREER_ROLES.find((r) => r.slug === selectedRoleId || r.id === selectedRoleId) || CAREER_ROLES[0];

  const handleSelectRole = (roleSlug: string) => {
    setSelectedRoleId(roleSlug);
    localStorage.setItem('digitalent_target_role', roleSlug);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const getRoleIcon = (slug: string) => {
    switch (slug) {
      case 'ai-engineer':
        return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'data-analyst':
        return <Database className="w-5 h-5 text-indigo-600" />;
      case 'cloud-devops':
        return <Cloud className="w-5 h-5 text-emerald-600" />;
      case 'cybersecurity':
        return <Lock className="w-5 h-5 text-rose-600" />;
      case 'fullstack':
        return <Code2 className="w-5 h-5 text-cyan-600" />;
      default:
        return <Target className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div data-testid="learner-target-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Target className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Lập mục tiêu sự nghiệp</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Mục tiêu nghề nghiệp & Khung năng lực</h1>
          <p className="text-sm text-slate-500 mt-1">
            Chọn vị trí công việc bạn hướng tới để hệ thống gợi ý lộ trình và bài đánh giá năng lực tương ứng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotification && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã lưu mục tiêu!
            </span>
          )}
          <Link
            to={`/learn/diagnostic?role=${activeRole.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            <span>Làm bài chẩn đoán</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Target Roles Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Danh mục 5 vị trí số hóa mục tiêu
          </h2>
          <span className="text-xs text-slate-500">
            Đang chọn: <strong className="text-blue-600">{activeRole.title.split('(')[0]}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CAREER_ROLES.map((item) => {
            const isSelected = activeRole.slug === item.slug;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectRole(item.slug)}
                className={`cursor-pointer rounded-xl p-4 border transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono">
                      {item.roleCode}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      getRoleIcon(item.slug)
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title.split('(')[0]}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.department}</p>
                </div>

                <div className="pt-3 mt-3 border-t text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="text-blue-700 font-semibold">{item.levelBadge.split('(')[0]}</span>
                  <span className="font-medium text-emerald-600">{item.recommendedCourses.length} khóa</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Target Deep Dive & Skill Gap Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-bold">
              {activeRole.roleCode}
            </span>
            <span className="text-xs text-slate-500">{activeRole.department}</span>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">{activeRole.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{activeRole.levelBadge}</p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed border-t pt-3">
            {activeRole.description}
          </p>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div>
              <span className="font-semibold text-slate-700">Mức lương chuẩn:</span>{' '}
              <strong className="text-emerald-700">{activeRole.salaryRange}</strong>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Chuẩn đối soát:</span>{' '}
              <span className="text-slate-600">{activeRole.vnStandardReference}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to={`/learn/diagnostic?role=${activeRole.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Bắt đầu bài chẩn đoán vị trí này</span>
            </Link>
          </div>
        </div>

        {/* Skill Gap & Competency Comparison */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Phân tích đối soát năng lực
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                So sánh Kỹ năng Hiện tại vs Chuẩn Yêu cầu Vị trí
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span>Mục tiêu vị trí</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Hiện tại của bạn</span>
              </span>
            </div>
          </div>

          {/* Competency Comparison Bars */}
          <div className="space-y-4">
            {activeRole.competencies.map((comp) => {
              // Read current level from diagnostic result if available for this area, else default to 2 or 3
              const diagArea = diagnosticResult?.areaBreakdown.find((a) => a.areaId === comp.id);
              const currentLvl = diagArea ? diagArea.currentLevel : 3;
              const targetLvl = comp.requiredLevel;
              // Learner data keeps the DigComp 1–6 scale; display uses the 3-level scale (D-B5)
              const gap = Math.max(0, levelFromDigComp(targetLvl) - levelFromDigComp(currentLvl));
              const currentPercent = Math.min(100, Math.round((currentLvl / 6) * 100));
              const targetPercent = Math.min(100, Math.round((targetLvl / 6) * 100));

              return (
                <div key={comp.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-800">{comp.name}</span>
                      {comp.isCore && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Cốt lõi ★
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">
                        Hiện tại: <strong className="text-emerald-700">{levelLabelViFromDigComp(currentLvl)}</strong>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-700">
                        Yêu cầu: <strong className="text-blue-700">{levelLabelViFromDigComp(targetLvl)}</strong>
                      </span>
                      {gap > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          Thiếu {gap} mức
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Đạt chuẩn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual comparison progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                      {/* Target marker */}
                      <div
                        className="bg-blue-300 h-full absolute opacity-40"
                        style={{ width: `${targetPercent}%` }}
                      />
                      {/* Current level fill */}
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${currentPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Cơ bản (bậc 1–2)</span>
                      <span>Trung bình (bậc 3–4)</span>
                      <span>Nâng cao (bậc 5–6)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">{comp.benchmarkNote}</p>
                </div>
              );
            })}
          </div>

          {!diagnosticResult && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Chưa có dữ liệu chẩn đoán thực tế:</strong> Hệ thống đang hiển thị mức ước tính khởi điểm (Trung bình). Hãy làm bài chẩn đoán 10 câu hỏi để đo lường chính xác và tự động miễn học các phần bạn đã thành thạo!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
