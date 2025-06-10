import { Result } from "./result";
import { safe } from "../safe";

/**
 * Option type for handling nullable values safely
 * Similar to Rust's Option or Haskell's Maybe
 * @template T - The type of the value contained in the Option
 */
export type Option<T> =
  | { readonly kind: "some"; readonly value: T }
  | { readonly kind: "none" };

/**
 * Utility functions for working with Option types
 */
export const Option = {
  /**
   * Creates an Option from a nullable value
   * @param value - The value to check
   * @return An Option containing the value or none
   */
  from_nullable: <T>(value: T | null | undefined): Option<T> => {
    return value != null ? safe.some(value) : safe.none();
  },

  /**
   * Creates an Option from a predicate
   * @param value - The value to check
   * @param predicate - The predicate function to apply
   * @return An Option containing the value if the predicate is true, otherwise none
   */
  from_predicate: <T>(
    value: T,
    predicate: (value: T) => boolean,
  ): Option<T> => {
    return predicate(value) ? safe.some(value) : safe.none();
  },

  /**
   * Combines two Options into one
   * @param first - The first Option
   * @param second - The second Option
   * @return An Option containing a tuple of both values if both are Some, otherwise None
   */
  zip: <T, U>(first: Option<T>, second: Option<U>): Option<[T, U]> => {
    return first.kind === "some" && second.kind === "some"
      ? safe.some([first.value, second.value])
      : safe.none();
  },

  /**
   * Combines an array of Options into one Option of array
   * @param options - An array of Options
   * @return An Option containing an array of values if all are Some, otherwise None
   */
  all: <T>(options: Option<T>[]): Option<T[]> => {
    const values: T[] = [];
    for (const opt of options) {
      if (opt.kind === "none") return safe.none();
      values.push(opt.value);
    }
    return safe.some(values);
  },

  /**
   * Returns the first Some value or None if all are None
   * @param options - An array of Options
   * @return The first Some Option found, or None if all are None
   */
  any: <T>(options: Option<T>[]): Option<T> => {
    for (const opt of options) {
      if (opt.kind === "some") return opt;
    }
    return safe.none();
  },
} as const;

/**
 * Extension methods for Option type
 */
export const OptionExt = {
  /**
   * Maps an Option<T> to Option<U>
   * @param option - The Option to map
   * @param f - The function to apply to the value
   * @return An Option containing the mapped value, or None if the original was None
   */
  map: <T, U>(option: Option<T>, f: (value: T) => U): Option<U> => {
    return option.kind === "some" ? safe.some(f(option.value)) : safe.none();
  },

  /**
   * Returns the value or a default
   * @param option - The Option to check
   * @param default_value - The default value to return if the Option is None
   * @return The value if Some, otherwise the default value
   */
  get_or_else: <T>(option: Option<T>, default_value: T): T => {
    return option.kind === "some" ? option.value : default_value;
  },

  /**
   * Converts an Option to a Result
   * @param option - The Option to convert
   * @param error - The error to return if the Option is None
   * @return A Result containing the value if Some, or an error if None
   */
  to_result: <T, E>(option: Option<T>, error: E): Result<T, E> => {
    return option.kind === "some" ? safe.ok(option.value) : safe.error(error);
  },

  /**
   * Chains Option computations
   * @param option - The Option to chain
   * @param f - The function to apply if the Option is Some
   * @return An Option containing the result of the function if Some, otherwise None
   */
  flat_map: <T, U>(
    option: Option<T>,
    f: (value: T) => Option<U>,
  ): Option<U> => {
    return option.kind === "some" ? f(option.value) : safe.none();
  },

  /**
   * Filters an Option based on a predicate
   * @param option - The Option to filter
   * @param predicate - The predicate function to apply
   * @return An Option containing the value if Some and matches the predicate, otherwise None
   */
  filter: <T>(
    option: Option<T>,
    predicate: (value: T) => boolean,
  ): Option<T> => {
    return option.kind === "some" && predicate(option.value)
      ? option
      : safe.none();
  },

  /**
   * Returns true if the Option is Some and matches the predicate
   * @param option - The Option to check
   * @param predicate - The predicate function to apply
   * @return True if the Option is Some and matches the predicate, otherwise false
   */
  exists: <T>(option: Option<T>, predicate: (value: T) => boolean): boolean => {
    return option.kind === "some" && predicate(option.value);
  },

  /**
   * Applies a side effect if the Option is Some
   * @param option - The Option to check
   * @param f - The function to apply if the Option is Some
   */
  for_each: <T>(option: Option<T>, f: (value: T) => void): void => {
    if (option.kind === "some") f(option.value);
  },

  /**
   * Convert to nullable value
   * @param option - The Option to convert
   * @return The value if Some, otherwise null
   */
  to_nullable: <T>(option: Option<T>): T | null => {
    return option.kind === "some" ? option.value : null;
  },
} as const;
