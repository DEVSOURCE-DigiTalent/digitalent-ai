import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PricingPage } from '../pages/PricingPage';
import { getPortalChoice } from '../../portal/portal-preference';

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname + location.search}</p>;
}

function renderPricing(audience: 'enterprise' | 'individual') {
  cleanup();
  const base = audience === 'enterprise' ? '/business' : '/individual';
  return render(
    <MemoryRouter initialEntries={[`${base}/pricing`]}>
      <Routes>
        <Route path={`${base}/pricing`} element={<PricingPage audience={audience} />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
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

  it('prices by seats and shows the total', () => {
    renderPricing('enterprise');

    expect(card('Pro').getByText(/Tổng 790\.000.* \/ tháng cho 10 ghế/)).toBeInTheDocument();
    fireEvent.change(card('Pro').getByLabelText(/Số ghế/), { target: { value: '50' } });
    expect(card('Pro').getByText(/Tổng 3\.950\.000.* cho 50 ghế/)).toBeInTheDocument();
  });

  it('keeps seats inside what the plan sells once the field is left', () => {
    renderPricing('enterprise');
    const seats = card('Starter').getByLabelText(/Số ghế/) as HTMLInputElement;

    fireEvent.change(seats, { target: { value: '500' } });
    fireEvent.blur(seats);

    expect(seats.value).toBe('20');
    expect(card('Starter').getByText(/cho 20 ghế/)).toBeInTheDocument();
  });

  it('switches to yearly prices with the 20% discount', () => {
    renderPricing('enterprise');
    fireEvent.click(screen.getByRole('button', { name: /Theo năm/ }));

    expect(screen.getByRole('button', { name: /Theo năm/ })).toHaveAttribute('aria-pressed', 'true');
    // 79.000 x 10 seats x 12 months x 0.8
    expect(card('Pro').getByText(/Tổng 7\.584\.000.* \/ năm cho 10 ghế/)).toBeInTheDocument();
  });

  it('carries the choice into registration and remembers the product', () => {
    renderPricing('enterprise');
    fireEvent.change(card('Pro').getByLabelText(/Số ghế/), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: /Theo năm/ }));
    fireEvent.click(card('Pro').getByRole('button', { name: 'Chọn gói Pro' }));

    expect(screen.getByTestId('where')).toHaveTextContent('/business/register?plan=ENT_PRO&seats=30&cycle=year');
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
    expect(card('Plus').getAllByText(/149.000/).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/Số ghế/)).not.toBeInTheDocument();
    fireEvent.click(card('Plus').getByRole('button', { name: 'Chọn gói Plus' }));

    expect(screen.getByTestId('where')).toHaveTextContent('/individual/register?plan=IND_PLUS&seats=1&cycle=month');
    expect(getPortalChoice()).toBe('individual');
  });

  it('shows the yearly total of a paid plan', () => {
    renderPricing('individual');
    fireEvent.click(screen.getByRole('button', { name: /Theo năm/ }));

    expect(card('Plus').getByText(/Tổng 1\.430\.400.* \/ năm/)).toBeInTheDocument();
  });
});
