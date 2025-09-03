/**
 * Queue timing estimation utility
 * Calculates estimated time for processing large contact imports
 */

export interface QueueEstimate {
  seconds: number;
  minutes: number;
  hours?: number;
}

/**
 * Estimate queue processing time based on contact count and rate limits
 * @param contacts - Number of contacts to process
 * @param cps - Calls per second rate limit
 * @param concurrency - Maximum concurrent calls
 * @returns QueueEstimate with estimated processing time
 */
export function estimateQueueWindow(
  contacts: number, 
  cps: number = 8, 
  concurrency: number = 80
): QueueEstimate {
  // Effective start rate: min(cps, concurrency / avgCallSeconds)
  // For simplicity, we use cps as the primary rate limiter
  const effectiveRate = Math.max(cps, 1);
  const seconds = Math.ceil(contacts / effectiveRate);
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  const hours = minutes >= 60 ? Math.ceil(minutes / 60) : undefined;

  return { seconds, minutes, hours };
}

/**
 * Format queue estimate into human-readable string
 * @param estimate - QueueEstimate object
 * @returns Formatted time string
 */
export function formatQueueEstimate(estimate: QueueEstimate): string {
  if (estimate.hours && estimate.hours > 1) {
    return `about ${estimate.hours} hours`;
  } else if (estimate.minutes > 1) {
    return `about ${estimate.minutes} minutes`;
  } else {
    return `about ${estimate.seconds} seconds`;
  }
}

/**
 * Get queue timing message for large imports
 * @param contactCount - Number of contacts being imported
 * @param threshold - Threshold for showing the message (default: 300)
 * @param cps - Calls per second rate limit (default: 8)
 * @param concurrency - Maximum concurrent calls (default: 80)
 * @returns Message string or null if below threshold
 */
export function getQueueTimingMessage(
  contactCount: number,
  threshold: number = 300,
  cps: number = 8,
  concurrency: number = 80
): string | null {
  if (contactCount <= threshold) {
    return null;
  }

  const estimate = estimateQueueWindow(contactCount, cps, concurrency);
  const timeString = formatQueueEstimate(estimate);

  return `This import will queue ~${contactCount} calls. To avoid spikes, calls will be spread over ${timeString}.`;
}
