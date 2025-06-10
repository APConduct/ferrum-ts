import { Option } from "../types/option";
import { Array } from "./array";
import { Result } from "../types/result";
import { safe } from "../safe";

/**
 * Immutable Queue implementation using two stacks for efficient operations
 */
export class Queue<T> {
  private constructor(
    private readonly incoming: ReadonlyArray<T>,
    private readonly outgoing: ReadonlyArray<T>,
  ) {}

  static empty<T>(): Queue<T> {
    return new Queue([], []);
  }

  static from<T>(items: Iterable<T>): Queue<T> {
    return new Queue([...items], []);
  }

  /**
   * Add an item to the back of the queue
   */
  enqueue(item: T): Queue<T> {
    return new Queue([...this.incoming, item], this.outgoing);
  }

  /**
   * Remove and return the item at the front of the queue
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

  isEmpty(): boolean {
    return this.incoming.length === 0 && this.outgoing.length === 0;
  }

  size(): number {
    return this.incoming.length + this.outgoing.length;
  }

  /**
   * Converts the queue to an Array in FIFO order
   * (first item in queue will be first in resulting array)
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
