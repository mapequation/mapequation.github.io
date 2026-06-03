export function shareUrlSavedToast() {
  return {
    description: "Current inputs are saved in the URL and copied.",
    title: "Share URL copied",
    type: "success" as const,
  };
}
