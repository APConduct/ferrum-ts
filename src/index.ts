// console.log("the start of something crusty");

/** Branded types for compilw-tiime safety. */
type Brand<T, B> = T & { readonly __brand: B };

/**
 * Adorably named namespace for safe numeric types
 * that prevent NaN/Infinity issues.
 */
/** safe type for ints, which are finite integers. */
export type int = Brand<number, "int">;
/** safe type for floats, which are finite numbers. */
export type float = Brand<number, "float">;

/** Type for error-handling without exceptions. */
export type Result<T, E = string> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "error"; readonly error: E };

/** Type for optional values, similar to Option in Rust. */
export type Option<T> =
  | { readonly kind: "some"; readonly value: T }
  | { readonly kind: "none" };

/** Module for the factory functions for ferrum bib primatives */
export const safe = {
  /**
   * Creates a safe integer type.
   * @param n - The number to check.
   * @returns A Result containing the safe integer or an error.
   */
  int: (n: number): Result<int, "not_integer" | "not_finite"> => {
    if (!Number.isFinite(n)) return { kind: "error", error: "not_finite" };
    if (!Number.isInteger(n)) return { kind: "error", error: "not_integer" };
    return { kind: "ok", value: n as int };
  },

  /**
   * Creates a safe float type.
   * @param n - The number to check.
   * @returns A Result containing the safe float or an error.
   */
  float: (n: number): Result<float, "not_finite"> => {
    if (!Number.isFinite(n)) return { kind: "error", error: "not_finite" };
    return { kind: "ok", value: n as float };
  },

  /**
   * Converts a value to an Option type
   * without prototype pollution.
   * @param s - The value to check.
   * @returns An Option containing the string or none.
   */
  string: (s: unknown): Option<string> => {
    if (typeof s === "string") return { kind: "some", value: s };
    return { kind: "none" };
  },

  // Result factory constructors

  /** Creates a Result without an error.
   * This is useful for functions that always succeed.
   * @param value - The value to return.
   * @return A Result with the value.
   * @example
   * ```typescript
   * import { safe } from "ferrum";
   * const result = safe.ok(42);
   * console.log(result); // { kind: "ok", value: 42 }
   * ```
   */
  ok: <T>(value: T): Result<T, never> => ({
    kind: "ok",
    value,
  }),

  /** Creates a Result with an error. */
  error: <E>(error: E): Result<never, E> => ({
    kind: "error",
    error,
  }),

  /** Creates an Option with a value. */
  some: <T>(value: T): Option<T> => ({
    kind: "some",
    value,
  }),

  /** Creates an Option without a value. */
  none: <T>(): Option<T> => ({
    kind: "none",
  }),
} as const;

/**
 * A simple immutable array wrapper that prevents prototype pollution.
 */
export class Array<T> {
  /** Private constructor to enforce immutability. */
  private constructor(private readonly items: readonly T[]) {}

  /** creates a new Array instance from an parameterized array.
   * This is a defensive copy to prevent prototype pollution.
   * @param items - The items to initialize the array with.
   * @return A new Array instance containing the items.
   * @example
   * ```typescript
   * import { Array } from "ferrum";
   * const arr = Array.from([1, 2, 3]);
   * console.log(arr.to_array()); // Outputs: [1, 2, 3]
   * ```
   * @remarks
   * This method creates a new instance of the Array class
   */
  static from<T>(items: readonly T[]): Array<T> {
    return new Array([...items]); // defensive copy
  }
  /** override the type of the Array class */
  static isArray<T>(value: unknown): value is Array<T> {
    return value instanceof Array;
  }

  static empty(): Array<unknown> {
    return new Array([]);
  }

  map<U>(f: (items: T) => U): Array<U> {
    return Array.from(this.items.map(f));
  }

  filter(predicate: (item: T) => boolean): Array<T> {
    return Array.from(this.items.filter(predicate));
  }

  fold<U>(initial: U, f: (acc: U, item: T) => U): U {
    return this.items.reduce(f, initial);
  }

  get(index: int): Option<T> {
    const idx = index as number;
    if (idx >= 0 && this.items.length) {
      return safe.some(this.items[idx]);
    }
    return safe.none();
  }

  length(): int {
    return this.items.length as int;
  }

