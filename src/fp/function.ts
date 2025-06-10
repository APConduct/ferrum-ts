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
   */
  partial: <F extends AnyFn>(fn: F, ...args: Partial<Parameters<F>>) => {
    return (...moreArgs: any[]) => fn(...args, ...moreArgs);
  },

  /**
   * Memoize a function
   */
  memoize: <F extends AnyFn>(
    fn: F,
    keyFn: (...args: Parameters<F>) => string = (...args) =>
      JSON.stringify(args),
  ): F => {
    const cache = new Map<string, ReturnType<F>>();

    return ((...args: Parameters<F>): ReturnType<F> => {
      const key = keyFn(...args);
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
 */
type CurriedFunction<F extends AnyFn> = F extends (arg: infer A) => infer R
  ? (arg: A) => R
  : F extends (arg: infer A, ...args: infer REST) => infer R
    ? (arg: A) => CurriedFunction<(...args: REST) => R>
    : never;

/**
 * Helper type for partially applied functions
 */
type PartialFunction<F extends AnyFn, Applied extends any[]> = (
  ...args: RestParams<F>
) => ReturnType<F>;
