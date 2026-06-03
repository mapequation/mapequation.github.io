import { describe, expect, it } from "vitest";
import { buildWorkbenchUrl, parseWorkbenchUrlState } from "./urlState";

describe("parseWorkbenchUrlState", () => {
  it("decodes compressed network, companion inputs, filenames, and args", async () => {
    const url = await buildWorkbenchUrl(
      "https://mapequation.org/infomap/workbench",
      {
        args: "--directed --two-level",
        clusterData: { name: "known.clu", value: "1 1\n2 1" },
        metaData: { name: "labels.clu", value: "1 red\n2 blue" },
        network: { name: "example.net", value: "1 2\n2 3" },
      },
    );
    const params = new URL(url).searchParams;

    expect(await parseWorkbenchUrlState(params)).toEqual({
      args: "--directed --two-level",
      clusterData: { name: "known.clu", value: "1 1\n2 1" },
      metaData: { name: "labels.clu", value: "1 red\n2 blue" },
      network: { name: "example.net", value: "1 2\n2 3" },
      oversized: [],
    });
  });

  it("uses default names and omits blank inputs from legacy params", async () => {
    const params = new URLSearchParams({
      network: "1 2",
      clusterData: "   ",
      metaData: "",
    });

    expect(await parseWorkbenchUrlState(params)).toEqual({
      network: { name: "", value: "1 2" },
      oversized: [],
    });
  });

  it("omits inputs that exceed the decoded size limit from legacy params", async () => {
    const params = new URLSearchParams({
      network: "x".repeat(200_001),
      args: "--directed",
    });

    expect(await parseWorkbenchUrlState(params)).toEqual({
      args: "--directed",
      oversized: ["network"],
    });
  });

  it("ignores invalid compressed state and falls back to legacy params", async () => {
    const params = new URLSearchParams({
      s: "not-valid-base64url",
      network: "1 2",
    });

    expect(await parseWorkbenchUrlState(params)).toEqual({
      network: { name: "", value: "1 2" },
      oversized: [],
    });
  });
});

describe("buildWorkbenchUrl", () => {
  it("encodes current input state and args into one compressed share param", async () => {
    const url = await buildWorkbenchUrl(
      "https://mapequation.org/infomap/workbench",
      {
        args: "--directed --two-level",
        clusterData: { name: "known.clu", value: "1 1\n2 1" },
        metaData: { name: "labels.clu", value: "1 red\n2 blue" },
        network: { name: "example.net", value: "1 2\n2 3" },
      },
    );

    const parsed = new URL(url);
    expect(parsed.searchParams.get("s")).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(parsed.searchParams.has("network")).toBe(false);
    expect(await parseWorkbenchUrlState(parsed.searchParams)).toEqual({
      args: "--directed --two-level",
      clusterData: { name: "known.clu", value: "1 1\n2 1" },
      metaData: { name: "labels.clu", value: "1 red\n2 blue" },
      network: { name: "example.net", value: "1 2\n2 3" },
      oversized: [],
    });
  });

  it("omits empty optional inputs and existing unrelated query params", async () => {
    const url = await buildWorkbenchUrl(
      "https://mapequation.org/infomap/workbench?old=1#preview",
      {
        args: "",
        clusterData: { name: "", value: "" },
        metaData: { name: "", value: "   " },
        network: { name: "network", value: "1 2" },
      },
    );

    const parsed = new URL(url);
    expect(parsed.searchParams.has("old")).toBe(false);
    expect(parsed.hash).toBe("");
    expect(await parseWorkbenchUrlState(parsed.searchParams)).toEqual({
      network: { name: "network", value: "1 2" },
      oversized: [],
    });
  });
});
