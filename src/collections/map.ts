import { Option } from "../types/option";
import { Array } from "./array";

export class Map<K, V> {
  private constructor(private readonly items: ReadonlyMap<K, V>) {}

  static from<K, V>(entries: Iterable<readonly [K, V]>): Map<K, V> {
    return new Map(new globalThis.Map(entries));
  }

  static empty<K, V>(): Map<K, V> {
    return new Map(new globalThis.Map());
  }

  set(key: K, value: V): Map<K, V> {
    const newMap = new globalThis.Map(this.items);
    newMap.set(key, value);
    return new Map(newMap);
  }

  get(key: K): Option<V> {
    const value = this.items.get(key);
    return value !== undefined ? { kind: "some", value } : { kind: "none" };
  }

  delete(key: K): Map<K, V> {
    const newMap = new globalThis.Map(this.items);
    newMap.delete(key);
    return new Map(newMap);
  }

  keys(): Array<K> {
    return Array.from([...this.items.keys()]);
  }

  values(): Array<V> {
    return Array.from([...this.items.values()]);
  }
}
