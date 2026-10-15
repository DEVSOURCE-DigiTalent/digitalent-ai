import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { RichText } from '../components/RichText';

describe('RichText', () => {
  it('rebuilds lesson HTML from allowed tags only and drops every attribute', () => {
    const { container } = render(
      <RichText body={'<p onclick="steal()" style="color:red">Xin <strong>chào</strong><script>alert(1)</script></p><img src=x onerror="alert(2)"><a href="javascript:alert(3)">liên kết</a><iframe src="https://evil.test"></iframe>'} />,
    );

    expect(container.querySelector('script, img, a, iframe')).toBeNull();
    expect(container.querySelector('[onclick], [style], [href], [src], [onerror]')).toBeNull();
    expect(container.querySelector('p strong')?.textContent).toBe('chào');
    expect(container.textContent).toContain('liên kết');
    expect(container.textContent).not.toContain('alert');
  });

  it('renders the Development seed Markdown as headings, lists and bold text', () => {
    const { container } = render(<RichText body={'# Mục tiêu\n- Hiểu **nguồn** dữ liệu\n- Kiểm tra lại\n\n1. Bước một\n2. Bước hai\n\n> Ghi nhớ'} />);

    expect(container.querySelector('h2')?.textContent).toBe('Mục tiêu');
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.querySelector('ul li strong')?.textContent).toBe('nguồn');
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
    expect(container.querySelector('blockquote')?.textContent).toBe('Ghi nhớ');
  });

  it('shows a placeholder when the lesson has no text', () => {
    const { container } = render(<RichText body="   " />);
    expect(container.textContent).toBe('Trang này chưa có nội dung văn bản.');
  });
});
