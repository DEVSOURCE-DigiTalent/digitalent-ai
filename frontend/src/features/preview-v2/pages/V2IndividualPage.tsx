import { useState } from 'react';
import { V2Banner, V2Navbar } from '../components/V2Header';
import { V2Footer } from '../components/V2ClosingSections';
import { 
  Award, CheckCircle2, 
  BarChart2, Target, QrCode, Play, AlertCircle, FileCheck
} from 'lucide-react';
import '../theme/v2-theme.css';

export function V2IndividualPage() {
  const [selectedQuestionOption, setSelectedQuestionOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Sample learner data matching real TT02 individual profile
  const learnerProfile = {
    name: 'Trần Minh Anh',
    roleTarget: 'Chuyên viên Marketing Số',
    roleCode: 'MARKETING',
    requiredCompetencies: 20,
    achievedCompetencies: 14,
    currentLevel: 'Bậc 3 (Trung cấp)',
    completionRate: 70,
  };

  const domainScores = [
    { id: 1, name: 'Khai thác dữ liệu số', current: 2, required: 3, percent: 67 },
    { id: 2, name: 'Giao tiếp & hợp tác số', current: 3, required: 3, percent: 100 },
    { id: 3, name: 'Sáng tạo nội dung số', current: 2, required: 3, percent: 67 },
    { id: 4, name: 'An toàn & bảo mật số', current: 3, required: 3, percent: 100 },
    { id: 5, name: 'Giải quyết vấn đề', current: 2, required: 2, percent: 100 },
    { id: 6, name: 'Ứng dụng AI', current: 1, required: 3, percent: 33 }, // Ưu tiên đào tạo!
  ];

  const handleAnswerSubmit = () => {
    if (selectedQuestionOption !== null) {
      setQuizSubmitted(true);
    }
  };

  return (
    <div className="v2-theme min-h-screen flex flex-col font-sans antialiased text-[#1D252C] bg-[#FAF7F2]">
      <V2Banner />
      <V2Navbar />

      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* ── 1. Learner Profile Header ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE4D6] v2-card-shadow relative overflow-hidden">
            {/* Background soft blob */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full v2-blob-peach pointer-events-none blur-xl -z-0" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="relative">
                  <img
                    src="/images/v2/hero-talent.jpg"
                    alt={learnerProfile.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-[#FAF1E8] shadow-md"
                  />
                  <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#537565] text-white flex items-center justify-center text-xs shadow-sm">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D96B43] bg-[#FAF1E8] px-2.5 py-0.5 rounded-full">
                      Hồ Sơ Năng Lực Cá Nhân
                    </span>
                    <span className="text-xs text-[#7A8795] font-medium">Mã: DT-VN-9082</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1D252C]">
                    {learnerProfile.name}
                  </h1>
                  <p className="text-sm text-[#5C6A78] flex items-center gap-2 mt-1">
                    <Target className="w-4 h-4 text-[#D96B43]" />
                    <span>Mục tiêu: <strong>{learnerProfile.roleTarget}</strong></span>
                  </p>
                </div>
              </div>

              {/* Progress Summary Pill */}
              <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EFE4D6] w-full lg:w-auto min-w-[320px] space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#647180]">Mức độ đáp ứng vị trí:</span>
                  <span className="text-base font-bold text-[#D96B43]">{learnerProfile.completionRate}%</span>
                </div>
                <div className="w-full bg-[#EADCCF] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#D96B43] h-3 rounded-full transition-all duration-700"
                    style={{ width: `${learnerProfile.completionRate}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#788694]">
                  <span>Đã đạt: <strong>{learnerProfile.achievedCompetencies}</strong> / {learnerProfile.requiredCompetencies} năng lực</span>
                  <span className="text-[#537565] font-bold">Cần bổ sung: 6</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Grid: Ma trận năng lực 6 miền + Khoảng trống kỹ năng ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: 6 Miền năng lực theo chuẩn TT02 */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE4D6] v2-card-shadow space-y-6">
              <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1D252C] flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-[#D96B43]" />
                    <span>Ma Trận 6 Miền Năng Lực Chuẩn TT02</span>
                  </h2>
                  <p className="text-xs text-[#7A8795] mt-1">
                    Đo lường bằng bài đánh giá chẩn đoán thích ứng và minh chứng công việc.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#537565] bg-[#EBF2EE] px-3 py-1 rounded-full">
                  Chuẩn 8 Bậc
                </span>
              </div>

              <div className="space-y-4">
                {domainScores.map((domain) => (
                  <div key={domain.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE4D6]">
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-[#1D252C] font-bold">
                        Miền {domain.id}: {domain.name}
                      </span>
                      <span className={`${domain.percent === 100 ? 'text-[#537565]' : 'text-[#D96B43]'}`}>
                        Đạt {domain.current}/{domain.required} bậc ({domain.percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#E8DACB] rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          domain.percent === 100 ? 'bg-[#537565]' : 'bg-[#D96B43]'
                        }`}
                        style={{ width: `${domain.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Khoảng trống năng lực & Khóa học gợi ý */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE4D6] v2-card-shadow flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 text-[#D96B43] text-xs font-bold uppercase tracking-wider mb-2">
                  <AlertCircle className="w-4 h-4" />
                  KHOẢNG TRỐNG NĂNG LỰC ƯU TIÊN
                </div>

                <h3 className="text-xl font-bold text-[#1D252C] mb-2">
                  Khóa Học Tiên Quyết Đề Xuất
                </h3>

                <p className="text-xs text-[#647180] leading-relaxed mb-6">
                  Để đạt bậc 3 vị trí <strong>Marketing Số</strong>, bạn cần nâng bậc <strong>Miền 6: Ứng dụng AI (từ Bậc 1 lên Bậc 3)</strong>.
                </p>

                {/* Priority Course Card */}
                <div className="p-5 rounded-2xl bg-[#FAF1E8] border border-[#EACEC0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold bg-[#D96B43] text-white px-2.5 py-0.5 rounded-full">
                      Ưu tiên số 1
                    </span>
                    <span className="text-xs font-semibold text-[#8C4627]">
                      12 bài học • 18 giờ
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#1D252C] leading-snug">
                    Làm Chủ AI Tạo Sinh & Prompt Engineering Cho Chuyên Viên
                  </h4>

                  <p className="text-xs text-[#5D6B78] line-clamp-2">
                    Xây dựng cấu trúc prompt chuẩn xác, tự động hóa sáng tạo nội dung đa kênh và báo cáo chiến dịch với AI.
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#537565]">Miễn phí gói cá nhân</span>
                    <button className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#D96B43] hover:bg-[#C25630] transition-colors">
                      <Play className="w-3 h-3 fill-white" />
                      Học Ngay
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Step Note */}
              <div className="pt-4 border-t border-[#F5EFE6] text-xs text-[#7A8896]">
                Sau khi hoàn thành khóa học và bài kiểm tra đầu ra, điểm Miền 6 sẽ tự động cập nhật lên Bậc 3.
              </div>
            </div>

          </div>

          {/* ── 3. Trải nghiệm thử: Bài Đánh Giá Chẩn Đoán AI Thích Ứng ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE4D6] v2-card-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5EFE6] pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#537565] bg-[#EBF2EE] px-3 py-1 rounded-full">
                  TRẢI NGHIỆM THỰC TẾ
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1D252C] mt-2">
                  Làm Thử 1 Câu Hỏi Chẩn Đoán AI Thích Ứng
                </h3>
              </div>
              <span className="text-xs text-[#788694]">
                Câu 01 / 15 • Năng lực 6.1: Ứng dụng Trí tuệ Nhân tạo
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-base font-semibold text-[#1D252C] leading-relaxed">
                Khi sử dụng mô hình ngôn ngữ lớn (LLM) để tóm tắt một tài liệu bảo mật nội bộ của công ty, phương án nào dưới đây đảm bảo an toàn thông tin theo chuẩn TT02?
              </p>

              <div className="space-y-3">
                {[
                  'Dán trực tiếp toàn bộ tài liệu có chứa thông tin khách hàng vào bản miễn phí của công cụ AI công cộng.',
                  'Ẩn danh hóa (anonymize) các dữ liệu nhạy cảm hoặc sử dụng hệ thống AI Enterprise có cam kết không dùng dữ liệu để train model.',
                  'Chụp ảnh tài liệu rồi dùng tính năng Vision của AI để đọc ảnh nhằm tránh quét văn bản.',
                  'Chia nhỏ tài liệu thành từng đoạn gửi ngắt quãng để AI không phát hiện ra toàn bộ nội dung.',
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => !quizSubmitted && setSelectedQuestionOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl text-xs sm:text-sm transition-all border flex items-center justify-between ${
                      selectedQuestionOption === idx
                        ? 'border-[#D96B43] bg-[#FAF1E8] text-[#1D252C] font-semibold shadow-sm'
                        : 'border-[#EFE4D6] bg-[#FAF7F2] text-[#475460] hover:bg-[#F5EBE1]'
                    } ${quizSubmitted && idx === 1 ? 'border-[#537565] bg-[#EBF2EE] text-[#2B4738] font-bold' : ''}`}
                  >
                    <span>{String.fromCharCode(65 + idx)}. {option}</span>
                    {selectedQuestionOption === idx && !quizSubmitted && (
                      <span className="w-5 h-5 rounded-full bg-[#D96B43] text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                    {quizSubmitted && idx === 1 && (
                      <span className="text-xs font-bold text-[#537565]">Đáp án chuẩn xác!</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#7A8795]">
                  {quizSubmitted ? '🎉 Hệ thống đã ghi nhận năng lực xử lý rủi ro an toàn AI của bạn.' : 'Chọn câu trả lời và bấm nộp bài để xem phản hồi AI'}
                </span>

                <button
                  onClick={handleAnswerSubmit}
                  disabled={selectedQuestionOption === null || quizSubmitted}
                  className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#D96B43] hover:bg-[#C25630] disabled:opacity-50 transition-all shadow-md"
                >
                  {quizSubmitted ? 'Đã Hoàn Thành' : 'Nộp Đáp Án'}
                </button>
              </div>
            </div>
          </div>

          {/* ── 4. Thẻ Chứng Chỉ Số DigiTalent AI (Digital Certificate) ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE4D6] v2-card-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#476757] text-xs font-bold uppercase tracking-wider">
                  <FileCheck className="w-4 h-4 text-[#537565]" />
                  CHỨNG CHỈ SỐ CÔNG NHẬN MINH BẠCH
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#1D252C]">
                  Chứng Nhận Năng Lực Có Mã QR Tra Cứu Toàn Quốc
                </h3>

                <p className="text-sm text-[#5E6A77] leading-relaxed">
                  Mỗi chứng chỉ sau khi hoàn thành đánh giá được cấp mã số định danh duy nhất. Nhà tuyển dụng, doanh nghiệp và đối tác có thể quét mã QR để đối chiếu kết quả kiểm tra gốc ngay trên hệ thống.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#3D4955]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#537565]" />
                    Chữ ký số xác thực
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#537565]" />
                    Mã tra cứu công khai
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#537565]" />
                    Liên kết LinkedIn & CV
                  </span>
                </div>
              </div>

              {/* Certificate Preview Card */}
              <div className="lg:col-span-5 bg-[#FAF7F2] rounded-3xl p-6 border-2 border-[#E9DAC8] shadow-md relative">
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-[#EADCCF]">
                  <div>
                    <span className="text-[10px] text-[#A64B29] font-bold uppercase tracking-wider block">
                      CHỨNG NHẬN SỐ DIGITALENT AI
                    </span>
                    <h4 className="text-base font-bold text-[#1D252C]">Kỹ Năng Số Trung Cấp (Bậc 3)</h4>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#D96B43] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#52606E] mb-5">
                  <p>Học viên: <strong className="text-[#1D252C]">Trần Minh Anh</strong></p>
                  <p>Vị trí: <strong>Chuyên viên Marketing Số</strong></p>
                  <p>Chuẩn: <strong>Thông tư 02/2025/TT-BGDĐT</strong></p>
                  <p className="font-mono text-[11px] text-[#A64B29]">Mã số: DT-2026-M6-9821</p>
                </div>

                <div className="pt-3 border-t border-[#EADCCF] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E0D2C2] flex items-center justify-center text-[#1D252C] shadow-sm">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-[#788694]">Quét để xác thực online</span>
                  </div>

                  <a
                    href="/verify"
                    className="text-xs font-bold text-[#D96B43] hover:underline"
                  >
                    Xem trang tra cứu →
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <V2Footer />
    </div>
  );
}
export default V2IndividualPage;
