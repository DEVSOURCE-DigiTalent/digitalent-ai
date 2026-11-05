import { afterEach, describe, expect, it, vi } from 'vitest';
import { openScreenshot } from '../lib/open-screenshot';

describe('openScreenshot', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it.each(['javascript:alert(1)', 'https://evil.example/a.png', 'data:text/html;base64,PHNjcmlwdD4=', 'data:image/svg+xml;base64,PHN2Zz4='])(
    'never opens %s',
    (src) => {
      const open = vi.spyOn(window, 'open').mockReturnValue(null);
      openScreenshot(src);
      expect(open).not.toHaveBeenCalled();
    },
  );

  it('opens an inline image as a blob, not as a data: URL', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    URL.createObjectURL = vi.fn(() => 'blob:screenshot');
    URL.revokeObjectURL = vi.fn();
    openScreenshot('data:image/jpeg;base64,AAAA');
    expect(open).toHaveBeenCalledWith('blob:screenshot', '_blank', 'noopener');
  });
});
