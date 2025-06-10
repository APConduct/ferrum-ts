#!/usr/bin/env node
/**
 * Script to run all examples for the Ferrum library using ts-node
 */
const { execSync } = require("child_process");
const { readdirSync, existsSync } = require("fs");
const { join } = require("path");

// Configuration
const EXAMPLES_DIR = join(__dirname, "examples");
const TS_NODE_PATH = join(__dirname, "node_modules", ".bin", "ts-node");

// Check if examples directory exists
if (!existsSync(EXAMPLES_DIR)) {
  console.error(`Error: Examples directory not found at ${EXAMPLES_DIR}`);
  console.log("Creating examples directory...");
  require("fs").mkdirSync(EXAMPLES_DIR, { recursive: true });
  console.log(
    "Examples directory created. Please add your example files there.",
  );
  process.exit(1);
}

// Get all TypeScript files in the examples directory
const examples = readdirSync(EXAMPLES_DIR)
  .filter((file) => file.endsWith(".ts"))
  .map((file) => join(EXAMPLES_DIR, file));

if (examples.length === 0) {
  console.log(
    "No example files found. Please add TypeScript (.ts) files to the examples directory.",
  );
  process.exit(0);
}

console.log("=== Running Ferrum Examples with ts-node ===\n");

// Run each example
let passCount = 0;
let failCount = 0;

examples.forEach((example) => {
  const filename = example.split("/").pop();
  console.log(`\n=== Running ${filename} ===`);
  console.log("----------------------------------------");

  try {
    execSync(`${TS_NODE_PATH} ${example}`, {
      stdio: "inherit",
      env: { ...process.env, TS_NODE_PROJECT: "./tsconfig.json" },
    });
    console.log("----------------------------------------");
    console.log(`✅ ${filename} completed successfully`);
    passCount++;
  } catch (error) {
    console.log("----------------------------------------");
    console.error(`❌ ${filename} failed with error: ${error.message}`);
    failCount++;
  }
});

console.log("\n=== Examples Summary ===");
console.log(`Total: ${examples.length}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
