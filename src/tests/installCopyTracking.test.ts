import { describe, expect, it } from "vitest";
import { getManualCommandCopyProps } from "../shared/installCopyTracking";

describe("getManualCommandCopyProps", () => {
  it("returns manual command copy props for selected install command text", () => {
    const command = {
      getAttribute(name: string) {
        return (
          {
            "data-content-id": "pip-install",
            "data-package": "python",
          }[name] ?? null
        );
      },
    };
    const element = {
      closest(selector: string) {
        return selector === "[data-install-command]" ? command : null;
      },
    } as Element;

    expect(getManualCommandCopyProps("pip install infomap", element)).toEqual({
      content_id: "pip-install",
      copy_method: "manual",
      cta_type: "install",
      package: "python",
      site_area: "install",
    });
  });

  it("ignores copy events without selected text in an install command", () => {
    const element = {
      closest() {
        return null;
      },
    } as unknown as Element;

    expect(getManualCommandCopyProps("   ", element)).toBeNull();
    expect(
      getManualCommandCopyProps("pip install infomap", element),
    ).toBeNull();
  });
});
