import type { RoleTutorialConfig } from './types';

export const TUTORIAL_CONFIGS: Record<string, RoleTutorialConfig> = {
  OWNER: {
    role: 'OWNER',
    roleName: 'Chủ doanh nghiệp',
    welcomeTitle: 'Chào mừng bạn đến với DigiTalent Pulse',
    welcomeDescription:
      'Hệ thống quản trị và nâng cao năng lực số chuẩn Thông tư 02/2025/BTTTT. Hãy cùng điểm qua các công cụ trọng tâm giúp doanh nghiệp định vị đích đến và đo lường khoảng trống năng lực đội ngũ.',
    steps: [
      {
        id: 'owner-step-1',
        title: 'Bức tranh Năng lực Toàn diện Tổ chức',
        description:
          'Nơi trực quan hóa tỷ lệ bao phủ năng lực, số lượng tài khoản, phòng ban và tiến độ của các đợt đào tạo đang diễn ra trong doanh nghiệp.',
        badge: 'Tổng quan',
        targetSelector: '[data-tour="OW-01"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/dashboard',
        actionText: 'Xem trang này',
        tips: 'Mẹo: Bạn có thể theo dõi tỷ lệ sẵn sàng năng lực số ngay tại Hero Card.',
      },
      {
        id: 'owner-step-2',
        title: 'Thiết lập Trần Năng lực Chuẩn hóa',
        description:
          'Áp dụng "Lý thuyết trần nhà": Thiết lập giới hạn năng lực tối đa cho toàn tổ chức và từng phòng ban theo chuẩn Thông tư 02/2025.',
        badge: 'Kiến trúc năng lực',
        targetSelector: '[data-tour="OW-05"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/setup',
        actionText: 'Khám phá trần năng lực',
        tips: 'Trần của phòng ban luôn nhỏ hơn hoặc bằng trần của tổ chức.',
      },
      {
        id: 'owner-step-3',
        title: 'Quản lý Nhân sự & Phân quyền',
        description:
          'Mời thành viên mới tham gia, phân bổ vào các phòng ban, chỉ định vai trò Trưởng phòng (Manager) và gán chức danh công việc mẫu.',
        badge: 'Cơ cấu tổ chức',
        targetSelector: '[data-tour="OW-02"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/members',
        actionText: 'Quản lý thành viên',
        tips: 'Gửi link kích hoạt ngay cho nhân viên để bắt đầu đo năng lực.',
      },
      {
        id: 'owner-step-4',
        title: 'Ma trận Khoảng cách Kỹ năng (Skill Gap)',
        description:
          'Phân tích chi tiết khoảng cách giữa năng lực hiện tại của nhân sự so với yêu cầu chuẩn vị trí để tối ưu chi phí đào tạo.',
        badge: 'Phân tích thông minh',
        targetSelector: '[data-tour="OW-21"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/capability',
        actionText: 'Xem ma trận khoảng trống',
        tips: 'Chỉ ra ngay những vị trí nào đang thiếu hụt kỹ năng mức độ cao.',
      },
      {
        id: 'owner-step-5',
        title: 'Danh mục Khóa học & Báo cáo Chu kỳ',
        description:
          'Theo dõi danh mục khóa học chuẩn hóa và xuất báo cáo kết quả tăng trưởng năng lực số theo từng chu kỳ đào tạo của tổ chức.',
        badge: 'Đào tạo & Đo lường',
        targetSelector: '[data-tour="OW-23"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/courses',
        actionText: 'Xem kho khóa học',
        tips: 'Mỗi khóa học đều gắn chặt với từng năng lực cụ thể.',
      },
    ],
    checklist: [
      {
        id: 'task-owner-1',
        title: 'Khám phá bức tranh tổng quan tổ chức',
        subtitle: 'Xem tỷ lệ bao phủ năng lực và các chỉ số sức khỏe số',
        route: '/enterprise/dashboard',
        targetSelector: '[data-tour="OW-01"]',
        badge: 'Cốt lõi',
      },
      {
        id: 'task-owner-2',
        title: 'Xem và tinh chỉnh Trần năng lực',
        subtitle: 'Kiểm tra mức trần của tổ chức và các phòng ban',
        route: '/enterprise/setup',
        targetSelector: '[data-tour="OW-05"]',
        badge: 'Thiết lập',
      },
      {
        id: 'task-owner-3',
        title: 'Kiểm tra danh sách thành viên & Mời nhân sự',
        subtitle: 'Xem cấu trúc phòng ban và gửi lời mời kích hoạt',
        route: '/enterprise/members',
        targetSelector: '[data-tour="OW-02"]',
        badge: 'Nhân sự',
      },
      {
        id: 'task-owner-4',
        title: 'Xem báo cáo khoảng cách năng lực',
        subtitle: 'Nhận diện điểm hụt kỹ năng theo từng phòng ban',
        route: '/enterprise/capability',
        targetSelector: '[data-tour="OW-21"]',
        badge: 'Báo cáo',
      },
    ],
  },

  MANAGER: {
    role: 'MANAGER',
    roleName: 'Quản lý phòng ban',
    welcomeTitle: 'Không gian Điều hành Đội ngũ',
    welcomeDescription:
      'Chào mừng bạn đến với Cổng Quản lý. Đây là trung tâm giúp bạn nắm bắt khoảng trống kỹ năng của cấp dưới, theo dõi quá trình học và thực hiện đánh giá minh chứng bài làm.',
    steps: [
      {
        id: 'manager-step-1',
        title: 'Bảng Điều hành & Hàng chờ Quyết định',
        description:
          'Khu vực hiển thị các công việc nóng: bài thi cần duyệt quyết định, nhân viên cần hỗ trợ tháo gỡ khó khăn, và quy mô nhân sự phòng ban.',
        badge: 'Hàng chờ nóng',
        targetSelector: '[data-tour="MG-01"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/team',
        actionText: 'Xem tổng quan nhóm',
        tips: 'Mẹo: Kiểm tra thẻ "Cần quyết định" để không làm chậm trễ tiến độ của nhân viên.',
      },
      {
        id: 'manager-step-2',
        title: 'Năng lực Đội ngũ & Bản đồ Khoảng trống',
        description:
          'Xem bản đồ năng lực của từng thành viên trong nhóm so với chuẩn vị trí. Biết chính xác ai đã vững và ai cần bổ trợ kỹ năng gì.',
        badge: 'Bản đồ kỹ năng',
        targetSelector: '[data-tour="MG-05"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/team/competency',
        actionText: 'Xem ma trận năng lực',
        tips: 'Bộ lọc giúp bạn nhóm nhân viên theo từng mức độ khoảng trống kỹ năng.',
      },
      {
        id: 'manager-step-3',
        title: 'Chấm bài & Duyệt Đánh giá Minh chứng AI',
        description:
          'Chức năng trọng tâm của Quản lý: Xem lại video ghi hình thi có giám sát AI, kiểm tra phân tích gian lận, chấm tự luận và đưa ra quyết định Đạt / Cần cải thiện.',
        badge: 'Đánh giá thực tế',
        targetSelector: '[data-tour="MG-13"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/team/final-reviews',
        actionText: 'Trải nghiệm chấm bài',
        tips: 'Hệ thống AI tự động đánh dấu các khoảnh khắc cần lưu ý trong video giám sát.',
      },
      {
        id: 'manager-step-4',
        title: 'Tiến độ Đào tạo & Báo cáo Tăng trưởng',
        description:
          'Xem tiến độ hoàn thành các khóa học của nhóm và xuất báo cáo tăng trưởng năng lực theo từng đợt đào tạo.',
        badge: 'Tiến độ & Báo cáo',
        targetSelector: '[data-tour="MG-06"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/team/training',
        actionText: 'Xem tiến độ học tập',
      },
    ],
    checklist: [
      {
        id: 'task-mgr-1',
        title: 'Nắm bắt các đầu việc cần ưu tiên',
        subtitle: 'Kiểm tra hàng chờ duyệt bài và nhân sự cần hỗ trợ',
        route: '/enterprise/team',
        targetSelector: '[data-tour="MG-01"]',
        badge: 'Ưu tiên',
      },
      {
        id: 'task-mgr-2',
        title: 'Khám phá Ma trận Năng lực của Đội ngũ',
        subtitle: 'Xem khoảng trống kỹ năng của từng thành viên',
        route: '/enterprise/team/competency',
        targetSelector: '[data-tour="MG-05"]',
        badge: 'Đội ngũ',
      },
      {
        id: 'task-mgr-3',
        title: 'Khám phá giao diện Chấm bài thi có AI Proctoring',
        subtitle: 'Trải nghiệm xem video giám sát và đưa ra quyết định',
        route: '/enterprise/team/final-reviews',
        targetSelector: '[data-tour="MG-13"]',
        badge: 'Chấm bài',
      },
      {
        id: 'task-mgr-4',
        title: 'Theo dõi tiến trình đào tạo của phòng ban',
        subtitle: 'Kiểm tra mức độ hoàn thành các môn học',
        route: '/enterprise/team/training',
        targetSelector: '[data-tour="MG-06"]',
        badge: 'Tiến độ',
      },
    ],
  },

  EMPLOYEE: {
    role: 'EMPLOYEE',
    roleName: 'Nhân viên',
    welcomeTitle: 'Chào mừng bạn đến với DigiTalent AI',
    welcomeDescription:
      'Hệ thống theo dõi tiến độ đào tạo và bài kiểm tra theo chức danh công việc của bạn.',
    steps: [
      {
        id: 'emp-step-1',
        title: 'Bàn làm việc của bạn',
        description:
          'Nơi theo dõi tiến độ hoàn thành các khóa học theo vị trí công tác và thời hạn đào tạo.',
        badge: 'Tổng quan',
        targetSelector: '[data-tour="emp-today-header"]',
        targetPosition: 'bottom',
        tips: 'Mẹo: Bạn có thể kiểm tra tỷ lệ hoàn thành các môn học ngay tại đây.',
      },
      {
        id: 'emp-step-2',
        title: 'Nhiệm vụ cần làm',
        description:
          'Danh sách các bài học tiếp theo, bài kiểm tra cần làm hoặc bài tập đang chờ chấm điểm.',
        badge: 'Nhiệm vụ',
        targetSelector: '[data-tour="emp-action-center"]',
        targetPosition: 'bottom',
        tips: 'Mẹo: Bấm nút để vào học ngay hoặc làm bài kiểm tra.',
      },
      {
        id: 'emp-step-3',
        title: 'Lộ trình môn học',
        description:
          'Xem danh sách toàn bộ các môn học được phân bổ theo từng lĩnh vực chuyên môn của vị trí.',
        badge: 'Lộ trình',
        targetSelector: '[data-tour="side-EM-02"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/me/path',
        actionText: 'Xem lộ trình',
        tips: 'Mẹo: Bấm vào tên môn để xem nhanh đề cương bài học.',
      },
      {
        id: 'emp-step-4',
        title: 'Sổ kiểm tra và bài tập',
        description:
          'Nơi nộp bài tập thực hành tình huống và theo dõi kết quả chấm điểm từ người hướng dẫn.',
        badge: 'Kiểm tra',
        targetSelector: '[data-tour="side-EM-03"]',
        targetPosition: 'right',
        actionRoute: '/enterprise/me/practice',
        actionText: 'Mở sổ kiểm tra',
        tips: 'Mẹo: Xem lại lịch sử các bài thi đã hoàn thành tại đây.',
      },
    ],
    checklist: [
      {
        id: 'task-emp-1',
        title: 'Kiểm tra tiến độ chức danh',
        subtitle: 'Xem tỷ lệ hoàn thành các môn học của bạn',
        route: '/enterprise/me',
        targetSelector: '[data-tour="emp-today-header"]',
        badge: 'Tổng quan',
      },
      {
        id: 'task-emp-2',
        title: 'Xem lộ trình môn học',
        subtitle: 'Khám phá các môn học theo từng cấp độ',
        route: '/enterprise/me/path',
        targetSelector: '[data-tour="side-EM-02"]',
        badge: 'Lộ trình',
      },
      {
        id: 'task-emp-3',
        title: 'Mở sổ nộp bài tập',
        subtitle: 'Theo dõi các bài kiểm tra và bài tập thực hành',
        route: '/enterprise/me/practice',
        targetSelector: '[data-tour="side-EM-03"]',
        badge: 'Kiểm tra',
      },
    ],
  },
};