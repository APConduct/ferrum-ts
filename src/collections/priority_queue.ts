import { Option } from "../types/option";
import { Array } from "./array";
import { Result } from "../types/result";
import { safe } from "../safe";

/**
 * Immutable Priority Queue implementation using a binary heap
 * This implementation is based on a min-heap structure
 * It allows for efficient insertion and removal of the minimum element
 * @template T - The type of items in the priority queue
 */
export class PriorityQueue<T> {
  private constructor(
    private readonly items: ReadonlyArray<T>,
    private readonly compare: (a: T, b: T) => number,
  ) {}

  /**
   * Creates a new PriorityQueue from existing items
   * @param items - An iterable of items to initialize the PriorityQueue
   * @param compare - A comparison function to determine the order of items
   * @return A new PriorityQueue instance containing the items
   */
  static empty<T>(compare: (a: T, b: T) => number): PriorityQueue<T> {
    return new PriorityQueue([], compare);
  }

  /**
   * Creates a new PriorityQueue from existing items
   * @param items - An iterable of items to initialize the PriorityQueue
   * @param compare - A comparison function to determine the order of items
   * @return A new PriorityQueue instance containing the items
   */
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

  /**
   * Sifts down an element in the heap to maintain the heap property
   * @param heap - The array representing the heap
   * @param index - The index of the element to sift down
   * @param compare - The comparison function to determine order
   */
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

  /**
   * Creates a new PriorityQueue with a custom comparison function
   * @param compare - A comparison function to determine the order of items
   * @return A new PriorityQueue instance
   */
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

  /**
   * Removes and returns the item with the highest priority (smallest value)
   * @return A Result containing the removed item and a new PriorityQueue without that item, or an error if the queue is empty
   */
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

  /**
   * Returns the item with the highest priority (smallest value) without removing it
   * @return An Option containing the item if it exists, or None if the queue is empty
   */
  peek(): Option<T> {
    return this.items.length > 0 ? safe.some(this.items[0]) : safe.none();
  }

  /**
   * Checks if the priority queue is empty
   * @return True if the queue has no items, false otherwise
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Checks if the priority queue is empty
   * @return True if the queue has no items, false otherwise
   */
  to_array(): Array<T> {
    return Array.from([...this.items]);
  }
}
