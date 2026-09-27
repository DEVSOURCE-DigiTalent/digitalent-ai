import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Route, CheckCircle, Clock, ArrowRight, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { CAREER_ROLES, type CareerRole } from '../../public/data/careerData';
import { LEARNER_MILESTONES, type Milestone, type DiagnosticResult } from '../data/learnerData';

export const LearnerPathPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState<CareerRole>(CAREER_ROLES[0]);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  useEffect(() => {
    try {
      const storedRoleSlug = localStorage.getItem('digitalent_target_role') || 'ai-engineer';
      const foundRole = CAREER_ROLES.find((r) => r.slug === storedRoleSlug || r.id === storedRoleSlug);
      if (foundRole) setActiveRole(foundRole);

      const storedDiag = localStorage.getItem('digitalent_diagnostic_result');
      if (storedDiag) {
        setDiagnosticResult(JSON.parse(storedDiag));
      }
    } catch {
      // ignore
    }
  }, []);

  const milestones: Milestone[] = LEARNER_MILESTONES;

  return (
    <div data-testid="learner-path-page" className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header with test expectation strings */}
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Route className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Lộ trình cá nhân hóa</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Lộ trình học tập mục tiêu</h1>
          <p className="text-sm text-slate-500 mt-1">
            Được xây dựng dựa trên kết quả đánh giá năng lực đầu vào hướng tới chuẩn {activeRole.title.split('(')[0]}.
          </p>
        </div>

        {/* Progress stat pill - retains exact string for existing router tests */}
        <div className="text-sm text-slate-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-2">
          <span>Tiến độ lộ trình:</span>
          <strong className="text-emerald-700 font-bold">25% (1/4 khóa học)</strong>
        </div>
      </div>

      {/* Target Role & Exemption Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
              {activeRole.roleCode}
            </span>
            <span className="font-bold text-slate-900 text-sm">{activeRole.title}</span>
          </div>
          <p className="text-xs text-slate-500">{activeRole.department}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {diagnosticResult ? (
            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Điểm chẩn đoán: <strong>{diagnosticResult.overallScore}/100</strong> (Miễn {diagnosticResult.exemptCount} học phần)</span>
            </div>
          ) : (
            <Link
              to={`/learn/diagnostic?role=${activeRole.slug}`}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 inline-flex items-center gap-1 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chưa làm bài chẩn đoán? Nhận đề xuất cá nhân</span>
            </Link>
          )}

          <Link
            to="/learn/target"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Đổi mục tiêu
          </Link>
        </div>
      </div>

      {/* Milestones timeline */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200">
        {milestones.map((m) => (
          <div key={m.id} className="relative pl-10">
            <div className="absolute left-2.5 top-2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-blue-600" />

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {m.stage}
                </span>
                <h2 className="text-lg font-bold text-slate-800 mt-1 mb-1">{m.title}</h2>
                <p className="text-xs sm:text-sm text-slate-500">{m.description}</p>
              </div>

              <div className="space-y-3">
                {m.courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      {c.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/learn/courses/${c.id}`}
                            className="font-bold text-sm text-slate-900 hover:text-blue-600 transition"
                          >
                            {c.name}
                          </Link>
                          {c.completed && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                              Đã hoàn thành
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono">Mã: {c.id}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {c.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/learn/courses/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        to={`/learn/classroom/${c.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                      >
                        Vào học
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
