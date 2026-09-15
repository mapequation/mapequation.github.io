import { describe, expect, it } from "vitest";
import {
  publicationLinkCopiedToast,
  shareUrlSavedToast,
} from "./toastMessages";

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

describe("publicationLinkCopiedToast", () => {
  it("describes a copied publication link", () => {
    expect(publicationLinkCopiedToast(true)).toMatchObject({
      closable: true,
      description: "The link opens this paper with its details expanded.",
      title: "Link copied",
      type: "success",
    });
  });

  it("points at the address bar when copying is unavailable", () => {
    expect(publicationLinkCopiedToast(false)).toMatchObject({
      closable: true,
      description: "Copy the link from the address bar to share this paper.",
      title: "Link ready to copy",
      type: "success",
    });
  });
});
