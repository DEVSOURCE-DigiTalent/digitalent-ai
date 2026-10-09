import { BrainCircuit, GitFork, Award } from 'lucide-react';

export function V2CorePillars() {
  const pillars = [
    {
      icon: BrainCircuit,
      iconBg: 'bg-[#F9EDE6]',
      iconColor: 'text-[#D96B43]',
      tag: '01 / ĐÁNH GIÁ CHẨN ĐOÁN',
      title: 'Đánh Giá AI Thích Ứng',
      desc: 'Hệ thống đo lường năng lực thực tế của nhân sự theo chuẩn 6 miền TT02, không mặc định bắt đầu từ con số không.',
    },
    {
      icon: GitFork,
      iconBg: 'bg-[#EBF2EE]',
      iconColor: 'text-[#537565]',
      tag: '02 / TỐI ƯU THỜI GIAN',
      title: 'Lộ Trình Tiên Quyết Chuẩn',
      desc: 'Chỉ học đúng phần năng lực còn thiếu so với vị trí mục tiêu. Thứ tự các học phần được xếp tự động theo điều kiện tiên quyết.',
    },
    {
      icon: Award,
      iconBg: 'bg-[#F2E8DC]',
      iconColor: 'text-[#966336]',
      tag: '03 / CÔNG NHẬN MINH BẠCH',
      title: 'Chứng Chỉ Số Xác Thực',
      desc: 'Cấp chứng nhận số có mã định danh và QR tra cứu công khai. Hồ sơ năng lực được cập nhật minh chứng sau mỗi bài kiểm tra.',
    },
  ];

  return (
    <section className="py-8 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-[#EFE4D6] v2-card-shadow v2-card-hover flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl ${pillar.iconBg} ${pillar.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider text-[#8A97A4] uppercase">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1D252C] mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#5E6973] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#F5EFE6] flex items-center text-xs font-semibold text-[#D96B43] group-hover:translate-x-1 transition-transform">
                  Tìm hiểu chi tiết →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
