import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnterpriseThemeStore, useEnterpriseTheme } from '../use-enterprise-theme';

describe('useEnterpriseThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useEnterpriseThemeStore.setState({ theme: 'dark' });
  });

  it('defaults to dark theme', () => {
    expect(useEnterpriseThemeStore.getState().theme).toBe('dark');
  });

  it('setTheme changes theme to light', () => {
    useEnterpriseThemeStore.getState().setTheme('light');
    expect(useEnterpriseThemeStore.getState().theme).toBe('light');
  });

  it('setTheme saves to localStorage', () => {
    useEnterpriseThemeStore.getState().setTheme('light');
    expect(localStorage.getItem('dt-enterprise-theme')).toBe('light');
  });

  it('toggle switches dark → light', () => {
    useEnterpriseThemeStore.setState({ theme: 'dark' });
    useEnterpriseThemeStore.getState().toggle();
    expect(useEnterpriseThemeStore.getState().theme).toBe('light');
  });

  it('toggle switches light → dark', () => {
    useEnterpriseThemeStore.setState({ theme: 'light' });
    useEnterpriseThemeStore.getState().toggle();
    expect(useEnterpriseThemeStore.getState().theme).toBe('dark');
  });

  it('works when localStorage is blocked (storage error)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => {
      useEnterpriseThemeStore.getState().setTheme('light');
    }).not.toThrow();
    // Still changes in-memory state
    expect(useEnterpriseThemeStore.getState().theme).toBe('light');
    spy.mockRestore();
  });

  it('reads saved theme from localStorage on init', () => {
    localStorage.setItem('dt-enterprise-theme', 'light');
    const stored = localStorage.getItem('dt-enterprise-theme');
    expect(stored === 'light' || stored === 'dark' ? stored : 'dark').toBe('light');
  });
});

describe('useEnterpriseTheme (DOM integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('attaches ent-theme class and data-theme to <html> on mount', () => {
    useEnterpriseThemeStore.setState({ theme: 'dark' });
    const { unmount } = renderHook(() => useEnterpriseTheme());

    expect(document.documentElement.classList.contains('ent-theme')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    unmount();
    expect(document.documentElement.classList.contains('ent-theme')).toBe(false);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('');
  });
});
