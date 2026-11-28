import { describe, expect, it } from 'vitest';
import { isSignView, SIGN_VIEWS, signMeta, signProgress, viewQuery } from '../sign-dictionary/sign-labels';

const video = { assetId: 'a', url: '/x', kind: 'VIDEO' } as never;

describe('Từ điển ký hiệu: các tab đi theo từng bước làm ký hiệu', () => {
  it('maps each tab to the list filters and reads its count from the summary', () => {
    expect(viewQuery('ALL')).toEqual({ status: '', stage: '' });
    expect(viewQuery('NO_VIDEO')).toEqual({ status: '', stage: 'NO_VIDEO' });
    expect(viewQuery('NEEDS_MOTION')).toEqual({ status: '', stage: 'NEEDS_MOTION' });
    expect(viewQuery('READY')).toEqual({ status: '', stage: 'READY' });
    expect(viewQuery('PUBLISHED')).toEqual({ status: 'PUBLISHED', stage: '' });

    const summary = { total: 418, noVideo: 408, needsMotion: 4, ready: 6, published: 0, archived: 394 };
    expect(SIGN_VIEWS.map((view) => view.count(summary))).toEqual([418, 408, 4, 6, 0]);
    expect(isSignView('READY')).toBe(true);
    expect(isSignView('ARCHIVED')).toBe(false);
    expect(isSignView(null)).toBe(false);
  });

  it('says how far a sign went and what to do next', () => {
    expect(signProgress({ video: null, hasMotion: false, status: 'DRAFT' })).toMatchObject({ done: 0, next: 'VIDEO' });
    expect(signProgress({ video, hasMotion: false, status: 'DRAFT' })).toMatchObject({ done: 1, next: 'MOTION' });
    expect(signProgress({ video, hasMotion: true, status: 'DRAFT' })).toMatchObject({ done: 2, next: 'PUBLISH' });
    const published = signProgress({ video, hasMotion: true, status: 'PUBLISHED' });
    expect(published).toMatchObject({ done: 3, next: null });
    expect(published.label).toBe('Có video, có chuyển động, đã xuất bản');
  });

  it('only names what tells two signs of a word apart', () => {
    expect(signMeta({ kind: 'WORD', region: 'VN', variant: null, isPreferred: false })).toBe('');
    expect(signMeta({ kind: 'WORD', region: 'VN-BAC', variant: 'QIPEDC W00110', isPreferred: true })).toBe('Miền Bắc · QIPEDC W00110 · mặc định');
    expect(signMeta({ kind: 'LETTER', region: 'VN', variant: null, isPreferred: false })).toBe('Chữ cái');
  });
});
