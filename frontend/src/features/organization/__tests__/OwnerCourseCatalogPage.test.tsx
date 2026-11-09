import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as assignmentHooks from '@/hooks/use-assignments';
import * as competencyHooks from '@/hooks/use-competencies';
import { OwnerCourseCatalogPage } from '../pages/OwnerCourseCatalogPage';
import type { CourseListItem } from '@/services/assignment.service';

const course = (id: string, code: string, title: string): CourseListItem => ({
  id, code, title, level: 1, modules: 3, assignedCount: 0, status: 'PUBLISHED',
});
const courses = [course('one', 'M1-F', 'Dữ liệu cơ bản'), course('four', 'M4-F', 'An toàn số cơ bản'), { ...course('three-i', 'A3-I', 'Nội dung chuyên nghiệp'), level: 2 }];

function renderCatalog(path = '/enterprise/courses') {
  vi.spyOn(competencyHooks, 'useCompetencyCategories').mockReturnValue({ data: [] } as never);
  vi.spyOn(assignmentHooks, 'useCourseCatalog').mockReturnValue({ data: { items: courses }, isLoading: false, isError: false } as never);
  return render(<MemoryRouter initialEntries={[path]}><OwnerCourseCatalogPage /></MemoryRouter>);
}

describe('OwnerCourseCatalogPage', () => {
  beforeEach(() => { Element.prototype.scrollIntoView = vi.fn(); });
  it('shows one domain at a time while keeping all domains accessible', () => {
    renderCatalog();
    const nav = screen.getByRole('navigation', { name: 'Lĩnh vực năng lực' });
    expect(within(nav).getAllByRole('button')).toHaveLength(6);
    expect(screen.getByRole('group', { name: /Khóa học Khai thác dữ liệu/ })).toBeInTheDocument();
    fireEvent.click(within(nav).getByRole('button', { name: /An toàn/ }));
    expect(screen.getByRole('group', { name: 'Khóa học An toàn' })).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Khóa học An toàn' })).getByText('An toàn số cơ bản')).toBeInTheDocument();
  });

  it('opens the requested course and domain from a recommendation link', async () => {
    renderCatalog('/enterprise/courses?focus=M4-F');
    await waitFor(() => expect(screen.getByRole('group', { name: 'Khóa học An toàn' })).toBeInTheDocument());
    expect(document.getElementById('gap-target-course')).toHaveTextContent('An toàn số cơ bản');
  });

  it('selects and highlights the exact course id from a skill gap link', async () => {
    renderCatalog('/enterprise/courses?focus=four');
    await waitFor(() => expect(screen.getByRole('group', { name: 'Khóa học An toàn' })).toBeInTheDocument());
    const target = document.getElementById('gap-target-course');
    expect(target).toHaveTextContent('An toàn số cơ bản');
    expect(target).toHaveClass('course-gap-target');
    expect(target).toHaveAttribute('aria-pressed', 'true');
  });

  it('resolves the legacy M code to the exact A course and keeps its domain color', async () => {
    renderCatalog('/enterprise/courses?focus=M3-I');
    await waitFor(() => expect(document.getElementById('gap-target-course')).toHaveTextContent('Nội dung chuyên nghiệp'));
    expect(document.getElementById('gap-target-course')).toHaveAttribute('data-domain', '3');
    expect(document.getElementById('gap-target-course')).toHaveAttribute('aria-pressed', 'true');
  });

  it('preserves multi-course purchase highlights across domains and lets users jump between them', async () => {
    renderCatalog('/enterprise/courses?selected=A1-F,M3-I&level=1');
    const first = await screen.findByRole('button', { name: /Đã chọn từ Khung năng lực.*Dữ liệu cơ bản/ });
    expect(first).toHaveAttribute('data-preselected', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Xem khóa đã chọn M3-I' }));
    const group = screen.getByRole('group', { name: /Khóa học Sáng tạo nội dung/ });
    const target = within(group).getByRole('button', { name: /Nội dung chuyên nghiệp/ });
    expect(target).toHaveAttribute('data-preselected', 'true');
    expect(target).toHaveAttribute('data-course-domain', '3');
    expect(target).toHaveAttribute('aria-pressed', 'true');
    expect(target).toHaveStyle({ opacity: '1' });
    expect(screen.getByRole('link', { name: /Thanh toán & Ký online \(2 khóa\)/ })).toHaveAttribute('href', '/enterprise/courses/checkout?courses=M1-F%2CM3-I');
    const nav = screen.getByRole('navigation', { name: 'Lĩnh vực năng lực' });
    expect(within(nav).getAllByText('Đã chọn')).toHaveLength(2);
  });
});
