import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, Target, TrendingUp, BookOpen,
  ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, ShieldAlert,
  ChevronRight, BrainCircuit, BarChart3, Clock
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';

interface AssessmentQuestion {
  id: string;
  domainNumber: number;
  domainName: string;
  competencyCode: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'init-q1',
    domainNumber: 1,
    domainName: 'Khai thác dữ liệu và thông tin số',
    competencyCode: '1.1',
    text: 'Bạn cần tìm mẫu quy chế hoặc văn bản quy phạm pháp luật mới nhất để áp dụng vào công việc. Phương pháp tìm kiếm và xác minh nào đáng tin cậy nhất?',
    options: [
      'Gõ từ khóa chung chung trên công cụ tìm kiếm và nhấp vào kết quả đầu tiên xuất hiện.',
      'Sử dụng từ khóa cụ thể kèm số hiệu văn bản, ưu tiên nguồn cổng thông tin chính thức của cơ quan nhà nước (.gov.vn).',
      'Tham khảo từ bài đăng trên diễn đàn mạng xã hội vì có nhiều người chia sẻ tệp tải về.',
      'Sử dụng lại tài liệu mẫu từ 5 năm trước trong máy tính cá nhân vì nội dung ít khi thay đổi.',
    ],
    correctIndex: 1,
    explanation: 'Tìm kiếm chính xác với từ khóa pháp lý cụ thể và kiểm chứng từ cổng thông tin cơ quan chức năng (.gov.vn) đảm bảo tính pháp lý và chính xác tuyệt đối.',
  },
  {
    id: 'init-q2',
    domainNumber: 2,
    domainName: 'Giao tiếp và hợp tác trong môi trường số',
    competencyCode: '2.1',
    text: 'Khi phối hợp làm việc nhóm với đồng nghiệp đa phòng ban trên cùng một bảng tính phân tích dữ liệu, giải pháp nào tối ưu và tránh xung đột phiên bản nhất?',
    options: [
      'Tải tệp về máy tính cá nhân, chỉnh sửa xong rồi gửi lại qua email cho tất cả thành viên.',
      'Đưa tài liệu lên không gian lưu trữ đám mây dùng chung của tổ chức, phân quyền truy cập, bật tính năng cộng tác trực tuyến và theo dõi lịch sử chỉnh sửa.',
      'Nhắn tin các nội dung thay đổi qua nhóm chat cá nhân để người phụ trách tự tổng hợp thủ công.',
      'Chỉ định một người duy nhất được mở tệp, những người khác không được can thiệp vào dữ liệu.',
    ],
    correctIndex: 1,
    explanation: 'Cộng tác trên nền tảng đám mây tập trung kết hợp phân quyền và phiên bản (version history) giúp loại bỏ trùng lặp và xung đột dữ liệu trong môi trường doanh nghiệp.',
  },
  {
    id: 'init-q3',
    domainNumber: 3,
    domainName: 'Sáng tạo và biên tập nội dung số',
    competencyCode: '3.1',
    text: 'Bạn đang thiết kế bài thuyết trình báo cáo nội bộ và hướng dẫn số cho phòng ban. Khi sử dụng hình ảnh, đồ họa minh họa từ internet, nguyên tắc nào là đúng?',
    options: [
      'Có thể sao chép bất kỳ hình ảnh nào tìm được trên mạng miễn là sử dụng trong nội bộ.',
      'Ưu tiên sử dụng tài nguyên có giấy phép mở (Creative Commons), ảnh tự sản xuất hoặc kho tài nguyên số đã mua bản quyền của công ty.',
      'Dùng công cụ chỉnh sửa để cắt bỏ logo/watermark của tác giả gốc trước khi đưa vào tài liệu.',
      'Chỉ cần dịch lại bài viết của người khác sang tiếng Việt thì tài liệu đương nhiên thuộc bản quyền của mình.',
    ],
    correctIndex: 1,
    explanation: 'Tôn trọng quyền sở hữu trí tuệ và sử dụng tài nguyên số hợp chuẩn giấy phép là yêu cầu đạo đức và tuân thủ bản quyền số bắt buộc nơi công sở.',
  },
  {
    id: 'init-q4',
    domainNumber: 4,
    domainName: 'An toàn thông tin và bảo mật dữ liệu',
    competencyCode: '4.2',
    text: 'Bạn nhận được một email khẩn cấp từ "Hệ thống Quản trị" yêu cầu nhấp vào đường link để xác minh mật khẩu trong vòng 24 giờ nhằm tránh bị khóa tài khoản công ty. Bạn nên hành động như thế nào?',
    options: [
      'Lập tức nhấp vào liên kết và điền thông tin tài khoản ngay để tránh gián đoạn công việc.',
      'Chuyển tiếp email cho toàn bộ nhân sự trong công ty để mọi người cùng cẩn thận làm theo.',
      'Không nhấp vào bất kỳ đường dẫn nào, kiểm tra kỹ địa chỉ người gửi thực tế và báo cáo ngay cho bộ phận An toàn thông tin/IT của tổ chức.',
      'Xóa email và không cần báo cho ai vì nghĩ đây chỉ là thư rác thông thường.',
    ],
    correctIndex: 2,
    explanation: 'Đây là hình thức tấn công giả mạo (Phishing). Tuyệt đối không nhấp link lạ, bảo vệ thông tin đăng nhập và thông báo cho IT chuyên trách để ngăn chặn mã độc.',
  },
  {
    id: 'init-q5',
    domainNumber: 5,
    domainName: 'Giải quyết vấn đề kỹ thuật và chuyển đổi số',
    competencyCode: '5.1',
    text: 'Khi đang thực hiện quy trình nghiệp vụ trên phần mềm doanh nghiệp thì hệ thống thông báo mã lỗi lạ và không thể lưu dữ liệu. Bước xử lý ban đầu chuyên nghiệp nhất là gì?',
    options: [
      'Khởi động lại máy tính liên tục và hy vọng sự cố sẽ tự biến mất.',
      'Chụp ảnh màn hình thông báo lỗi (error code), ghi lại các thao tác vừa thực hiện, tra cứu cổng kiến thức nội bộ (FAQ) hoặc gửi ticket hỗ trợ IT kèm mô tả cụ thể.',
      'Tải về và cài đặt các phần mềm sửa lỗi không rõ nguồn gốc từ trên mạng để tự khắc phục.',
      'Ngừng làm việc hoàn toàn và chuyển toàn bộ quy trình sang viết tay trên giấy tờ.',
    ],
    correctIndex: 1,
    explanation: 'Ghi lại thông tin lỗi chi tiết và cung cấp bằng chứng kỹ thuật giúp đội ngũ hỗ trợ xác định nguyên nhân gốc rễ và xử lý nhanh chóng mà không gây mất an toàn hệ thống.',
  },
  {
    id: 'init-q6',
    domainNumber: 6,
    domainName: 'Ứng dụng Trí tuệ nhân tạo (AI) trong công việc',
    competencyCode: '6.1',
    text: 'Khi ứng dụng các công cụ Trí tuệ nhân tạo tạo sinh (GenAI như ChatGPT, Claude, Copilot) để hỗ trợ tóm tắt tài liệu và lập kế hoạch công việc, nguyên tắc cốt lõi cần nhớ là gì?',
    options: [
      'Sao chép nguyên văn toàn bộ câu trả lời của AI và nộp thẳng cho cấp trên mà không cần đọc lại.',
      'Dán toàn bộ tài liệu chứa bí mật kinh doanh và dữ liệu nhạy cảm của khách hàng lên các công cụ AI công cộng để phân tích cho nhanh.',
      'Định hình câu lệnh rõ ràng (Prompting), luôn đối chiếu kiểm chứng thông tin thực tế, không đưa dữ liệu mật/nhạy cảm lên AI công cộng và chịu trách nhiệm về sản phẩm đầu ra.',
      'Từ chối hoàn toàn việc sử dụng AI vì AI không đem lại bất kỳ giá trị nào cho công việc.',
    ],
    correctIndex: 2,
    explanation: 'Sử dụng AI có trách nhiệm đòi hỏi kiểm chứng dữ liệu, bảo vệ thông tin nội bộ bí mật và coi AI là công cụ đồng hành thay vì phụ thuộc thụ động.',
  },
];

