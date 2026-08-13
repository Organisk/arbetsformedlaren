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

import Database from 'better-sqlite3';
import { NormalizedJob } from './jobsearch-client';

// Scheduler configuration types
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
export async function runSchedulerCycle(config: SchedulerConfig): Promise<SchedulerRunResult> {
  const result: SchedulerRunResult = {
    success: false,
    jobsFetched: 0,
    jobsNew: 0,
    jobsDuplicate: 0,
    matchesCreated: 0,
  };
  
  const db = new Database('./database/arbetsformedlaren.db');
  
  try {
    // Step 1: Fetch new jobs from JobSearch API
    const { searchJobs } = await import('./jobsearch-client');
    
    // Search for relevant jobs - use a broad search to get current listings
    const searchResults = await searchJobs({ 
      q: '',
      size: config.maxJobs
    });
    
    result.jobsFetched = searchResults.length;
    
    if (searchResults.length === 0) {
      result.nextRun = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      return result;
    }
    
    // Step 2: Deduplicate against existing jobs in database
    const existingJobIds = new Set<string>();
    const existingJobs = db.prepare('SELECT external_id FROM jobs WHERE removed = 0').all() as { external_id: string }[];
    existingJobs.forEach(job => existingJobIds.add(job.external_id || ''));
    
    const newJobs: NormalizedJob[] = [];
    let jobsDuplicate = 0;
    
    for (const job of searchResults) {
      const externalId = job.external_id || '';
      if (existingJobIds.has(externalId)) {
        jobsDuplicate++;
      } else {
        // Step 3: Save new job to database
        const stmt = db.prepare(`
          INSERT INTO jobs (id, external_id, headline, company, municipality, county, 
            employment_type, duration, scope_of_work, lat, lon, must_skills, must_languages,
            occupation, occupation_group, publication_url, employer_name, salary_type, publication_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          job.id,
          job.external_id,
          job.headline,
          job.company,
          job.municipality,
          job.county,
          job.employment_type,
          job.duration,
          job.scope_of_work,
          job.lat,
          job.lon,
          JSON.stringify(job.must_skills),
          JSON.stringify(job.must_languages),
          job.occupation,
          job.occupation_group,
          job.publication_url,
          job.employer_name,
          job.salary_type,
          job.publication_date
        );
        
        newJobs.push(job);
        result.jobsNew++;
      }
    }
    
    result.jobsDuplicate = jobsDuplicate;
    
    // Step 4: Match new jobs against user profiles
    if (newJobs.length > 0 && config.userIds.length > 0) {
      // Get user profiles
      const userPlaceholders = config.userIds.map(() => '?').join(',');
      const users = db.prepare(`SELECT * FROM users WHERE id IN (${userPlaceholders})`).all() as any[];
      
      for (const user of users) {
        const userLocation = user.location_lat && user.location_lon 
          ? { lat: user.location_lat, lon: user.location_lon }
          : null;
        
        const maxRadius = user.radius_km || config.radiusKm;
        
        // Match each new job against user profile
        for (const job of newJobs) {
          // Import matching engine
          const { matchCVagainstJob } = await import('./matching-engine');
          
          // Read CV data from localStorage or database
          const cvData = JSON.parse(localStorage.getItem(`cv_user_${user.id}`) || '{}');
          
          if (cvData.skills && cvData.skills.length > 0) {
            const matchResult = matchCVagainstJob(cvData, job, userLocation, maxRadius);
            
            if (matchResult.totalScore >= 30) { // Only show matches with >= 30% score
              // Check if match already exists
              const existingMatch = db.prepare(
                'SELECT * FROM matches WHERE user_id = ? AND job_id = ? AND status = ?'
              ).get(user.id, job.id, 'new') as any;
              
              if (!existingMatch) {
                const matchStmt = db.prepare(`
                  INSERT INTO matches (id, user_id, job_id, score, match_reasons, status)
                  VALUES (?, ?, ?, ?, ?, ?)
                `);
                
                matchStmt.run(
                  `match_${user.id}_${job.id}`,
                  user.id,
                  job.id,
                  matchResult.totalScore,
                  JSON.stringify(matchResult.reasons),
                  'new'
                );
                
                result.matchesCreated++;
              }
            }
          }
        }
      }
    }
    
    result.success = true;
    result.nextRun = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    // Step 5: Clean up removed jobs
    db.prepare('DELETE FROM matches WHERE created_at < date("now", "-30 days")').run();
    
    return result;
    
  } catch (error: any) {
    console.error('Scheduler error:', error);
    result.error = error.message || 'Unknown scheduler error';
    return result;
  } finally {
    db.close();
  }
}

/**
 * Get scheduler status - check when next run is due
 */
export function getSchedulerStatus(config: SchedulerConfig): {
  nextRun: string;
  mode: 'cron' | 'webhook' | 'interval';
  lastRun?: string;
} {
  let mode: 'cron' | 'webhook' | 'interval' = 'interval';
  
  if (config.cronExpression) {
    mode = 'cron';
  } else if (config.webhookUrl) {
    mode = 'webhook';
  } else if (config.checkIntervalMinutes) {
    mode = 'interval';
  }
  
  const now = new Date();
  let nextRun: Date;
  
  switch (mode) {
    case 'cron':
      nextRun = new Date(Date.now() + 60 * 60 * 1000);
      break;
    case 'webhook':
      nextRun = new Date(Date.now() + 60 * 60 * 1000);
      break;
    case 'interval':
      nextRun = new Date(Date.now() + (config.checkIntervalMinutes || 60) * 60 * 1000);
      break;
    default:
      nextRun = new Date(Date.now() + 60 * 60 * 1000);
  }
  
  return {
    nextRun: nextRun.toISOString(),
    mode,
  };
}

export default { runSchedulerCycle, getSchedulerStatus };
