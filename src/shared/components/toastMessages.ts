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
