import {
  fn,
  OptionFunctor,
  ResultFunctor,
  ArrayFunctor,
  OptionMonad,
  ResultMonad,
  safe,
  Result,
} from "../src";

// Example 1: Function composition
const add = (x: number) => x + 1;
const multiply = (x: number) => x * 2;

// Using the compose function from fn
const composed = fn.compose(multiply, add);
console.log(`compose(multiply, add)(5) = ${composed(5)}`); // 12 = (5+1)*2

// Example 2: Using functors
const optionFunctor = OptionFunctor.some(5);
const mappedOption = optionFunctor.map((x) => x * 2);
console.log(`Mapped option value: ${mappedOption.get_or_else(0)}`); // 10

const resultFunctor = ResultFunctor.ok<number, string>(10);
const mappedResult = resultFunctor.map((x) => x / 2);
// Using Result.unwrap_or to safely get the value
const result = mappedResult.to_result();
console.log(`Mapped result value: ${Result.unwrap_or(result, 0)}`); // 5

const arrayFunctor = ArrayFunctor.from([1, 2, 3]);
const mappedArray = arrayFunctor.map((x) => x * x);
console.log(
  `Mapped array: ${JSON.stringify(mappedArray.to_array().to_array())}`,
); // [1, 4, 9]

// Example 3: Using monads for composition
const optionMonad = OptionMonad.some(5);
const chainedOption = optionMonad.flat_map((x) =>
  x > 0 ? OptionMonad.some(x * 2) : OptionMonad.none(),
);
console.log(
  `Chained option: ${chainedOption.fold(
    () => "none",
    (value) => `some(${value})`,
  )}`,
); // some(10)

const resultMonad = ResultMonad.ok<number, string>(10);
const chainedResult = resultMonad.flat_map((x) =>
  x > 0 ? ResultMonad.ok(x + 5) : ResultMonad.error("negative_value"),
);
console.log(
  `Chained result: ${chainedResult.fold(
    (err) => `error(${err})`,
    (value) => `ok(${value})`,
  )}`,
); // ok(15)

// Example 4: Using curry and partial application
const add3 = (a: number, b: number, c: number) => a + b + c;
const curriedAdd3 = fn.curry(add3);
console.log(`Curried: ${curriedAdd3(1)(2)(3)}`); // 6

const addToFive = fn.partial(add, 5);
console.log(`Partial: ${addToFive(3)}`); // 8

// Example 5: Safe pattern matching with Result
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Result.error("division_by_zero");
  return Result.ok(a / b);
}

const divideResult = divide(10, 2);
// Proper pattern matching
if (divideResult.kind === "ok") {
  console.log(`Division result: ${divideResult.value}`); // 5
} else {
  console.log(`Division error: ${divideResult.error}`);
}

// Alternative using Result utilities
console.log(`Division using unwrap_or: ${Result.unwrap_or(divideResult, 0)}`); // 5

// Example 6: Mapping and transforming Results
const numberResult = Result.ok(42); // Fixed: removed the extra type parameter
const stringResult = Result.map(numberResult, (n) => n.toString());

if (stringResult.kind === "ok") {
  console.log(`Mapped result: ${stringResult.value}`); // "42"
}

// Example 7: Chain operations
const chainResult = Result.and_then(numberResult, (n) =>
  n > 0 ? Result.ok(n * 2) : Result.error("negative number"),
);

if (chainResult.kind === "ok") {
  console.log(`Chained result: ${chainResult.value}`); // 84
}

// Example 8: Using memoize
let computeCount = 0;
const expensiveCalculation = (n: number): number => {
  computeCount++;
  return n * n;
};

const memoizedCalculation = fn.memoize(expensiveCalculation);

console.log(memoizedCalculation(5)); // 25 (computed)
console.log(memoizedCalculation(5)); // 25 (from cache)
console.log(`Compute count: ${computeCount}`); // Should be 1

// Example 9: Working with monads for cleaner code
function validatePositive(n: number): ResultMonad<number, string> {
  return n > 0
    ? ResultMonad.ok(n)
    : ResultMonad.error("number must be positive");
}

function validateEven(n: number): ResultMonad<number, string> {
  return n % 2 === 0
    ? ResultMonad.ok(n)
    : ResultMonad.error("number must be even");
}

// Chain validations
const validationResult = ResultMonad.ok<number, string>(10)
  .flat_map(validatePositive)
  .flat_map(validateEven);

console.log(
  `Validation result: ${validationResult.fold(
    (err) => `Invalid: ${err}`,
    (val) => `Valid: ${val}`,
  )}`,
); // Valid: 10
