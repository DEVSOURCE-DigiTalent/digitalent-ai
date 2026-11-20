import { create } from 'zustand';
import type { UserRoleType } from './types';
import { TUTORIAL_CONFIGS } from './tutorial-configs';

interface OnboardingStoreState {
  currentRole: UserRoleType | null;
  isTourActive: boolean;
  /** The welcome card listing the journey, shown before the first step of a guide that has one. */
  isIntro: boolean;
  currentStepIndex: number;
  completedTaskIds: string[];
  isChecklistOpen: boolean;
  isMinimized: boolean;
  isDismissed: boolean;
  hasSeenTour: boolean;

  // Actions
  initializeForUser: (userId: string, role: UserRoleType) => void;
  startTour: (role?: UserRoleType) => void;
  /** From the welcome card to the first step. */
  beginSteps: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  completeTour: () => void;
  toggleChecklist: () => void;
  toggleMinimize: () => void;
  completeTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  dismissChecklist: () => void;
  resetTutorial: () => void;
}

function getStorageKey(userId: string, role: string) {
  return `dt_onboarding_v1_${userId}_${role}`;
}

interface PersistedState {
  completedTaskIds: string[];
  hasSeenTour: boolean;
  isDismissed: boolean;
}

function loadPersisted(userId: string, role: string): PersistedState {
  try {
    const raw = localStorage.getItem(getStorageKey(userId, role));
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage errors
  }
  return { completedTaskIds: [], hasSeenTour: false, isDismissed: false };
}

function savePersisted(userId: string, role: string, data: PersistedState) {
  try {
    localStorage.setItem(getStorageKey(userId, role), JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

const hasIntro = (role: UserRoleType | null) => Boolean(role && TUTORIAL_CONFIGS[role]?.intro);

let activeUserId = 'anonymous';

export const useOnboardingStore = create<OnboardingStoreState>((set, get) => ({
  currentRole: null,
  isTourActive: false,
  isIntro: false,
  currentStepIndex: 0,
  completedTaskIds: [],
  isChecklistOpen: true,
  isMinimized: false,
  isDismissed: false,
  hasSeenTour: false,

  initializeForUser: (userId: string, role: UserRoleType) => {
    const nextUserId = userId || 'anonymous';
    // Same person, same guide (e.g. /auth/me read again): keep a tour that is open where it is.
    if (nextUserId === activeUserId && get().currentRole === role) return;
    activeUserId = nextUserId;
    const persisted = loadPersisted(activeUserId, role);
    const config = TUTORIAL_CONFIGS[role];

    const shouldAutoStart = !persisted.hasSeenTour && !!config;

    set({
      currentRole: role,
      completedTaskIds: persisted.completedTaskIds,
      hasSeenTour: persisted.hasSeenTour,
      isDismissed: persisted.isDismissed,
      isTourActive: shouldAutoStart,
      isIntro: shouldAutoStart && hasIntro(role),
      currentStepIndex: 0,
      isChecklistOpen: !persisted.isDismissed,
      isMinimized: false,
    });
  },

  startTour: (roleOverride?: UserRoleType) => {
    const role = roleOverride || get().currentRole;
    if (!role || !TUTORIAL_CONFIGS[role]) return;

    set({
      currentRole: role,
      isTourActive: true,
      isIntro: hasIntro(role),
      currentStepIndex: 0,
      isMinimized: true,
    });
  },

  beginSteps: () => set({ isIntro: false, currentStepIndex: 0 }),

  nextStep: () => {
    const { currentRole, currentStepIndex, isIntro } = get();
    if (!currentRole) return;
    if (isIntro) {
      set({ isIntro: false, currentStepIndex: 0 });
      return;
    }
    const steps = TUTORIAL_CONFIGS[currentRole]?.steps ?? [];
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      get().completeTour();
    }
  },

  prevStep: () => {
    const { currentRole, currentStepIndex, isIntro } = get();
    if (isIntro) return;
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    } else if (hasIntro(currentRole)) {
      set({ isIntro: true });
    }
  },

  goToStep: (index: number) => {
    set({ currentStepIndex: index, isIntro: false });
  },

  skipTour: () => {
    const { currentRole, completedTaskIds, isDismissed } = get();
    if (currentRole) {
      savePersisted(activeUserId, currentRole, {
        completedTaskIds,
        hasSeenTour: true,
        isDismissed,
      });
    }
    set({ isTourActive: false, isIntro: false, hasSeenTour: true, isMinimized: false });
  },

  completeTour: () => {
    const { currentRole, completedTaskIds, isDismissed } = get();
    if (currentRole) {
      savePersisted(activeUserId, currentRole, {
        completedTaskIds,
        hasSeenTour: true,
        isDismissed,
      });
    }
    set({ isTourActive: false, isIntro: false, hasSeenTour: true, isMinimized: false });
  },

  toggleChecklist: () => {
    set((state) => ({ isChecklistOpen: !state.isChecklistOpen }));
  },

  toggleMinimize: () => {
    set((state) => ({ isMinimized: !state.isMinimized }));
  },

  completeTask: (taskId: string) => {
    const { completedTaskIds, currentRole, hasSeenTour, isDismissed } = get();
    if (!completedTaskIds.includes(taskId)) {
      const next = [...completedTaskIds, taskId];
      if (currentRole) {
        savePersisted(activeUserId, currentRole, {
          completedTaskIds: next,
          hasSeenTour,
          isDismissed,
        });
      }
      set({ completedTaskIds: next });
    }
  },

  toggleTask: (taskId: string) => {
    const { completedTaskIds, currentRole, hasSeenTour, isDismissed } = get();
    const next = completedTaskIds.includes(taskId)
      ? completedTaskIds.filter((id) => id !== taskId)
      : [...completedTaskIds, taskId];

    if (currentRole) {
      savePersisted(activeUserId, currentRole, {
        completedTaskIds: next,
        hasSeenTour,
        isDismissed,
      });
    }
    set({ completedTaskIds: next });
  },

  dismissChecklist: () => {
    const { currentRole, completedTaskIds, hasSeenTour } = get();
    if (currentRole) {
      savePersisted(activeUserId, currentRole, {
        completedTaskIds,
        hasSeenTour,
        isDismissed: true,
      });
    }
    set({ isDismissed: true });
  },

  resetTutorial: () => {
    const { currentRole } = get();
    if (currentRole) {
      savePersisted(activeUserId, currentRole, {
        completedTaskIds: [],
        hasSeenTour: false,
        isDismissed: false,
      });
    }
    set({
      hasSeenTour: false,
      completedTaskIds: [],
      isDismissed: false,
      isTourActive: true,
      isIntro: hasIntro(currentRole),
      currentStepIndex: 0,
      isChecklistOpen: true,
      isMinimized: false,
    });
  },
}));
