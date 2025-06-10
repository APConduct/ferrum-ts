import { Array, Queue, Map, Set, PriorityQueue } from "../src";

// Example 1: Working with Array
const numbers = Array.from([1, 2, 3, 4, 5]);
const doubled = numbers.map((x) => x * 2);
const evens = numbers.filter((x) => x % 2 === 0);
const sum = numbers.fold(0, (acc, x) => acc + x);

console.log(`Original: ${numbers.to_array()}`); // [1, 2, 3, 4, 5]
console.log(`Doubled: ${doubled.to_array()}`); // [2, 4, 6, 8, 10]
console.log(`Evens: ${evens.to_array()}`); // [2, 4]
console.log(`Sum: ${sum}`); // 15

// Example 2: Working with Queue
let queue = Queue.empty<number>();
queue = queue.enqueue(1).enqueue(2).enqueue(3);

const dequeueResult = queue.dequeue();
if (dequeueResult.kind === "ok") {
  const [value, newQueue] = dequeueResult.value;
  console.log(`Dequeued value: ${value}`); // 1
  console.log(`Queue size after dequeue: ${newQueue.size()}`); // 2
}

// Example 3: Working with Map
let userMap = Map.empty<string, { name: string; age: number }>();
userMap = userMap
  .set("user1", { name: "Alice", age: 30 })
  .set("user2", { name: "Bob", age: 25 });

const alice = userMap.get("user1");
if (alice.kind === "some") {
  console.log(`User: ${alice.value.name}, Age: ${alice.value.age}`);
}

// Example 4: Working with Set
const set1 = Set.from([1, 2, 3]);
const set2 = Set.from([3, 4, 5]);

const union = set1.union(set2);
const intersection = set1.intersection(set2);
const difference = set1.difference(set2);

console.log(`Union: ${union.to_array().to_array()}`); // [1, 2, 3, 4, 5]
console.log(`Intersection: ${intersection.to_array().to_array()}`); // [3]
console.log(`Difference: ${difference.to_array().to_array()}`); // [1, 2]

// Example 5: Working with PriorityQueue
const compareNumbers = (a: number, b: number) => a - b; // Min heap
let priorityQueue = PriorityQueue.from([5, 3, 8, 1, 2], compareNumbers);

const peekResult = priorityQueue.peek();
if (peekResult.kind === "some") {
  console.log(`Top priority item: ${peekResult.value}`); // 1 (minimum value)
}

const popResult = priorityQueue.pop();
if (popResult.kind === "ok") {
  const [value, newQueue] = popResult.value;
  console.log(`Popped value: ${value}`); // 1
  console.log(`Priority queue size after pop: ${newQueue.size()}`); // 4
}
