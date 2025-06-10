import { Option } from "../types/option";
import { Result } from "../types/result";
import { Array } from "../collections/array";
import { safe } from "../safe";

/**
 * Functor type class
 * A functor is a type that can be mapped over
 * @template T - The type of the value contained in the functor
 */
export interface Functor<T> {
  /**
   * Maps a function over the functor's value
   * @param f - The function to apply to the value
   * @returns A new functor containing the mapped value
   */
  map<U>(f: (value: T) => U): Functor<U>;
}

/**
 * Option functor implementation
 * @template T - The type of the value contained in the Option
 */
export class OptionFunctor<T> implements Functor<T> {
  constructor(private readonly value: Option<T>) {}

  /**
   * Creates an OptionFunctor with a Some value
   * @param value - The value to wrap in a Some
   * @returns An OptionFunctor containing the value
   */
  static some<T>(value: T): OptionFunctor<T> {
    return new OptionFunctor(safe.some(value));
  }

  /**
   * Creates an OptionFunctor with a None value
   * @returns An OptionFunctor representing None
   */
  static none<T>(): OptionFunctor<T> {
    return new OptionFunctor(safe.none());
  }

  /**
   * Creates an OptionFunctor from an existing Option
   * @param option - The Option to wrap
   * @returns An OptionFunctor containing the Option
   */
  map<U>(f: (value: T) => U): OptionFunctor<U> {
    return new OptionFunctor(
      this.value.kind === "some" ? safe.some(f(this.value.value)) : safe.none(),
    );
  }

  /**
   * Returns the value if Some, otherwise a default value
   * @param default_value - The default value to return if the Option is None
   * @return The value if Some, otherwise the default value
   */
  get_or_else(default_value: T): T {
    return this.value.kind === "some" ? this.value.value : default_value;
  }

  /**
   * Converts the OptionFunctor to an Option
   * @returns The underlying Option
   */
  to_option(): Option<T> {
    return this.value;
  }
}

/**
 * Result functor implementation
 * @template T - The type of the successful value
 * @template E - The type of the error value
 */
export class ResultFunctor<T, E> implements Functor<T> {
  constructor(private readonly value: Result<T, E>) {}

  /**
   * Creates a ResultFunctor with a successful value
   * @param value - The value to wrap in an Ok
   * @returns A ResultFunctor containing the value
   * @template T - The type of the successful value
   * @template E - The type of the error value
   */
  static ok<T, E>(value: T): ResultFunctor<T, E> {
    return new ResultFunctor(safe.ok(value));
  }

  /**
   * Creates a ResultFunctor with an error
   * @param error - The error to wrap in an Error
   * @returns A ResultFunctor containing the error
   * @template T - The type of the successful value
   * @template E - The type of the error value
   */
  static error<T, E>(error: E): ResultFunctor<T, E> {
    return new ResultFunctor(safe.error(error));
  }

  /**
   * Creates a ResultFunctor from an existing Result
   * @param result - The Result to wrap
   * @returns A ResultFunctor containing the Result
   */
  map<U>(f: (value: T) => U): ResultFunctor<U, E> {
    return new ResultFunctor(
      this.value.kind === "ok" ? safe.ok(f(this.value.value)) : this.value,
    );
  }

  /**
   * Maps an error to a new type
   * @param f - The function to apply to the error
   * @returns A new ResultFunctor with the mapped error
   * @template F - The type of the new error value
   */
  map_error<F>(f: (error: E) => F): ResultFunctor<T, F> {
    return new ResultFunctor(
      this.value.kind === "ok" ? this.value : safe.error(f(this.value.error)),
    );
  }

  /**
   * Returns the successful value or a default
   * @param default_value - The default value to return if the Result is an error
   * @returns The successful value if Ok, otherwise the default value
   */
  to_result(): Result<T, E> {
    return this.value;
  }
}

/**
 * Array functor implementation
 * @template T - The type of the values contained in the array
 */
export class ArrayFunctor<T> implements Functor<T> {
  constructor(private readonly values: Array<T>) {}

  /**
   * Creates an ArrayFunctor from an array of values
   * @param values - The array of values to wrap
   * @returns An ArrayFunctor containing the values
   */
  static from<T>(values: T[]): ArrayFunctor<T> {
    return new ArrayFunctor(Array.from(values));
  }