interface CourseRecommendation {
  code: string;
  title: string;
  hours: number;
  priority: 'HIGH' | 'MEDIUM';
  rationale: string;
  competencyCode: string;
}

const COURSE_CATALOG: Record<string, CourseRecommendation> = {
  '1': {
    code: 'A1-D',
    title: 'Khai thác và quản trị dữ liệu số doanh nghiệp',
    hours: 5,
    priority: 'MEDIUM',
    rationale: 'Nâng cao kỹ năng phân tích và thẩm định dữ liệu nghiệp vụ phục vụ ra quyết định.',
    competencyCode: '1.1',
  },
  '2': {
    code: 'A2-F',
    title: 'Giao tiếp và cộng tác số nơi công sở hiện đại',
    hours: 4,
    priority: 'MEDIUM',
    rationale: 'Tối ưu hóa khả năng làm việc nhóm từ xa và quản lý dự án cộng tác trên nền tảng số.',
    competencyCode: '2.1',
  },
  '3': {
    code: 'A3-C',
    title: 'Sáng tạo nội dung số và tài liệu chuẩn doanh nghiệp',
    hours: 6,
    priority: 'MEDIUM',
    rationale: 'Hoàn thiện kỹ năng biên tập tài liệu và tuân thủ bản quyền số trong tổ chức.',
    competencyCode: '3.1',
  },
  '4': {
    code: 'A4-I',
    title: 'An toàn thông tin và bảo vệ dữ liệu cá nhân',
    hours: 6,
    priority: 'HIGH',
    rationale: 'Bù đắp khoảng trống an ninh số bắt buộc theo chuẩn quy định và Thông tư 02/2025/TT-BGDĐT.',
    competencyCode: '4.2',
  },
  '5': {
    code: 'A5-P',
    title: 'Kỹ năng giải quyết sự cố kỹ thuật số nơi công sở',
    hours: 5,
    priority: 'MEDIUM',
    rationale: 'Chủ động xử lý sự cố quy trình và tối ưu hóa năng suất vận hành cá nhân.',
    competencyCode: '5.1',
  },
  '6': {
    code: 'A6-AI',
    title: 'Ứng dụng AI tạo sinh và tự động hóa công việc văn phòng',
    hours: 8,
    priority: 'HIGH',
    rationale: 'Bồi dưỡng kỹ năng Prompt Engineering và tích hợp trợ lý AI nâng cao 40% hiệu suất.',
    competencyCode: '6.1',
  },
};

