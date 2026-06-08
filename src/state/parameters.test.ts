import { describe, expect, it } from "vitest";
import {
  applyArgsToParams,
  buildArgs,
  createParams,
  DEFAULT_INFOMAP_ARGS,
} from "./parameters";

describe("DEFAULT_INFOMAP_ARGS", () => {
  it("enables pretty console output by default", () => {
    const params = applyArgsToParams(
      createParams(),
      DEFAULT_INFOMAP_ARGS.split(/\s+/),
    );

    expect(buildArgs(params)).toContain("--pretty");
    expect(params.find((param) => param.long === "--pretty")?.active).toBe(
      true,
    );
  });
});
