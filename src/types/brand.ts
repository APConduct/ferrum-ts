/**
 * Branded type utility for compile-time type-safety
 * @template T The underlying type
 * @template B The brand identifier
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Function to create branded type constructors
 * @template T The underlying type
 * @template B The brand identifier
 */
export function brand<T, B>(value: T): Brand<T, B> {
  return value as Brand<T, B>;
}