type ScreenStage = 'intro' | 'quiz' | 'result';

export function EmployeeInitialAssessmentPage() {
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user);

  const [stage, setStage] = useState<ScreenStage>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [validationAlert, setValidationAlert] = useState(false);

  const currentQ = QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === QUESTIONS.length;

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
    setValidationAlert(false);
  };

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    const domainScores: Record<number, { isCorrect: boolean; currentLevel: number; targetLevel: number }> = {};

    QUESTIONS.forEach((q) => {
      const isRight = answers[q.id] === q.correctIndex;
      if (isRight) correct += 1;
      domainScores[q.domainNumber] = {
        isCorrect: isRight,
        currentLevel: isRight ? 2 : 1, // 2: Meets standard, 1: Basic with gap
        targetLevel: 2, // Standard target for enterprise position
      };
    });

    const gapDomains = Object.entries(domainScores)
      .filter(([_, item]) => !item.isCorrect)
      .map(([domain]) => domain);

    // If perfectly answered, recommend advanced AI + Security booster
    const recommendedCourses: CourseRecommendation[] =
      gapDomains.length > 0
        ? gapDomains.slice(0, 3).map((d) => COURSE_CATALOG[d]).filter(Boolean)
        : [COURSE_CATALOG['4'], COURSE_CATALOG['6']];

    return {
      correct,
      total: QUESTIONS.length,
      percentage: Math.round((correct / QUESTIONS.length) * 100),
      domainScores,
      gapDomains,
      recommendedCourses,
    };
  };

  const handleSubmit = () => {
    if (!isAllAnswered) {
      setValidationAlert(true);
      return;
    }

    const result = calculateResults();
    // Persist result in localStorage
    if (user?.id) {
      localStorage.setItem(`dt_initial_assessment_${user.id}`, JSON.stringify({
        completedAt: new Date().toISOString(),
        score: result.correct,
        total: result.total,
        percentage: result.percentage,
        gapCount: result.gapDomains.length,
      }));
    }
    setStage('result');
  };

  const results = stage === 'result' ? calculateResults() : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* ── STAGE 1: INTRO ── */}
      {stage === 'intro' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <Sparkles className="size-4" />
              <span>Khung năng lực số Thông tư 02/2025/TT-BGDĐT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bài test đánh giá năng lực hiện tại
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Chào mừng <strong className="text-slate-900 font-semibold">{user?.fullName || 'bạn'}</strong> đã gia nhập tổ chức! 
              Trước khi bắt đầu làm việc và học tập, hệ thống cần bạn thực hiện một bài khảo sát đánh giá nhanh 
              gồm các tình huống công việc thực tiễn nhằm xác định chính xác điểm xuất phát của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <BrainCircuit className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Quy mô bài test</p>
                <p className="text-lg font-bold text-slate-900">6 Tình huống</p>
                <p className="text-xs text-slate-500">6 miền năng lực số cốt lõi</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Thời gian ước tính</p>
                <p className="text-lg font-bold text-slate-900">~5 phút</p>
                <p className="text-xs text-slate-500">Trắc nghiệm 4 lựa chọn</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Mục tiêu đầu ra</p>
                <p className="text-lg font-bold text-slate-900">Skill Gap & Lộ trình</p>
                <p className="text-xs text-slate-500">Đề xuất khóa học cá nhân hóa</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Kết quả được lưu vào hồ sơ cá nhân và làm căn cứ điều chỉnh kế hoạch đào tạo nội bộ.
            </p>
            <button
              type="button"
              onClick={() => setStage('quiz')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
            >
              <span>Bắt đầu làm bài test</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 2: QUIZ ── */}
      {stage === 'quiz' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          {/* Progress Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900">
                Câu {currentIndex + 1} / {QUESTIONS.length}
              </span>
              <span className="text-slate-500 text-xs">
                Đã trả lời {answeredCount}/{QUESTIONS.length} câu
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Paginator Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {QUESTIONS.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`size-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isAnswered
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  aria-label={`Câu ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Box */}
          <div className="space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <span>Miền {currentQ.domainNumber}: {currentQ.domainName}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.text}
            </h2>

            {/* Options */}
            <div className="grid gap-3 pt-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-950 font-medium'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className={`size-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation Alert if user tries to submit without answering all */}
          {validationAlert && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-sm">
              <AlertTriangle className="size-5 text-amber-600 shrink-0" />
              <span>Bạn còn {QUESTIONS.length - answeredCount} câu chưa trả lời. Vui lòng hoàn thành tất cả các câu trước khi nộp bài.</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="border-t border-slate-100 pt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                currentIndex === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <ArrowLeft className="size-4" />
              <span>Câu trước</span>
            </button>

            {currentIndex < QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
              >
                <span>Câu tiếp</span>
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="size-4" />
                <span>Nộp bài & Phân tích Gap</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── STAGE 3: RESULT, GAP & LEARNING PATH ── */}
      {stage === 'result' && results && (
        <div className="space-y-8">
          {/* Header Score Card */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                  <CheckCircle2 className="size-3.5" /> Hoàn thành đánh giá đầu vào
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
                  Kết quả phân tích Năng lực & Khoảng trống
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Đã hoàn thành đánh giá cho nhân viên <strong className="text-white">{user?.fullName}</strong>. Hệ thống đã xác lập điểm xuất phát và đề xuất lộ trình đào tạo.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-center shrink-0 w-full sm:w-auto">
                <p className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Điểm số đạt được</p>
                <p className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {results.correct}<span className="text-xl font-normal text-blue-200">/{results.total}</span>
                </p>
                <p className="text-xs text-emerald-300 font-medium mt-1">
                  Độ bao phủ: {results.percentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Skill Gap Analysis */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Target className="size-5 text-blue-600" />
                  <span>1. Phân tích Khoảng trống Năng lực (Skill Gap)</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Đối chiếu giữa năng lực hiện tại của bạn và tiêu chuẩn vị trí việc làm theo Thông tư 02/2025.
                </p>
              </div>
              <Link
                to="/enterprise/me/skill-gap"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Xem chi tiết Radar Gap</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-3">
              {QUESTIONS.map((q) => {
                const score = results.domainScores[q.domainNumber];
                const hasGap = !score.isCorrect;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      hasGap
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Miền {q.domainNumber}</span>
                        <span className="font-semibold text-slate-900 text-sm">{q.domainName}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Hiện tại / Tiêu chuẩn</p>
                        <p className="text-xs font-bold text-slate-700">
                          Cấp {score.currentLevel} / Cấp {score.targetLevel}
                        </p>
                      </div>
                      {hasGap ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                          <ShieldAlert className="size-3.5" />
                          <span>Thiếu 1 Cấp</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="size-3.5" />
                          <span>Đạt Chuẩn</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Recommended Learning Roadmap */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="size-5 text-emerald-600" />
                  <span>2. Lộ trình Đào tạo Đề xuất (Learning Roadmap)</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Các khóa học được hệ thống đề xuất nhằm bù đắp trực tiếp các khoảng trống năng lực vừa phát hiện.
                </p>
              </div>
              <Link
                to="/enterprise/me/learning-path"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Xem toàn bộ lộ trình</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.recommendedCourses.map((course, idx) => (
                <div
                  key={course.code}
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Bước {idx + 1} · {course.code}
                      </span>
                      {course.priority === 'HIGH' ? (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Ưu tiên cao
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Ưu tiên trung bình
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {course.rationale}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span>Thời lượng: {course.hours} giờ</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      Chi tiết <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold">Sẵn sàng nâng cao năng lực số?</h3>
              <p className="text-xs text-slate-400">
                Lộ trình học tập cá nhân hóa của bạn đã sẵn sàng tại hệ thống.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setStage('quiz')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Làm lại bài test</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/enterprise/me/learning-path')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                <BookOpen className="size-4" />
                <span>Bắt đầu học theo lộ trình</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/enterprise/me')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                <span>Vào Bảng phát triển</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