  /** converts to a native array only when explicitly requested */
  to_array(): readonly T[] {
    return [...this.items];
  }
}

export class Record<K extends string, V> {
  private constructor(private readonly data: globalThis.Record<K, V>) {}

  static from<K extends string, V>(obj: globalThis.Record<K, V>): Record<K, V> {
    // Defensive copy and prototype safety
    const clean = Object.create(null);
    for (const [key, val] of Object.entries(obj)) {
      clean[key] = val;
    }
    return new Record(clean);
  }

  get(key: K): Option<V> {
    const val = this.data[key];
    return val !== undefined ? safe.some(val) : safe.none<V>();
  }

  /** Returns a new Record with the key set to the value. */
  set(key: K, val: V): Record<K | any, V> {
    function to_any(s: string): any {
      return s as any;
    }
    const newData = { ...this.data, [to_any(key)]: val };
    return Record.from(newData);
  }

  keys(): Array<K> {
    return Array.from(Object.keys(this.data) as K[]);
  }

  values(): Array<V> {
    return Array.from(Object.values(this.data));
  }
}

// ==== FUNCTIONAL UTILS ====

const fn = {
  /** Functional composition
   * Composes two functions into one.
   * @param f - The second function to apply.
   * @param g - The first function to apply.
   * @return A new function that applies g first, then f.
   * @param a - The input to the first function.
   * @return The result of applying f to the result of g.
   * @example
   * ```typescript
   * import { fn } from "ferrum";
   * const addOne = (x: number) => x + 1;
   * const double = (x: number) => x * 2;
   * const addOneThenDouble = fn.compose(double, addOne);
   * console.log(addOneThenDouble(3)); // Outputs: 8
   * ```
   */
  compose:
    <A, B, C>(f: (b: B) => C, g: (a: A) => B) =>
    (a: A): C =>
      f(g(a)),

  /** Applies a function to a value and returns a new function that can be used for further chaining.
   * @param f - The function to apply.
   * @return A new function that takes a value and applies f to it.
   * @example
   * ```typescript
   * import { fn } from "ferrum";
   * const addOne = (x: number) => x + 1;
   * const result = fn.pipe(5).then(addOne).get();
   * console.log(result); // Outputs: 6
   * ```
   */
  pipe: <T>(value: T) => ({
    then: <U>(f: (value: T) => U) => fn.pipe(f(value)),
    get: () => value,
  }),

  /** Awaits a promise and returns a new function that can be used for further chaining.
   * @param result - The Result to await.
   * @param f - The function to apply to the value if the Result is ok.
   * @return A new function that returns a Result with the awaited value or an error.
   * @example
   * ```typescript
   * import { fn, safe } from "ferrum";
   * const asyncAddOne = async (x: number) => x + 1;
   * const result = fn.async.map(safe.ok(5), asyncAddOne);
   * result.then((res) => console.log(res)); // Outputs: { kind: "ok", value: 6 }
   * ```
   */
  async: {
    map: async <T, U>(
      result: Result<T, string>,
      f: (value: T) => Promise<U>,
    ): Promise<Result<U, string>> => {
      if (result.kind === "error") return result;
      try {
        const value = await f(result.value);
        return safe.ok(value);
      } catch (error) {
        return safe.error(
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },
  },
} as const;

/** EXAMPLES */

/** example 1: safe integer number creation */
function safe_arithmetic() {
  const a = safe.int(42);
  const b = safe.int(7);

  return a.kind === "ok" && b.kind === "ok"
    ? safe.int((a.value as number) + (b.value as number))
    : safe.error("Invalid integers integer for arithmetic");
}

// console.log(typeof [..."hello", "world"][0]);
// console.log("here is a ferrum integer");
// console.log(safe.int(42));
// console.log(typeof safe.int)

// const addOne = (x: number) => x + 1;
// const result = fn.pipe(5).then(addOne).get();
// console.log(result); // Outputs: 6

// const asyncAddOne = async (x: number) => x + 1;
// const result = fn.async.map(safe.ok(5), asyncAddOne);
// result.then((res) => console.log(res)); // Outputs: { kind: "ok", value: 6 }

// Example 2: Safe data processing
function process_data() {
  const numbers = Array.from([1, 2, 3, 4, 5]);
  return numbers
    .map((x) => x * 2)
    .filter((x) => x > 5)
    .fold(0, (acc, x) => acc + x);
}

// Example 3: Safe object manipulation
function user_management() {
  type User = { name: string; age: int };
  // Explicitly define the type parameter to allow any string keys
  const users = Record.from<string, User>({
    alice: { name: "Alice", age: 30 as int },
    bob: { name: "Bob", age: 25 as int },
  });
  const alice = users.get("alice");
  if (alice.kind === "some") {
    console.log(alice.value.name);
  }
  return users.set("charlie", { name: "Charlie", age: 35 as int });
}

// Example 4: Functional data pipeline
function process_user_data() {
  const raw_data = [
    { name: "Alice", age_str: "30", active: true },
    { name: "Bob", age_str: "invalid", active: false },
    { name: "Charlie", age_str: "25", active: true },
  ];

  const process_user = (raw: (typeof raw_data)[0]) => {
    const age_result = safe.int(parseInt(raw.age_str));
    if (age_result.kind === "error")
      return safe.none<{ name: string; age: int; active: boolean }>();
    return safe.some({
      name: raw.name,
      age: age_result.value,
      active: raw.active,
    });
  };

  return Array.from(raw_data)
    .map(process_user)
    .filter((user) => user.kind === "some")
    .map((user) => (user.kind === "some" ? user.value : null!))
    .filter((user) => user.active);
}

// Example 5: Result chaining (like Rust's ? operator)
function chain_operations(input: string): Result<int, string> {
  const parse_result = safe.int(parseInt(input));
  if (parse_result.kind === "error") return safe.error("failed_to_parse");
  const doubled = safe.int((parse_result.value as number) * 2);
  if (doubled.kind === "error") return safe.error("overflow");
  if ((doubled.value as number) > 100) {
    return safe.error("value_too_large");
  }
  return doubled;
}

// Example 6: Working with nested data
function nested_data_example() {
  type Config = {
    database: {
      host: string;
      port: int;
      timeout: float;
    };
    features: Array<string>;
  };

  const create_config = (
    host: string,
    port_str: string,
    timeout_str: string,
    features: readonly string[],
  ): Result<Config, string> => {
    const port_result = safe.int(parseInt(port_str));
    const timeout_result = safe.float(parseFloat(timeout_str));
    if (port_result.kind === "error") return safe.error("invalid_port");
    if (timeout_result.kind === "error") return safe.error("invalid_timeout");
    return safe.ok({
      database: {
        host,
        port: port_result.value,
        timeout: timeout_result.value,
      },
      features: Array.from(features),
    });
  };

  return create_config("localhost", "5432", "30.5", ["auth", "logging"]);
}

// === ISOLATION LAYER ===

// Prevent access to global JavaScript objects
const FORBIDDEN_GLOBALS = [
  "window",
  "document",
  "global",
  "globalThis",
  "eval",
  "Function",
  "setTimeout",
  "setInterval",
] as const;

// Runtime check (in development mode)
export function validate_environment(): Result<void, string> {
  if (typeof window !== "undefined") {
    // Browser environment - could add restrictions
    return safe.ok(undefined);
  } // Additional safety checks could go here
  return safe.ok(undefined);
}

// === COMPILE-TIME UTILITIES ===

// Type-level programming for additional safety
type IsNever<T> = [T] extends [never] ? true : false;
type NonEmpty<T extends readonly unknown[]> = T extends readonly [] ? never : T;

// Ensure arrays are non-empty at compile time
export function non_empty_array<T extends readonly unknown[]>(
  arr: T,
): NonEmpty<T> extends never ? never : Array<T[number]> {
  if (arr.length === 0) {
    throw new Error("array_cannot_be_empty");
  }
  return Array.from(arr) as any;
}

// === EXPORT CONTROLLED API ===

// Users only get access to these safe operations
export const API = {
  // Core types and constructors
  safe, // Data structures
  Array,
  Record, // Functional utilities
  fn, // Safe constructors
  non_empty_array, // Environment validation
  validate_environment, // Type utilities for advanced users
  types: {} as {
    Result: Result<unknown, unknown>;
    Option: Option<unknown>;
    Int: int;
    Float: float;
  },
} as const;

// Default export prevents importing internals
export default API;
