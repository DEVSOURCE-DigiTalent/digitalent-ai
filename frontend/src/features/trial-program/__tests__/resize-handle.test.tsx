import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ResizeHandle } from '../components/ResizeHandle';

// jsdom không có PointerEvent: dùng MouseEvent để giữ clientX / button
if (typeof window.PointerEvent === 'undefined') {
  class PointerEventStub extends MouseEvent {
    pointerId = 1;
  }
  window.PointerEvent = PointerEventStub as unknown as typeof PointerEvent;
}

const WIDTHS: Record<string, number> = { shell: 1400, col: 336 };

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return { width: WIDTHS[this.dataset.testid ?? ''] ?? 0 } as DOMRect;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setup(target: 'prev' | 'next', disabled = false) {
  const onResize = vi.fn();
  const onReset = vi.fn();
  const handle = (
    <ResizeHandle
      target={target}
      min={260}
      max={(w) => w - 700}
      onResize={onResize}
      onReset={onReset}
      label="Kéo"
      disabled={disabled}
    />
  );
  render(
    <div data-testid="shell">
      {target === 'prev' ? <div data-testid="col" /> : <div />}
      {handle}
      {target === 'next' ? <div data-testid="col" /> : <div />}
    </div>,
  );
  return { handle: screen.getByRole('separator', { name: 'Kéo' }), onResize, onReset };
}

describe('ResizeHandle', () => {
  it('grows the left column on ArrowRight', () => {
    const { handle, onResize } = setup('prev');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onResize).toHaveBeenLastCalledWith(352);
  });

  it('grows the right column on ArrowLeft', () => {
    const { handle, onResize } = setup('next');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(onResize).toHaveBeenLastCalledWith(352);
  });

  it('clamps the dragged width and resets on double click', () => {
    const { handle, onResize, onReset } = setup('prev');
    fireEvent.pointerDown(handle, { button: 0, clientX: 100 });
    fireEvent.pointerMove(handle, { clientX: 2000 });
    expect(onResize).toHaveBeenLastCalledWith(700);
    fireEvent.pointerMove(handle, { clientX: -2000 });
    expect(onResize).toHaveBeenLastCalledWith(260);
    fireEvent.pointerUp(handle);
    fireEvent.doubleClick(handle);
    expect(onReset).toHaveBeenCalled();
  });

  it('ignores input while disabled', () => {
    const { handle, onResize, onReset } = setup('prev', true);
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    fireEvent.doubleClick(handle);
    expect(onResize).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });
});
