import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { REFERENCE_POSITIONS, getReferencePosition } from '@/lib/reference-positions';
import { samplePathFor } from '@/lib/standard-courses';
import { IndividualTrialPage } from '../pages/IndividualTrialPage';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/individual/try']}>
      <IndividualTrialPage />
    </MemoryRouter>,
  );
}

describe('Individual quick try', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts with the five reference positions and no account needed', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'Bạn muốn phát triển cho vị trí nào?' })).toBeInTheDocument();
    expect(screen.getByText(/không cần tài khoản/i)).toBeInTheDocument();
    for (const position of REFERENCE_POSITIONS) {
      expect(screen.getByRole('radio', { name: new RegExp(escapeRegExp(position.name)) })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Chọn một vị trí' })).toBeDisabled();
  });

  it('shows the sample path of the chosen position, with its course count and hours, then offers the trial', () => {
    renderPage();

    fireEvent.click(screen.getByRole('radio', { name: /Marketing/ }));
    fireEvent.click(screen.getByRole('button', { name: /Xem lộ trình cho Marketing/ }));

    expect(screen.getByRole('heading', { level: 2, name: 'Lộ trình năng lực số cho Marketing' })).toBeInTheDocument();
    const path = samplePathFor(getReferencePosition('MARKETING')!);
    const domains = within(screen.getByRole('list', { name: 'Các miền năng lực của lộ trình' }));
    path.domains.forEach((domain) => expect(domains.getByRole('heading', { level: 3, name: domain.name })).toBeInTheDocument());
    expect(screen.getByText(String(path.courseCount))).toBeInTheDocument();
    expect(screen.queryByText(/Khảo sát định hướng/)).not.toBeInTheDocument();

    const start = screen.getByRole('link', { name: /Bắt đầu 7 ngày miễn phí/ });
    expect(start).toHaveAttribute('href', '/individual/register?trial=1&position=MARKETING&source=try');
    fireEvent.click(start);
    expect(JSON.parse(sessionStorage.getItem('dt-try-handoff')!)).toMatchObject({ positionCode: 'MARKETING' });
  });

  it('goes back to change the position', () => {
    renderPage();

    fireEvent.click(screen.getByRole('radio', { name: /Kế toán/ }));
    fireEvent.click(screen.getByRole('button', { name: /Xem lộ trình cho Kế toán/ }));
    fireEvent.click(screen.getByRole('button', { name: /Đổi vị trí/ }));

    expect(screen.getByRole('radio', { name: /Kế toán/ })).toBeChecked();
  });

  it('reopens on the saved sample path and ignores state of the earlier five-step try', () => {
    localStorage.setItem('dt-individual-trial-v3', JSON.stringify({ version: 3, step: 'path', positionCode: 'HR' }));
    localStorage.setItem('dt-individual-trial-v2', JSON.stringify({ version: 2, step: 'lesson', positionCode: 'HR' }));

    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'Lộ trình năng lực số cho Nhân sự' })).toBeInTheDocument();
    expect(localStorage.getItem('dt-individual-trial-v2')).toBeNull();
  });

  it('falls back to the position list when the saved position no longer exists', () => {
    localStorage.setItem('dt-individual-trial-v3', JSON.stringify({ version: 3, step: 'path', positionCode: 'OLD' }));

    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'Bạn muốn phát triển cho vị trí nào?' })).toBeInTheDocument();
  });
});
