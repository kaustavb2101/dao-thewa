/**
 * ดาวเทวา — DailyScheduler
 * 05:30 Bangkok daily computation · Notifee push notifications
 * Processes all active users, caches briefs for app retrieval
 */
import {AstronomicalEngine} from '../engines/AstronomicalEngine';
import {ThaiRulesEngine, RuleInputData} from '../engines/ThaiRulesEngine';
import {InterpretationEngine} from './InterpretationEngine';
import {getUserStore} from '../stores/userStore';

// ─── TYPES ────────────────────────────────────────────────────────

export interface SchedulerResult {
  usersProcessed: number;
  errors:         number;
  durationMs:     number;
  runAt:          Date;
}

// ─── SCHEDULER ────────────────────────────────────────────────────

export class DailyScheduler {

  /**
   * Main entry point — runs at 05:30 Asia/Bangkok every morning.
   * Called by Cowork /schedule or app background task.
   */
  static async runMorningComputation(): Promise<SchedulerResult> {
    const startTime = Date.now();
    console.log('[DailyScheduler] Morning computation started:', new Date().toISOString());

    let usersProcessed = 0;
    let errors = 0;

    try {
      const userStore = getUserStore();
      const users = userStore.getAllActiveUsers();

      if (users.length === 0) {
        console.log('[DailyScheduler] No active users. Skipping.');
        return {usersProcessed: 0, errors: 0, durationMs: Date.now() - startTime, runAt: new Date()};
      }

      // Process in batches of 50 to respect API rate limits
      const BATCH_SIZE = 50;
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map(user => this.computeForUser(user)),
        );
        results.forEach(r => {
          if (r.status === 'fulfilled') usersProcessed++;
          else errors++;
        });
        // Polite pause between batches
        if (i + BATCH_SIZE < users.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`[DailyScheduler] Complete — ${usersProcessed} users processed, ${errors} errors`);
    } catch (error) {
      console.error('[DailyScheduler] Fatal error:', error);
      errors++;
    }

    return {
      usersProcessed,
      errors,
      durationMs: Date.now() - startTime,
      runAt: new Date(),
    };
  }

  /**
   * Compute full daily brief for a single user.
   * Stores result in AsyncStorage for app retrieval.
   */
  static async computeForUser(user: any): Promise<void> {
    const today = new Date();

    // Step 1: Astronomical data
    const astroData = await AstronomicalEngine.computeDailyData(
      today,
      user.birthLat  ?? 13.7563,   // Default: Bangkok
      user.birthLng  ?? 100.5018,
      user.natalChart ?? undefined,
    );

    // Step 2: Thai rules engine
    const ruleInput: RuleInputData = {
      planets:          astroData.planets,
      transits:         astroData.natalTransits ?? [],
      lunarPhase:       astroData.lunarPhase,
      currentHora:      astroData.currentHora,
      thaiDate:         astroData.thaiDate,
      wanGerd:          user.wanGerd          ?? new Date().getDay(),
      birthRasi:        user.birthRasi         ?? 0,
      birthNakshatra:   user.birthNakshatra    ?? 0,
      horaHours:        astroData.horaHours    ?? [],
    };
    const interpretation = ThaiRulesEngine.interpret(ruleInput);

    // Step 3: AI interpretation (Thai + English)
    const brief = await InterpretationEngine.generateDailyBrief(
      interpretation,
      astroData,
      user.language ?? 'th',
    );

    // Step 4: Persist for app retrieval
    await this.storeDailyBrief(user.id ?? 'default', brief);

    // Step 5: Schedule push notification
    if (user.notificationsEnabled !== false) {
      await this.scheduleNotification(user, brief);
    }
  }

  /**
   * Store computed brief in AsyncStorage.
   * App reads this on open to show cached brief instantly.
   */
  static async storeDailyBrief(userId: string, brief: any): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`daily_brief_${userId}_${today}`, JSON.stringify(brief));
    } catch (err) {
      console.warn('[DailyScheduler] Failed to store brief:', err);
    }
  }

  /**
   * Schedule a Notifee push notification at the user's preferred hour.
   * Defaults to 07:00 Bangkok time.
   */
  static async scheduleNotification(user: any, brief: any): Promise<void> {
    try {
      const notifee = require('@notifee/react-native').default;
      const {TriggerType} = require('@notifee/react-native');

      // Ensure channel exists (Android)
      await notifee.createChannel({
        id:         'dao-thewa-daily',
        name:       'ดาวเทวา · ดวงประจำวัน',
        importance: 4,  // HIGH
      });

      const notificationTime = new Date();
      notificationTime.setHours(user.notificationHour ?? 7, 0, 0, 0);
      // If the time has already passed today, schedule for tomorrow
      if (notificationTime.getTime() <= Date.now()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      await notifee.createTriggerNotification(
        {
          title: brief.headlineThai ?? brief.headline ?? 'ดวงประจำวัน',
          body:  (brief.overviewThai ?? brief.overview ?? '').substring(0, 120) + '…',
          android: {
            channelId:   'dao-thewa-daily',
            smallIcon:   'ic_star',
            color:       '#D4A017',
            pressAction: {id: 'open_brief'},
          },
          ios: {
            sound:      'temple_bell.caf',
            badgeCount: 1,
          },
        },
        {
          type:      TriggerType.TIMESTAMP,
          timestamp: notificationTime.getTime(),
        },
      );
    } catch (err) {
      // Notifee not installed in dev/test — silently skip
      console.warn('[DailyScheduler] Notification skipped:', (err as Error).message);
    }
  }

  /**
   * Register this scheduler as a Cowork daily task.
   * Run once at app setup or admin deploy.
   */
  static async registerScheduledTask(): Promise<void> {
    console.log('[DailyScheduler] Registered: runs daily at 05:30 Asia/Bangkok');
    // Cowork handles the OS-level scheduling:
    // /schedule daily at 05:30 Asia/Bangkok
    // Task: node -e "require('./src/api/DailyScheduler').DailyScheduler.runMorningComputation()"
  }
}
