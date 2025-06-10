import { Result } from "./types/result";
import { Option } from "./types/option";
import { Brand, brand } from "./types/brand";
import { int, float, uint, nonzero } from "./types/numeric";

/**
 * Core safe type constructors and utilities
 */
export const safe = {
  /**
   * Creates a safe integer type.
   * @param n - The number to check.
   * @returns A Result containing the safe integer or an error.
   */
  int: (n: number): Result<int, string> => {
    if (!Number.isFinite(n)) return { kind: "error", error: "not_finite" };
    if (!Number.isInteger(n)) return { kind: "error", error: "not_integer" };
    return { kind: "ok", value: brand<number, "int">(n) };
  },

  /**
   * Creates a safe float type.
   * @param n - The number to check.
   * @returns A Result containing the safe float or an error.
   */
  float: (n: number): Result<float, string> => {
    if (!Number.isFinite(n)) return { kind: "error", error: "not_finite" };
    return { kind: "ok", value: brand<number, "float">(n) };
  },

  /**
   * Creates a safe unsigned integer type.
   * @param n - The number to check.
   * @returns A Result containing the safe unsigned integer or an error.
   */
  uint: (n: number): Result<uint, string> => {
    const intResult = safe.int(n);
    if (intResult.kind === "error") return intResult;
    if (intResult.value < 0) return { kind: "error", error: "negative_number" };
    return { kind: "ok", value: brand<number, "uint">(intResult.value) };
  },

  /**
   * Creates a safe non-zero integer type.
   * @param n - The number to check.
   * @returns A Result containing the safe non-zero integer or an error.
   */
  nonzero: (n: number): Result<nonzero, string> => {
    const intResult = safe.int(n);
    if (intResult.kind === "error") return intResult;
    if (intResult.value === 0)
      return { kind: "error", error: "zero_not_allowed" };
    return { kind: "ok", value: brand<number, "nonzero">(intResult.value) };
  },

  /**
   * Creates an Option from a nullable value
   * @param value - The value to check
   * @returns An Option containing the value or none
   */
  fromNullable: <T>(value: T | null | undefined): Option<T> => {
    return value != null ? { kind: "some", value } : { kind: "none" };
  },

  /**
   * Creates a Result without an error.
   * @param value - The value to wrap
   * @returns A Result containing the value
   */
  ok: <T>(value: T): Result<T, never> => ({
    kind: "ok",
    value,
  }),

  /**
   * Creates a Result with an error.
   * @param error - The error to wrap
   * @returns A Result containing the error
   */
  error: <E>(error: E): Result<never, E> => ({
    kind: "error",
    error,
  }),

  /**
   * Creates an Option with a value.
   * @param value - The value to wrap
   * @returns An Option containing the value
   */
  some: <T>(value: T): Option<T> => ({
    kind: "some",
    value,
  }),

  /**
   * Creates an Option without a value.
   * @returns An empty Option
   */
  none: <T>(): Option<T> => ({
    kind: "none",
  }),

  /**
   * Validates a string is non-empty
   * @param s - The string to check
   * @returns A Result containing the string or an error
   */
  nonEmptyString: (s: string): Result<string, "empty_string"> => {
    return s.length > 0 ? safe.ok(s) : safe.error("empty_string");
  },
} as const;
