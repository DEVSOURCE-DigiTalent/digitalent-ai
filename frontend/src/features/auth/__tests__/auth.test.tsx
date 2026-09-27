import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../pages/LoginPage';
import apiClient from '../../../services/api-client';
import { AuthGuard } from '../../../components/guards/AuthGuard';
import { getLoginPath, isSafeReturnTo } from '../auth-redirect';

vi.mock('../../../services/api-client', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }
  };
});

describe('Authentication', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    
    // We mock window.location for redirect tests
    const mockLocation = new URL('http://localhost');
    vi.stubGlobal('location', mockLocation);
  });

  it('LoginStoresOnlyReturnedAccessToken', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: {
        data: {
          accessToken: 'mock-access-token',
          expiresAt: '2026-10-01T00:00:00Z'
        }
      }
    });

    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        data: {
          id: '1',
          roles: ['EMPLOYEE']
        }
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const emailInput = screen.getByPlaceholderText(/Tên đăng nhập \/ Email/i);
    const passwordInput = screen.getByPlaceholderText(/Mật khẩu/i);
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  it('AnonymousGuardPreservesCurrentPathForLogin', async () => {
    function LoginDestination() {
      const [params] = useSearchParams();
      return <div>Return to: {params.get('returnTo')}</div>;
    }

    render(
      <MemoryRouter initialEntries={['/enterprise/organization/departments?page=2']}>
        <Routes>
          <Route path="/enterprise/organization/departments" element={<AuthGuard><div>Protected</div></AuthGuard>} />
          <Route path="/login" element={<LoginDestination />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Return to: /enterprise/organization/departments?page=2')).toBeInTheDocument();
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    expect(getLoginPath('/enterprise/organization/departments', '?page=2'))
      .toBe('/login?returnTo=%2Fenterprise%2Forganization%2Fdepartments%3Fpage%3D2');
  });

  it('LoginRedirectRespectsSafeInternalReturnTo', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: { data: { accessToken: 'token' } }
    });
    (apiClient.get as any).mockResolvedValueOnce({
      data: { data: { id: '1', roles: ['EMPLOYEE'] } }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/login?returnTo=/enterprise/organization/departments']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/enterprise/organization/departments" element={<div>Returned to departments</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const emailInput = screen.getByPlaceholderText(/Tên đăng nhập \/ Email/i);
    const passwordInput = screen.getByPlaceholderText(/Mật khẩu/i);
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Returned to departments')).toBeInTheDocument();
    });

    expect(isSafeReturnTo('//external.example')).toBe(false);
    expect(isSafeReturnTo('/\\external.example')).toBe(false);
  });
});
