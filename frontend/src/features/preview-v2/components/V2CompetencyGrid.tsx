import { useState } from 'react';
import { V2_COURSES } from '../data/v2-data';
import { BookOpen, Clock, Star, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function V2CompetencyGrid() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | number>('all');

  const filteredCourses = selectedFilter === 'all'
    ? V2_COURSES
    : V2_COURSES.filter((c) => c.domainId === selectedFilter);

  return (
    <section id="khoa-hoc-thuc-chien" className="py-16 lg:py-24 bg-white/70 border-y border-[#EFE4D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E5D8] text-[#A64B29] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              CHƯƠNG TRÌNH ĐÀO TẠO CHUẨN HOÁ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D252C]">
              Khoá Học & Lộ Trình Theo Năng Lực
            </h2>
            <p className="text-base text-[#647180] mt-2 max-w-xl">
              Được thiết kế theo 3 tầng chương trình (Cơ bản · Trung cấp · Nâng cao), kết thúc bằng bài đánh giá cập nhật hồ sơ cá nhân.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-[#537565] text-white shadow-sm'
                  : 'bg-[#F4EBE1] text-[#4E5B67] hover:bg-[#EBDDCE]'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedFilter(6)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedFilter === 6
                  ? 'bg-[#D96B43] text-white shadow-sm'
                  : 'bg-[#F4EBE1] text-[#4E5B67] hover:bg-[#EBDDCE]'
              }`}
            >
              Ứng dụng AI
            </button>
            <button
              onClick={() => setSelectedFilter(1)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedFilter === 1
                  ? 'bg-[#537565] text-white shadow-sm'
                  : 'bg-[#F4EBE1] text-[#4E5B67] hover:bg-[#EBDDCE]'
              }`}
            >
              Dữ liệu & Số liệu
            </button>
            <button
              onClick={() => setSelectedFilter(4)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedFilter === 4
                  ? 'bg-[#537565] text-white shadow-sm'
                  : 'bg-[#F4EBE1] text-[#4E5B67] hover:bg-[#EBDDCE]'
              }`}
            >
              An toàn & Bảo mật
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#EFE4D6] v2-card-shadow v2-card-hover flex flex-col justify-between group"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F4EBE1]">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Level Tag */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#1D252C] text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                  {course.level} • {course.tierRange}
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#1D252C] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{course.rating}</span>
                </div>

                {/* Domain Pill */}
                <div className="absolute bottom-3 left-3 bg-[#1D252C]/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                  {course.domainName}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-[#71808F] mb-2 font-medium">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#D96B43]" />
                      {course.lessonsCount} bài học
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#537565]" />
                      {course.duration}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1D252C] group-hover:text-[#D96B43] transition-colors leading-snug line-clamp-2 mb-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#5D6B78] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Footer with Role & Arrow Button */}
                <div className="mt-5 pt-4 border-t border-[#F5EFE6] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8E9CA9] tracking-wider block">
                      Phù hợp với
                    </span>
                    <span className="text-xs font-semibold text-[#38434F]">
                      {course.targetRole}
                    </span>
                  </div>

                  <Link
                    to="/v2/individual"
                    className="w-10 h-10 rounded-full bg-[#FAF1E8] group-hover:bg-[#D96B43] text-[#D96B43] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Explorer CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/v2/individual"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-[#D96B43] hover:bg-[#C25630] shadow-md shadow-[#D96B43]/20 hover:shadow-lg transition-all"
          >
            <span>Khám Phá Toàn Bộ 24 Năng Lực Thành Phần TT02</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
