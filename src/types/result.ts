/**
 * A type that represents either success (Ok) or failure (Error)
 */
export type Result<T, E = string> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "error"; readonly error: E };

export class ResultError<E> extends Error {
  constructor(public readonly error: E) {
    super(typeof error === "string" ? error : "ResultError");
  }
}

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({
    kind: "ok",
    value,
  }),

  error: <E>(error: E): Result<never, E> => ({
    kind: "error",
    error,
  }),

  unwrap: <T, E>(result: Result<T, E>): T => {
    if (result.kind === "error") {
      throw new ResultError(result.error);
    }
    return result.value;
  },

  unwrap_or: <T, E>(result: Result<T, E>, defaultValue: T): T => {
    return result.kind === "ok" ? result.value : defaultValue;
  },

  and_then: <T, U, E>(
    result: Result<T, E>,
    f: (value: T) => Result<U, E>,
  ): Result<U, E> => {
    return result.kind === "ok" ? f(result.value) : result;
  },

  map: <T, U, E>(result: Result<T, E>, f: (value: T) => U): Result<U, E> => {
    return result.kind === "ok" ? Result.ok(f(result.value)) : result;
  },

  /** Combines multiple Results into one */
  all: <T, E>(results: Result<T, E>[]): Result<T[], E> => {
    const values: T[] = [];
    for (const result of results) {
      if (result.kind === "error") return result;
      values.push(result.value);
    }
    return Result.ok(values);
  },

  /** Returns the first success or all errors */
  any: <T, E>(results: Result<T, E>[]): Result<T, E[]> => {
    const errors: E[] = [];
    for (const result of results) {
      if (result.kind === "ok") return result;
      errors.push(result.error);
    }
    return Result.error(errors);
  },

  from_try: <T>(f: () => T): Result<T, Error> => {
    try {
      return Result.ok(f());
    } catch (e) {
      return Result.error(e instanceof Error ? e : new Error(String(e)));
    }
  },
} as const;
