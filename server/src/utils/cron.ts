import { CronJob } from 'cron';
import { cleanupUnverifiedUsers } from '../controllers/authController';

// Run cleanup job every hour
export const initializeCronJobs = () => {
  new CronJob('0 * * * *', cleanupUnverifiedUsers, null, true, 'UTC');
};
