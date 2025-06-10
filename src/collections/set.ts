import { Array } from "./array";

export class Set<T> {
  private constructor(private readonly items: ReadonlySet<T>) {}

  /**
   * Create a new Set from an iterable
   * @param items - An iterable of items to initialize the Set
   * @return A new Set instance containing the items
   * @template T - The type of elements in the set
   */
  static from<T>(items: Iterable<T>): Set<T> {
    return new Set(new globalThis.Set(items));
  }

  /**
   * Create an empty Set
   * @return A new empty Set instance
   * @template T - The type of elements in the set
   */
  static empty<T>(): Set<T> {
    return new Set(new globalThis.Set());
  }

  /**
   * Add an item to the set
   * This operation is O(1) on average, but can be O(n) in the worst case
   * @param item - The item to add to the set
   * @return A new Set instance with the item added
   * @template T - The type of the item
   */
  add(item: T): Set<T> {
    const newSet = new globalThis.Set(this.items);
    newSet.add(item);
    return new Set(newSet);
  }

  /**
   * Remove an item from the set
   * This operation is O(1) on average, but can be O(n) in the worst case
   * @param item - The item to remove from the set
   * @return A new Set instance with the item removed
   * If the item does not exist, the set remains unchang
   * @template T - The type of the item
   */
  delete(item: T): Set<T> {
    const newSet = new globalThis.Set(this.items);
    newSet.delete(item);
    return new Set(newSet);
  }

  /**
   * Check if an item exists in the set
   * @param item - The item to check for existence
   * @return True if the item exists, false otherwise
   * @template T - The type of the item
   */
  has(item: T): boolean {
    return this.items.has(item);
  }

  /**
   * Get the union of this set with another
   * This operation combines the items of both sets
   * @param other - The other set to union with
   * @return A new Set instance containing the union of both sets
   * @template T - The type of elements in the set
   */
  union(other: Set<T>): Set<T> {
    return new Set(new globalThis.Set([...this.items, ...other.items]));
  }

  /**
   * Get the intersection of this set with another
   * This operation finds items that are present in both sets
   * @param other - The other set to intersect with
   * @return A new Set instance containing the intersection of both sets
   * @template T - The type of elements in the set
   */
  intersection(other: Set<T>): Set<T> {
    return new Set(
      new globalThis.Set([...this.items].filter((x) => other.has(x))),
    );
  }

  /**
   * Get the difference of this set with another (items in this but not in other)
   * @param other - The other set to find the difference with
   * @return A new Set instance containing the difference
   * @template T - The type of elements in the set
   */
  difference(other: Set<T>): Set<T> {
    return new Set(
      new globalThis.Set([...this.items].filter((x) => !other.has(x))),
    );
  }

  /**
   * Get the symmetric difference of this set with another
   * (items in either set but not in both)
   * @param other - The other set to find the symmetric difference with
   * @return A new Set instance containing the symmetric difference
   * @template T - The type of elements in the set
   */
  symmetric_difference(other: Set<T>): Set<T> {
    return this.difference(other).union(other.difference(this));
  }

  /**
   * Check if this set is a subset of another
   * This operation checks if all items in this set are also in the other set
   * @param other - The other set to check against
   * @return True if this set is a subset of the other, false otherwise
   * @template T - The type of elements in the set
   */
  is_subset_of(other: Set<T>): boolean {
    return [...this.items].every((item) => other.has(item));
  }

  /**
   * Check if this set is a superset of another
   * This operation checks if all items in the other set are also in this set
   * @param other - The other set to check against
   * @return True if this set is a superset of the other, false otherwise
   * @template T - The type of elements in the set
   */
  is_superset_of(other: Set<T>): boolean {
    return other.is_subset_of(this);
  }

  /**
   * Map over the items in the set
   * This operation applies a function to each item and returns a new set
   * @param f - The function to apply to each item
   * @return A new Set instance containing the results of the mapping
   * @template U - The type of the resulting items
   */
  map<U>(f: (item: T) => U): Set<U> {
    return Set.from([...this.items].map(f));
  }

  /**
   * Filter items in the set
   * This operation returns a new set containing only items that match the predicate
   * @param predicate - The function to test each item
   * @return A new Set instance containing the items that match the predicate
   * @template T - The type of elements in the set
   */
  filter(predicate: (item: T) => boolean): Set<T> {
    return Set.from([...this.items].filter(predicate));
  }

  /**
   * Get the size of the set
   * This operation returns the number of items in the set
   * @return The number of items in the set
   */
  size(): number {
    return this.items.size;
  }

  /**
   * Convert the set to an array
   * This operation creates an array containing all items in the set
   * @return An array containing all items in the set
   */
  to_array(): Array<T> {
    return Array.from([...this.items]);
  }
}
