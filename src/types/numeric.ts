import { Result } from "../types/result";
import { Brand, brand } from "./brand";
import { safe } from "../safe";

/** safe type for ints, which are finite integers. */
export type int = Brand<number, "int">;

/** safe type for floats, which are finite numbers. */
export type float = Brand<number, "float">;

/** Safe type for positive integers */
export type uint = Brand<number, "uint">;

/** Safe type for non-zero integers */
export type nonzero = Brand<number, "nonzero">;

export const numeric = {
  int: (n: number): Result<int, string> => {
    if (!Number.isFinite(n)) return safe.error("not_finite");
    if (!Number.isInteger(n)) return safe.error("not_integer");
    return safe.ok(brand<number, "int">(n));
  },

  float: (n: number): Result<float, string> => {
    if (!Number.isFinite(n)) return safe.error("not_finite");
    return safe.ok(brand<number, "float">(n));
  },

  uint: (n: number): Result<uint, string> => {
    const intResult = numeric.int(n);
    if (intResult.kind === "error") return intResult;
    if (intResult.value < 0) return safe.error("negative_number");
    return safe.ok(brand<number, "uint">(intResult.value));
  },

  nonzero: (n: number): Result<nonzero, string> => {
    const intResult = numeric.int(n);
    if (intResult.kind === "error") return intResult;
    if (intResult.value === 0) return safe.error("zero_not_allowed");
    return safe.ok(brand<number, "nonzero">(intResult.value));
  },
} as const;
