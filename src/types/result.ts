/**
 * A type that represents either success (Ok) or failure (Error)
 * @template T The type of the successful value
 * @template E The type of the error value
 */
export type Result<T, E = string> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "error"; readonly error: E };

/**
 * Custom error class for Result errors
 * @template E The type of the error value
 */
export class ResultError<E> extends Error {
  constructor(public readonly error: E) {
    super(typeof error === "string" ? error : "ResultError");
  }
}

export const Result = {
  /**
   * Creates a Result with a successful value.
   * @param value - The value to wrap
   * @returns A Result containing the value
   * @template T The type of the successful value
   */
  ok: <T>(value: T): Result<T, never> => ({
    kind: "ok",
    value,
  }),

  /**
   * Creates a Result with an error.
   * @param error - The error to wrap
   * @returns A Result containing the error
   * @template E The type of the error value
   */
  error: <E>(error: E): Result<never, E> => ({
    kind: "error",
    error,
  }),

  /**
   * Unwraps a Result, throwing an error if it is an error variant.
   * @template T The type of the successful value
   * @template E The type of the error value
   * @param result - The Result to unwrap
   * @returns The successful value
   * @throws {ResultError} If the Result is an error variant
   */
  unwrap: <T, E>(result: Result<T, E>): T => {
    if (result.kind === "error") {
      throw new ResultError(result.error);
    }
    return result.value;
  },

  /**
   * Unwraps a Result, returning a default value if it is an error variant.
   * @param result - The Result to unwrap
   * @param defaultValue - The default value to return if the Result is an error
   * @return The successful value or the default value
   * @template T The type of the successful value
   * @template E The type of the error value
   */
  unwrap_or: <T, E>(result: Result<T, E>, defaultValue: T): T => {
    return result.kind === "ok" ? result.value : defaultValue;
  },

  /**
   * Maps a Result to another Result using a function.
   * @param result - The Result to map
   * @param f - The function to apply to the successful value
   * @return A new Result with the mapped value or the original error
   * @template T The type of the successful value
   * @template U The type of the new successful value
   * @template E The type of the error value
   */
  and_then: <T, U, E>(
    result: Result<T, E>,
    f: (value: T) => Result<U, E>,
  ): Result<U, E> => {
    return result.kind === "ok" ? f(result.value) : result;
  },

  /**
   * Maps a Result to another Result using a function that transforms the value.
   * @param result - The Result to map
   * @param f - The function to apply to the successful value
   * @return A new Result with the transformed value or the original error
   * @template T The type of the successful value
   * @template U The type of the new successful value
   * @template E The type of the error value
   */
  map: <T, U, E>(result: Result<T, E>, f: (value: T) => U): Result<U, E> => {
    return result.kind === "ok" ? Result.ok(f(result.value)) : result;
  },

  /**
   * Combines multiple Results into one.
   * @param results - An array of Results to combine
   * @return A Result containing an array of values if all are successful, or the first error encountered
   * @template T The type of the successful value
   * @template E The type of the error value
   */
  /** Combines multiple Results into one */
  all: <T, E>(results: Result<T, E>[]): Result<T[], E> => {
    const values: T[] = [];
    for (const result of results) {
      if (result.kind === "error") return result;
      values.push(result.value);
    }
    return Result.ok(values);
  },

  /**
   * Returns the first success or all errors
   * @param results - An array of Results to check
   * @return The first successful Result or a Result containing all errors if all are errors
   * @template T The type of the successful value
   * @template E The type of the error value
   */
  any: <T, E>(results: Result<T, E>[]): Result<T, E[]> => {
    const errors: E[] = [];
    for (const result of results) {
      if (result.kind === "ok") return result;
      errors.push(result.error);
    }
    return Result.error(errors);
  },

  /**
   * Creates a Result from a function that may throw an error.
   * @param f - The function to execute
   * @return A Result containing the value if successful, or an error if an exception is thrown
   * @template T The type of the successful value
   * @template E The type of the error value
   */
  from_try: <T>(f: () => T): Result<T, Error> => {
    try {
      return Result.ok(f());
    } catch (e) {
      return Result.error(e instanceof Error ? e : new Error(String(e)));
    }
  },
} as const;
