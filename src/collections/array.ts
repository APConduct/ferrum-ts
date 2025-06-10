import { Option } from "../types/option";
import { safe } from "../safe";
import { int } from "../types/numeric";

/**
 * A safe, immutable array implementation with functional programming utilities
 * @template T - The type of elements in the array
 */
export class Array<T> {
  /** Private constructor to enforce immutability */
  private constructor(private readonly items: readonly T[]) {}

  /**
   * Creates a new Array from existing items
   * @param items - An iterable of items to initialize the Array
   * @return A new Array instance containing the items
   * @template T - The type of elements in the array
   */
  static from<T>(items: Iterable<T>): Array<T> {
    return new Array([...items]); // defensive copy
  }

  /**
   * Creates an empty Array
   * @return A new empty Array instance
   * @template T - The type of elements in the array
   */
  static empty<T>(): Array<T> {
    return new Array([]);
  }

  /**
   * Type guard to check if a value is an Array
   * @param value - The value to check
   * @return True if the value is an Array, false otherwise
   * @template T - The type of elements in the array
   */
  static is_array<T>(value: unknown): value is Array<T> {
    return value instanceof Array;
  }

  /**
   * Creates an Array with a single item
   * @param item - The item to wrap in an Array
   * @return A new Array instance containing the item
   * @template T - The type of the item
   */
  static of<T>(item: T): Array<T> {
    return new Array([item]);
  }

  /**
   * Creates an Array with n copies of an item
   * @param item - The item to repeat
   * @param count - The number of times to repeat the item
   * @return A new Array instance containing the repeated items
   * @template T - The type of the item
   */
  static repeat<T>(item: T, count: int): Array<T> {
    return new Array(new globalThis.Array(count).fill(item));
  }

  /**
   * Maps each element using the provided function
   * @param f - The function to apply to each item
   * @return A new Array instance containing the results of the mapping
   * @template U - The type of the resulting items
   */
  map<U>(f: (item: T, index: int) => U): Array<U> {
    return Array.from(this.items.map((item, i) => f(item, i as int)));
  }

  /**
   * Filters elements based on a predicate
   * @param predicate - The function to test each item
   * @return A new Array instance containing the items that match the predicate
   * @template T - The type of elements in the array
   */
  filter(predicate: (item: T, index: int) => boolean): Array<T> {
    return Array.from(
      this.items.filter((item, i) => predicate(item, i as int)),
    );
  }

  /**
   * Reduces the array to a single value
   * @param initial - The initial value for the accumulator
   * @param f - The function to apply to each item and the accumulator
   * @return The final accumulated value
   * @template U - The type of the accumulator
   */
  fold<U>(initial: U, f: (acc: U, item: T, index: int) => U): U {
    return this.items.reduce((acc, item, i) => f(acc, item, i as int), initial);
  }

  /**
   * Gets an item at the specified index
   * @param index - The index of the item to retrieve
   * @return An Option containing the item if it exists, or None if out of bounds
   * @template T - The type of elements in the array
   */
  get(index: int): Option<T> {
    const idx = index as number;
    if (idx >= 0 && idx < this.items.length) {
      return safe.some(this.items[idx]);
    }
    return safe.none();
  }

  /**
   * Returns the length of the array
   * @return The number of items in the array
   */
  length(): int {
    return this.items.length as int;
  }

  /**
   * Checks if the array is empty
   * @return True if the array has no items, false otherwise
   */
  is_empty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Returns first element if it exists
   * @return An Option containing the first item if it exists, or None if the array is empty
   * @template T - The type of elements in the array
   */
  first(): Option<T> {
    return this.get(0 as int);
  }

  /**
   * Returns last element if it exists
   * @return An Option containing the last item if it exists, or None if the array is empty
   * @template T - The type of elements in the array
   */
  last(): Option<T> {
    return this.get((this.items.length - 1) as int);
  }

  /**
   * Returns a new Array with the elements reversed
   * @return A new Array instance with the elements in reverse order
   * @template T - The type of elements in the array
   */
  reverse(): Array<T> {
    return Array.from([...this.items].reverse());
  }

