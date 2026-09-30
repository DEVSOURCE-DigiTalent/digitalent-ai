import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  ArrowRight,
  Layers,
  CheckCircle2,
  Award,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Database,
  Cloud,
  Lock,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { CAREER_ROLES, DIGCOMP_AREAS } from '../data/careerData';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('ai-engineer');
  const activeRole = CAREER_ROLES.find((r) => r.slug === selectedRoleId) || CAREER_ROLES[0];

  const handleStartDiagnostic = (roleSlug: string) => {
    localStorage.setItem('digitalent_target_role', roleSlug);
    navigate(`/learn/diagnostic?role=${roleSlug}`);
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
    <div className="landing-page max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-12">
      {/* 1. HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 border border-blue-900/50">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Nền Tảng Đào Tạo & Chuẩn Hóa Năng Lực Số Doanh Nghiệp (DigComp 3.0 & Tiêu chuẩn VN)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Welcome to DigiTalent AI
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200 text-2xl sm:text-4xl mt-2 font-bold">
              Phát Triển Năng Lực Số Cá Nhân Hóa Theo Đúng Vị Trí Việc Làm
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            Không đánh giá cảm tính. Năng lực số được đo lường khi người học{' '}
            <strong className="text-white">chọn đúng vị trí công việc</strong>, hoàn thành{' '}
            <strong className="text-white">bài kiểm tra chẩn đoán năng lực</strong> để xác định{' '}
            <strong className="text-emerald-300">khoảng cách kỹ năng (Skill Gap)</strong> và nhận lộ trình học tập bù đắp chính xác nhất.
          </p>

          {/* Quick Interactive Role Selector Widget */}
          <div className="mt-8 bg-white/95 backdrop-blur-md rounded-2xl p-6 text-slate-800 text-left shadow-xl border border-white/20">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-4">
              <Target className="w-4 h-4" />
              <span>Bước 1: Chọn nhanh vị trí công việc bạn muốn nâng cao năng lực số:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {CAREER_ROLES.map((r) => {
                const isSelected = r.slug === selectedRoleId;
                return (
                  <button
                    key={r.slug}
                    type="button"
                    onClick={() => setSelectedRoleId(r.slug)}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {r.roleCode}
                        </span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <div className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                        {r.title.split('(')[0].trim()}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 block truncate">{r.department}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Role Summary Preview */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {activeRole.roleCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ⚖️ Đối soát chuẩn: {activeRole.vnStandardReference}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {activeRole.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeRole.description}
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <Link
                  to={`/careers/${activeRole.slug}`}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold inline-flex items-center gap-1.5 transition"
                >
                  <span>Xem chi tiết yêu cầu</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleStartDiagnostic(activeRole.slug)}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-md shadow-blue-500/20"
                >
                  <span>Vào Khảo Sát & Phân Tích GAP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PLATFORM STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">8 Cấp Độ</div>
            <div className="text-xs text-slate-500">Chuẩn DigComp 3.0 & Thông tư VN</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">5 Vị Trí Số</div>
            <div className="text-xs text-slate-500">Trọng điểm chuyển đổi số</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">100% Miễn Học</div>
            <div className="text-xs text-slate-500">Cho năng lực đã đạt chuẩn</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">Cấp Chứng Chỉ</div>
            <div className="text-xs text-slate-500">Mã QR xác thực công khai</div>
          </div>
        </div>
      </div>

      {/* 3. 5-STEP TRAINING WORKFLOW */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            Quy trình chuẩn hóa khép kín
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Quá Trình Đào Tạo & Chuẩn Hóa 5 Bước
          </h2>
          <p className="text-sm text-slate-500">
            Từ xác định vị trí công việc, khảo sát khởi điểm đến hoàn thành khóa học và nhận chứng nhận kỹ năng số.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Chọn Vị Trí Công Việc</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lựa chọn vị trí mục tiêu (AI Engineer, Data Analyst, Cloud DevOps, Cybersecurity, Fullstack).
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Khảo Sát Khởi Điểm</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thực hiện bài kiểm tra chẩn đoán trắc nghiệm theo 5 lĩnh vực năng lực để đo lường mức độ thành thạo thực tế.
            </p>
          </div>

          <div className="bg-blue-50/60 rounded-xl p-5 border border-blue-200 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm shadow">
              3
            </div>
            <h4 className="font-bold text-blue-900 text-sm">Phân Tích GAP & Miễn Học</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống tự động miễn học các năng lực đã đạt chuẩn, chỉ giao các khóa học bù đắp cho kỹ năng còn thiếu hụt.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Lớp Học Số & Thực Hành</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vào lớp học số 1080p, ghi chú cá nhân, xem đề cương chi tiết và thực hành sandbox tương tác.
            </p>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-5 border border-emerald-200 relative space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
              5
            </div>
            <h4 className="font-bold text-emerald-900 text-sm">Nộp Bài & Nhận Chứng Chỉ</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Nộp minh chứng dự án thực tế (GitHub, tài liệu), được chuyên gia chấm điểm và phát hành chứng chỉ có QR tra cứu.
            </p>
          </div>
        </div>
      </div>

      {/* 4. CHỌN HƯỚNG BẮT ĐẦU (ENTERPRISE VS LEARNER) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 text-center">Bắt đầu trải nghiệm nền tảng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:border-blue-400 transition flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 px-2.5 py-1 bg-blue-50 rounded">
                Dành cho Quản lý & HR
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Dành cho Doanh nghiệp</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Quản lý đào tạo và phát triển nhân tài cho tổ chức của bạn. Giám sát ma trận năng lực của các phòng ban, phân bổ ngân sách đào tạo và phê duyệt bài thi thực hành.
              </p>
            </div>
            <div>
              <Link
                to="/enterprise"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition shadow-sm"
              >
                <span>Enterprise Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:border-emerald-400 transition flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded">
                Dành cho Học viên & Nhân viên
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Người học theo vị trí</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Khám phá lộ trình học tập và phát triển sự nghiệp. Chọn vị trí mục tiêu, làm bài kiểm tra chẩn đoán để xác định khoảng cách kỹ năng và nhận chứng chỉ hoàn thành số hóa.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition shadow-sm"
              >
                <span>Bắt đầu học</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/careers"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition"
              >
                <span>Xem từ điển nghề</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CAREER DIRECTORY SHOWCASE */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Từ điển vị trí việc làm số hóa</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Khung Chuẩn Năng Lực Theo Từng Vị Trí Công Việc
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Mỗi vị trí có yêu cầu cấp độ (Cơ bản / Trung bình / Nâng cao) khác nhau cho 5 lĩnh vực kỹ năng số chuẩn DigComp.
            </p>
          </div>
          <Link
            to="/careers"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>Xem tất cả vị trí</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAREER_ROLES.map((r) => (
            <div
              key={r.slug}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(r.slug)}
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {r.roleCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{r.department}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Chuẩn yêu cầu năng lực:
                  </div>
                  {r.competencies.slice(0, 3).map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between text-slate-700">
                      <span className="truncate pr-2 font-medium">
                        {comp.name} {comp.isCore && <span className="text-amber-500 font-bold">★</span>}
                      </span>
                      <span className="font-bold text-blue-700 shrink-0 text-[11px]">
                        {comp.requiredLabel.split('(')[0].trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between gap-2">
                <Link
                  to={`/careers/${r.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <span>Chi tiết yêu cầu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleStartDiagnostic(r.slug)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Khảo sát vị trí
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. DIGCOMP 3.0 FRAMEWORK REFERENCE */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
              Khung Tham Chiếu Năng Lực Số Chuẩn Hóa
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              5 Lĩnh Vực Kỹ Năng Số Tiêu Chuẩn (DigComp 3.0 & Thông tư 02/2025/TT-BGDĐT)
            </h3>
          </div>
          <Link
            to="/verify"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cổng xác thực chứng chỉ số</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DIGCOMP_AREAS.map((area) => (
            <div
              key={area.id}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 hover:bg-blue-50/40 transition"
            >
              <div className="text-xs font-bold text-blue-700">Lĩnh vực {area.code}</div>
              <h4 className="font-bold text-slate-900 text-sm">{area.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{area.description}</p>
              <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/60 font-medium">
                <strong>Trọng tâm:</strong> {area.coreFocus}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
