import { describe, expect, it } from "vitest";
import { getLegacyRedirect } from "./legacyRedirects";

describe("getLegacyRedirect", () => {
  it("sends retired Python docs links to the Python docs site", () => {
    expect(getLegacyRedirect("/infomap/python")).toBe("/infomap-python-docs/");
    expect(getLegacyRedirect("/infomap/python/")).toBe("/infomap-python-docs/");
    expect(getLegacyRedirect("/infomap/python/infomap.html")).toBe(
      "/infomap-python-docs/",
    );
  });

  it("leaves other paths alone", () => {
    expect(getLegacyRedirect("/infomap/workbench/")).toBeNull();
    expect(getLegacyRedirect("/infomap/pythonic")).toBeNull();
    expect(getLegacyRedirect("/missing")).toBeNull();
  });
});
