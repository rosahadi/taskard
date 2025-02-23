import { CronJob } from 'cron';
import { cleanupUnverifiedUsers } from '../controllers/authController';
import { cleanupExpiredInvitations } from '../controllers/inviteWorkspaceMemberController';

// Run cleanup job every hour
export const initializeCronJobs = () => {
  new CronJob('0 * * * *', cleanupUnverifiedUsers, null, true, 'UTC');
  new CronJob('0 * * * *', cleanupExpiredInvitations, null, true, 'UTC');
};
