import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CapabilityCeilingGuide } from '../CapabilityCeilingGuide';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('React', React);
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('capability ceiling guide', () => {
  it('renders outside the page and supports Escape and backdrop dismissal', () => {
    const onClose = vi.fn();
    const { container } = render(<CapabilityCeilingGuide open onClose={onClose} />);
    const dialog = screen.getByRole('dialog', { name: 'Quy tắc & hướng dẫn' });
    expect(container.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(document.querySelector('.ceiling-guide__backdrop')!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('finishes the exit animation before removing the dialog and restoring scroll and focus', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const onClose = vi.fn();
    const { rerender } = render(<CapabilityCeilingGuide open onClose={onClose} />);
    act(() => vi.advanceTimersByTime(40));
    rerender(<CapabilityCeilingGuide open={false} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    act(() => vi.advanceTimersByTime(240));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
import React from 'react';
