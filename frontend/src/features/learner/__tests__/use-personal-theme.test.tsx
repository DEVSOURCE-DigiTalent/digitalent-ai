import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  PERSONAL_THEME_BACKGROUND,
  usePersonalTheme,
} from '../theme/use-personal-theme';
import { ThemeToggle } from '../components/ThemeToggle';

describe('usePersonalTheme (Digital Dawn and Daybreak spec)', () => {
  beforeEach(() => {
    localStorage.clear();
    usePersonalTheme.setState({ theme: 'dark' });
  });

  it('defaults to dark theme (Digital Dawn)', () => {
    expect(usePersonalTheme.getState().theme).toBe('dark');
  });

  it('provides the correct overscroll background per theme', () => {
    expect(PERSONAL_THEME_BACKGROUND.dark).toBe('#07151b');
    expect(PERSONAL_THEME_BACKGROUND.light).toBe('#f3f8f7');
  });

  it('setTheme updates theme to light (Daybreak) and persists to localStorage', () => {
    usePersonalTheme.getState().setTheme('light');
    expect(usePersonalTheme.getState().theme).toBe('light');
    expect(localStorage.getItem('dt-personal-theme')).toBe('light');
  });

  it('toggle alternates between dark and light', () => {
    usePersonalTheme.setState({ theme: 'dark' });
    usePersonalTheme.getState().toggle();
    expect(usePersonalTheme.getState().theme).toBe('light');

    usePersonalTheme.getState().toggle();
    expect(usePersonalTheme.getState().theme).toBe('dark');
  });

  it('handles blocked localStorage gracefully', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage access blocked');
    });

    expect(() => {
      usePersonalTheme.getState().setTheme('light');
    }).not.toThrow();

    expect(usePersonalTheme.getState().theme).toBe('light');
    spy.mockRestore();
  });
});

describe('ThemeToggle component', () => {
  beforeEach(() => {
    localStorage.clear();
    usePersonalTheme.setState({ theme: 'dark' });
  });

  it('displays Vietnamese label and title for switching to light theme when dark', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Chuyển sang giao diện sáng' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Giao diện sáng');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking toggle switches theme to light and updates accessible label', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(usePersonalTheme.getState().theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' })).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Giao diện tối');
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
