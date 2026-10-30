export function shareUrlSavedToast(copied: boolean) {
  return {
    closable: true,
    description: copied
      ? "Current inputs are saved in the URL and copied."
      : "Current inputs are saved in the URL.",
    title: copied ? "Share URL copied" : "Share URL saved",
    type: "success" as const,
  };
}

export function publicationLinkCopiedToast(copied: boolean) {
  return {
    closable: true,
    description: copied
      ? "The link opens this paper with its details expanded."
      : "Copy the link from the address bar to share this paper.",
    title: copied ? "Link copied" : "Link ready to copy",
    type: "success" as const,
  };
}

export function shareUrlTooLongToast() {
  return {
    closable: true,
    description:
      "The current inputs are too large to fit in a URL. Share the input files instead.",
    title: "Share URL not created",
    type: "error" as const,
  };
}

export function urlInputsSkippedToast(inputs: string[]) {
  const list = new Intl.ListFormat("en", { type: "conjunction" }).format(
    inputs,
  );
  return {
    closable: true,
    description: `The ${list} in this link ${
      inputs.length === 1 ? "is" : "are"
    } too large to load. Load the ${
      inputs.length === 1 ? "file" : "files"
    } into the workbench instead.`,
    title:
      inputs.length === 1 ? "Link input not loaded" : "Link inputs not loaded",
    type: "warning" as const,
  };
}
