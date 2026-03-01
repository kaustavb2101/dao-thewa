/**
 * ดาวเทวา — UserStore
 * Zustand + AsyncStorage · Birth data + preferences · Online/offline persistence
 */
import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── TYPES ────────────────────────────────────────────────────────

export interface UserProfile {
  id:                string;
  birthDate:         Date;
  birthTime:         string;      // HH:MM
  birthLat:          number;
  birthLng:          number;
  birthTimezone:     string;
  birthCity:         string;
  wanGerd:           number;      // 0–6 (weekday of birth)
  birthRasi:         number;      // 0–11 (Sun sign at birth)
  birthNakshatra:    number;      // 0–26 (natal nakshatra)
  natalChart?:       any;         // Full natal chart data
  language:          'th' | 'en';
  notificationHour:  number;      // 0–23
  notificationsEnabled: boolean;
  isPremium:         boolean;
  createdAt:         Date;
}

export interface Preferences {
  language:          'th' | 'en';
  notificationHour:  number;
  notificationsEnabled: boolean;
  theme:             'dark' | 'auto';
}

const DEFAULT_PREFERENCES: Preferences = {
  language:             'th',
  notificationHour:     7,
  notificationsEnabled: true,
  theme:                'dark',
};

export interface UserState {
  user:           UserProfile | null;
  preferences:    Preferences;
  isOnboarded:    boolean;
  isPremium:      boolean;
  // Actions
  setUser:               (user: UserProfile) => Promise<void>;
  updateBirthData:       (data: Partial<UserProfile>) => Promise<void>;
  setPreferences:        (prefs: Partial<Preferences>) => Promise<void>;
  setOnboardingComplete: () => void;
  setPremium:            (isPremium: boolean) => Promise<void>;
  loadFromStorage:       () => Promise<void>;
  clearUser:             () => Promise<void>;
  // DailyScheduler interface
  getAllActiveUsers:      () => UserProfile[];
}

// ─── STORE ────────────────────────────────────────────────────────

export const useUserStore = create<UserState>((set, get) => ({

  user:         null,
  preferences:  DEFAULT_PREFERENCES,
  isOnboarded:  false,
  isPremium:    false,

  setUser: async (user: UserProfile) => {
    set({user, isOnboarded: true});
    await AsyncStorage.setItem('user_profile', JSON.stringify(user));
  },

  updateBirthData: async (data: Partial<UserProfile>) => {
    const current = get().user;
    if (!current) return;
    const updated = {...current, ...data};
    set({user: updated});
    await AsyncStorage.setItem('user_profile', JSON.stringify(updated));
  },

  setPreferences: async (prefs: Partial<Preferences>) => {
    const current = get().preferences;
    const updated = {...current, ...prefs};
    set({preferences: updated});
    await AsyncStorage.setItem('user_preferences', JSON.stringify(updated));
  },

  setOnboardingComplete: () => {
    set({isOnboarded: true});
    AsyncStorage.setItem('onboarding_complete', 'true').catch(() => {});
  },

  setPremium: async (isPremium: boolean) => {
    set({isPremium});
    const user = get().user;
    if (user) {
      const updated = {...user, isPremium};
      set({user: updated});
      await AsyncStorage.setItem('user_profile', JSON.stringify(updated));
    }
  },

  loadFromStorage: async () => {
    try {
      const [profileJson, prefsJson, onboardedStr] = await Promise.all([
        AsyncStorage.getItem('user_profile'),
        AsyncStorage.getItem('user_preferences'),
        AsyncStorage.getItem('onboarding_complete'),
      ]);
      const updates: Partial<UserState> = {};
      if (profileJson) updates.user = JSON.parse(profileJson) as UserProfile;
      if (prefsJson)   updates.preferences = {...DEFAULT_PREFERENCES, ...JSON.parse(prefsJson)};
      if (onboardedStr === 'true') updates.isOnboarded = true;
      if (updates.user?.isPremium) updates.isPremium = true;
      set(updates as UserState);
    } catch (err) {
      console.warn('[UserStore] Failed to load from storage:', err);
    }
  },

  clearUser: async () => {
    set({user: null, isOnboarded: false, isPremium: false});
    await Promise.all([
      AsyncStorage.removeItem('user_profile'),
      AsyncStorage.removeItem('onboarding_complete'),
    ]);
  },

  // Used by DailyScheduler to fetch users for batch processing
  getAllActiveUsers: (): UserProfile[] => {
    const {user} = get();
    return user ? [user] : [];
  },
}));

// Module-level getter for use outside React components (DailyScheduler)
export const getUserStore = () => useUserStore.getState();
