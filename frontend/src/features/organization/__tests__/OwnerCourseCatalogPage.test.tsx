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
const courses = [course('one', 'M1-F', 'Dữ liệu cơ bản'), course('four', 'M4-F', 'An toàn số cơ bản')];

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
});
