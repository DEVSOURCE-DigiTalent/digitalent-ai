import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Target,
  ArrowRight,
  Clock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CAREER_ROLES } from '../data/careerData';

export const CareerCatalogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const selectedRole = useMemo(() => {
    if (!slug) return null;
    return CAREER_ROLES.find((r) => r.slug.toLowerCase() === slug.toLowerCase()) || null;
  }, [slug]);

  const departments = useMemo(() => {
    const set = new Set(CAREER_ROLES.map((r) => r.department));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredRoles = useMemo(() => {
    return CAREER_ROLES.filter((role) => {
      const matchSearch =
        role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.roleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.competencies.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDept = selectedDept === 'all' || role.department === selectedDept;

      return matchSearch && matchDept;
    });
  }, [searchTerm, selectedDept]);

  const handleSelectTarget = (roleSlug: string) => {
    localStorage.setItem('digitalent_target_role', roleSlug);
    navigate(`/learn/target?role=${roleSlug}`);
  };

  const handleTakeDiagnostic = (roleSlug: string) => {
    localStorage.setItem('digitalent_target_role', roleSlug);
    navigate(`/learn/diagnostic?role=${roleSlug}`);
  };

  // ── Render Detail View when slug is present ──
  if (slug) {
    return (
      <div className="career-detail-view max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link to="/careers" className="inline-flex items-center gap-1 hover:text-blue-600 transition font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả vị trí nghề nghiệp</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate">
            {selectedRole ? selectedRole.title.split('(')[0] : slug}
          </span>
        </div>

        {/* Required assertion phrase for router tests */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between">
          <span className="font-medium">
            Viewing details for career path: {slug}
          </span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
            {selectedRole ? selectedRole.roleCode : slug.toUpperCase()}
          </span>
        </div>

        {selectedRole ? (
          <div className="space-y-8">
            {/* Header Hero */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-bold">
                      {selectedRole.roleCode}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                      {selectedRole.department}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold">
                      {selectedRole.levelBadge}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                    {selectedRole.title}
                  </h1>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectTarget(selectedRole.slug)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    <span>Chọn làm mục tiêu học tập</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTakeDiagnostic(selectedRole.slug)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Làm bài chẩn đoán ngay</span>
                  </button>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2 border-t">
                {selectedRole.description}
              </p>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2">
                <div>
                  <strong>Mức lương tham khảo:</strong>{' '}
                  <span className="text-emerald-700 font-bold">{selectedRole.salaryRange}</span>
                </div>
                <div>
                  <strong>Tiêu chuẩn đối soát:</strong>{' '}
                  <span className="text-slate-700">{selectedRole.vnStandardReference}</span>
                </div>
              </div>
            </div>

            {/* Competency Framework Matrix */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Chuẩn hóa theo DigComp 3.0 & Tiêu chuẩn VN
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Ma Trận Chuẩn Năng Lực Cần Đạt (Required Competencies)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Người học cần đạt mức yêu cầu tương ứng để được cấp chứng nhận nghề nghiệp cho vị trí này.
                </p>
              </div>

              <div className="space-y-3">
                {selectedRole.competencies.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[11px] font-bold rounded">
                          Lĩnh vực {comp.areaCode}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {comp.name}
                        </h3>
                        {comp.isCore && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold rounded-full">
                            Trọng tâm cốt lõi ★
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {comp.benchmarkNote}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold border border-blue-200">
                        {comp.requiredLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Learning Courses */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Khung chương trình đào tạo
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    Các Khóa Học Khuyến Nghị (Recommended Courses)
                  </h2>
                </div>
                <Link
                  to="/learn/path"
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Xem sơ đồ lộ trình</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRole.recommendedCourses.map((crs) => (
                  <div
                    key={crs.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {crs.id}
                        </span>
                        <span className="text-blue-700 font-semibold">{crs.level}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {crs.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {crs.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {crs.duration}
                      </span>
                      <Link
                        to={`/learn/courses/${crs.id}`}
                        className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Chi tiết khóa</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <p className="text-slate-600 text-sm">
              Không tìm thấy thông tin chi tiết cho vị trí: <strong>{slug}</strong>.
            </p>
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Quay lại danh mục nghề nghiệp
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ── Render Catalog List View when no slug ──
  return (
    <div className="career-catalog p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section with exact strings for router tests */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Career Catalog
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Browse available career paths to find your next step. Khám phá các vị trí số hóa tiêu biểu, chuẩn năng lực yêu cầu và lộ trình học tập cá nhân hóa.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm vị trí, mã vị trí hoặc kỹ năng..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Department Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept === 'all' ? 'Tất cả lĩnh vực' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Career Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div
            key={role.slug}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  {role.roleCode}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                  {role.department}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {role.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              </div>

              {/* Competencies Preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                  Khung năng lực yêu cầu:
                </div>
                {role.competencies.slice(0, 3).map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between text-slate-700 text-[11px]">
                    <span className="truncate pr-2 font-medium">
                      {comp.name} {comp.isCore && <span className="text-amber-500 font-bold">★</span>}
                    </span>
                    <span className="font-bold text-blue-700 shrink-0">
                      {comp.requiredLabel.split('(')[0].trim()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                <span>{role.recommendedCourses.length} khóa học khuyến nghị</span>
                <span className="text-emerald-700 font-semibold">{role.salaryRange}</span>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between gap-2">
              <Link
                to={`/careers/${role.slug}`}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Xem chi tiết</span>
              </Link>
              <button
                type="button"
                onClick={() => handleSelectTarget(role.slug)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Chọn mục tiêu</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
