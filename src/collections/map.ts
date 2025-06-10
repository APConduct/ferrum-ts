import { Option } from "../types/option";
import { Array } from "./array";

/**
 * A safe, immutable Map implementation with functional programming utilities
 * @template K - The type of keys in the map
 * @template V - The type of values in the map
 */
export class Map<K, V> {
  private constructor(private readonly items: ReadonlyMap<K, V>) {}

  /**
   * Creates a new Map from existing entries
   * @param entries - An iterable of key-value pairs to initialize the Map
   * @return A new Map instance containing the entries
   * @template K - The type of keys in the map
   * @template V - The type of values in the map
   */
  static from<K, V>(entries: Iterable<readonly [K, V]>): Map<K, V> {
    return new Map(new globalThis.Map(entries));
  }

  /**
   * Creates an empty Map
   * @return A new empty Map instance
   * @template K - The type of keys in the map
   * @template V - The type of values in the map
   */
  static empty<K, V>(): Map<K, V> {
    return new Map(new globalThis.Map());
  }

  /**
   * Type guard to check if a value is a Map
   * @param value - The value to check
   * @return True if the value is a Map, false otherwise
   * @template K - The type of keys in the map
   * @template V - The type of values in the map
   */
  set(key: K, value: V): Map<K, V> {
    const newMap = new globalThis.Map(this.items);
    newMap.set(key, value);
    return new Map(newMap);
  }

  /**
   * Gets the value associated with a key
   * @param key - The key to look up
   * @return An Option containing the value if found, otherwise none
   * @template K - The type of keys in the map
   * @template V - The type of values in the map
   */
  get(key: K): Option<V> {
    const value = this.items.get(key);
    return value !== undefined ? { kind: "some", value } : { kind: "none" };
  }

  /**
   * Checks if a key exists in the map
   * @param key - The key to check
   * @return True if the key exists, false otherwise
   * @template K - The type of keys in the map
   */
  delete(key: K): Map<K, V> {
    const newMap = new globalThis.Map(this.items);
    newMap.delete(key);
    return new Map(newMap);
  }

  /**
   * Checks if a key exists in the map
   * @param key - The key to check
   * @return True if the key exists, false otherwise
   * @template K - The type of keys in the map
   */
  keys(): Array<K> {
    return Array.from([...this.items.keys()]);
  }

  /**
   * Gets all values in the map
   * @return An array of all values in the map
   * @template K - The type of keys in the map
   * @template V - The type of values in the map
   */
  values(): Array<V> {
    return Array.from([...this.items.values()]);
  }
}
