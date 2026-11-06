/**
 * Retry helper for mail.tm rate limits
 * Only retries on HTTP 429 status.
 * Backoff schedule: 2s, 4s, 8s (capped at 30s) plus small random jitter (~100-500ms).
 * Max attempts: 4.
 */

export class HttpError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

export async function retryOn429<T>(
  fn: () => Promise<T>,
  maxAttempts = 4
): Promise<T> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const is429 = err instanceof HttpError && err.status === 429;
      if (!is429 || attempt >= maxAttempts) {
        throw err;
      }
      // Backoff: 2^(attempt) seconds = 2, 4, 8... capped at 30s + small jitter
      const baseDelay = Math.min(Math.pow(2, attempt) * 1000, 30000);
      const jitter = Math.floor(Math.random() * 500) + 100;
      const delay = baseDelay + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retry attempts exceeded');
}
