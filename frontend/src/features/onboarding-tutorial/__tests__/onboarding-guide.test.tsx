import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { isTrialLockedPath, TRIAL_LOCKED_SCREEN_IDS } from '@/lib/trial-lock';
import type { SessionUser } from '@/types/session';
import { useOnboardingStore } from '../onboarding-store';
import { findTarget, placeCard } from '../placement';
import { RoleTutorialContainer } from '../RoleTutorialContainer';
import { TUTORIAL_CONFIGS } from '../tutorial-configs';
import { trialJourney } from '../use-trial-journey';

const participant = (status: 'NOT_STARTED' | 'SUBMITTED' | 'REVIEWED') => ({ status }) as never;
let program: unknown;
let positions: { isCustomized: boolean }[] | undefined;
vi.mock('@/hooks/use-trial-program', () => ({ useTrialProgram: () => ({ data: program }) }));
vi.mock('@/hooks/use-capability-ceilings', () => ({ useCapabilityCeilings: () => ({ data: positions ? { positions } : undefined }) }));

const owner = (extra: Partial<SessionUser> = {}): SessionUser => ({
  id: 'owner-1', email: 'owner@trial.test', fullName: 'Owner', roles: ['OWNER'], permissions: [], workspace: 'enterprise',
  enterpriseTrialStatus: 'trial_active', emailVerified: true, ...extra,
});

const renderGuide = (user: SessionUser) => {
  useCurrentUser.setState({ user, isAuthenticated: true });
  return render(<MemoryRouter initialEntries={['/enterprise/trial']}><RoleTutorialContainer /></MemoryRouter>);
};

beforeEach(() => {
  localStorage.clear();
  program = { stage: 'SETUP', participants: [] };
  positions = [{ isCustomized: false }, { isCustomized: false }];
});
afterEach(() => {
  cleanup();
  useCurrentUser.setState({ user: null, isAuthenticated: false });
  useOnboardingStore.setState({ currentRole: null, isTourActive: false, isIntro: false, currentStepIndex: 0, isDismissed: false, hasSeenTour: false });
});

