import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Steps } from '../components/TrialUi';
import { TrialDisclosure } from '../components/TrialDisclosure';

afterEach(cleanup);

describe('owner assessment interactions', () => {
  it('keeps draft content mounted but inert when the disclosure closes', () => {
    const { rerender, container } = render(<TrialDisclosure open><input aria-label="Bản nháp" defaultValue="Giữ nội dung" /></TrialDisclosure>);
    rerender(<TrialDisclosure open={false}><input aria-label="Bản nháp" defaultValue="Giữ nội dung" /></TrialDisclosure>);
    expect(container.querySelector('.trial-disclosure')).toHaveAttribute('inert');
    expect(container.querySelector('input')).toHaveValue('Giữ nội dung');
    rerender(<TrialDisclosure open><input aria-label="Bản nháp" defaultValue="Giữ nội dung" /></TrialDisclosure>);
    expect(screen.getByLabelText('Bản nháp')).toHaveValue('Giữ nội dung');
    expect(container.querySelector('.trial-disclosure')).not.toHaveAttribute('inert');
  });

  it('identifies the current assessment step for keyboard and screen reader users', () => {
    render(<Steps steps={['Danh sách', 'Thời hạn', 'Tiến độ']} current={1} label="Tiến trình đánh giá" />);
    expect(screen.getByRole('navigation', { name: 'Tiến trình đánh giá' }).querySelector('[aria-current=step]')).toHaveTextContent('Thời hạn');
  });
});
