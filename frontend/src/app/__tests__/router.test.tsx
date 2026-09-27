import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '../router';
import { isSafeReturnTo } from '../../features/auth/auth-redirect';

function AppRoutes() {
  return useRoutes(routes);
}

function renderWithRouter(initialEntry: string, queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Router Configuration & Surface Separation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  describe('Public Flow (Anonymous Access)', () => {
    it('Anonymous can access landing page without login redirect', async () => {
      renderWithRouter('/', queryClient);

      expect(screen.getByTestId('public-layout')).toBeInTheDocument();
      expect(screen.getByText(/Welcome to DigiTalent AI/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Dành cho Doanh nghiệp/i })).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Anonymous can access career catalog without login redirect', async () => {
      renderWithRouter('/careers', queryClient);

      expect(screen.getByTestId('public-layout')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Career Catalog/i })).toBeInTheDocument();
      expect(screen.getByText(/Browse available career paths/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Anonymous can access career detail slug without login redirect', async () => {
      renderWithRouter('/careers/ai-engineer', queryClient);

      expect(screen.getByTestId('public-layout')).toBeInTheDocument();
      expect(screen.getByText(/Viewing details for career path: ai-engineer/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Anonymous can access certificate verification without login redirect', async () => {
      renderWithRouter('/verify', queryClient);

      expect(screen.getByTestId('public-layout')).toBeInTheDocument();
      expect(screen.getByText(/Certificate Verification/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });
  });

  describe('Learner Flow & Deep-Link Boundaries', () => {
    it('Direct load /learn/courses/crs-01 renders LearnerLayout and does NOT contain Enterprise shell', async () => {
      renderWithRouter('/learn/courses/crs-01', queryClient);

      // Verify Learner layout is active
      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();

      // Verify Course Detail content for crs-01 is rendered
      expect(screen.getByTestId('learner-course-detail')).toBeInTheDocument();
      expect(screen.getByText(/Mã: crs-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Kỹ nghệ Câu lệnh AI Nâng cao/i)).toBeInTheDocument();

      // Verify Enterprise shell and login redirect are NOT rendered
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
      expect(screen.queryByText(/Đăng nhập vào hệ thống/i)).not.toBeInTheDocument();
    });

    it('Direct load /learn renders learner dashboard directly', async () => {
      renderWithRouter('/learn', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Chào mừng trở lại với DigiTalent AI/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /learn/dashboard renders learner dashboard', async () => {
      renderWithRouter('/learn/dashboard', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /learn/target renders target career and competencies', async () => {
      renderWithRouter('/learn/target', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-target-page')).toBeInTheDocument();
      expect(screen.getByText(/Mục tiêu nghề nghiệp & Khung năng lực/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /learn/diagnostic renders diagnostic assessment page', async () => {
      renderWithRouter('/learn/diagnostic', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-diagnostic-page')).toBeInTheDocument();
      expect(screen.getByText(/Bài kiểm tra chẩn đoán năng lực/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /learn/path renders learning path roadmap', async () => {
      renderWithRouter('/learn/path', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-path-page')).toBeInTheDocument();
      expect(screen.getByText(/Lộ trình học tập mục tiêu/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /learn/classroom/crs-01 renders virtual classroom player', async () => {
      renderWithRouter('/learn/classroom/crs-01', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-classroom-page')).toBeInTheDocument();
      expect(screen.getByText(/Lớp học số: crs-01/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /learn/progress renders personal skill progress', async () => {
      renderWithRouter('/learn/progress', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-progress-page')).toBeInTheDocument();
      expect(screen.getByText(/Tiến độ tích lũy kỹ năng/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /learn/tasks renders practical tasks page', async () => {
      renderWithRouter('/learn/tasks', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-tasks-page')).toBeInTheDocument();
      expect(screen.getByText(/Nhiệm vụ & Bài tập thực hành/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Direct load /learn/certificates renders certificates page', async () => {
      renderWithRouter('/learn/certificates', queryClient);

      expect(screen.getByTestId('learner-layout')).toBeInTheDocument();
      expect(screen.getByTestId('learner-certificates-page')).toBeInTheDocument();
      expect(screen.getByText(/Chứng chỉ & Huy hiệu đã đạt/i)).toBeInTheDocument();
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });
  });

  describe('Enterprise Flow & Auth Guards', () => {
    it('Unauthenticated access to /enterprise/dashboard redirects to /login?returnTo=...', async () => {
      renderWithRouter('/enterprise/dashboard', queryClient);

      await waitFor(() => {
        expect(screen.getByText(/Đăng nhập vào hệ thống/i)).toBeInTheDocument();
      });
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Unauthenticated access to /enterprise/organization/departments redirects to login', async () => {
      renderWithRouter('/enterprise/organization/departments', queryClient);

      await waitFor(() => {
        expect(screen.getByText(/Đăng nhập vào hệ thống/i)).toBeInTheDocument();
      });
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });

    it('Legacy /organization/departments redirects to /enterprise/organization/departments then login', async () => {
      renderWithRouter('/organization/departments', queryClient);

      await waitFor(() => {
        expect(screen.getByText(/Đăng nhập vào hệ thống/i)).toBeInTheDocument();
      });
      expect(screen.queryByTestId('enterprise-layout')).not.toBeInTheDocument();
    });
  });

  describe('Safe returnTo Validation', () => {
    it('isSafeReturnTo allows valid internal relative paths', () => {
      expect(isSafeReturnTo('/enterprise/dashboard')).toBe(true);
      expect(isSafeReturnTo('/learn/courses/crs-01')).toBe(true);
      expect(isSafeReturnTo('/careers?search=ai')).toBe(true);
    });

    it('isSafeReturnTo rejects external protocols, protocol-relative, and backslash paths', () => {
      expect(isSafeReturnTo('//attacker.com')).toBe(false);
      expect(isSafeReturnTo('/\\attacker.com')).toBe(false);
      expect(isSafeReturnTo('https://malicious.com')).toBe(false);
      expect(isSafeReturnTo('javascript:alert(1)')).toBe(false);
      expect(isSafeReturnTo('')).toBe(false);
      expect(isSafeReturnTo(null)).toBe(false);
    });
  });
});
