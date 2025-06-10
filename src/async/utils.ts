import { Result } from "../types/result";
import { Option } from "../types/option";
import { safe } from "../safe";

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Configuration for retry operations
 */
export interface RetryConfig {
  /** Maximum number of attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Factor to multiply delay by after each attempt */
  backoffFactor?: number;
  /** Whether to add jitter to delays */
  jitter?: boolean;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  jitter: true,
} as const;

/**
 * Adds random jitter to a delay
 */
const add_jitter = (delay: number): number => {
  const jitterFactor = 0.25; // 25% jitter
  const randomFactor = 1 - jitterFactor + Math.random() * jitterFactor * 2;
  return Math.floor(delay * randomFactor);
};

/**
 * Calculate delay for next retry attempt
 */
export const calculateDelay = (
  attempt: number,
  config: Required<RetryConfig>,
): number => {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffFactor, attempt),
    config.maxDelay,
  );
  return config.jitter ? add_jitter(delay) : delay;
};

/**
 * Wraps a promise with a timeout
 */
export const with_timeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<Result<T, "timeout">> => {
  try {
    const result = await Promise.race([
      promise,
      sleep(timeoutMs).then(() => {
        throw new Error("timeout");
      }),
    ]);
    return safe.ok(result);
  } catch (error) {
    return safe.error("timeout");
  }
};

/**
 * Wraps a promise to make it cancelable
 */
export const make_cancelable = <T>(promise: Promise<T>) => {
  let isCanceled = false;

  const wrappedPromise = new Promise<Result<T, "canceled">>((resolve) => {
    promise
      .then((value) => {
        if (!isCanceled) {
          resolve(safe.ok(value));
        }
      })
      .catch(() => {
        if (!isCanceled) {
          resolve(safe.error("canceled"));
        }
      });
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      isCanceled = true;
    },
  };
};

/**
 * Creates a deferred promise that can be resolved/rejected externally
 */
export const create_deferred = <T>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: (value: T) => resolve(value),
    reject: (reason?: any) => reject(reason),
  };
};

/**
 * Run async operations in sequence
 */
export const sequence = async <T>(
  operations: (() => Promise<T>)[],
): Promise<Result<T[], string>> => {
  const results: T[] = [];

  for (const operation of operations) {
    try {
      results.push(await operation());
    } catch (error) {
      return safe.error(String(error));
    }
  }

  return safe.ok(results);
};

/**
 * Run async operations with limited concurrency
 */
export const parallel = async <T>(
  operations: (() => Promise<T>)[],
  concurrency: number,
): Promise<Result<T[], string>> => {
  const results: T[] = new Array(operations.length);
  let currentIndex = 0;

  const run_next = async (): Promise<void> => {
    const index = currentIndex++;
    if (index >= operations.length) return;

    try {
      results[index] = await operations[index]();
    } catch (error) {
      results[index] = error as T;
    }

    return run_next();
  };

  try {
    await Promise.all(
      Array.from({ length: Math.min(concurrency, operations.length) }, () =>
        run_next(),
      ),
    );
    return safe.ok(results);
  } catch (error) {
    return safe.error(String(error));
  }
};
