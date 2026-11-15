import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Số giây chờ trước khi tự chuyển trang, giống lúc đạt bài ôn tập rồi tự sang mô-đun tiếp theo. */
const AUTO_RETURN_SECONDS = 5;

/**
 * Đếm ngược rồi tự chuyển tới `to` (ví dụ sau khi nộp bài khảo sát, về trang tổng quan).
 * Bấm "Ở lại trang này" để hủy và tự bấm nút chuyển trang khi muốn.
 */
export function AutoReturnNotice({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(AUTO_RETURN_SECONDS);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      navigate(to);
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => (value === null ? null : value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, navigate, to]);

  if (countdown === null) return null;
  return (
    <p role="status" style={{ margin: '12px 0 0', fontSize: 13.5, color: '#64748b', textAlign: 'center', width: '100%' }}>
      Tự {label} sau <strong>{countdown}</strong> giây…{' '}
      <button
        type="button"
        onClick={() => setCountdown(null)}
        style={{ background: 'none', border: 0, padding: 0, color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
      >
        Ở lại trang này
      </button>
    </p>
  );
}
