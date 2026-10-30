import type { CSSProperties } from 'react';
import './owner.css';

/**
 * Bảng màu chung của mọi trang chủ doanh nghiệp, đồng bộ với trang quản lý (`pulse-manager/manager.css`, `.pu-manager`):
 * mực xanh biển cho chữ và hero, xanh ngọc làm màu nhấn, san hô cho tín hiệu cần chú ý.
 * Gắn vào phần tử gốc của trang cùng lớp `po-owner` (hiệu ứng xuất hiện trong owner.css).
 */
export const PULSE_TOKENS = {
  '--po-canvas': '#f6f9fa',
  '--po-surface': '#fff',
  '--po-ink': '#17243f',
  '--po-muted': '#5f6e88',
  '--po-accent': '#137b84',
  '--po-accent-strong': '#0e5968',
  '--po-coral': '#e8a17f',
  '--po-lime': '#b8eadc',
  '--po-line': '#e0e8ee',
  '--po-soft': '#e8f6f4',
  '--po-tint': '#e8f6f4',
  '--po-warm': '#e8a17f',
} as CSSProperties;

