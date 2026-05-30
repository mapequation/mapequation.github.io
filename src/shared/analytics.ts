export type AnalyticsEvent =
  | "cta_clicked"
  | "command_copied"
  | "code_example_copied"
  | "citation_copied"
  | "outbound_clicked"
  | "workbench_opened"
  | "workbench_run_started"
  | "workbench_run_completed"
  | "workbench_output_downloaded"
  | "support_clicked";

export type AnalyticsProps = {
  citation_type?: "bibtex" | "method-text";
  content_id?: string;
  cta_type?: "try" | "install" | "docs" | "cite" | "read" | "support";
  destination?: string;
  elapsed_bucket?: string;
  example?: string;
  has_cluster_data?: boolean;
  has_meta_data?: boolean;
  input_length_bucket?: string;
  output_count_bucket?: string;
  package?: "python" | "r" | "homebrew" | "docker" | "typescript" | "source";
  page_path?: string;
  paper?: string;
  site_area?:
    | "home"
    | "infomap"
    | "install"
    | "publications"
    | "apps"
    | "workbench"
    | "about";
  source_campaign?: string;
  status?: "success" | "error";
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_source?: string;
  utm_term?: string;
};

type UmamiTracker = {
  track?: (eventName: string, data?: Record<string, string | number>) => void;
};

type PlausibleTracker = {
  (
    eventName: string,
    options?: { props?: Record<string, string | number> },
  ): void;
  init?: (options?: Record<string, unknown>) => void;
  o?: Record<string, unknown>;
  q?: IArguments[];
};

declare global {
  interface Window {
    plausible?: PlausibleTracker;
    umami?: UmamiTracker;
  }
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function cleanProps(props: AnalyticsProps): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === "") continue;
    cleaned[key] =
      typeof value === "boolean" ? String(value) : (value as string | number);
  }

  return cleaned;
}

function currentPageProps() {
  if (typeof window === "undefined") return {};

  const searchParams = new URLSearchParams(window.location.search);
  const props: AnalyticsProps = {
    page_path: window.location.pathname,
    source_campaign: searchParams.get("utm_campaign") ?? undefined,
  };

  for (const key of UTM_KEYS) {
    const value = searchParams.get(key);
    if (value) props[key] = value;
  }

  return props;
}

export function trackEvent(
  eventName: AnalyticsEvent,
  props: AnalyticsProps = {},
) {
  if (typeof window === "undefined") return;

  const cleanedProps = cleanProps({ ...currentPageProps(), ...props });

  window.umami?.track?.(eventName, cleanedProps);
  window.plausible?.(eventName, { props: cleanedProps });
}
