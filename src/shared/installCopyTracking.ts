import type { AnalyticsProps } from "./analytics";

const INSTALL_COMMAND_SELECTOR = "[data-install-command]";

const packages = new Set([
  "python",
  "r",
  "homebrew",
  "docker",
  "typescript",
  "source",
] satisfies NonNullable<AnalyticsProps["package"]>[]);

function packageValue(value: string | null) {
  return packages.has(value as NonNullable<AnalyticsProps["package"]>)
    ? (value as AnalyticsProps["package"])
    : undefined;
}

export function getManualCommandCopyProps(
  selectedText: string,
  element: Element | null,
): AnalyticsProps | null {
  if (!selectedText.trim()) return null;

  const command = element?.closest(INSTALL_COMMAND_SELECTOR);
  if (!command) return null;

  return {
    site_area: "install",
    cta_type: "install",
    package: packageValue(command.getAttribute("data-package")),
    content_id: command.getAttribute("data-content-id") ?? undefined,
    copy_method: "manual",
  };
}

export function selectionElement(node: Node | null) {
  if (!node) return null;
  return node instanceof Element ? node : node.parentElement;
}
