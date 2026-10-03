import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CareerCatalogPage } from '../career-catalog/CareerCatalogPage';
import { REFERENCE_POSITIONS } from '@/lib/reference-positions';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/careers" element={<CareerCatalogPage />} />
        <Route path="/careers/:slug" element={<CareerCatalogPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('/careers: reference positions', () => {
  it('lists the five MVP positions and says where they come from', () => {
    const { container } = renderAt('/careers');

    expect(screen.getByRole('heading', { level: 1, name: /Vị trí tham chiếu/ })).toBeInTheDocument();
    for (const position of REFERENCE_POSITIONS) {
      expect(screen.getByRole('link', { name: new RegExp(position.name.replace(/[()]/g, '\\$&')) })).toHaveAttribute(
        'href',
        `/careers/${position.code.toLowerCase()}`
      );
    }
    expect(container.textContent).toMatch(/do DigiTalent AI xây dựng/);
    expect(container.textContent).not.toMatch(/AI Engineer|Data Analyst|DevOps|Cybersecurity/);
  });

  it('opens a position with its requirements grouped by the six domains', () => {
    renderAt('/careers/accountant');

    expect(screen.getByRole('heading', { level: 1, name: 'Kế toán' })).toBeInTheDocument();
    expect(screen.getByText(/21\/24 năng lực/)).toBeInTheDocument();
    const domains = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(domains).toEqual(expect.arrayContaining([expect.stringMatching(/An toàn/), expect.stringMatching(/Ứng dụng trí tuệ nhân tạo/)]));

    const row = screen.getByText('Phát triển nội dung số').closest('li')!;
    expect(within(row).getByText('3.1')).toBeInTheDocument();
    expect(within(row).getByText('Cơ bản · bậc 1–2')).toBeInTheDocument();
    // The accountant does not need 3.2 and 3.3; they are named as left out, not listed as requirements.
    expect(screen.queryByText('Tích hợp và tạo lập lại nội dung số')).not.toBeInTheDocument();
    expect(screen.getByText(/Không thuộc yêu cầu.*3\.2.*3\.3/)).toBeInTheDocument();
  });

  it('leads a visitor who wants more to the paid personal plans', () => {
    renderAt('/careers/accountant');

    expect(screen.getByRole('link', { name: /Xem gói cá nhân/ })).toHaveAttribute('href', '/individual/pricing');
    expect(screen.getByRole('link', { name: /Tất cả vị trí/ })).toHaveAttribute('href', '/careers');
    expect(screen.queryByText(/miễn phí/i)).not.toBeInTheDocument();
  });

  it('says so when the position does not exist', () => {
    renderAt('/careers/ai-engineer');

    expect(screen.getByRole('heading', { name: /Không tìm thấy vị trí/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem tất cả vị trí/ })).toHaveAttribute('href', '/careers');
  });
});
