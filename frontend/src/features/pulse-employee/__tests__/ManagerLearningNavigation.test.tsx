import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LayoutDashboard, Route } from 'lucide-react';
import { ManagerLearningNavigation } from '../components/ManagerLearningNavigation';
import { PULSE_PATHS } from '../lib/paths';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('ManagerLearningNavigation', () => {
  it('becomes a floating switcher after scrolling past the navigation and restores on return', () => {
    vi.stubGlobal('PointerEvent', class extends MouseEvent {
      readonly pointerType: string;
      constructor(type: string, options: MouseEventInit & { pointerType?: string } = {}) {
        super(type, options);
        this.pointerType = options.pointerType ?? '';
      }
    });
    let notify: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = vi.fn();
      disconnect = disconnect;
    });
    const view = render(
      <MemoryRouter initialEntries={[PULSE_PATHS.today]}>
        <ManagerLearningNavigation trialLearning={false} items={[
          { to: PULSE_PATHS.today, label: 'Tổng quan', icon: LayoutDashboard, screenId: 'EM-01', end: true, match: [PULSE_PATHS.today] },
          { to: PULSE_PATHS.path, label: 'Lộ trình năng lực', icon: Route, screenId: 'EM-02', match: [PULSE_PATHS.path] },
        ]} />
      </MemoryRouter>,
    );
    const scrolled = (isIntersecting: boolean, bottom: number) => act(() => notify([
      { isIntersecting, boundingClientRect: { bottom } } as IntersectionObserverEntry,
    ], {} as IntersectionObserver));

    expect(screen.getByRole('link', { name: 'Tổng quan' })).toHaveAttribute('aria-current', 'page');
    scrolled(false, 60);
    expect(screen.queryByRole('link', { name: 'Tổng quan' })).not.toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Mở điều hướng học tập' });
    fireEvent.pointerOver(trigger, { pointerType: 'mouse' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Tổng quan' })).not.toHaveFocus();
    fireEvent.pointerOut(trigger, { pointerType: 'mouse', relatedTarget: document.body });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.pointerOver(trigger, { pointerType: 'touch' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Tổng quan' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('link', { name: 'Lộ trình năng lực' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(screen.getByRole('link', { name: 'Lộ trình năng lực' })).toHaveAttribute('aria-current', 'page');

    scrolled(true, 130);
    expect(screen.queryByRole('button', { name: 'Mở điều hướng học tập' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lộ trình năng lực' })).toBeVisible();
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
