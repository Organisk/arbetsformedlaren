/**
 * Scheduler Service - Automated job ingestion scheduler
 *
 * Supports multiple scheduling mechanisms:
 * - Cron expressions (for traditional cron setups)
 * - GitHub Actions workflow triggers
 * - External scheduler integration (via HTTP webhooks)
 *
 * The scheduler fetches new job ads from the JobSearch API,
 * deduplicates against existing entries, and triggers matching
 * against user profiles.
 */
export interface SchedulerConfig {
    /** Cron expression for when to run (e.g., "0 7 * * *" for 7:00 AM daily) */
    cronExpression?: string;
    /** GitHub Actions workflow reference */
    githubActions?: {
        workflowId: string;
        event: 'schedule' | 'workflow_dispatch';
    };
    /** External webhook URL for triggering */
    webhookUrl?: string;
    /** How often to check for new jobs (in minutes) */
    checkIntervalMinutes?: number;
    /** Maximum number of jobs to fetch per cycle */
    maxJobs: number;
    /** Geographic radius in km for job filtering */
    radiusKm: number;
    /** User IDs to match against (empty = all active users) */
    userIds: string[];
}
export interface SchedulerRunResult {
    success: boolean;
    jobsFetched: number;
    jobsNew: number;
    jobsDuplicate: number;
    matchesCreated: number;
    error?: string;
    nextRun?: string;
}
/**
 * Run the scheduler cycle - fetch new jobs and match against users
 */
export declare function runSchedulerCycle(config: SchedulerConfig): Promise<SchedulerRunResult>;
/**
 * Get scheduler status - check when next run is due
 */
export declare function getSchedulerStatus(config: SchedulerConfig): {
    nextRun: string;
    mode: 'cron' | 'webhook' | 'interval';
    lastRun?: string;
};
declare const _default: {
    runSchedulerCycle: typeof runSchedulerCycle;
    getSchedulerStatus: typeof getSchedulerStatus;
};
export default _default;
