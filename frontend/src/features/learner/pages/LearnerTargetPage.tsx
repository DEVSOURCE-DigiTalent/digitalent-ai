import React, { useState } from 'react';
import { Target, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CareerTarget {
  id: string;
  title: string;
  level: string;
  department: string;
  requiredCompetencies: string[];
}

const mockTargets: CareerTarget[] = [
  {
    id: 'tg-01',
    title: 'AI Prompt Engineer',
    level: 'Chuyên viên (Mid-level)',
    department: 'AI & Data Lab',
    requiredCompetencies: ['Prompt Design & Optimization', 'LLM Workflow Architecture', 'Python for AI Scripting', 'Safety & Guardrails'],
  },
  {
    id: 'tg-02',
    title: 'Data & Analytics Specialist',
    level: 'Chuyên viên (Mid-level)',
    department: 'Business Intelligence',
    requiredCompetencies: ['SQL Data Modeling', 'Dashboard Engineering', 'Statistical Analysis', 'ETL Pipeline Design'],
  },
  {
    id: 'tg-03',
    title: 'Enterprise Solution Architect',
    level: 'Chuyên gia (Senior)',
    department: 'Digital Architecture',
    requiredCompetencies: ['Cloud Infrastructure', 'Microservices Design', 'Security Standards', 'System Integration'],
  },
];

export const LearnerTargetPage: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<string>('tg-01');

  return (
    <div data-testid="learner-target-page" className="p-6 max-w-7xl mx-auto space-y-6">
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
        <div className="flex gap-3">
          <Link
            to="/learn/diagnostic"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Làm bài chẩn đoán
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Target Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockTargets.map((item) => {
          const isSelected = selectedTarget === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedTarget(item.id)}
              className={`cursor-pointer rounded-xl p-6 border transition relative ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-blue-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded">
                {item.department}
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-3 mb-1">{item.title}</h2>
              <p className="text-xs text-slate-500 mb-4">{item.level}</p>

              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-semibold text-slate-700 uppercase">Khung năng lực chuẩn:</p>
                <ul className="space-y-1.5">
                  {item.requiredCompetencies.map((comp, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
