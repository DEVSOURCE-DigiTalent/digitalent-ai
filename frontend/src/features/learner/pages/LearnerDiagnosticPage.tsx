import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import { CAREER_ROLES, type CareerRole } from '../../public/data/careerData';
import {
  DIAGNOSTIC_QUESTIONS,
  evaluateDiagnosticQuiz,
  type DiagnosticResult,
} from '../data/learnerData';

export const LearnerDiagnosticPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role');

  const targetRole: CareerRole = useMemo(() => {
    const roleSlug = queryRole || localStorage.getItem('digitalent_target_role') || 'ai-engineer';
    return (
      CAREER_ROLES.find((r) => r.slug === roleSlug || r.id === roleSlug) || CAREER_ROLES[0]
    );
  }, [queryRole]);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  useEffect(() => {
    // Check if previous diagnostic result exists
    try {
      const stored = localStorage.getItem('digitalent_diagnostic_result');
      if (stored) {
        const parsed: DiagnosticResult = JSON.parse(stored);
        if (parsed.roleId === targetRole.id) {
          setResult(parsed);
          setSubmitted(true);
        }
      }
    } catch {
      // ignore
    }
  }, [targetRole]);

  const handleSelect = (qId: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Unanswered questions are treated as wrong — no auto-fill of correct answers.
    // evaluateDiagnosticQuiz checks answers[q.id] === q.correctIndex; undefined !== number → counts as incorrect.
    const evaluated = evaluateDiagnosticQuiz(selectedAnswers, targetRole);
    setResult(evaluated);
    setSubmitted(true);
    localStorage.setItem('digitalent_diagnostic_result', JSON.stringify(evaluated));
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
    localStorage.removeItem('digitalent_diagnostic_result');
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / DIAGNOSTIC_QUESTIONS.length) * 100);

  // Radar Chart coordinates for 5 areas
  const radarPoints = useMemo(() => {
    const center = 150;
    const maxRadius = 100;
    const total = 5;

    // Outer polygon vertices
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPolygons = gridLevels.map((lvl) => {
      const pts = [];
      for (let i = 0; i < total; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
        const x = center + maxRadius * lvl * Math.cos(angle);
        const y = center + maxRadius * lvl * Math.sin(angle);
        pts.push(`${x},${y}`);
      }
      return pts.join(' ');
    });

    // Target role polygon
    const targetPoints = targetRole.competencies.map((c, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
      const ratio = Math.max(0.2, c.requiredLevel / 6);
      const x = center + maxRadius * ratio * Math.cos(angle);
      const y = center + maxRadius * ratio * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    // Learner current points
    let learnerPoints = '';
    if (result) {
      learnerPoints = result.areaBreakdown.map((a, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
        const ratio = Math.max(0.2, a.currentLevel / 6);
        const x = center + maxRadius * ratio * Math.cos(angle);
        const y = center + maxRadius * ratio * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
    } else {
      learnerPoints = targetRole.competencies.map((_, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
        const ratio = 0.5; // baseline
        const x = center + maxRadius * ratio * Math.cos(angle);
        const y = center + maxRadius * ratio * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
    }

    // Label coordinates
    const labelCoords = targetRole.competencies.map((c, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
      const x = center + (maxRadius + 24) * Math.cos(angle);
      const y = center + (maxRadius + 18) * Math.sin(angle);
      return { x, y, name: c.name.split('&')[0].trim() };
    });

    return { gridPolygons, targetPoints, learnerPoints, labelCoords };
  }, [targetRole, result]);

  return (
    <div data-testid="learner-diagnostic-page" className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Đánh giá kỹ năng đầu vào
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              Vị trí: {targetRole.title.split('(')[0]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Bài kiểm tra chẩn đoán năng lực
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Đánh giá mức độ thành thạo hiện tại theo chuẩn vị trí {targetRole.title.split('(')[0]} để xây dựng lộ trình học tập cá nhân.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Trạng thái:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
              submitted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {submitted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {submitted ? 'Đã hoàn thành' : 'Đang thực hiện'}
          </span>
        </div>
      </div>

      {/* RESULT DASHBOARD & SKILL GAP ANALYSIS */}
      {submitted && result && (
        <div className="space-y-6 animate-fade-in">
          {/* Main summary banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h2 className="font-extrabold text-xl text-emerald-900">
                  Kết quả phân tích chẩn đoán: Đạt {result.overallScore}/100
                </h2>
                <p className="text-sm text-emerald-800 leading-relaxed max-w-2xl">
                  {result.overallScore >= 80
                    ? `Bạn có nền tảng vững chắc về ${targetRole.title.split('(')[0]}. Hệ thống tự động miễn học ${result.exemptCount} lĩnh vực đã đạt chuẩn và đề xuất lộ trình tập trung vào các kỹ năng chuyên sâu còn thiếu.`
                    : `Hệ thống đã nhận diện được thế mạnh và khoảng cách kỹ năng so với chuẩn ${targetRole.roleCode}. Lộ trình dưới đây được tinh chỉnh riêng để tối ưu hóa thời gian học tập của bạn.`}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <span className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg border border-emerald-300">
                    🎉 Miễn học: {result.exemptCount} / 5 lĩnh vực
                  </span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">
                    🎯 Cần bù đắp GAP: {result.gapCount} lĩnh vực
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <Link
                to="/learn/path"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition"
              >
                <span>Xem lộ trình được điều chỉnh riêng cho bạn</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 rounded-xl text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại bài kiểm tra</span>
              </button>
            </div>
          </div>

          {/* Radar Chart & Area Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart SVG Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-between">
              <div className="w-full text-left mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Biểu đồ mạng nhện năng lực
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Radar Năng Lực 5 Chiều
                </h3>
              </div>

              {/* Pure SVG Radar Chart */}
              <div className="relative my-2">
                <svg width="300" height="300" className="overflow-visible">
                  {/* Background concentric grids */}
                  {radarPoints.gridPolygons.map((pts, idx) => (
                    <polygon
                      key={idx}
                      points={pts}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Target Role Benchmark Polygon */}
                  <polygon
                    points={radarPoints.targetPoints}
                    fill="rgba(59, 130, 246, 0.15)"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />

                  {/* Learner Score Polygon */}
                  <polygon
                    points={radarPoints.learnerPoints}
                    fill="rgba(16, 185, 129, 0.35)"
                    stroke="#10B981"
                    strokeWidth="2.5"
                  />

                  {/* Labels */}
                  {radarPoints.labelCoords.map((lbl, idx) => (
                    <text
                      key={idx}
                      x={lbl.x}
                      y={lbl.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[10px] font-semibold fill-slate-700"
                    >
                      {lbl.name}
                    </text>
                  ))}
                </svg>
              </div>

              <div className="w-full flex items-center justify-center gap-6 text-xs text-slate-600 pt-3 border-t">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Chuẩn vị trí ({targetRole.roleCode})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Kết quả của bạn</span>
                </span>
              </div>
            </div>

            {/* Area Breakdown & Exemption Rules */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>Chi tiết kết quả theo 5 Lĩnh vực Năng lực số</span>
                </h3>
                <span className="text-xs text-slate-400">Thang đo DigComp Level 1 - 6</span>
              </div>

              <div className="space-y-3">
                {result.areaBreakdown.map((area) => (
                  <div
                    key={area.areaId}
                    className={`p-4 rounded-xl border transition ${
                      area.isExempt
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{area.areaName}</span>
                          {area.isCore && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                              Cốt lõi ★
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{area.recommendation}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-slate-600">
                          Điểm: <strong className="text-slate-900">{area.currentScore}%</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">
                          Cấp độ: <strong className="text-blue-700">L{area.currentLevel}/6</strong> (Chuẩn: L{area.requiredLevel})
                        </span>
                        {area.isExempt ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Miễn học
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300">
                            Cần học bù (Gap -{area.gap})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ FORM */}
      <div className="space-y-6">
        {/* Progress Bar while testing */}
        {!submitted && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>
                Tiến độ trả lời: <strong>{answeredCount} / {DIAGNOSTIC_QUESTIONS.length} câu</strong>
              </span>
              <span className="text-blue-600 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Questions list */}
        <div className="space-y-6">
          {DIAGNOSTIC_QUESTIONS.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                    Câu {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {q.areaName}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-indigo-600 font-medium">
                    {q.subTopic}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {q.text}
              </h3>

              <div className="space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isChecked = selectedAnswers[q.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center gap-3 ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-semibold shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 font-bold transition ${
                          isChecked
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 text-slate-500 bg-white'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Giải thích đáp án:</span>
                  </div>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        {!submitted && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">
                * Câu chưa trả lời sẽ được tính là sai. Bạn đã trả lời{' '}
                <strong className={answeredCount < DIAGNOSTIC_QUESTIONS.length ? 'text-amber-600' : 'text-emerald-600'}>
                  {answeredCount}/{DIAGNOSTIC_QUESTIONS.length} câu
                </strong>.
              </p>
              {answeredCount < DIAGNOSTIC_QUESTIONS.length && (
                <p className="text-xs text-amber-600 font-semibold">
                  ⚠ Còn {DIAGNOSTIC_QUESTIONS.length - answeredCount} câu chưa trả lời — điểm sẽ thấp hơn thực tế nếu bỏ qua.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-500/20"
            >
              Nộp bài & Xem kết quả phân tích
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
