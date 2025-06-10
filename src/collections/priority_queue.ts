import { Option } from "../types/option";
import { Array } from "./array";
import { Result } from "../types/result";
import { safe } from "../safe";

export class PriorityQueue<T> {
  private constructor(
    private readonly items: ReadonlyArray<T>,
    private readonly compare: (a: T, b: T) => number,
  ) {}

  static empty<T>(compare: (a: T, b: T) => number): PriorityQueue<T> {
    return new PriorityQueue([], compare);
  }

  static from<T>(
    items: Iterable<T>,
    compare: (a: T, b: T) => number,
  ): PriorityQueue<T> {
    const heap = [...items];
    // Heapify
    for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
      PriorityQueue.sift_down(heap, i, compare);
    }
    return new PriorityQueue(heap, compare);
  }

  private static sift_down<T>(
    heap: T[],
    index: number,
    compare: (a: T, b: T) => number,
  ): void {
    const length = heap.length;
    let current = index;

    while (true) {
      const left = 2 * current + 1;
      const right = left + 1;
      let smallest = current;

      if (left < length && compare(heap[left], heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && compare(heap[right], heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === current) break;

      [heap[current], heap[smallest]] = [heap[smallest], heap[current]];
      current = smallest;
    }
  }

  push(item: T): PriorityQueue<T> {
    const newItems = [...this.items];
    newItems.push(item);

    // Bubble up
    let index = newItems.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(newItems[parent], newItems[index]) <= 0) break;

      [newItems[parent], newItems[index]] = [newItems[index], newItems[parent]];
      index = parent;
    }

    return new PriorityQueue(newItems, this.compare);
  }

  pop(): Result<[T, PriorityQueue<T>], "empty_queue"> {
    if (this.items.length === 0) {
      return safe.error("empty_queue");
    }

    const newItems = [...this.items];
    const result = newItems[0];
    const last = newItems.pop()!;

    if (newItems.length > 0) {
      newItems[0] = last;
      PriorityQueue.sift_down(newItems, 0, this.compare);
    }

    return safe.ok([result, new PriorityQueue(newItems, this.compare)]);
  }

  peek(): Option<T> {
    return this.items.length > 0 ? safe.some(this.items[0]) : safe.none();
  }

  size(): number {
    return this.items.length;
  }

  to_array(): Array<T> {
    return Array.from([...this.items]);
  }
}
