import {
  AsyncResult,
  Result,
  sleep,
  with_timeout,
  make_cancelable,
  create_deferred,
  sequence,
  parallel,
} from "../src";

async function asyncExamples() {
  console.log("Running async examples...");

  // Example 1: Using AsyncResult to wrap promises
  const successPromise = Promise.resolve(42);
  const resultFromPromise = await AsyncResult.fromPromise(successPromise);
  console.log(`Result from promise: ${JSON.stringify(resultFromPromise)}`); // { kind: 'ok', value: 42 }

  // Example 2: Using retry with exponential backoff
  let attempts = 0;
  const flaky = async (): Promise<Result<string, string>> => {
    attempts++;
    if (attempts < 3) {
      return { kind: "error", error: `Failed attempt ${attempts}` };
    }
    return { kind: "ok", value: "Success after retries" };
  };

  const retryResult = await AsyncResult.retry(flaky, {
    max_attempts: 5, // Using snake_case to match the API
    initial_delay: 100, // Using snake_case to match the API
    max_delay: 10000, // Using snake_case to match the API
    backoff_factor: 2, // Using snake_case to match the API
  });
  console.log(`Retry result: ${JSON.stringify(retryResult)}`); // { kind: 'ok', value: 'Success after retries' }

  // Example 3: Using timeout
  const slowOperation = async (): Promise<Result<string, string>> => {
    await sleep(2000);
    return { kind: "ok", value: "Completed" };
  };

  const withTimeoutResult = await AsyncResult.with_timeout(slowOperation, 1000);
  console.log(`With timeout result: ${JSON.stringify(withTimeoutResult)}`); // { kind: 'error', error: 'timeout' }

  // Example 4: Using make_cancelable
  const longRunningTask = sleep(5000).then(() => "Done");
  const cancelable = make_cancelable(longRunningTask);

  // Cancel it after 1 second
  setTimeout(() => {
    cancelable.cancel();
    console.log("Task canceled");
  }, 1000);

  const cancelableResult = await cancelable.promise;
  console.log(`Cancelable result: ${JSON.stringify(cancelableResult)}`); // { kind: 'error', error: 'canceled' }

  // Example 5: Using deferred promise
  const deferred = create_deferred<string>();

  // Resolve after 1 second
  setTimeout(() => {
    deferred.resolve("Deferred resolved");
  }, 1000);

  const deferredResult = await deferred.promise;
  console.log(`Deferred result: ${deferredResult}`); // 'Deferred resolved'

  // Example 6: Sequential and parallel operations
  const operations = [
    () => Promise.resolve(1),
    () => Promise.resolve(2),
    () => Promise.resolve(3),
  ];

  const sequentialResult = await sequence(operations);
  console.log(`Sequential result: ${JSON.stringify(sequentialResult)}`); // { kind: 'ok', value: [1, 2, 3] }

  const parallelResult = await parallel(operations, 2);
  console.log(`Parallel result: ${JSON.stringify(parallelResult)}`); // { kind: 'ok', value: [1, 2, 3] }
}

asyncExamples().catch(console.error);
