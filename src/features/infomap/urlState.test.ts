import { describe, expect, it } from "vitest";
import { buildWorkbenchUrl, parseWorkbenchUrlState } from "./urlState";

describe("parseWorkbenchUrlState", () => {
  it("decodes network, companion inputs, filenames, and args from query params", () => {
    const params = new URLSearchParams({
      network: "1 2\n2 3",
      networkName: "example.net",
      clusterData: "1 1\n2 1",
      clusterName: "known.clu",
      metaData: "1 red\n2 blue",
      metaName: "labels.clu",
      args: "--directed --two-level",
    });

    expect(parseWorkbenchUrlState(params)).toEqual({
      args: "--directed --two-level",
      clusterData: { name: "known.clu", value: "1 1\n2 1" },
      metaData: { name: "labels.clu", value: "1 red\n2 blue" },
      network: { name: "example.net", value: "1 2\n2 3" },
      oversized: [],
    });
  });

  it("uses default names and omits blank inputs", () => {
    const params = new URLSearchParams({
      network: "1 2",
      clusterData: "   ",
      metaData: "",
    });

    expect(parseWorkbenchUrlState(params)).toEqual({
      network: { name: "", value: "1 2" },
      oversized: [],
    });
  });

  it("omits inputs that exceed the decoded size limit", () => {
    const params = new URLSearchParams({
      network: "x".repeat(200_001),
      args: "--directed",
    });

    expect(parseWorkbenchUrlState(params)).toEqual({
      args: "--directed",
      oversized: ["network"],
    });
  });
});

describe("buildWorkbenchUrl", () => {
  it("encodes current input state and args into a shareable workbench URL", () => {
    const url = buildWorkbenchUrl("https://mapequation.org/infomap/workbench", {
      args: "--directed --two-level",
      clusterData: { name: "known.clu", value: "1 1\n2 1" },
      metaData: { name: "labels.clu", value: "1 red\n2 blue" },
      network: { name: "example.net", value: "1 2\n2 3" },
    });

    expect(url).toBe(
      "https://mapequation.org/infomap/workbench?network=1+2%0A2+3&networkName=example.net&clusterData=1+1%0A2+1&clusterName=known.clu&metaData=1+red%0A2+blue&metaName=labels.clu&args=--directed+--two-level",
    );
  });

  it("omits empty optional inputs and existing unrelated query params", () => {
    const url = buildWorkbenchUrl(
      "https://mapequation.org/infomap/workbench?old=1#preview",
      {
        args: "",
        clusterData: { name: "", value: "" },
        metaData: { name: "", value: "   " },
        network: { name: "network", value: "1 2" },
      },
    );

    expect(url).toBe(
      "https://mapequation.org/infomap/workbench?network=1+2&networkName=network",
    );
  });
});
