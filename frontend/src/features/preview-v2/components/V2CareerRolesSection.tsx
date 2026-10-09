import { useState } from 'react';
import { V2_CAREER_ROLES } from '../data/v2-data';
import { Briefcase, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function V2CareerRolesSection() {
  const [activeCode, setActiveCode] = useState<string>('MARKETING');
  const activeRole = V2_CAREER_ROLES.find((r) => r.code === activeCode) || V2_CAREER_ROLES[0];

  return (
    <section id="vi-tri-chuan" className="py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3E5D8] text-[#A64B29] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            VỊ TRÍ THAM CHIẾU TIÊU BIỂU
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D252C]">
            Khung Năng Lực Theo Từng Vị Trí
          </h2>
          <p className="text-base text-[#5E6A77] mt-3 leading-relaxed">
            Mỗi vị trí công việc cần một bộ năng lực số riêng biệt. Chọn một vị trí để xem yêu cầu chuẩn và tỷ lệ sẵn sàng.
          </p>
        </div>

        {/* Roles Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {V2_CAREER_ROLES.map((role) => (
            <button
              key={role.code}
              onClick={() => setActiveCode(role.code)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeCode === role.code
                  ? 'bg-[#D96B43] text-white shadow-md shadow-[#D96B43]/25 -translate-y-0.5'
                  : 'bg-white text-[#465360] border border-[#EFE4D6] hover:bg-[#F8EFE7]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{role.name}</span>
            </button>
          ))}
        </div>

        {/* Active Role Feature Display Card */}
        <div className="bg-white rounded-3xl border border-[#EFE4D6] p-8 sm:p-10 v2-card-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-[#FAF1E8] text-[#D96B43] px-3 py-1 rounded-full">
                  MÃ VỊ TRÍ: {activeRole.code}
                </span>
                <span className="text-xs text-[#7B8895] font-medium">
                  {activeRole.englishTitle}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[#1D252C]">
                {activeRole.name}
              </h3>

              <p className="text-sm sm:text-base text-[#566472] leading-relaxed">
                {activeRole.description}
              </p>

              <div>
                <h4 className="text-xs uppercase font-bold text-[#8695A4] tracking-wider mb-3">
                  NĂNG LỰC SỐ CỐT LÕI YÊU CẦU:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeRole.highlightSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EBF2EE] text-[#426151]"
                    >
                      <Check className="w-3.5 h-3.5 text-[#537565]" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/v2/individual"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#537565] hover:bg-[#436153] transition-colors"
                >
                  <span>Xem Chi Tiết & Làm Đánh Giá Vị Trí Này</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Metric Card */}
            <div className="lg:col-span-5 bg-[#FAF7F2] rounded-2xl p-6 border border-[#EFE4D6] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#EBDCCF]">
                <span className="text-xs font-medium text-[#647180]">Số năng lực cấu hình</span>
                <span className="text-base font-bold text-[#1D252C]">{activeRole.competenciesCount} / 24 năng lực TT02</span>
              </div>

              <div className="pb-3 border-b border-[#EBDCCF]">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-[#647180]">Chỉ số sẵn sàng trung bình</span>
                  <span className="font-bold text-[#D96B43]">{activeRole.readinessRate}%</span>
                </div>
                <div className="w-full bg-[#EAD8C7] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#D96B43] h-2 rounded-full transition-all duration-700"
                    style={{ width: `${activeRole.readinessRate}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-[#5C6A78] leading-relaxed pt-1">
                💡 <em>Hệ thống sẽ đối chiếu mức hiện tại của bạn với ma trận bậc chuẩn của vị trí {activeRole.name} để đề xuất đúng các học phần cần bổ sung.</em>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