  /**
   * Creates an ArrayFunctor with a single value
   * @param value - The value to wrap in an ArrayFunctor
   * @returns An ArrayFunctor containing the value
   */
  map<U>(f: (value: T) => U): ArrayFunctor<U> {
    return new ArrayFunctor(this.values.map(f));
  }

  /**
   * Filters the values in the ArrayFunctor based on a predicate
   * @param predicate - The function to test each value
   * @return A new ArrayFunctor containing the values that match the predicate
   */
  filter(predicate: (value: T) => boolean): ArrayFunctor<T> {
    return new ArrayFunctor(this.values.filter(predicate));
  }

  /**
   * Reduces the values in the ArrayFunctor to a single value
   * @param f - The function to apply to each value
   * @param initial - The initial value for the reduction
   * @return The reduced value
   */
  reduce<U>(f: (acc: U, value: T) => U, initial: U): U {
    return this.values.fold(initial, f);
  }

  /**
   * Converts the ArrayFunctor to an array
   * @return An array containing the values in the ArrayFunctor
   */
  to_array(): Array<T> {
    return this.values;
  }
}

/**
 * Promise functor implementation
 * @template T - The type of the value contained in the Promise
 * @description
 * A functor that wraps a Promise and allows mapping over its resolved value.
 */
export class PromiseFunctor<T> implements Functor<T> {
  constructor(private readonly promise: Promise<T>) {}

  /**
   * Creates a PromiseFunctor with a resolved value
   * @param value - The value to wrap in a Promise
   * @returns A PromiseFunctor containing the resolved value
   */
  static of<T>(value: T): PromiseFunctor<T> {
    return new PromiseFunctor(Promise.resolve(value));
  }

  /**
   * Creates a PromiseFunctor from a Promise
   * @param promise - The Promise to wrap
   * @returns A PromiseFunctor containing the Promise
   */
  static from_promise<T>(promise: Promise<T>): PromiseFunctor<T> {
    return new PromiseFunctor(promise);
  }

  /**
   * Maps a function over the resolved value of the Promise
   * @param f - The function to apply to the resolved value
   * @returns A new PromiseFunctor containing the mapped value
   */
  map<U>(f: (value: T) => U): PromiseFunctor<U> {
    return new PromiseFunctor(this.promise.then(f));
  }

  /**
   * Flat maps a function that returns a Promise over the resolved value
   * @param f - The function to apply to the resolved value, returning a Promise
   * @return A new PromiseFunctor containing the resolved value of the inner Promise
   * @template U - The type of the value returned by the inner Promise
   */
  flat_map<U>(f: (value: T) => Promise<U>): PromiseFunctor<U> {
    return new PromiseFunctor(this.promise.then(f));
  }

  /**
   * Catches errors from the Promise and maps them to a new type
   * @param f - The function to apply to the error
   * @returns A new PromiseFunctor containing the resolved value or the mapped error
   * @template U - The type of the error value
   */
  catch<U>(f: (error: any) => U): PromiseFunctor<T | U> {
    return new PromiseFunctor(this.promise.catch(f));
  }

  /**
   * Converts the PromiseFunctor to a Promise
   * @returns The underlying Promise
   */
  to_promise(): Promise<T> {
    return this.promise;
  }
}

// Example usage of functors with type composition
export const functors = {
  /**
   * Compose multiple functors
   * @param functors - An array of functors to compose
   * @return A new functor that contains all the provided functors
   * @template T - The type of the values contained in the functors
   */
  compose: <T>(...functors: Functor<T>[]): ArrayFunctor<Functor<T>> => {
    return new ArrayFunctor(Array.from(functors.map((f) => f)));
  },

  /**
   * Lift a function to work with functors
   * @param f - The function to lift
   * @return A new function that takes a functor and applies the lifted function to its value
   * @template T - The type of the value contained in the functor
   * @template U - The type of the value returned by the lifted function
   */
  lift:
    <T, U>(f: (value: T) => U) =>
    (functor: Functor<T>): Functor<U> =>
      functor.map(f),

  /**
   * Sequence an array of functors into a functor of array
   * @param functors - An array of functors to sequence
   * @return A new functor containing an array of the values from the functors
   * @template T - The type of the values contained in the functors
   */
  sequence: <T>(functors: Functor<T>[]): ArrayFunctor<Functor<T>> => {
    return ArrayFunctor.from(functors).map((f) => f);
  },
};
