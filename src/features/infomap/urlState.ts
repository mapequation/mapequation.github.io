import type { InputFile, InputName } from "../../state/types";

const MAX_URL_INPUT_LENGTH = 200_000;

type UrlInputName = Extract<InputName, "network"> | "clusterData" | "metaData";

export type WorkbenchUrlState = {
  args?: string;
  network?: InputFile;
  clusterData?: InputFile;
  metaData?: InputFile;
  oversized: UrlInputName[];
};

type WorkbenchShareState = {
  args: string;
  network: InputFile;
  clusterData: InputFile;
  metaData: InputFile;
};

const inputParams = [
  { key: "network", nameKey: "networkName" },
  { key: "clusterData", nameKey: "clusterName" },
  { key: "metaData", nameKey: "metaName" },
] satisfies { key: UrlInputName; nameKey: string }[];

const cleanParam = (params: URLSearchParams, key: string) => {
  const value = params.get(key);
  if (value === null) return undefined;
  return value.trim() ? value : undefined;
};

export function parseWorkbenchUrlState(
  params: URLSearchParams,
): WorkbenchUrlState {
  const state: WorkbenchUrlState = { oversized: [] };
  const args = cleanParam(params, "args");
  if (args) {
    state.args = args;
  }

  for (const { key, nameKey } of inputParams) {
    const value = cleanParam(params, key);
    if (!value) continue;

    if (value.length > MAX_URL_INPUT_LENGTH) {
      state.oversized.push(key);
      continue;
    }

    state[key] = {
      name: params.get(nameKey)?.trim() ?? "",
      value,
    };
  }

  return state;
}

export function buildWorkbenchUrl(baseUrl: string, state: WorkbenchShareState) {
  const url = new URL(baseUrl);
  const params = new URLSearchParams();

  for (const { key, nameKey } of inputParams) {
    const input = state[key];
    if (!input.value.trim()) continue;
    params.set(key, input.value);
    if (input.name.trim()) {
      params.set(nameKey, input.name);
    }
  }

  if (state.args.trim()) {
    params.set("args", state.args);
  }

  url.search = params.toString();
  url.hash = "";
  return url.toString();
}
