import cron from 'node-cron';
import { checkReminderSchedule } from '../services/reminderService.js';

export function startReminderJob() {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log(`\n[${new Date().toISOString()}] Running reminder job...`);
    try {
      await checkReminderSchedule();
    } catch (error) {
      console.error('Reminder job error:', error);
    }
  });

  console.log('✓ Reminder job started (runs every hour)');
}
