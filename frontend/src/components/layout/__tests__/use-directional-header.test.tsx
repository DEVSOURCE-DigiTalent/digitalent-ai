import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDirectionalHeader } from '../use-directional-header';

let y = 0;
let frame: FrameRequestCallback | undefined;
const header = document.createElement('div');
const ref = { current: header };
const scroll = (position: number) => act(() => {
  y = position;
  window.dispatchEvent(new Event('scroll'));
  const callback = frame;
  frame = undefined;
  callback?.(0);
});

beforeEach(() => {
  y = 0;
  header.replaceChildren();
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(3000);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frame = callback; return 1; });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Owner directional header', () => {
  it('ignores small movements, hides scrolling down, and reveals on upward intent', () => {
    const { result } = renderHook(() => useDirectionalHeader(ref, true, '/reports', false));
    scroll(110); scroll(125);
    expect(result.current.hidden).toBe(false);
    scroll(175);
    expect(result.current.hidden).toBe(true);
    scroll(170); scroll(155);
    expect(result.current.hidden).toBe(false);
    scroll(20);
    expect(result.current.hidden).toBe(false);
  });
  it('keeps dropdown controls accessible while open and resets on navigation', () => {
    const { result, rerender } = renderHook(({ route }) => useDirectionalHeader(ref, true, route, false), { initialProps: { route: '/reports' } });
    const button = document.createElement('button');
    button.setAttribute('aria-expanded', 'true'); header.append(button);
    scroll(120); scroll(240);
    expect(result.current.hidden).toBe(false);
    button.setAttribute('aria-expanded', 'false');
    scroll(320);
    expect(result.current.hidden).toBe(true);
    rerender({ route: '/members' });
    expect(result.current.hidden).toBe(false);
  });
  it('stays visible when disabled or pinned by the navigation/search', () => {
    const { result, rerender } = renderHook(({ enabled, pinned }) => useDirectionalHeader(ref, enabled, '/', pinned), { initialProps: { enabled: false, pinned: false } });
    scroll(120); scroll(300);
    expect(result.current.hidden).toBe(false);
    rerender({ enabled: true, pinned: true });
    scroll(400); scroll(600);
    expect(result.current.hidden).toBe(false);
  });
});
