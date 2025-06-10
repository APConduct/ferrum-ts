import { safe, Result, Option } from "../src";

// Example 1: Working with Result type
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { kind: "error", error: "division_by_zero" };
  }
  return { kind: "ok", value: a / b };
}

const divideResult = divide(10, 2);
if (divideResult.kind === "ok") {
  console.log(`Division result: ${divideResult.value}`); // 5
} else {
  console.error(`Error: ${divideResult.error}`);
}

// Example 2: Working with Option type
function findUser(id: string): Option<{ name: string }> {
  const users = {
    user1: { name: "Alice" },
    user2: { name: "Bob" },
  };

  return id in users
    ? { kind: "some", value: users[id as keyof typeof users] }
    : { kind: "none" };
}

const user = findUser("user1");
if (user.kind === "some") {
  console.log(`Found user: ${user.value.name}`); // Alice
} else {
  console.log("User not found");
}

// Example 3: Using safe numeric types
const intResult = safe.int(42);
const floatResult = safe.float(3.14);
const uintResult = safe.uint(10);

if (intResult.kind === "ok" && floatResult.kind === "ok") {
  console.log(`Integer: ${intResult.value}, Float: ${floatResult.value}`);
}
