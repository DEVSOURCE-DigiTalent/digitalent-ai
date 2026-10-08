import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/services/api-client';
import { resetMockDb } from '@/services/mock/mock-store';
import { mockAdapter } from '@/services/mock/server/mock-adapter';
import { MOCK_EMAILS, signInAsMock, signOut } from '@/test/session';
import { LearnerDiagnosticPage } from '../pages/LearnerDiagnosticPage';
import { LearnerPathPage } from '../pages/LearnerPathPage';
import { LearnerClassroomPage } from '../pages/LearnerClassroomPage';
function renderPage(page: React.ReactElement, route: string, path: string) {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={[route]}><Routes><Route path={path} element={page} /></Routes></MemoryRouter></QueryClientProvider>);
}
beforeAll(() => { apiClient.defaults.adapter = mockAdapter; });
beforeEach(() => { signOut(); resetMockDb(); signInAsMock(MOCK_EMAILS.personal); });
afterEach(() => { vi.restoreAllMocks(); });
describe('Learning workspace', () => {
  it('preserves diagnostic answers when cancelling exit and only warns with unsaved answers', async () => {
    renderPage(<LearnerDiagnosticPage />, '/personal/diagnostic', '*');
    fireEvent.click(await screen.findByRole('button', { name: /Làm lại/ }));
    const option = screen.getAllByRole('radio')[0];
    fireEvent.click(option);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(option).toBeChecked();
    const unloading = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(unloading);
    expect(unloading.defaultPrevented).toBe(true);
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    const cleanUnload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanUnload);
    expect(cleanUnload.defaultPrevented).toBe(false);
  });
  it('prioritizes the next course and hides demo completion/reset actions', async () => {
    renderPage(<LearnerPathPage />, '/personal/path', '*');
    expect(await screen.findByRole('region', { name: 'Khóa học tiếp theo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Demo/ })).not.toBeInTheDocument();
    const exempt = screen.getByText('Các khóa được miễn').closest('details');
    expect(exempt).not.toHaveAttribute('open');
  });
  it('opens a lesson drawer and keeps normal lesson completion without demo controls', async () => {
    renderPage(<LearnerClassroomPage />, '/personal/classroom/crs-A3-I', '/personal/classroom/:id');
    const trigger = await screen.findByRole('button', { name: 'Mở mục lục khóa học' });
    fireEvent.click(trigger);
    const drawer = screen.getByRole('dialog', { name: 'Mục lục khóa học' });
    expect(within(drawer).getByRole('button', { name: 'Đóng mục lục' })).toBeInTheDocument();
    fireEvent.keyDown(drawer, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('button', { name: /Demo/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đánh dấu hoàn thành' })).toBeInTheDocument();
  });
});
