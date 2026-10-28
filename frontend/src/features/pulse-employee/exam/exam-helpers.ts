import { useEffect, useState } from 'react';
import type { DeviceState } from './proctor';

/** Đồng hồ cập nhật mỗi giây khi `active` (thời gian làm bài). */
export function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

/** Chữ trạng thái của một thiết bị ở bước chuẩn bị. */
export function deviceText(state: DeviceState, onText: string): { text: string; tone: 'ok' | 'bad' | '' } {
  switch (state) {
    case 'on': return { text: onText, tone: 'ok' };
    case 'requesting': return { text: 'Đang chờ trình duyệt…', tone: '' };
    case 'wrong-surface': return { text: 'Đã chọn cửa sổ hoặc tab — cần toàn bộ màn hình', tone: 'bad' };
    case 'denied': return { text: 'Chưa được cho phép', tone: 'bad' };
    case 'stopped': return { text: 'Đã ngừng', tone: 'bad' };
    default: return { text: 'Chưa bật', tone: 'bad' };
  }
}
