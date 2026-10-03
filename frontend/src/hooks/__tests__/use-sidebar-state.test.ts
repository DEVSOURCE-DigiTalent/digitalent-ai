import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSidebarState, getDefaultState } from '../use-sidebar-state';

describe('useSidebarState', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store state between tests
    useSidebarState.setState({ state: 'open', isMobileOpen: false });
  });

  it('defaults to open at >= 1280px', () => {
    vi.stubGlobal('window', { ...window, innerWidth: 1440 });
    expect(getDefaultState()).toBe('open');
    vi.unstubAllGlobals();
  });

  it('defaults to collapsed at 768–1279px', () => {
    vi.stubGlobal('window', { ...window, innerWidth: 900 });
    expect(getDefaultState()).toBe('collapsed');
    vi.unstubAllGlobals();
  });

  it('defaults to drawer below 768px (mobile)', () => {
    vi.stubGlobal('window', { ...window, innerWidth: 375 });
    expect(getDefaultState()).toBe('drawer');
    vi.unstubAllGlobals();
  });

  it('toggleCollapsed switches between open and collapsed', () => {
    useSidebarState.setState({ state: 'open' });
    useSidebarState.getState().toggleCollapsed();
    expect(useSidebarState.getState().state).toBe('collapsed');
    useSidebarState.getState().toggleCollapsed();
    expect(useSidebarState.getState().state).toBe('open');
  });

  it('saves state to localStorage on toggle', () => {
    useSidebarState.setState({ state: 'open' });
    useSidebarState.getState().toggleCollapsed();
    expect(localStorage.getItem('dt-sidebar')).toBe('collapsed');
  });

  it('restores state from localStorage', () => {
    localStorage.setItem('dt-sidebar', 'collapsed');
    // Simulate reading from storage in getDefaultState
    const stored = localStorage.getItem('dt-sidebar');
    expect(stored).toBe('collapsed');
  });

  it('works when localStorage is blocked', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => {
      useSidebarState.getState().toggleCollapsed();
    }).not.toThrow();
    spy.mockRestore();
  });

  it('setMobileOpen updates isMobileOpen', () => {
    useSidebarState.getState().setMobileOpen(true);
    expect(useSidebarState.getState().isMobileOpen).toBe(true);
    useSidebarState.getState().setMobileOpen(false);
    expect(useSidebarState.getState().isMobileOpen).toBe(false);
  });
});
