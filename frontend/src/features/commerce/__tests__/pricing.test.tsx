import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PricingPage } from '../pages/PricingPage';
import { getPortalChoice } from '../../portal/portal-preference';

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname + location.search}</p>;
}

function renderPricing(audience: 'enterprise' | 'individual') {
  cleanup();
  const base = audience === 'enterprise' ? '/business' : '/individual';
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`${base}/pricing`]}>
        <Routes>
          <Route path={`${base}/pricing`} element={<PricingPage audience={audience} />} />
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const card = (name: string) => within(screen.getByRole('article', { name: `Gói ${name}` }));

beforeEach(() => localStorage.clear());

describe('enterprise pricing (PUB-04)', () => {
  it('lists the three plans, recommends Pro and sells Enterprise through sales', () => {
    renderPricing('enterprise');

    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(card('Pro').getByText('Nên chọn')).toBeInTheDocument();
    expect(card('Enterprise').getByText('Liên hệ')).toBeInTheDocument();
    expect(card('Enterprise').getByRole('link', { name: 'Liên hệ tư vấn' }).getAttribute('href')).toMatch(/^mailto:/);
    expect(card('Enterprise').queryByRole('button')).not.toBeInTheDocument();
  });

  it('prices by user capacity bundle and shows add-on totals', () => {
    renderPricing('enterprise');
    // Switch to monthly for testing monthly bundle calculation
    fireEvent.click(screen.getByRole('button', { name: /Theo tháng/ }));

    expect(card('Pro').getByText(/Trọn gói 1\.990\.000.* \/ tháng cho tối đa 50 người dùng/)).toBeInTheDocument();
    fireEvent.change(card('Pro').getByLabelText(/Số người dùng/), { target: { value: '60' } });
    expect(card('Pro').getByText(/Tổng 2\.340\.000.* cho 60 người dùng/)).toBeInTheDocument();
  });

  it('keeps users inside what the plan allows once the field is left', () => {
    renderPricing('enterprise');
    const usersInput = card('Starter').getByLabelText(/Số người dùng/) as HTMLInputElement;

    fireEvent.change(usersInput, { target: { value: '500' } });
    fireEvent.blur(usersInput);

    expect(usersInput.value).toBe('30');
    expect(card('Starter').getByText(/cho 30 người dùng/)).toBeInTheDocument();
  });

  it('defaults to yearly prices with annual-first experience', () => {
    renderPricing('enterprise');

    expect(screen.getByRole('button', { name: /Theo năm/ })).toHaveAttribute('aria-pressed', 'true');
    expect(card('Pro').getByText(/Trọn gói 19\.090\.000.* \/ năm cho tối đa 50 người dùng/)).toBeInTheDocument();
  });

  it('carries the choice into registration and remembers the product', () => {
    renderPricing('enterprise');
    fireEvent.change(card('Pro').getByLabelText(/Số người dùng/), { target: { value: '60' } });
    fireEvent.click(card('Pro').getByRole('button', { name: 'Chọn gói Pro' }));

    expect(screen.getByTestId('where')).toHaveTextContent('/business/register?plan=ENT_PRO&seats=60&cycle=year');
    expect(getPortalChoice()).toBe('enterprise');
  });

  it('compares what each plan includes', () => {
    renderPricing('enterprise');
    const table = within(screen.getByRole('table'));
    const row = (name: string) => within(table.getByRole('row', { name: new RegExp(name) }));

    expect(row('Khóa học nội bộ').getAllByLabelText('Có')).toHaveLength(2);
    expect(row('Khóa học nội bộ').getAllByLabelText('Không')).toHaveLength(1);
    expect(row('Nhiệm vụ thực hành').getAllByLabelText('Có')).toHaveLength(3);
  });
});

describe('individual pricing (PUB-05)', () => {
  it('offers only paid plans and asks for no seats', () => {
    renderPricing('individual');

    expect(screen.queryByRole('article', { name: 'Gói Khởi đầu' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Miễn phí|miễn phí/)).not.toBeInTheDocument();
    expect(card('Plus').getAllByText(/1\.190\.000/).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/Số người dùng/)).not.toBeInTheDocument();
    fireEvent.click(card('Plus').getByRole('button', { name: 'Chọn gói Plus' }));

    expect(screen.getByTestId('where')).toHaveTextContent('/individual/register?plan=IND_PLUS&seats=1&cycle=year');
    expect(getPortalChoice()).toBe('individual');
  });

  it('shows the yearly total of a paid plan', () => {
    renderPricing('individual');

    expect(card('Plus').getByText(/1\.190\.000.* \/ năm/)).toBeInTheDocument();
    expect(card('Plus').getByText(/≈ 99\.167.* \/ tháng/)).toBeInTheDocument();
  });
});
