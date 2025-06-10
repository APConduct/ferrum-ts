import { Option } from "../types/option";
import { Result } from "../types/result";
import { safe } from "../safe";

/**
 * Monad type class implementation
 * This defines the basic operations for a monad, including map, flat_map, and fold.
 * It is a generic interface that can be implemented by various monads like Option and Result.
 * @template T - The type of the value contained in the monad
 */
export interface Monad<T> {
  map<U>(f: (value: T) => U): Monad<U>;
  flat_map<U>(f: (value: T) => Monad<U>): Monad<U>;
  fold<U>(on_empty: () => U, onValue: (value: T) => U): U;
}

/**
 * Option monad implementation
 * This class wraps an Option type and provides monadic operations like map, flat_map, and fold.
 * It allows chaining operations on optional values, handling the case where a value may be absent (None).
 * @template T - The type of the value contained in the Option
 */
export class OptionMonad<T> implements Monad<T> {
  constructor(private readonly option: Option<T>) {}

  /**
   * Creates an OptionMonad with a Some value
   * @param value - The value to wrap in a Some
   * @returns An OptionMonad containing the value
   */
  static some<T>(value: T): OptionMonad<T> {
    return new OptionMonad(safe.some(value));
  }

  /**
   * Creates an OptionMonad with a None value
   * @returns An OptionMonad representing None
   */
  static none<T>(): OptionMonad<T> {
    return new OptionMonad(safe.none());
  }

  /**
   * Creates an OptionMonad from an existing Option
   * @param option - The Option to wrap
   * @returns An OptionMonad containing the Option
   */
  map<U>(f: (value: T) => U): OptionMonad<U> {
    return new OptionMonad(
      this.option.kind === "some"
        ? safe.some(f(this.option.value))
        : safe.none(),
    );
  }

  /**
   * Applies a function that returns an OptionMonad to the value if Some, otherwise returns None
   * @param f - The function to apply to the value
   * @returns An OptionMonad containing the result of the function or None
   */
  flat_map<U>(f: (value: T) => OptionMonad<U>): OptionMonad<U> {
    return this.option.kind === "some"
      ? f(this.option.value)
      : OptionMonad.none();
  }

  /**
   * Returns the value if Some, otherwise a default value
   * @param default_value - The default value to return if the Option is None
   * @return The value if Some, otherwise the default value
   */
  fold<U>(on_none: () => U, on_some: (value: T) => U): U {
    return this.option.kind === "some" ? on_some(this.option.value) : on_none();
  }
}

/**
 * Result monad implementation
 * This class wraps a Result type and provides monadic operations like map, flat_map, and fold.
 * It allows chaining operations on results, handling both success (Ok) and error (Error) cases.
 * @template T - The type of the successful value
 * @template E - The type of the error value
 */
export class ResultMonad<T, E> implements Monad<T> {
  constructor(private readonly result: Result<T, E>) {}

  /**
   * Creates a ResultMonad with a successful value
   * @param value - The value to wrap in an Ok
   * @returns A ResultMonad containing the value
   */
  static ok<T, E>(value: T): ResultMonad<T, E> {
    return new ResultMonad(safe.ok(value));
  }

  /**
   * Creates a ResultMonad with an error
   * @param error - The error to wrap in an Error
   * @returns A ResultMonad containing the error
   */
  static error<T, E>(error: E): ResultMonad<T, E> {
    return new ResultMonad(safe.error(error));
  }

  /**
   * Creates a ResultMonad from an existing Result
   * @param result - The Result to wrap
   * @returns A ResultMonad containing the Result
   */
  map<U>(f: (value: T) => U): ResultMonad<U, E> {
    return new ResultMonad(
      this.result.kind === "ok" ? safe.ok(f(this.result.value)) : this.result,
    );
  }

  /**
   * Applies a function that returns a ResultMonad to the value if Ok, otherwise returns an error
   * @param f - The function to apply to the value
   * @returns A ResultMonad containing the result of the function or an error
   */
  flat_map<U>(f: (value: T) => ResultMonad<U, E>): ResultMonad<U, E> {
    return this.result.kind === "ok"
      ? f(this.result.value)
      : ResultMonad.error(this.result.error);
  }

  /**
   * Folds the ResultMonad into a single value based on the success or error case
   * @param onError - The function to call if the Result is an error
   * @param onOk - The function to call if the Result is successful
   * @returns The result of calling either onError or onOk
   */
  fold<U>(onError: (error: E) => U, onOk: (value: T) => U): U {
    return this.result.kind === "ok"
      ? onOk(this.result.value)
      : onError(this.result.error);
  }

  /**
   * Maps the error of the ResultMonad to a new type
   * @param f - The function to apply to the error
   * @returns A new ResultMonad with the mapped error
   */
  map_error<F>(f: (error: E) => F): ResultMonad<T, F> {
    return new ResultMonad(
      this.result.kind === "ok"
        ? this.result
        : safe.error(f(this.result.error)),
    );
  }
}
