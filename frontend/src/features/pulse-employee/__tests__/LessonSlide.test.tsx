import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonSlide } from '../components/LessonSlide';
import { lessonSections } from '../lib/lesson-sections';
import { slideArtwork } from '../lib/slide-art';
import manifest from '../lib/domain1-slide-art.json';

describe('Học liệu theo từng slide', () => {
  it('resolves every reviewed image by course and title and never assigns one to an unrelated lesson', () => {
    for (const row of manifest) {
      expect(slideArtwork(row.course, row.moduleIndex, row.title)?.src).toContain(row.image.split('/').pop());
      expect(slideArtwork(row.course.replace('A1-', 'M1-'), row.moduleIndex, row.title)?.alt).toBe(row.alt);
    }
    expect(slideArtwork('A6-F', 0, manifest[0]!.title)).toBeNull();
    expect(slideArtwork('A1-F', 0, 'Bài mới do quản trị viên tự soạn')).toBeNull();
    expect(slideArtwork('A1-F', 0, manifest[0]!.title)?.src).not.toBe(slideArtwork('A1-F', 0, manifest[1]!.title)?.src);
  });

  it('retains API text, highlights the self check, and keeps the complete source reachable', () => {
    render(<LessonSlide courseCode="A1-F" moduleIndex={0} index={0} count={11} slide={{
      lessonId: 'slide-1', title: manifest[0]!.title, lessonType: 'TEXT', estimatedMinutes: 4,
      media: [{ kind: 'IMAGE', url: '/reviewed-slide.png', alt: manifest[0]!.alt }],
      contentBody: 'Nội dung từ database.\n\n### Từ nhu cầu đến truy vấn\n- Câu hỏi\n- Phạm vi\n\n### Tự kiểm tra\nViết nhu cầu có kỳ thời gian.\n\n### Nguồn tham khảo\nGoogle Search\nhttps://support.google.com/websearch/answer/2466433',
    }} />);
    expect(screen.getByText('Nội dung từ database.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Từ nhu cầu đến truy vấn' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Dừng một chút, thử nghĩ xem' })).toBeTruthy();
    expect(screen.getByText('Viết nhu cầu có kỳ thời gian.')).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('src')).toContain('/reviewed-slide.png');
    const link = screen.getByRole('link', { hidden: true });
    expect(link.getAttribute('href')).toBe('https://support.google.com/websearch/answer/2466433');
  });

  it('shows an uploaded PDF on a page without text, instead of the empty text notice and the video script panel', () => {
    const { container } = render(<LessonSlide courseCode="M1-F" moduleIndex={1} index={0} count={12} slide={{
      lessonId: 'pdf-page', title: 'Slide bài giảng', lessonType: 'TEXT', contentBody: null,
      media: [{ kind: 'PDF', url: 'platform/assets/a1/content?exp=1&sig=s', alt: 'Slide bài giảng M1-F' }],
    }} />);
    const viewer = screen.getByTitle('Slide bài giảng M1-F');
    expect(viewer.getAttribute('src')).toContain('platform/assets/a1/content?exp=1&sig=s');
    expect(screen.getByRole('link', { name: /Mở PDF trong tab mới/ }).getAttribute('href')).toBe(viewer.getAttribute('src'));
    expect(screen.queryByText('Trang này chưa có nội dung văn bản.')).toBeNull();
    expect(screen.queryByText(/Kịch bản video/)).toBeNull();
    expect(container.querySelector('.pu-lesson-grid')).toBeNull();
  });

  it('keeps the text of a page that also has a PDF', () => {
    render(<LessonSlide index={0} count={1} slide={{
      lessonId: 'pdf-text', title: 'Có chữ và PDF', lessonType: 'TEXT', contentBody: 'Đọc phần này trước.',
      media: [{ kind: 'PDF', url: 'platform/assets/a2/content', alt: 'Tài liệu' }],
    }} />);
    expect(screen.getByText('Đọc phần này trước.')).toBeTruthy();
    expect(screen.getByTitle('Tài liệu')).toBeTruthy();
  });

  it('does not invent an illustration for custom content and sanitizes HTML in every section', () => {
    const { container } = render(<LessonSlide courseCode="A1-F" moduleIndex={0} index={0} count={1} slide={{
      lessonId: 'custom', title: 'Nội dung riêng', lessonType: 'TEXT',
      contentBody: '<p>Nội dung riêng từ API.</p><h3>Phân tích</h3><p onclick="steal()">Giữ nội dung<script>alert(1)</script></p><h3>Tự kiểm tra</h3><p>Bạn hiểu gì?</p>',
    }} />);
    expect(screen.getByText('Nội dung riêng từ API.')).toBeTruthy();
    expect(screen.getByText('Bạn hiểu gì?')).toBeTruthy();
    expect(container.querySelector('img, script, [onclick]')).toBeNull();
    expect(lessonSections('Nội dung không có heading')).toEqual([{ title: '', body: 'Nội dung không có heading\n' }]);
  });
});
