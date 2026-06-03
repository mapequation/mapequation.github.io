import { describe, expect, it } from "vitest";
import { shareUrlSavedToast } from "./toastMessages";

describe("shareUrlSavedToast", () => {
  it("describes a copied share URL", () => {
    expect(shareUrlSavedToast(true)).toMatchObject({
      closable: true,
      description: "Current inputs are saved in the URL and copied.",
      title: "Share URL copied",
      type: "success",
    });
  });

  it("describes a saved share URL when copying is unavailable", () => {
    expect(shareUrlSavedToast(false)).toMatchObject({
      closable: true,
      description: "Current inputs are saved in the URL.",
      title: "Share URL saved",
      type: "success",
    });
  });
});
