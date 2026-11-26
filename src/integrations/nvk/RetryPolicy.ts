export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 10000;
  const backoffFactor = options.backoffFactor ?? 2;

  let lastError: Error = new Error('Operation failed without explicit error.');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Do not retry 4xx client errors except 429 Too Many Requests
      const message = lastError.message.toLowerCase();
      if (
        (message.includes('400') ||
         message.includes('401') ||
         message.includes('403') ||
         message.includes('404')) &&
        !message.includes('429')
      ) {
        throw lastError;
      }

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = Math.min(
        maxDelayMs,
        baseDelayMs * Math.pow(backoffFactor, attempt - 1) + Math.random() * 200
      );

      options.onRetry?.(attempt, lastError);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
