import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { LandingPage } from '../../public/pages/LandingPage';
import { CareerCatalogPage } from '../../public/pages/CareerCatalogPage';
import { CertificateVerificationPage } from '../../public/pages/CertificateVerificationPage';
import {
  LearnerTargetPage,
  LearnerDiagnosticPage,
  LearnerPathPage,
  LearnerCourseDetailPage,
  LearnerClassroomPage,
  LearnerProgressPage,
  LearnerCertificatesPage,
  LearnerTasksPage,
} from '../pages';

function renderWithProviders(ui: React.ReactElement, initialRoute = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Lane E: Learner Flow Delivery Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // TASK L1: Public Landing & Career Discovery
  // ─────────────────────────────────────────────────────────────
  describe('Task L1: LandingPage & CareerCatalogPage', () => {
    it('LandingPage renders hero banner, interactive role selector, and 5-step workflow', () => {
      renderWithProviders(<LandingPage />);

      // Hero
      expect(screen.getByText(/Welcome to DigiTalent AI/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Phát Triển Năng Lực Số Cá Nhân Hóa Theo Đúng Vị Trí Việc Làm/i)
      ).toBeInTheDocument();

      // Interactive role buttons
      expect(screen.getAllByText(/Kỹ sư Trí tuệ Nhân tạo/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Chuyên viên Phân tích Dữ liệu/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Kỹ sư Đám mây & Tự động hóa/i).length).toBeGreaterThan(0);

      // Platform stats
      expect(screen.getByText(/8 Cấp Độ/i)).toBeInTheDocument();
      expect(screen.getByText(/100% Miễn Học/i)).toBeInTheDocument();

      // 5-step workflow
      expect(screen.getByText(/Quá Trình Đào Tạo & Chuẩn Hóa 5 Bước/i)).toBeInTheDocument();
      expect(screen.getByText(/Phân Tích GAP & Miễn Học/i)).toBeInTheDocument();

      // Switching roles in interactive widget
      const dataRoleBtn = screen.getByRole('button', { name: /DATA-ANA-02/i });
      fireEvent.click(dataRoleBtn);
      expect(screen.getAllByText(/Data Analyst/i).length).toBeGreaterThan(0);
    });

    it('CareerCatalogPage list view renders search, filter, and roles list', () => {
      renderWithProviders(<CareerCatalogPage />, '/careers');

      expect(screen.getByRole('heading', { name: /Career Catalog/i })).toBeInTheDocument();
      expect(screen.getByText(/Browse available career paths to find your next step/i)).toBeInTheDocument();

      // Filter input
      const searchInput = screen.getByPlaceholderText(/Tìm kiếm vị trí/i);
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'Cybersecurity' } });
      expect(screen.getByText(/SEC-OPS-04/i)).toBeInTheDocument();
      expect(screen.queryByText(/AI-ENG-01/i)).not.toBeInTheDocument();
    });

    it('CareerCatalogPage detail view with :slug renders competency matrix and recommended courses', () => {
      renderWithProviders(
        <Routes>
          <Route path="/careers/:slug" element={<CareerCatalogPage />} />
        </Routes>,
        '/careers/ai-engineer'
      );

      // Verifies exact test requirement
      expect(screen.getByText(/Viewing details for career path: ai-engineer/i)).toBeInTheDocument();
      expect(screen.getAllByText(/AI-ENG-01/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Ma Trận Chuẩn Năng Lực Cần Đạt/i)).toBeInTheDocument();
      expect(screen.getByText(/Kỹ nghệ Prompt & Workflow LLM/i)).toBeInTheDocument();
      expect(screen.getByText(/Các Khóa Học Khuyến Nghị/i)).toBeInTheDocument();
      expect(screen.getByText(/Chọn làm mục tiêu học tập/i)).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TASK L2: Target & Diagnostic
  // ─────────────────────────────────────────────────────────────
  describe('Task L2: LearnerTargetPage & LearnerDiagnosticPage', () => {
    it('LearnerTargetPage allows exploring and selecting target role', () => {
      renderWithProviders(<LearnerTargetPage />, '/learn/target');

      expect(screen.getByTestId('learner-target-page')).toBeInTheDocument();
      expect(screen.getByText(/Mục tiêu nghề nghiệp & Khung năng lực/i)).toBeInTheDocument();

      // Select Cloud & DevOps role
      const devopsCard = screen.getByText(/CLD-OPS-03/i);
      fireEvent.click(devopsCard);

      // Verify localStorage was updated
      expect(localStorage.getItem('digitalent_target_role')).toBe('cloud-devops');
      expect(screen.getByText(/So sánh Kỹ năng Hiện tại vs Chuẩn Yêu cầu Vị trí/i)).toBeInTheDocument();
      expect(screen.getByText(/Cộng tác GitOps & Điều phối/i)).toBeInTheDocument();
    });

    it('LearnerDiagnosticPage allows answering questions, computing radar score, and viewing exemptions', async () => {
      renderWithProviders(<LearnerDiagnosticPage />, '/learn/diagnostic');

      expect(screen.getByTestId('learner-diagnostic-page')).toBeInTheDocument();
      expect(screen.getByText(/Bài kiểm tra chẩn đoán năng lực/i)).toBeInTheDocument();

      // Select answers for questions
      const answerButtons = screen.getAllByRole('button');
      // Click an option in the first question
      const firstOption = answerButtons.find((b) => b.textContent?.includes('Cơ sở dữ liệu Vector'));
      if (firstOption) fireEvent.click(firstOption);

      // Submit test
      const submitBtn = screen.getByRole('button', { name: /Nộp bài & Xem kết quả phân tích/i });
      fireEvent.click(submitBtn);

      // Check result evaluation
      expect(screen.getByText(/Kết quả phân tích chẩn đoán/i)).toBeInTheDocument();
      expect(screen.getByText(/Radar Năng Lực 5 Chiều/i)).toBeInTheDocument();
      expect(screen.getByText(/Chi tiết kết quả theo 5 Lĩnh vực Năng lực số/i)).toBeInTheDocument();
      expect(screen.getByText(/Xem lộ trình được điều chỉnh riêng cho bạn/i)).toBeInTheDocument();

      // Verify result persisted in localStorage
      expect(localStorage.getItem('digitalent_diagnostic_result')).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TASK L3: Classroom, Outline & Progress
  // ─────────────────────────────────────────────────────────────
  describe('Task L3: Classroom, Outline & Progress', () => {
    it('LearnerPathPage displays milestones and course roadmap', () => {
      renderWithProviders(<LearnerPathPage />, '/learn/path');

      expect(screen.getByTestId('learner-path-page')).toBeInTheDocument();
      expect(screen.getByText(/Lộ trình học tập mục tiêu/i)).toBeInTheDocument();
      expect(screen.getByText(/Tiến độ lộ trình:/i)).toBeInTheDocument();
      expect(screen.getByText(/Giai đoạn 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Giai đoạn 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Kỹ nghệ Câu lệnh AI Nâng cao/i)).toBeInTheDocument();
    });

    it('LearnerCourseDetailPage displays syllabus outline, outcomes, and instructor profile', () => {
      renderWithProviders(
        <Routes>
          <Route path="/learn/courses/:id" element={<LearnerCourseDetailPage />} />
        </Routes>,
        '/learn/courses/crs-01'
      );

      expect(screen.getByTestId('learner-course-detail')).toBeInTheDocument();
      expect(screen.getByText(/Mã: crs-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Kỹ nghệ Câu lệnh AI Nâng cao/i)).toBeInTheDocument();
      expect(screen.getByText(/Chuẩn đầu ra khóa học/i)).toBeInTheDocument();
      expect(screen.getByText(/Nội dung chương trình đào tạo/i)).toBeInTheDocument();
      expect(screen.getByText(/TS. Nguyễn Hoàng Nam/i)).toBeInTheDocument();
      expect(screen.getByText(/Tài liệu & Học liệu đính kèm/i)).toBeInTheDocument();
    });

    it('LearnerClassroomPage simulates player, handles switching lessons, toggling completion, and saving notes', () => {
      renderWithProviders(
        <Routes>
          <Route path="/learn/classroom/:id" element={<LearnerClassroomPage />} />
        </Routes>,
        '/learn/classroom/crs-01'
      );

      expect(screen.getByTestId('learner-classroom-page')).toBeInTheDocument();
      expect(screen.getByText(/Lớp học số: crs-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Danh sách bài học/i)).toBeInTheDocument();

      // Toggle complete
      const toggleCompleteButtons = screen.getAllByRole('button', { name: /hoàn thành/i });
      fireEvent.click(toggleCompleteButtons[0]);

      // Verify progress updated
      expect(localStorage.getItem('digitalent_progress_crs-01')).toBeTruthy();

      // Switch to Notes tab and type personal notes
      const notesTabBtn = screen.getByRole('button', { name: /Ghi chú của tôi/i });
      fireEvent.click(notesTabBtn);

      const notesTextarea = screen.getByLabelText(/Ghi chép bài học/i);
      fireEvent.change(notesTextarea, { target: { value: 'Lưu ý về Few-shot prompting' } });

      const saveNoteBtn = screen.getByRole('button', { name: /Lưu ghi chú/i });
      fireEvent.click(saveNoteBtn);
      expect(localStorage.getItem('digitalent_notes_crs-01')).toBe('Lưu ý về Few-shot prompting');
    });

    it('LearnerProgressPage renders overall metrics, competency progress bars, and badges', () => {
      renderWithProviders(<LearnerProgressPage />, '/learn/progress');

      expect(screen.getByTestId('learner-progress-page')).toBeInTheDocument();
      expect(screen.getByText(/Tiến độ tích lũy kỹ năng/i)).toBeInTheDocument();
      expect(screen.getByText(/28.5 giờ/i)).toBeInTheDocument();
      expect(screen.getByText(/12 \/ 14/i)).toBeInTheDocument();
      expect(screen.getByText(/Huy hiệu thành tích đã đạt được/i)).toBeInTheDocument();
      expect(screen.getByText(/Bậc Thầy Prompting/i)).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TASK L4: Certificates & Verification
  // ─────────────────────────────────────────────────────────────
  describe('Task L4: Certificates & Verification', () => {
    it('LearnerCertificatesPage renders issued certificates and opens modal preview', () => {
      renderWithProviders(<LearnerCertificatesPage />, '/learn/certificates');

      expect(screen.getByTestId('learner-certificates-page')).toBeInTheDocument();
      expect(screen.getByText(/Chứng chỉ & Huy hiệu đã đạt/i)).toBeInTheDocument();
      expect(screen.getByText(/DigiTalent AI Certified Prompt Specialist/i)).toBeInTheDocument();
      expect(screen.getByText(/DTAI-PRM-9831/i)).toBeInTheDocument();

      // Open Certificate Modal
      const viewModalButtons = screen.getAllByRole('button', { name: /Xem chứng chỉ/i });
      fireEvent.click(viewModalButtons[0]);

      expect(screen.getByText(/CHỨNG NHẬN HOÀN THÀNH XUẤT SẮC/i)).toBeInTheDocument();
      expect(screen.getByText(/Trần Văn Hoàng/i)).toBeInTheDocument();
      expect(screen.getByText(/Quét để xác thực/i)).toBeInTheDocument();
    });

    it('CertificateVerificationPage verifies valid certificate and shows error for unknown code', () => {
      renderWithProviders(<CertificateVerificationPage />, '/verify');

      expect(screen.getByRole('heading', { name: /Certificate Verification/i })).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/Nhập mã xác thực/i);
      const submitBtn = screen.getByRole('button', { name: /Xác minh chứng chỉ/i });

      // Valid test
      fireEvent.change(input, { target: { value: 'DTAI-PRM-9831' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Chứng chỉ hợp lệ & Được công nhận/i)).toBeInTheDocument();
      expect(screen.getByText(/Trần Văn Hoàng/i)).toBeInTheDocument();

      // Invalid test
      fireEvent.change(input, { target: { value: 'INVALID-CODE-999' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Không tìm thấy chứng chỉ với mã/i)).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TASK L5: Practical Tasks & Evidence Submission
  // ─────────────────────────────────────────────────────────────
  describe('Task L5: Practical Tasks', () => {
    it('LearnerTasksPage renders practical tasks with statuses and handles evidence submission', () => {
      renderWithProviders(<LearnerTasksPage />, '/learn/tasks');

      expect(screen.getByTestId('learner-tasks-page')).toBeInTheDocument();
      expect(screen.getByText(/Nhiệm vụ & Bài tập thực hành/i)).toBeInTheDocument();

      // Task statuses
      expect(screen.getByText(/tsk-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Đã có điểm/i)).toBeInTheDocument();
      expect(screen.getAllByText(/92\/100/i).length).toBeGreaterThan(0);

      // Pending task submission
      const submitButtons = screen.getAllByRole('button', { name: /Nộp bài làm/i });
      expect(submitButtons.length).toBeGreaterThan(0);

      fireEvent.click(submitButtons[0]);

      // Fill out submission form in modal
      expect(screen.getByText(/Nộp minh chứng công việc thực tế/i)).toBeInTheDocument();

      const repoInput = screen.getByPlaceholderText(/github.com/i);
      fireEvent.change(repoInput, { target: { value: 'https://github.com/user/ai-guardrails-defense' } });

      const notesInput = screen.getByPlaceholderText(/Mô tả các kỹ thuật đã áp dụng/i);
      fireEvent.change(notesInput, { target: { value: 'Đã hoàn thành kiểm thử 25 vector tấn công jailbreak' } });

      const submitEvidenceBtn = screen.getByRole('button', { name: /Gửi nộp bài đánh giá/i });
      fireEvent.click(submitEvidenceBtn);

      // Verify task status changed
      expect(screen.getByText(/Đã gửi nộp bài thực hành/i)).toBeInTheDocument();
      expect(localStorage.getItem('digitalent_tasks_state')).toBeTruthy();
    });
  });
});
