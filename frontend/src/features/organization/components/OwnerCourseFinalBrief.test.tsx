import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OwnerCourseFinalBrief } from './OwnerCourseFinalBrief';

describe('Đề cuối khóa dành cho doanh nghiệp', () => {
  it('tách nhiệm vụ và tiêu chí, mở nội dung khi chọn thanh đề', () => {
    render(<OwnerCourseFinalBrief content={{
      title: 'Bài cuối khóa về dữ liệu',
      promptHtml: '<h3>Tình huống</h3><p>Phân tích một nguồn dữ liệu.</p><h3>Sản phẩm cần nộp</h3><p>Báo cáo ngắn.</p>',
      criteria: ['Nguồn có thể kiểm tra', 'Kết luận rõ ràng'],
    }} />);
    const summary = screen.getByText('Đề cuối khóa');
    const details = summary.closest('details');
    expect(details).not.toHaveAttribute('open');
    fireEvent.click(summary);
    expect(details).toHaveAttribute('open');
    expect(screen.getByText('Tình huống')).toBeVisible();
    expect(screen.getByText('Sản phẩm cần nộp')).toBeVisible();
    expect(screen.getByText('Nguồn có thể kiểm tra')).toBeVisible();
  });
});