  /**
   * Returns a slice of the array
   * @param start - The starting index (inclusive)
   * @param end - The ending index (exclusive, optional)
   * @return A new Array instance containing the sliced elements
   */
  slice(start: int, end?: int): Array<T> {
    return Array.from(this.items.slice(start as number, end as number));
  }

  /**
   * Concatenates two arrays
   * @param other - The other Array to concatenate with
   * @return A new Array instance containing elements from both arrays
   */
  concat(other: Array<T>): Array<T> {
    return Array.from([...this.items, ...other.items]);
  }

  /**
   * Finds the first element matching a predicate
   * @param predicate - The function to test each item
   * @return An Option containing the first matching item, or None if not found
   */
  find(predicate: (item: T, index: int) => boolean): Option<T> {
    const found = this.items.find((item, i) => predicate(item, i as int));
    return found !== undefined ? safe.some(found) : safe.none();
  }

  /**
   * Returns index of first matching element
   * @param predicate - The function to test each item
   * @return An Option containing the index of the first matching item, or None if not found
   */
  find_index(predicate: (item: T, index: int) => boolean): Option<int> {
    const index = this.items.findIndex((item, i) => predicate(item, i as int));
    return index !== -1 ? safe.some(index as int) : safe.none();
  }

  /**
   * Groups elements by a key function
   * @param key_fn - The function to extract the key from each item
   * @return An object mapping keys to arrays of items
   * @template K - The type of the key
   */
  group_by<K extends string>(key_fn: (item: T) => K): Record<K, Array<T>> {
    const groups: Partial<Record<K, T[]>> = {};
    for (const item of this.items) {
      const key = key_fn(item);
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(item);
    }
    return Object.fromEntries(
      Object.entries(groups).map(([k, v]) => [k, Array.from(v as T[])]),
    ) as Record<K, Array<T>>;
  }

  /**
   * Partitions elements into two arrays based on a predicate
   * @param predicate - The function to test each item
   * @return A tuple containing two arrays: one with items that match the predicate, and one with items that do not
   */
  partition(predicate: (item: T) => boolean): [Array<T>, Array<T>] {
    const trueItems: T[] = [];
    const falseItems: T[] = [];

    for (const item of this.items) {
      if (predicate(item)) {
        trueItems.push(item);
      } else {
        falseItems.push(item);
      }
    }

    return [Array.from(trueItems), Array.from(falseItems)];
  }

  /**
   * Flattens nested arrays one level deep
   * @return A new Array instance containing all elements from nested arrays
   * @template U - The type of elements in the nested arrays
   */
  flatten<U>(this: Array<Array<U>>): Array<U> {
    return Array.from(this.items.flatMap((arr) => arr.items));
  }

  /**
   * Maps and flattens in one operation
   * @param f - The function to apply to each item, returning an array of items
   * @return A new Array instance containing all items from the resulting arrays
   * @template U - The type of elements in the resulting arrays
   */
  flat_map<U>(f: (item: T) => Array<U>): Array<U> {
    return Array.from(this.items.flatMap((item) => f(item).items));
  }

  /**
   * Returns distinct elements
   * @return A new Array instance containing unique items
   */
  distinct(): Array<T> {
    return Array.from(new Set(this.items));
  }

  /**
   * Checks if every element satisfies the predicate
   * @param predicate - The function to test each item
   * @return True if all items match the predicate, false otherwise
   */
  every(predicate: (item: T) => boolean): boolean {
    return this.items.every(predicate);
  }

  /**
   * Checks if any element satisfies the predicate
   * @param predicate - The function to test each item
   * @return True if at least one item matches the predicate, false otherwise
   */
  some(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  /**
   * Converts to a native readonly array
   * @return A defensive copy of the items as a readonly array
   */
  to_array(): readonly T[] {
    return [...this.items]; // defensive copy
  }

  /**
   * Creates a string representation
   * @return A string representation of the Array
   */
  to_string(): string {
    return `Array(${this.items.length})[${this.items.join(", ")}]`;
  }
}
