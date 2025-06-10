import { Result } from "../types/result";
import { sleep } from "./utils";

export type AsyncResult<T, E = string> = Promise<Result<T, E>>;

export const AsyncResult = {
  /** Wraps a promise in a Result */
  fromPromise: async <T>(promise: Promise<T>): AsyncResult<T> => {
    try {
      return Result.ok(await promise);
    } catch (e) {
      return Result.error(String(e));
    }
  },

  /** Retry an async operation with exponential backoff */
  retry: async <T, E = string>(
    operation: () => AsyncResult<T, E>,
    options: {
      maxAttempts?: number;
      initialDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
    } = {},
  ): AsyncResult<T, E> => {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
    } = options;

    let delay = initialDelay;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const result = await operation();
      if (result.kind === "ok") return result;

      attempt++;
      if (attempt === maxAttempts) return result;

      await sleep(delay);
      delay = Math.min(delay * backoffFactor, maxDelay);
    }

    return Result.error("max_attempts_reached" as E);
  },

  /** Add timeout to an async operation */
  with_timeout: async <T, E>(
    operation: () => AsyncResult<T, E>,
    timeoutMs: number,
  ): AsyncResult<T, E | "timeout"> => {
    const timeoutPromise = sleep(timeoutMs).then(() =>
      Result.error("timeout" as const),
    );
    return Promise.race([operation(), timeoutPromise]);
  },
} as const;
