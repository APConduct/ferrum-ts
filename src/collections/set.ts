import { Array } from "./array";

export class Set<T> {
  private constructor(private readonly items: ReadonlySet<T>) {}

  /**
   * Create a new Set from an iterable
   */
  static from<T>(items: Iterable<T>): Set<T> {
    return new Set(new globalThis.Set(items));
  }

  /**
   * Create an empty Set
   */
  static empty<T>(): Set<T> {
    return new Set(new globalThis.Set());
  }

  /**
   * Add an item to the set
   */
  add(item: T): Set<T> {
    const newSet = new globalThis.Set(this.items);
    newSet.add(item);
    return new Set(newSet);
  }

  /**
   * Remove an item from the set
   */
  delete(item: T): Set<T> {
    const newSet = new globalThis.Set(this.items);
    newSet.delete(item);
    return new Set(newSet);
  }

  /**
   * Check if an item exists in the set
   */
  has(item: T): boolean {
    return this.items.has(item);
  }

  /**
   * Get the union of this set with another
   */
  union(other: Set<T>): Set<T> {
    return new Set(new globalThis.Set([...this.items, ...other.items]));
  }

  /**
   * Get the intersection of this set with another
   */
  intersection(other: Set<T>): Set<T> {
    return new Set(
      new globalThis.Set([...this.items].filter((x) => other.has(x))),
    );
  }

  /**
   * Get the difference of this set with another (items in this but not in other)
   */
  difference(other: Set<T>): Set<T> {
    return new Set(
      new globalThis.Set([...this.items].filter((x) => !other.has(x))),
    );
  }

  /**
   * Get the symmetric difference of this set with another
   * (items in either set but not in both)
   */
  symmetric_difference(other: Set<T>): Set<T> {
    return this.difference(other).union(other.difference(this));
  }

  /**
   * Check if this set is a subset of another
   */
  is_subset_of(other: Set<T>): boolean {
    return [...this.items].every((item) => other.has(item));
  }

  /**
   * Check if this set is a superset of another
   */
  is_superset_of(other: Set<T>): boolean {
    return other.is_subset_of(this);
  }

  /**
   * Map over the items in the set
   */
  map<U>(f: (item: T) => U): Set<U> {
    return Set.from([...this.items].map(f));
  }

  /**
   * Filter items in the set
   */
  filter(predicate: (item: T) => boolean): Set<T> {
    return Set.from([...this.items].filter(predicate));
  }

  /**
   * Get the size of the set
   */
  size(): number {
    return this.items.size;
  }

  /**
   * Convert the set to an array
   */
  to_array(): Array<T> {
    return Array.from([...this.items]);
  }
}
