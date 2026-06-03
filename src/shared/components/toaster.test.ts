import { describe, expect, it } from "vitest";
import { shareUrlSavedToast } from "./toastMessages";

describe("shareUrlSavedToast", () => {
  it("describes a successful share URL copy", () => {
    expect(shareUrlSavedToast()).toMatchObject({
      description: "Current inputs are saved in the URL and copied.",
      title: "Share URL copied",
      type: "success",
    });
  });
});
