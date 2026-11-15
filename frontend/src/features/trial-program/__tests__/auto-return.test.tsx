import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AutoReturnNotice } from '../components/AutoReturnNotice';

function renderDone() {
  render(
    <MemoryRouter initialEntries={['/exam']}>
      <Routes>
        <Route path="/exam" element={<AutoReturnNotice to="/overview" label="về trang khảo sát" />} />
        <Route path="/overview" element={<p>Trang khảo sát</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const tick = (seconds: number) => {
  for (let i = 0; i < seconds; i++) act(() => vi.advanceTimersByTime(1000));
};

describe('AutoReturnNotice', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('counts down five seconds then opens the overview', () => {
    renderDone();
    expect(screen.getByRole('status').textContent).toContain('Tự về trang khảo sát sau 5 giây');
    tick(4);
    expect(screen.getByRole('status').textContent).toContain('sau 1 giây');
    tick(1);
    expect(screen.getByText('Trang khảo sát')).toBeTruthy();
  });

  it('stays on the page when asked to', () => {
    renderDone();
    fireEvent.click(screen.getByRole('button', { name: 'Ở lại trang này' }));
    tick(6);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByText('Trang khảo sát')).toBeNull();
  });
});
