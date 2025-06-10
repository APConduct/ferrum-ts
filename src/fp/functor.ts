import { Option } from "../types/option";
import { Result } from "../types/result";
import { Array } from "../collections/array";
import { safe } from "../safe";

/**
 * Functor type class
 * A functor is a type that can be mapped over
 */
export interface Functor<T> {
  map<U>(f: (value: T) => U): Functor<U>;
}

/**
 * Option functor implementation
 */
export class OptionFunctor<T> implements Functor<T> {
  constructor(private readonly value: Option<T>) {}

  static some<T>(value: T): OptionFunctor<T> {
    return new OptionFunctor(safe.some(value));
  }

  static none<T>(): OptionFunctor<T> {
    return new OptionFunctor(safe.none());
  }

  map<U>(f: (value: T) => U): OptionFunctor<U> {
    return new OptionFunctor(
      this.value.kind === "some" ? safe.some(f(this.value.value)) : safe.none(),
    );
  }

  // Additional utility methods
  get_or_else(defaultValue: T): T {
    return this.value.kind === "some" ? this.value.value : defaultValue;
  }

  to_option(): Option<T> {
    return this.value;
  }
}

/**
 * Result functor implementation
 */
export class ResultFunctor<T, E> implements Functor<T> {
  constructor(private readonly value: Result<T, E>) {}

  static ok<T, E>(value: T): ResultFunctor<T, E> {
    return new ResultFunctor(safe.ok(value));
  }

  static error<T, E>(error: E): ResultFunctor<T, E> {
    return new ResultFunctor(safe.error(error));
  }

  map<U>(f: (value: T) => U): ResultFunctor<U, E> {
    return new ResultFunctor(
      this.value.kind === "ok" ? safe.ok(f(this.value.value)) : this.value,
    );
  }

  // Additional utility methods
  map_error<F>(f: (error: E) => F): ResultFunctor<T, F> {
    return new ResultFunctor(
      this.value.kind === "ok" ? this.value : safe.error(f(this.value.error)),
    );
  }

  to_result(): Result<T, E> {
    return this.value;
  }
}

/**
 * Array functor implementation
 */
export class ArrayFunctor<T> implements Functor<T> {
  constructor(private readonly values: Array<T>) {}

  static from<T>(values: T[]): ArrayFunctor<T> {
    return new ArrayFunctor(Array.from(values));
  }

  map<U>(f: (value: T) => U): ArrayFunctor<U> {
    return new ArrayFunctor(this.values.map(f));
  }

  // Additional array-specific methods
  filter(predicate: (value: T) => boolean): ArrayFunctor<T> {
    return new ArrayFunctor(this.values.filter(predicate));
  }

  reduce<U>(f: (acc: U, value: T) => U, initial: U): U {
    return this.values.fold(initial, f);
  }

  to_array(): Array<T> {
    return this.values;
  }
}

/**
 * Promise functor implementation
 */
export class PromiseFunctor<T> implements Functor<T> {
  constructor(private readonly promise: Promise<T>) {}

  static of<T>(value: T): PromiseFunctor<T> {
    return new PromiseFunctor(Promise.resolve(value));
  }

  static from_promise<T>(promise: Promise<T>): PromiseFunctor<T> {
    return new PromiseFunctor(promise);
  }

  map<U>(f: (value: T) => U): PromiseFunctor<U> {
    return new PromiseFunctor(this.promise.then(f));
  }

  // Additional promise-specific methods
  flat_map<U>(f: (value: T) => Promise<U>): PromiseFunctor<U> {
    return new PromiseFunctor(this.promise.then(f));
  }

  catch<U>(f: (error: any) => U): PromiseFunctor<T | U> {
    return new PromiseFunctor(this.promise.catch(f));
  }

  to_promise(): Promise<T> {
    return this.promise;
  }
}

// Example usage of functors with type composition
export const functors = {
  /**
   * Compose multiple functors
   */
  compose: <T>(...functors: Functor<T>[]): ArrayFunctor<Functor<T>> => {
    return new ArrayFunctor(Array.from(functors.map((f) => f)));
  },

  /**
   * Lift a function to work with functors
   */
  lift:
    <T, U>(f: (value: T) => U) =>
    (functor: Functor<T>): Functor<U> =>
      functor.map(f),

  /**
   * Sequence an array of functors into a functor of array
   */
  sequence: <T>(functors: Functor<T>[]): ArrayFunctor<Functor<T>> => {
    return ArrayFunctor.from(functors).map((f) => f);
  },
};
