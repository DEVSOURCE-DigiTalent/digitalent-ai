import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PortalSelectorPage, RootRoute } from '../PortalSelectorPage';

function renderEntries(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/" element={<RootRoute />} />
    <Route path="/portal" element={<PortalSelectorPage />} />
    <Route path="/business" element={<p>Trang doanh nghiệp</p>} />
    <Route path="/business/try" element={<p>Đăng ký doanh nghiệp</p>} />
  </Routes></MemoryRouter>);
}

describe('enterprise-only public entry', () => {
  it('opens the enterprise landing directly at /', () => {
    localStorage.setItem('dt-portal', 'individual');
    renderEntries('/');
    expect(screen.getByText('Trang doanh nghiệp')).toBeInTheDocument();
  });

  it('keeps old /portal bookmarks on the enterprise landing', () => {
    renderEntries('/portal');
    expect(screen.getByText('Trang doanh nghiệp')).toBeInTheDocument();
  });

  it('sends old registration intent to the enterprise trial form', () => {
    renderEntries('/portal?intent=register');
    expect(screen.getByText('Đăng ký doanh nghiệp')).toBeInTheDocument();
  });
});
