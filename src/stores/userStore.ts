/**
 * ดาวเทวา — User Profile Store
 * Zustand store for user birth data and preferences
 * Agent 2/3/5 will extend this as needed.
 */

import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface BirthData {
  year: number;          // Gregorian year
  month: number;         // 1–12
  day: number;           // 1–31
  hour: number;          // 0–23
  minute: number;        // 0–59
  latitude: number;      // birth location
  longitude: number;
  timezone: string;      // IANA timezone string e.g. 'Asia/Bangkok'
}

export interface UserPreferences {
  language: 'th' | 'en';
  notificationsEnabled: boolean;
  dailyBriefTime: string;   // HH:MM in local time
  isPremium: boolean;
}

export interface UserState {
  birthData: BirthData | null;
  preferences: UserPreferences;
  hasCompletedOnboarding: boolean;

  // Actions
  setBirthData: (data: BirthData) => Promise<void>;
  setPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  setOnboardingComplete: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  setPremium: (isPremium: boolean) => void;
}

// ─────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────
const STORAGE_KEYS = {
  birthData: '@daothewa:birthData',
  preferences: '@daothewa:preferences',
  onboarding: '@daothewa:onboarding',
} as const;

// ─────────────────────────────────────────────
// Default preferences
// ─────────────────────────────────────────────
const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'th',
  notificationsEnabled: true,
  dailyBriefTime: '06:00',
  isPremium: false,
};

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────
export const useUserStore = create<UserState>((set, get) => ({
  birthData: null,
  preferences: DEFAULT_PREFERENCES,
  hasCompletedOnboarding: false,

  setBirthData: async (data: BirthData) => {
    set({birthData: data});
    await AsyncStorage.setItem(STORAGE_KEYS.birthData, JSON.stringify(data));
  },

  setPreferences: async (prefs: Partial<UserPreferences>) => {
    const updated = {...get().preferences, ...prefs};
    set({preferences: updated});
    await AsyncStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(updated));
  },

  setOnboardingComplete: async () => {
    set({hasCompletedOnboarding: true});
    await AsyncStorage.setItem(STORAGE_KEYS.onboarding, 'true');
  },

  loadFromStorage: async () => {
    try {
      const [birthRaw, prefsRaw, onboardingRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.birthData),
        AsyncStorage.getItem(STORAGE_KEYS.preferences),
        AsyncStorage.getItem(STORAGE_KEYS.onboarding),
      ]);

      set({
        birthData: birthRaw ? JSON.parse(birthRaw) : null,
        preferences: prefsRaw
          ? {...DEFAULT_PREFERENCES, ...JSON.parse(prefsRaw)}
          : DEFAULT_PREFERENCES,
        hasCompletedOnboarding: onboardingRaw === 'true',
      });
    } catch (error) {
      console.error('[UserStore] Failed to load from storage:', error);
    }
  },

  setPremium: (isPremium: boolean) => {
    set(state => ({
      preferences: {...state.preferences, isPremium},
    }));
  },
}));
