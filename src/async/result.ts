import { Result } from "../types/result";
import { sleep } from "./utils";

export type AsyncResult<T, E = string> = Promise<Result<T, E>>;

export const AsyncResult = {
  /**
   * Wraps a promise in a Result
   * @param promise The promise to wrap
   * @return An AsyncResult containing the Result of the promise
   */
  fromPromise: async <T>(promise: Promise<T>): AsyncResult<T> => {
    try {
      return Result.ok(await promise);
    } catch (e) {
      return Result.error(String(e));
    }
  },

  /**
   * Retry an async operation with exponential backoff
   * @param operation - The async operation to retry
   * @param options - Options for retrying
   * @param options.max_attempts - Maximum number of attempts (default: 3)
   * @param options.initial_delay - Initial delay in milliseconds (default: 1000)
   * @param options.max_delay - Maximum delay in milliseconds (default: 10000)
   * @param options.backoff_factor - Factor to multiply delay by after each attempt (default: 2)
   * @return An AsyncResult containing the Result of the operation
   * @template T The type of the successful value
   * @template E The type of the error value
   */
  retry: async <T, E = string>(
    operation: () => AsyncResult<T, E>,
    options: {
      max_attempts?: number;
      initial_delay?: number;
      max_delay?: number;
      backoff_factor?: number;
    } = {},
  ): AsyncResult<T, E> => {
    const {
      max_attempts = 3,
      initial_delay = 1000,
      max_delay = 10000,
      backoff_factor = 2,
    } = options;

    let delay = initial_delay;
    let attempt = 0;

    while (attempt < max_attempts) {
      const result = await operation();
      if (result.kind === "ok") return result;

      attempt++;
      if (attempt === max_attempts) return result;

      await sleep(delay);
      delay = Math.min(delay * backoff_factor, max_delay);
    }

    return Result.error("max_attempts_reached" as E);
  },

  /**
   * Add timeout to an async operation
   * @param operation - The async operation to run
   * @param timeout_ms - Timeout in milliseconds
   * @return An AsyncResult containing the Result of the operation or a timeout error
   * @template T The type of the successful value
   * @template E The type of the error value
   * @description If the operation does not complete within the timeout, it returns an error with "timeout"
   */
  with_timeout: async <T, E>(
    operation: () => AsyncResult<T, E>,
    timeout_ms: number,
  ): AsyncResult<T, E | "timeout"> => {
    const timeoutPromise = sleep(timeout_ms).then(() =>
      Result.error("timeout" as const),
    );
    return Promise.race([operation(), timeoutPromise]);
  },
} as const;
