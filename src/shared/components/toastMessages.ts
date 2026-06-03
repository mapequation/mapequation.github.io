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
