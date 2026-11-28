import { describe, expect, it } from 'vitest';
import { backState, backTarget } from '../back-target';

const fallback = { path: '/enterprise/members', label: 'Nhân sự' };

describe('backTarget', () => {
  it('leads back to the page that opened this one, with its filters', () => {
    expect(backTarget(backState('/enterprise/setup?tab=positions', 'Khung năng lực số'), fallback))
      .toEqual({ path: '/enterprise/setup?tab=positions', label: 'Khung năng lực số' });
    expect(backTarget(backState('/enterprise/members?tab=departments&manager=none', 'Nhân sự'), fallback).path)
      .toBe('/enterprise/members?tab=departments&manager=none');
  });

  it('falls back when the page was opened directly or the state is not a page of the portal', () => {
    expect(backTarget(null, fallback)).toEqual(fallback);
    expect(backTarget({ something: 1 }, fallback)).toEqual(fallback);
    expect(backTarget(backState('https://example.com', 'Ngoài'), fallback)).toEqual(fallback);
    expect(backTarget(backState('/enterprise/members', ''), fallback)).toEqual(fallback);
  });
});
