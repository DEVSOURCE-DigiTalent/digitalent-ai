import { describe, it, expect } from 'vitest';
import { PLATFORM_SIDEBAR } from '@/lib/sidebars/platform';
import { PLATFORM_SCREENS } from '@/lib/screens/platform';

describe('PLATFORM_SIDEBAR Configuration', () => {
  const registeredScreenIds = new Set([
    ...PLATFORM_SCREENS.map((s) => s.id),
    ...PLATFORM_SCREENS.flatMap((s) => s.aliases || []),
  ]);

  it('declares 5 main sections according to spec v2.1 section 5', () => {
    expect(PLATFORM_SIDEBAR).toHaveLength(5);
    const labels = PLATFORM_SIDEBAR.map((sec) => sec.label);
    expect(labels).toEqual([
      'Tổng quan',
      'Doanh nghiệp',
      'Nội dung nền tảng',
      'Thương mại',
      'Hệ thống',
    ]);
  });

  it('has valid screen IDs for all single-item sections and sub-items', () => {
    for (const section of PLATFORM_SIDEBAR) {
      if (section.screenId) {
        expect(registeredScreenIds.has(section.screenId)).toBe(true);
      }
      if (section.items) {
        for (const item of section.items) {
          expect(registeredScreenIds.has(item.screenId)).toBe(true);
        }
      }
    }
  });

  it('has icons for all sections and items', () => {
    for (const section of PLATFORM_SIDEBAR) {
      expect(section.icon).toBeDefined();
      if (section.items) {
        for (const item of section.items) {
          expect(item.icon).toBeDefined();
        }
      }
    }
  });

  it('verifies enterprise section contains Doanh nghiệp and Người dùng', () => {
    const orgSection = PLATFORM_SIDEBAR.find((sec) => sec.label === 'Doanh nghiệp');
    expect(orgSection?.items).toBeDefined();
    const itemIds = orgSection?.items?.map((i) => i.screenId);
    expect(itemIds).toContain('PA-02');
    expect(itemIds).toContain('PA-04');
  });

  it('verifies platform content section contains TT02 framework, standard curriculum, assessment bank, and reference positions', () => {
    const contentSection = PLATFORM_SIDEBAR.find((sec) => sec.label === 'Nội dung nền tảng');
    expect(contentSection?.items).toBeDefined();
    const itemIds = contentSection?.items?.map((i) => i.screenId);
    expect(itemIds).toEqual(['PA-06', 'PA-08', 'PA-11', 'PA-14']);
  });

  it('verifies commerce section contains plans and subscriptions', () => {
    const commerceSection = PLATFORM_SIDEBAR.find((sec) => sec.label === 'Thương mại');
    expect(commerceSection?.items).toBeDefined();
    const itemIds = commerceSection?.items?.map((i) => i.screenId);
    expect(itemIds).toEqual(['PA-16', 'PA-18']);
  });

  it('verifies system section contains audit log and settings', () => {
    const systemSection = PLATFORM_SIDEBAR.find((sec) => sec.label === 'Hệ thống');
    expect(systemSection?.items).toBeDefined();
    const itemIds = systemSection?.items?.map((i) => i.screenId);
    expect(itemIds).toEqual(['PA-20', 'PA-21']);
  });
});
