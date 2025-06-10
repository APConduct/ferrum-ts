/**
 * Function composition and transformation utilities
 */

/** Utility types for function composition */
type AnyFn = (...args: any[]) => any;

/** Ensures all types in a tuple are functions */
type AllFunctions<T extends any[]> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
};

/** Get the first parameter type of a function */
type FirstParam<F> = F extends (first: infer P, ...args: any[]) => any
  ? P
  : never;

/** Get the return type of a function */
type LastReturn<F> = F extends (...args: any[]) => infer R ? R : never;

/** Get all but the first parameter types of a function */
type RestParams<F> = F extends (first: any, ...rest: infer R) => any
  ? R
  : never;

/**
 * Type-safe function composition utilities
 */
export const fn = {
  /**
   * Compose functions from right to left
   * compose(f, g, h)(x) = f(g(h(x)))
   * @param fns - Functions to compose
   * @return A function that takes the parameters of the first function and returns the result of the composed functions
   * @template T - Tuple of functions to compose
   */
  compose: <T extends readonly AnyFn[]>(...fns: [...T]) => {
    return (
      ...args: Parameters<T[0]>
    ): ReturnType<
      T[T["length"] extends number
        ? T["length"] extends 0
          ? 0
          : number extends T["length"]
            ? number
            : T["length"] extends 1
              ? 0
              : T["length"] extends 2
                ? 1
                : T["length"] extends 3
                  ? 2
                  : T["length"] extends 4
                    ? 3
                    : T["length"] extends 5
                      ? 4
                      : number
        : 0]
    > => {
      return fns.reduceRight((result, fn, index) => {
        return index === fns.length - 1 ? fn(...args) : fn(result);
      }, undefined as any);
    };
  },

  /**
   * Pipe functions from left to right
   * pipe(f, g, h)(x) = h(g(f(x)))
   * @param fns - Functions to pipe
   * @return A function that takes the parameters of the first function and returns the result of the piped functions
   * @template T - Tuple of functions to pipe
   */
  pipe: <T extends readonly AnyFn[]>(...fns: [...T]) => {
    return (
      ...args: Parameters<T[0]>
    ): ReturnType<
      T[T["length"] extends number
        ? T["length"] extends 0
          ? 0
          : number extends T["length"]
            ? number
            : T["length"] extends 1
              ? 0
              : T["length"] extends 2
                ? 1
                : T["length"] extends 3
                  ? 2
                  : T["length"] extends 4
                    ? 3
                    : T["length"] extends 5
                      ? 4
                      : number
        : 0]
    > => {
      return fns.reduce((result, fn, index) => {
        return index === 0 ? fn(...args) : fn(result);
      }, undefined as any);
    };
  },

  /**
   * Curry a function
   * curry((a, b, c) => d)(a)(b)(c) = d
   * @param fn - Function to curry
   * @return A curried version of the function
   * @template F - Function to curry
   */
  curry: <F extends AnyFn>(fn: F) => {
    const curried = (...args: any[]) => {
      if (args.length >= fn.length) {
        return fn(...args);
      }
      return (...moreArgs: any[]) => curried(...args, ...moreArgs);
    };
    return curried as CurriedFunction<F>;
  },

  /**
   * Partial application from the left
   * partial(f, a, b)(c) = f(a, b, c)
   * @param fn - Function to partially apply
   * @param args - Arguments to partially apply
   * @return A function that takes the remaining parameters and returns the result of the original function
   * @template F - Function to partially apply
   */
  partial: <F extends AnyFn>(fn: F, ...args: Partial<Parameters<F>>) => {
    return (...moreArgs: any[]) => fn(...args, ...moreArgs);
  },

  /**
   * Memoize a function
   * memoize(f)(a, b) = cached result if available, otherwise f(a, b)
   * @param fn - Function to memoize
   * @param key_fn - Function to generate cache keys from arguments
   * @return A memoized version of the function
   */
  memoize: <F extends AnyFn>(
    fn: F,
    key_fn: (...args: Parameters<F>) => string = (...args) =>
      JSON.stringify(args),
  ): F => {
    const cache = new Map<string, ReturnType<F>>();

    return ((...args: Parameters<F>): ReturnType<F> => {
      const key = key_fn(...args);
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as F;
  },

  /**
   * Debounce a function
   * debounce(f, wait)(a, b) = waits for `wait` milliseconds before calling f(a, b)
   * @param fn - Function to debounce
   * @param wait - Time in milliseconds to wait before calling the function
   * @return A debounced version of the function
   * @template F - Function to debounce
   */
  debounce: <F extends AnyFn>(fn: F, wait: number): F => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return ((...args: Parameters<F>): void => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        fn(...args);
        timeout = null;
      }, wait);
    }) as F;
  },

  /**
   * Throttle a function
   * throttle(f, wait)(a, b) = calls f(a, b) at most once every `wait` milliseconds
   * @param fn - Function to throttle
   * @param wait - Time in milliseconds to wait before allowing the next call
   * @return A throttled version of the function
   * @template F - Function to throttle
   */
  throttle: <F extends AnyFn>(fn: F, wait: number): F => {
    let last = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return ((...args: Parameters<F>): void => {
      const now = Date.now();

      if (last && now < last + wait) {
        // If there's a timeout already scheduled, don't do anything
        if (timeout) return;

        // Schedule the next execution
        timeout = setTimeout(() => {
          last = now;
          fn(...args);
          timeout = null;
        }, wait);
      } else {
        // If enough time has elapsed, execute immediately
        last = now;
        fn(...args);
      }
    }) as F;
  },
} as const;

/**
 * Type helper for curried functions
 * This type recursively transforms a function type into a curried version.
 * @template F - The function type to transform
 */
type CurriedFunction<F extends AnyFn> = F extends (arg: infer A) => infer R
  ? (arg: A) => R
  : F extends (arg: infer A, ...args: infer REST) => infer R
    ? (arg: A) => CurriedFunction<(...args: REST) => R>
    : never;

/**
 * Helper type for partially applied functions
 * This type represents a function that takes the remaining parameters of a function after some have been applied.
 * @template F - The function type to partially apply
 */
type PartialFunction<F extends AnyFn, Applied extends any[]> = (
  ...args: RestParams<F>
) => ReturnType<F>;
