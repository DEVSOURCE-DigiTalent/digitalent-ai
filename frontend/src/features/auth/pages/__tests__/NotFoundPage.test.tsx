import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from '../NotFoundPage';
import { signOut, signInAsMock, MOCK_EMAILS } from '../../../../test/session';

describe('NotFoundPage', () => {
  beforeEach(() => {
    signOut();
  });

  it('renders the atmospheric 404 page with quote and links for anonymous visitors', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    // Verify quote
    expect(
      screen.getByText("We're sorry. We can't connect to the outer reaches of the web right now.")
    ).toBeInTheDocument();

    // Verify brand
    expect(screen.getByText('digitalent.ai')).toBeInTheDocument();

    // Verify home link
    const homeLink = screen.getByRole('link', { name: 'Về trang chủ' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.getAttribute('href')).toBe('/');

    // Verify category anchors
    expect(screen.getByRole('link', { name: 'web' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'product' })).toHaveAttribute('href', '/careers');
    expect(screen.getByRole('link', { name: 'brand' })).toHaveAttribute('href', '/business');
  });

  it('routes authenticated manager to enterprise team portal', () => {
    signInAsMock(MOCK_EMAILS.manager);
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: 'Về trang chủ' });
    expect(homeLink.getAttribute('href')).toBe('/enterprise/team');
  });

  it('routes authenticated personal learner to personal dashboard', () => {
    signInAsMock(MOCK_EMAILS.personal);
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: 'Về trang chủ' });
    expect(homeLink.getAttribute('href')).toBe('/personal/dashboard');
  });

  it('toggles zen view mode when clicking enjoy the view', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const zenButton = screen.getByRole('button', { name: 'enjoy the view?' });
    fireEvent.click(zenButton);

    // Zen mode exit button appears
    expect(screen.getByRole('button', { name: 'Hiển thị lại menu (ESC)' })).toBeInTheDocument();

    // Clicking exit brings back standard mode
    fireEvent.click(screen.getByRole('button', { name: 'Hiển thị lại menu (ESC)' }));
    expect(screen.queryByRole('button', { name: 'Hiển thị lại menu (ESC)' })).not.toBeInTheDocument();
  });

  it('opens and closes the vintage CRT terminal modal', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const terminalButton = screen.getByRole('button', { name: 'Mở CRT terminal' });
    fireEvent.click(terminalButton);

    expect(screen.getByText('VINTAGE CRT // 404 DIAGNOSTIC LOG')).toBeInTheDocument();
    expect(screen.getByText(/> ERROR_CODE: 404/)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Đóng màn hình' });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('VINTAGE CRT // 404 DIAGNOSTIC LOG')).not.toBeInTheDocument();
  });
});
