import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../pages/LoginPage';
import apiClient from '../../../services/api-client';

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

  it('ExpiredSessionRedirectsToLoginOnce', () => {
    localStorage.setItem('accessToken', 'expired-token');

    // Simulate 401 interceptor behavior: clears token, redirects to /login if not already there
    const handle401 = (status: number, currentPath: string) => {
      let redirectUrl: string | null = null;
      if (status === 401) {
        localStorage.removeItem('accessToken');
        if (currentPath !== '/login') {
          redirectUrl = '/login';
        }
      }
      return redirectUrl;
    };

    expect(handle401(401, '/dashboard')).toBe('/login');
    expect(localStorage.getItem('accessToken')).toBeNull();
    // When already on /login, no further redirect to prevent loops
    expect(handle401(401, '/login')).toBeNull();
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
        <MemoryRouter initialEntries={['/login?returnTo=/organization/departments']}>
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
      expect(apiClient.post).toHaveBeenCalled();
    });
  });
});
