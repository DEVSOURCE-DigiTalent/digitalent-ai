import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as assignmentHooks from '@/hooks/use-assignments';
import * as competencyHooks from '@/hooks/use-competencies';
import { OwnerCourseCatalogPage } from '../pages/OwnerCourseCatalogPage';
import type { CourseListItem } from '@/services/assignment.service';

const course = (id: string, code: string, title: string): CourseListItem => ({
  id, code, title, level: 1, modules: 3, assignedCount: 0, status: 'PUBLISHED',
});
// Two Basic courses (free, owned) and one Intermediate course not bought yet.
const courses = [
  course('one', 'M1-F', 'Dữ liệu cơ bản'),
  course('four', 'M4-F', 'An toàn số cơ bản'),
  { ...course('three-i', 'A3-I', 'Nội dung chuyên nghiệp'), level: 2, assignedCount: 5 },
];

function renderCatalog(path = '/enterprise/courses') {
  vi.spyOn(competencyHooks, 'useCompetencyCategories').mockReturnValue({ data: [] } as never);
  vi.spyOn(assignmentHooks, 'useCourseCatalog').mockReturnValue({ data: { items: courses }, isLoading: false, isError: false } as never);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/enterprise/courses" element={<OwnerCourseCatalogPage />} />
        <Route path="/enterprise/courses/:id" element={<p>Trang khóa học</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

/** A wheel segment: its accessible name starts with the course title (the panel links start with the level). */
const segment = (title: string) => screen.getByRole('link', { name: new RegExp(`^${title} · `) });
const hub = () => document.querySelector('.ck-hub') as HTMLElement;
const spotlight = () => screen.getByRole('complementary');

describe('OwnerCourseCatalogPage', () => {
  beforeEach(() => { Element.prototype.scrollIntoView = vi.fn(); });

  it('draws the wheel: one segment per course says owned or to buy, and a click opens the course page', () => {
    renderCatalog();
    // Rings are named by level, never by course code.
    expect(document.querySelector('svg')).toHaveTextContent('Cơ bản');
    expect(document.querySelector('svg')).not.toHaveTextContent('M1-F');
    expect(hub()).toHaveTextContent('2/3');
    expect(segment('Dữ liệu cơ bản')).toHaveAccessibleName(/Cấp 1 · Cơ bản · Miễn phí$/);
    expect(segment('Nội dung chuyên nghiệp')).toHaveAccessibleName(/Chưa mua · .*₫$/);
    fireEvent.click(segment('Dữ liệu cơ bản'));
    expect(screen.getByText('Trang khóa học')).toBeInTheDocument();
  });

  it('pointing at a segment shows the course in the hub; Enter opens it', () => {
    renderCatalog();
    fireEvent.mouseEnter(segment('Nội dung chuyên nghiệp'));
    expect(hub()).toHaveTextContent('Nội dung chuyên nghiệp');
    expect(hub()).toHaveTextContent('Cấp 2 · Trung cấp');
    fireEvent.mouseLeave(segment('Nội dung chuyên nghiệp'));
    expect(hub()).toHaveTextContent('khóa học đã có');
    fireEvent.keyDown(segment('An toàn số cơ bản'), { key: 'Enter' });
    expect(screen.getByText('Trang khóa học')).toBeInTheDocument();
  });

  it('the panel lists one domain by level, picked from the six domain buttons', () => {
    renderCatalog();
    expect(within(spotlight()).getByText('Khai thác dữ liệu và thông tin')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Lĩnh vực 04/ }));
    const link = within(spotlight()).getByRole('link', { name: /An toàn số cơ bản/ });
    expect(link).toHaveAttribute('href', '/enterprise/courses/four');
    expect(link).toHaveTextContent('Miễn phí');
    expect(screen.queryByText(/Giao khóa học|người đang học|người chờ mua/)).toBeNull();
  });

  it('"Chưa mua" dims what is owned instead of hiding it', () => {
    renderCatalog();
    fireEvent.click(within(screen.getByRole('group', { name: 'Trạng thái' })).getByRole('button', { name: /Chưa mua/ }));
    expect(segment('Dữ liệu cơ bản')).toHaveAttribute('data-dim', 'true');
    expect(segment('Nội dung chuyên nghiệp')).not.toHaveAttribute('data-dim');
  });

  it('?level=2 brings that ring forward, and the filter can be removed', () => {
    renderCatalog('/enterprise/courses?level=2');
    expect(segment('Dữ liệu cơ bản')).toHaveAttribute('data-dim', 'true');
    expect(segment('Nội dung chuyên nghiệp')).not.toHaveAttribute('data-dim');
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ lọc Cấp 2 · Trung cấp' }));
    expect(segment('Dữ liệu cơ bản')).not.toHaveAttribute('data-dim');
  });

  it('a recommendation link opens the domain of the course and highlights it', async () => {
    renderCatalog('/enterprise/courses?focus=four');
    await waitFor(() => expect(document.getElementById('gap-target-course')).toHaveTextContent('An toàn số cơ bản'));
    expect(document.getElementById('gap-target-course')).toHaveClass('course-gap-target');
    expect(segment('An toàn số cơ bản')).toHaveAttribute('data-referred', 'true');
  });

  it('resolves the legacy M code to the exact A course and keeps its domain color', async () => {
    renderCatalog('/enterprise/courses?focus=M3-I');
    await waitFor(() => expect(document.getElementById('gap-target-course')).toHaveTextContent('Nội dung chuyên nghiệp'));
    expect(document.getElementById('gap-target-course')).toHaveAttribute('data-domain', '3');
    expect(document.getElementById('gap-target-course')).toHaveAttribute('aria-current', 'true');
  });

  it('cart: courses picked in Khung năng lực số start there, the panel toggles one, the hub adds every course to buy', async () => {
    renderCatalog('/enterprise/courses?selected=A1-F,M3-I');
    const cart = await screen.findByRole('region', { name: 'Giỏ khóa học' });
    expect(cart).toHaveTextContent('Nội dung chuyên nghiệp');
    expect(within(cart).getByRole('link', { name: 'Thanh toán & Ký online' })).toHaveAttribute('href', '/enterprise/courses/checkout?courses=M3-I');
    fireEvent.click(screen.getByRole('button', { name: /^Lĩnh vực 03/ }));
    fireEvent.click(within(spotlight()).getByRole('button', { name: 'Bỏ M3-I khỏi giỏ' }));
    expect(screen.queryByRole('region', { name: 'Giỏ khóa học' })).toBeNull();
    fireEvent.click(within(hub()).getByRole('button', { name: /Thêm cả 1 khóa vào giỏ/ }));
    expect(screen.getByRole('region', { name: 'Giỏ khóa học' })).toHaveTextContent('Nội dung chuyên nghiệp');
    expect(within(hub()).getByRole('button', { name: /Đã thêm cả vào giỏ/ })).toBeDisabled();
  });
});
