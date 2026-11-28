import { describe, expect, it } from 'vitest';
import { contentSwitch, contentSwitchText } from './content-switch';

describe('contentSwitch', () => {
  const now = new Date('2026-11-28T03:00:00Z');

  it('counts the days left and turns urgent in the last week', () => {
    expect(contentSwitch('2026-12-28T03:00:00Z', now)).toEqual({ date: '28/12', daysLeft: 30, urgent: false });
    expect(contentSwitch('2026-12-04T20:00:00Z', now)).toMatchObject({ date: '05/12', daysLeft: 7, urgent: true });
  });

  it('is nothing for a course without new content', () => {
    expect(contentSwitch(null, now)).toBeNull();
    expect(contentSwitch('not a date', now)).toBeNull();
  });

  it('tells the employee to finish before the day', () => {
    expect(contentSwitchText({ date: '28/12', daysLeft: 30, urgent: false }))
      .toBe('Khóa này chuyển sang nội dung mới ngày 28/12 (còn 30 ngày). Học xong trước hạn để giữ kết quả; sau hạn bạn học lại từ đầu nội dung mới.');
    expect(contentSwitchText({ date: '28/12', daysLeft: 0, urgent: true })).toContain('hết hạn hôm nay');
    expect(contentSwitchText({ date: '28/12', daysLeft: 5, urgent: true }, true))
      .toBe('Khóa này cập nhật nội dung ngày 28/12 (còn 5 ngày). Học xong trước ngày đó thì giữ kết quả; chưa xong thì bạn học tiếp trên nội dung mới, tiến trình được giữ.');
  });
});
