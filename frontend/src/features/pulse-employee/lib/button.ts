export type ButtonKind = 'primary' | 'outline' | 'ghost' | 'light' | 'lime' | 'on-dark';

/** Lớp CSS của nút Pulse (pulse.css `.pu-btn-*`), dùng cho cả <button> và liên kết. */
export const btn = (kind: ButtonKind = 'primary', small = false) => `pu-btn pu-btn-${kind}${small ? ' pu-btn-small' : ''}`;
