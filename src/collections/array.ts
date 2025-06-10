import { Option } from "../types/option";
import { Result } from "../types/result";
import { safe } from "../safe";
import { int } from "../types/numeric";

/**
 * A safe, immutable array implementation with functional programming utilities
 */
export class Array<T> {
  /** Private constructor to enforce immutability */
  private constructor(private readonly items: readonly T[]) {}

  /**
   * Creates a new Array from existing items
   */
  static from<T>(items: Iterable<T>): Array<T> {
    return new Array([...items]); // defensive copy
  }

  /**
   * Creates an empty Array
   */
  static empty<T>(): Array<T> {
    return new Array([]);
  }

  /**
   * Type guard to check if a value is an Array
   */
  static is_array<T>(value: unknown): value is Array<T> {
    return value instanceof Array;
  }

  /**
   * Creates an Array with a single item
   */
  static of<T>(item: T): Array<T> {
    return new Array([item]);
  }

  /**
   * Creates an Array with n copies of an item
   */
  static repeat<T>(item: T, count: int): Array<T> {
    return new Array(new globalThis.Array(count).fill(item));
  }

  /**
   * Maps each element using the provided function
   */
  map<U>(f: (item: T, index: int) => U): Array<U> {
    return Array.from(this.items.map((item, i) => f(item, i as int)));
  }

  /**
   * Filters elements based on a predicate
   */
  filter(predicate: (item: T, index: int) => boolean): Array<T> {
    return Array.from(
      this.items.filter((item, i) => predicate(item, i as int)),
    );
  }

  /**
   * Reduces the array to a single value
   */
  fold<U>(initial: U, f: (acc: U, item: T, index: int) => U): U {
    return this.items.reduce((acc, item, i) => f(acc, item, i as int), initial);
  }

  /**
   * Gets an item at the specified index
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
   */
  length(): int {
    return this.items.length as int;
  }

  /**
   * Checks if the array is empty
   */
  is_empty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Returns first element if it exists
   */
  first(): Option<T> {
    return this.get(0 as int);
  }

  /**
   * Returns last element if it exists
   */
  last(): Option<T> {
    return this.get((this.items.length - 1) as int);
  }

  /**
   * Returns a new Array with the elements reversed
   */
  reverse(): Array<T> {
    return Array.from([...this.items].reverse());
  }

  /**
   * Returns a slice of the array
   */
  slice(start: int, end?: int): Array<T> {
    return Array.from(this.items.slice(start as number, end as number));
  }

  /**
   * Concatenates two arrays
   */
  concat(other: Array<T>): Array<T> {
    return Array.from([...this.items, ...other.items]);
  }

  /**
   * Finds the first element matching a predicate
   */
  find(predicate: (item: T, index: int) => boolean): Option<T> {
    const found = this.items.find((item, i) => predicate(item, i as int));
    return found !== undefined ? safe.some(found) : safe.none();
  }

  /**
   * Returns index of first matching element
   */
  find_index(predicate: (item: T, index: int) => boolean): Option<int> {
    const index = this.items.findIndex((item, i) => predicate(item, i as int));
    return index !== -1 ? safe.some(index as int) : safe.none();
  }

  /**
   * Groups elements by a key function
   */
  group_by<K extends string>(keyFn: (item: T) => K): Record<K, Array<T>> {
    const groups: Partial<Record<K, T[]>> = {};
    for (const item of this.items) {
      const key = keyFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(item);
    }
    return Object.fromEntries(
      Object.entries(groups).map(([k, v]) => [k, Array.from(v as T[])]),
    ) as Record<K, Array<T>>;
  }

  /**
   * Partitions elements into two arrays based on a predicate
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
   */
  flatten<U>(this: Array<Array<U>>): Array<U> {
    return Array.from(this.items.flatMap((arr) => arr.items));
  }

  /**
   * Maps and flattens in one operation
   */
  flat_map<U>(f: (item: T) => Array<U>): Array<U> {
    return Array.from(this.items.flatMap((item) => f(item).items));
  }

  /**
   * Returns distinct elements
   */
  distinct(): Array<T> {
    return Array.from(new Set(this.items));
  }

  /**
   * Checks if every element satisfies the predicate
   */
  every(predicate: (item: T) => boolean): boolean {
    return this.items.every(predicate);
  }

  /**
   * Checks if any element satisfies the predicate
   */
  some(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  /**
   * Converts to a native readonly array
   */
  to_array(): readonly T[] {
    return [...this.items]; // defensive copy
  }

  /**
   * Creates a string representation
   */
  to_string(): string {
    return `Array(${this.items.length})[${this.items.join(", ")}]`;
  }
}
