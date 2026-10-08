import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import { PersonalShell } from '../layouts/PersonalLayout';
import { usePersonalFocus } from '@/features/learner/components/PersonalFocusContext';

vi.mock('@/hooks/use-auth', () => ({ useLogout: () => ({ mutateAsync: vi.fn() }) }));
// The shell shows the plan badge from the access query; these tests are about navigation, so no plan state is loaded.
vi.mock('@/hooks/use-personal-learning', () => ({ usePersonalAccess: () => ({ data: undefined }) }));

function FocusPage() { usePersonalFocus(true); return <Link to="/personal/dashboard">Quay lại tổng quan</Link>; }
function renderShell(path = '/personal/dashboard') {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route element={<PersonalShell />}>
    <Route path="/personal/diagnostic" element={<FocusPage />} />
    <Route path="*" element={<p>Nội dung học tập</p>} />
  </Route></Routes></MemoryRouter>);
}

describe('Personal workspace shell', () => {
  beforeEach(() => { localStorage.clear(); });
  it.each([
    ['/personal', 'Tổng quan'], ['/personal/courses/course-1', 'Lộ trình học'],
    ['/personal/classroom/course-1', 'Lộ trình học'], ['/personal/billing', 'Gói học & thanh toán'],
  ])('marks exactly one item for %s', (path, label) => {
    renderShell(path);
    const nav = screen.getByRole('navigation', { name: 'Khu học tập cá nhân' });
    expect(within(nav).getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });
  it('uses a compact navigation card instead of a collapsible dashboard rail', () => {
    renderShell();
    expect(screen.getByTestId('personal-sidebar')).toHaveClass('pt-workspace-sidebar');
    expect(screen.queryByRole('button', { name: /thu gọn menu|mở rộng menu/i })).not.toBeInTheDocument();
    expect(localStorage.getItem('dt-personal-sidebar')).toBeNull();
    expect(screen.getByRole('link', { name: 'Mục tiêu nghề nghiệp' })).toBeInTheDocument();
  });
  it('opens the mobile drawer, closes with Escape and restores focus', () => {
    renderShell();
    const trigger = screen.getByRole('button', { name: 'Mở menu' });
    trigger.focus(); fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Điều hướng cá nhân' });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('marks focus pages without creating a dashboard sidebar preference', () => {
    renderShell('/personal/diagnostic');
    expect(screen.getByTestId('personal-layout')).toHaveAttribute('data-focus', 'true');
    expect(localStorage.getItem('dt-personal-sidebar')).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: 'Quay lại tổng quan' }));
    expect(screen.getByTestId('personal-layout')).toHaveAttribute('data-focus', 'false');
    expect(screen.getByTestId('personal-sidebar')).toBeInTheDocument();
  });
});
