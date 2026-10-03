import { afterAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true');
});

import { Field, MockEmailNotice } from '../components/FormControls';

afterAll(() => {
  vi.unstubAllEnvs();
});

const renderNotice = (to?: string) =>
  render(
    <MemoryRouter>
      <MockEmailNotice label="liên kết." to={to} />
    </MemoryRouter>,
  );

describe('MockEmailNotice', () => {
  it('links to an app path', () => {
    renderNotice('/reset-password/abc');

    expect(screen.getByRole('link', { name: 'mở liên kết' })).toHaveAttribute('href', '/reset-password/abc');
  });

  it.each(['https://evil.example/reset', '//evil.example/reset', 'javascript:alert(1)', ''])(
    'shows nothing for a link that is not an app path: %s',
    (link) => {
      renderNotice(link);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    },
  );

  it('shows nothing without a link', () => {
    renderNotice(undefined);

    expect(screen.queryByText(/Giả lập email/)).not.toBeInTheDocument();
  });
});

describe('Field', () => {
  it('ties the error to its control for screen readers', () => {
    render(
      <Field label="Email" htmlFor="email" error="Email không hợp lệ">
        <input id="email" />
      </Field>,
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-error');
  });

  it('ties the hint to its control when there is no error', () => {
    render(
      <Field label="Mật khẩu" htmlFor="password" hint="Ít nhất 8 ký tự">
        <input id="password" />
      </Field>,
    );

    const input = screen.getByLabelText('Mật khẩu');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute('aria-describedby', 'password-hint');
  });
});
