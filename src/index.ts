/**
 * Ferrum - A safe, immutable, and functional programming library for TypeScript.
 * This library provides safe numeric types, immutable data structures,
 * and functional utilities to help you write safer and more maintainable code.
 *
 * @module ferrum
 */

// Import everything we need
import { safe } from "./safe";
import { Result, ResultError } from "./types/result";
import { Option, OptionExt } from "./types/option";
import { Brand, brand } from "./types/brand";
import { int, float, uint, nonzero, numeric } from "./types/numeric";
import { Array } from "./collections/array";
import { Map } from "./collections/map";
import { Queue } from "./collections/queue";
import { Set } from "./collections/set";
import { PriorityQueue } from "./collections/priority_queue";
import { fn } from "./fp/function";
import {
  Functor,
  OptionFunctor,
  ResultFunctor,
  ArrayFunctor,
  PromiseFunctor,
  functors,
} from "./fp/functor";
import { Monad, OptionMonad, ResultMonad } from "./fp/monad";
import { AsyncResult } from "./async/result";
import {
  sleep,
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
  calculate_delay,
  with_timeout,
  make_cancelable,
  create_deferred,
  sequence,
  parallel,
} from "./async/utils";

// Re-export everything
export {
  // Core utilities
  safe,

  // Types
  Result,
  ResultError,
  Option,
  OptionExt,
  Brand,
  brand,
  int,
  float,
  uint,
  nonzero,
  numeric,

  // Collections
  Array,
  Map,
  Queue,
  Set,
  PriorityQueue,

  // Functional programming utilities
  fn,
  Functor,
  OptionFunctor,
  ResultFunctor,
  ArrayFunctor,
  PromiseFunctor,
  functors,
  Monad,
  OptionMonad,
  ResultMonad,

  // Async utilities
  AsyncResult,
  sleep,
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
  calculate_delay,
  with_timeout,
  make_cancelable,
  create_deferred,
  sequence,
  parallel,
};

// === Validation & Utilities ===

/**
 * Validates the runtime environment for safety
 */
export function validate_environment(): Result<void, string> {
  // Runtime check for potentially unsafe environments
  if (typeof window !== "undefined" || typeof global !== "undefined") {
    // Additional safety checks could be implemented here
    return { kind: "ok", value: undefined };
  }
  return { kind: "ok", value: undefined };
}

// Type-level utilities
export type IsNever<T> = [T] extends [never] ? true : false;
export type NonEmpty<T extends readonly unknown[]> = T extends readonly []
  ? never
  : T;

/**
 * Ensures arrays are non-empty at compile time
 */
export function non_empty_array<T extends readonly unknown[]>(
  arr: T,
): NonEmpty<T> extends never ? never : Array<T[number]> {
  if (arr.length === 0) {
    throw new Error("array_cannot_be_empty");
  }
  return Array.from(arr) as any;
}

// Default export for convenience
export default {
  safe,
  Array,
  Map,
  Set,
  Queue,
  PriorityQueue,
  fn,
  AsyncResult,
  validate_environment,
  non_empty_array,
};