describe('owner guides follow the current flow', () => {
  it('the trial guide only points at screens open during the trial and never sends the owner to a locked page', () => {
    const trial = TUTORIAL_CONFIGS.OWNER_TRIAL;
    for (const step of trial.steps) {
      for (const selector of [step.targetSelector].flat()) {
        const screenId = /data-tour="([^"]+)"/.exec(selector)?.[1];
        if (screenId) expect(TRIAL_LOCKED_SCREEN_IDS.has(screenId), `${step.id} → ${screenId}`).toBe(false);
      }
      if (step.actionRoute) expect(isTrialLockedPath(step.actionRoute), step.actionRoute).toBe(false);
    }
    for (const task of trial.checklist) expect(isTrialLockedPath(task.route), task.route).toBe(false);
    // no seats, no cycle report, no department targets: words from the old flow
    const text = JSON.stringify(trial.steps.map((s) => [s.title, s.description]));
    expect(text).not.toMatch(/ghế|Báo cáo chu kỳ|phòng ban và vị trí công việc/i);
  });

  it('starts a new trial owner on a welcome card listing the 4 steps, then walks them from the survey', () => {
    renderGuide(owner());
    expect(useOnboardingStore.getState().currentRole).toBe('OWNER_TRIAL');
    const intro = screen.getByRole('dialog', { name: 'Biết năng lực số của đội ngũ trong 4 bước' });
    // the closing tip is not a step of the journey
    expect(within(intro).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      '1Mời nhân viên làm khảo sátKhảo sát năng lực số',
      '2Đặt mức cần đạt cho từng vị tríKhung năng lực sốKhông bắt buộc',
      '3Nhận kết quảKết quả khảo sát',
      '4Mua khóa học còn thiếuKhóa học',
    ]);
    fireEvent.click(within(intro).getByRole('button', { name: /Xem từng bước/ }));
    const card = screen.getByRole('dialog', { name: 'Mời nhân viên làm khảo sát' });
    expect(card).toHaveTextContent('Bước 1/4');
    // already on the survey: no link to the page it is on
    expect(within(card).queryByRole('button', { name: /Mở trang Khảo sát/ })).toBeNull();
    fireEvent.click(within(card).getByRole('button', { name: /Tiếp/ }));
    const levels = screen.getByRole('dialog', { name: 'Đặt mức cần đạt cho từng vị trí' });
    expect(levels).toHaveTextContent('Bước 2/4Không bắt buộc');
    expect(within(levels).getByRole('button', { name: /Mở Khung năng lực số/ })).toBeInTheDocument();
    // back from the first step returns to the welcome card
    fireEvent.click(within(levels).getByRole('button', { name: /Quay lại/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Mời nhân viên làm khảo sát' })).getByRole('button', { name: /Quay lại/ }));
    expect(screen.getByRole('dialog', { name: 'Biết năng lực số của đội ngũ trong 4 bước' })).toBeInTheDocument();
  });

  it('closing the guide is remembered for that owner; "Để sau" counts as seen', () => {
    renderGuide(owner());
    fireEvent.click(screen.getByRole('button', { name: 'Để sau' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(JSON.parse(localStorage.getItem('dt_onboarding_v1_owner-1_OWNER_TRIAL')!)).toMatchObject({ hasSeenTour: true });
  });

  it('once a course is bought the owner gets the full guide (overview, people, levels, gaps, courses) and no checklist', () => {
    renderGuide(owner({ enterpriseTrialPurchased: true }));
    expect(useOnboardingStore.getState().currentRole).toBe('OWNER');
    const intro = screen.getByRole('dialog', { name: 'Năm việc chính của bạn' });
    expect(within(intro).getAllByRole('listitem')).toHaveLength(5);
    fireEvent.click(within(intro).getByRole('button', { name: 'Để sau' }));
    expect(screen.queryByRole('button', { name: /Bản dùng thử/ })).toBeNull();
  });
});

describe('trial journey checklist', () => {
  it('reads each step from the real data', () => {
    expect(trialJourney({ stage: 'SETUP', participants: [] }, [{ isCustomized: false }], false)).toEqual({
      invited: { done: false, detail: undefined },
      levels: { done: false, detail: undefined },
      results: { done: false, detail: undefined },
      purchased: { done: false },
    });
    const taking = trialJourney({ stage: 'ASSIGNED', participants: [participant('SUBMITTED'), participant('NOT_STARTED'), participant('NOT_STARTED')] },
      [{ isCustomized: true }, { isCustomized: false }], false);
    expect(taking.invited).toEqual({ done: true, detail: '3 người đã được mời' });
    expect(taking.levels).toEqual({ done: true, detail: '1/2 vị trí đã đặt' });
    expect(taking.results).toEqual({ done: false, detail: '1/3 đã nộp' });
    expect(trialJourney({ stage: 'ASSIGNED', participants: [participant('SUBMITTED')] }, [], false).results.detail).toBe('Chuyên gia đang chấm');
    expect(trialJourney({ stage: 'REPORTED', participants: [participant('REVIEWED')] }, [], true)).toMatchObject({
      results: { done: true, detail: 'Đã có kết quả' }, purchased: { done: true },
    });
  });

  it('shows the progress beside the assistant button and marks the next required step', () => {
    program = { stage: 'REPORTED', participants: [participant('REVIEWED'), participant('REVIEWED')] };
    localStorage.setItem('dt_onboarding_v1_owner-1_OWNER_TRIAL', JSON.stringify({ completedTaskIds: [], hasSeenTour: true, isDismissed: false }));
    renderGuide(owner());
    const pill = screen.getByRole('button', { name: 'Bản dùng thử: Xong 2/4 bước' });
    fireEvent.click(pill);
    const list = screen.getByRole('region', { name: 'Bản dùng thử' });
    const rows = within(list).getAllByRole('link');
    // done rows carry a tick instead of their number
    expect(rows.map((a) => a.textContent)).toEqual([
      'Mời nhân viên làm khảo sát2 người đã được mờiĐã xong',
      '2Đặt mức cần đạt cho vị tríBỏ qua thì dùng mức đề xuấtKhông bắt buộc',
      'Nhận kết quảĐã có kết quảĐã xong',
      '4Mua khóa học đầu tiênMở các mục đang khóaViệc tiếp theo',
    ]);
    expect(rows[3]).toHaveAttribute('aria-current', 'step');
    expect(rows[3]).toHaveAttribute('href', '/enterprise/courses');
    // "Xem lại hướng dẫn" opens the guide again
    fireEvent.click(within(list).getByRole('button', { name: /Xem lại hướng dẫn/ }));
    expect(screen.getByRole('dialog', { name: 'Biết năng lực số của đội ngũ trong 4 bước' })).toBeInTheDocument();
  });
});

describe('card placement', () => {
  const view = { width: 1440, height: 900 };
  const card = { width: 368, height: 240 };

  it('sits beside a menu entry with the pointer on its middle, inside the window', () => {
    const place = placeCard({ top: 180, left: 8, width: 240, height: 40 }, card, view, 'right');
    expect(place).toMatchObject({ side: 'right', left: 264 });
    expect(place.top).toBeGreaterThanOrEqual(16);
    expect(place.top + place.caret).toBe(200);
  });

  it('flips to the other side when there is no room, and goes to the middle without a target', () => {
    expect(placeCard({ top: 20, left: 1300, width: 120, height: 36 }, card, view, 'bottom')).toMatchObject({ side: 'bottom', left: 1440 - 368 - 16 });
    expect(placeCard({ top: 860, left: 600, width: 120, height: 30 }, card, view, 'bottom').side).toBe('top');
    expect(placeCard(null, card, { width: 390, height: 844 })).toMatchObject({ side: 'center', left: 16 });
  });

  it('skips a target that is off screen (the phone menu drawer) for the next selector', () => {
    document.body.innerHTML = '<a data-tour="OW-T1">menu</a><nav class="trial-progress">steps</nav>';
    const [menu, steps] = [document.querySelector('a')!, document.querySelector('nav')!];
    menu.getBoundingClientRect = () => ({ top: 10, left: -300, right: -60, bottom: 50, width: 240, height: 40 }) as DOMRect;
    steps.getBoundingClientRect = () => ({ top: 100, left: 20, right: 370, bottom: 160, width: 350, height: 60 }) as DOMRect;
    expect(findTarget(['[data-tour="OW-T1"]', '.trial-progress'], { width: 390, height: 844 })).toBe(steps);
    act(() => { document.body.innerHTML = ''; });
  });
});
