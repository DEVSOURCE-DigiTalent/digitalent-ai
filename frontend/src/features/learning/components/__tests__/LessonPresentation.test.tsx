import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonMedia, LessonText, parseLessonContent } from '../LessonPresentation';

describe('BE2 lesson presentation', () => {
  it('turns seeded headings and bullet points into separate learning sections', () => {
    const lesson = {
      title: 'Mục tiêu và khái niệm', lessonType: 'TEXT',
      contentBody: '- Chọn công cụ giao tiếp phù hợp\n- Giữ an toàn dữ liệu\n### Định nghĩa\n\n- Email: kênh giao tiếp có lưu vết',
    };
    const blocks = parseLessonContent(lesson.contentBody, lesson.lessonType);
    expect(blocks.map((block) => block.kind)).toEqual(['bullets', 'heading', 'bullets']);
    render(<LessonText lesson={lesson} />);
    expect(screen.getByRole('heading', { name: 'Định nghĩa' })).toBeInTheDocument();
    expect(screen.getByText('Giữ an toàn dữ liệu')).toBeInTheDocument();
  });

  it('shows quiz options separately and keeps the seeded answer behind disclosure', () => {
    const lesson = {
      title: 'Câu hỏi ôn tập', lessonType: 'QUIZ',
      contentBody: '1. BCC dùng khi nào? A. Công khai người nhận B. Ẩn người nhận C. Không dùng D. Xóa thư Đáp án: B — BCC ẩn danh sách người nhận.',
    };
    render(<LessonText lesson={lesson} />);
    expect(screen.getByText('Câu 1. BCC dùng khi nào?')).toBeInTheDocument();
    expect(screen.getByText('Ẩn người nhận')).toBeInTheDocument();
    expect(screen.getByText(/Đáp án: B/).closest('details')).not.toHaveAttribute('open');
  });

  it('uses a visible video mock when BE2 has no media URL', () => {
    render(<LessonMedia lesson={{ title: 'Nội dung bài học', lessonType: 'TEXT', contentBody: 'Nội dung thật' }} />);
    expect(screen.getByText('Video bài học đang được cập nhật')).toBeInTheDocument();
  });
});
