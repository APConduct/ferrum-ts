import { Option } from "../types/option";
import { Result } from "../types/result";
import { safe } from "../safe";

/**
 * Monad type class implementation
 */
export interface Monad<T> {
  map<U>(f: (value: T) => U): Monad<U>;
  flat_map<U>(f: (value: T) => Monad<U>): Monad<U>;
  fold<U>(on_empty: () => U, onValue: (value: T) => U): U;
}

/**
 * Option monad implementation
 */
export class OptionMonad<T> implements Monad<T> {
  constructor(private readonly option: Option<T>) {}

  static some<T>(value: T): OptionMonad<T> {
    return new OptionMonad(safe.some(value));
  }

  static none<T>(): OptionMonad<T> {
    return new OptionMonad(safe.none());
  }

  map<U>(f: (value: T) => U): OptionMonad<U> {
    return new OptionMonad(
      this.option.kind === "some"
        ? safe.some(f(this.option.value))
        : safe.none(),
    );
  }

  flat_map<U>(f: (value: T) => OptionMonad<U>): OptionMonad<U> {
    return this.option.kind === "some"
      ? f(this.option.value)
      : OptionMonad.none();
  }

  fold<U>(onNone: () => U, onSome: (value: T) => U): U {
    return this.option.kind === "some" ? onSome(this.option.value) : onNone();
  }
}

/**
 * Result monad implementation
 */
export class ResultMonad<T, E> implements Monad<T> {
  constructor(private readonly result: Result<T, E>) {}

  static ok<T, E>(value: T): ResultMonad<T, E> {
    return new ResultMonad(safe.ok(value));
  }

  static error<T, E>(error: E): ResultMonad<T, E> {
    return new ResultMonad(safe.error(error));
  }

  map<U>(f: (value: T) => U): ResultMonad<U, E> {
    return new ResultMonad(
      this.result.kind === "ok" ? safe.ok(f(this.result.value)) : this.result,
    );
  }

  flat_map<U>(f: (value: T) => ResultMonad<U, E>): ResultMonad<U, E> {
    return this.result.kind === "ok"
      ? f(this.result.value)
      : ResultMonad.error(this.result.error);
  }

  fold<U>(onError: (error: E) => U, onOk: (value: T) => U): U {
    return this.result.kind === "ok"
      ? onOk(this.result.value)
      : onError(this.result.error);
  }

  map_error<F>(f: (error: E) => F): ResultMonad<T, F> {
    return new ResultMonad(
      this.result.kind === "ok"
        ? this.result
        : safe.error(f(this.result.error)),
    );
  }
}
