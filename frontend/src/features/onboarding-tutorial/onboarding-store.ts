import { create } from 'zustand';
import type { UserRoleType } from './types';
import { TUTORIAL_CONFIGS } from './tutorial-configs';

interface OnboardingStoreState {
  currentRole: UserRoleType | null;
  isTourActive: boolean;
  currentStepIndex: number;
  completedTaskIds: string[];
  isChecklistOpen: boolean;
  isMinimized: boolean;
  isDismissed: boolean;
  hasSeenTour: boolean;

  // Actions
  initializeForUser: (userId: string, role: UserRoleType) => void;
  startTour: (role?: UserRoleType) => void;
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

let activeUserId = 'anonymous';

export const useOnboardingStore = create<OnboardingStoreState>((set, get) => ({
  currentRole: null,
  isTourActive: false,
  currentStepIndex: 0,
  completedTaskIds: [],
  isChecklistOpen: true,
  isMinimized: false,
  isDismissed: false,
  hasSeenTour: false,

  initializeForUser: (userId: string, role: UserRoleType) => {
    activeUserId = userId || 'anonymous';
    const persisted = loadPersisted(activeUserId, role);
    const config = TUTORIAL_CONFIGS[role];

    const shouldAutoStart = !persisted.hasSeenTour && !!config;

    set({
      currentRole: role,
      completedTaskIds: persisted.completedTaskIds,
      hasSeenTour: persisted.hasSeenTour,
      isDismissed: persisted.isDismissed,
      isTourActive: shouldAutoStart,
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
      currentStepIndex: 0,
      isMinimized: true,
    });
  },

  nextStep: () => {
    const { currentRole, currentStepIndex } = get();
    if (!currentRole) return;
    const steps = TUTORIAL_CONFIGS[currentRole]?.steps ?? [];
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      get().completeTour();
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  goToStep: (index: number) => {
    set({ currentStepIndex: index });
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
    set({ isTourActive: false, hasSeenTour: true, isMinimized: false });
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
    set({ isTourActive: false, hasSeenTour: true, isMinimized: false });
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
      currentStepIndex: 0,
      isChecklistOpen: true,
      isMinimized: false,
    });
  },
}));
