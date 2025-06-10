import { Result } from "./result";
import { safe } from "../safe";

/**
 * Option type for handling nullable values safely
 * Similar to Rust's Option or Haskell's Maybe
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
   */
  from_nullable: <T>(value: T | null | undefined): Option<T> => {
    return value != null ? safe.some(value) : safe.none();
  },

  /**
   * Creates an Option from a predicate
   */
  from_predicate: <T>(
    value: T,
    predicate: (value: T) => boolean,
  ): Option<T> => {
    return predicate(value) ? safe.some(value) : safe.none();
  },

  /**
   * Combines two Options into one
   */
  zip: <T, U>(first: Option<T>, second: Option<U>): Option<[T, U]> => {
    return first.kind === "some" && second.kind === "some"
      ? safe.some([first.value, second.value])
      : safe.none();
  },

  /**
   * Combines an array of Options into one Option of array
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
   */
  map: <T, U>(option: Option<T>, f: (value: T) => U): Option<U> => {
    return option.kind === "some" ? safe.some(f(option.value)) : safe.none();
  },

  /**
   * Returns the value or a default
   */
  get_or_else: <T>(option: Option<T>, defaultValue: T): T => {
    return option.kind === "some" ? option.value : defaultValue;
  },

  /**
   * Converts an Option to a Result
   */
  to_result: <T, E>(option: Option<T>, error: E): Result<T, E> => {
    return option.kind === "some" ? safe.ok(option.value) : safe.error(error);
  },

  /**
   * Chains Option computations
   */
  flat_map: <T, U>(
    option: Option<T>,
    f: (value: T) => Option<U>,
  ): Option<U> => {
    return option.kind === "some" ? f(option.value) : safe.none();
  },

  /**
   * Filters an Option based on a predicate
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
   */
  exists: <T>(option: Option<T>, predicate: (value: T) => boolean): boolean => {
    return option.kind === "some" && predicate(option.value);
  },

  /**
   * Applies a side effect if the Option is Some
   */
  for_each: <T>(option: Option<T>, f: (value: T) => void): void => {
    if (option.kind === "some") f(option.value);
  },

  /**
   * Convert to nullable value
   */
  to_nullable: <T>(option: Option<T>): T | null => {
    return option.kind === "some" ? option.value : null;
  },
} as const;
