import { Option } from "../types/option";
import { Array } from "./array";
import { Result } from "../types/result";
import { safe } from "../safe";

/**
 * Immutable Queue implementation using two stacks for efficient operations
 * @template T - The type of items in the queue
 */
export class Queue<T> {
  private constructor(
    private readonly incoming: ReadonlyArray<T>,
    private readonly outgoing: ReadonlyArray<T>,
  ) {}

  /**
   * Creates a new Queue from existing items
   * @param items - An iterable of items to initialize the Queue
   * @return A new Queue instance containing the items
   * @template T - The type of elements in the queue
   */
  static empty<T>(): Queue<T> {
    return new Queue([], []);
  }

  /**
   * Creates a new Queue from existing items
   * @param items - An iterable of items to initialize the Queue
   * @return A new Queue instance containing the items
   * @template T - The type of elements in the queue
   */
  static from<T>(items: Iterable<T>): Queue<T> {
    return new Queue([...items], []);
  }

  /**
   * Add an item to the back of the queue
   * This operation is O(1) on average, but can be O(n) in the worst case
   * @param item - The item to add to the queue
   * @return A new Queue instance with the item added
   * @template T - The type of the item
   */
  enqueue(item: T): Queue<T> {
    return new Queue([...this.incoming, item], this.outgoing);
  }

  /**
   * Remove and return the item at the front of the queue
   * This operation is O(1) on average, but can be O(n) in the worst case
   * @return A Result containing the item and the new Queue instance
   * If the queue is empty, it returns an error
   * @template T - The type of the item
   */
  dequeue(): Result<[T, Queue<T>], "empty_queue"> {
    if (this.outgoing.length > 0) {
      const [first, ...rest] = this.outgoing;
      return safe.ok([first, new Queue(this.incoming, rest)]);
    }

    if (this.incoming.length === 0) {
      return safe.error("empty_queue");
    }

    const reversed = [...this.incoming].reverse();
    const [first, ...rest] = reversed;
    return safe.ok([first, new Queue([], rest)]);
  }

  /**
   * Look at the front item without removing it
   * This operation is O(1) on average, but can be O(n) in the worst case
   * @return An Option containing the item if it exists, or none if the queue is empty
   * @template T - The type of the item
   */
  peek(): Option<T> {
    if (this.outgoing.length > 0) {
      return safe.some(this.outgoing[0]);
    }
    if (this.incoming.length > 0) {
      return safe.some(this.incoming[this.incoming.length - 1]);
    }
    return safe.none();
  }

  /**
   * Checks if the queue is empty
   * @return True if the queue has no items, false otherwise
   * @template T - The type of elements in the queue
   */
  isEmpty(): boolean {
    return this.incoming.length === 0 && this.outgoing.length === 0;
  }

  /**
   * Returns the number of items in the queue
   * @return The total number of items in the queue
   * @template T - The type of elements in the queue
   */
  size(): number {
    return this.incoming.length + this.outgoing.length;
  }

  /**
   * Converts the queue to an Array in FIFO order
   * (first item in queue will be first in resulting array)
   * @return An array containing all items in the queue
   * @template T - The type of elements in the queue
   */
  to_array(): Array<T> {
    if (this.outgoing.length > 0) {
      return Array.from([...this.outgoing, ...[...this.incoming].reverse()]);
    } else {
      // If no outgoing items, we need to reverse the incoming items
      // to maintain FIFO order
      return Array.from([...this.incoming]).reverse();
    }
  }
}
