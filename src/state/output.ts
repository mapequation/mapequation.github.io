import { OUTPUT_FORMATS } from "../data/output-formats";
import type { ModuleId } from "../features/infomap/moduleColors";
import type { OutputContent, OutputFile, OutputKey } from "./types";

export type OutputState = Record<OutputKey, string> & {
  activeKey: OutputKey;
  codeLength: number | null;
  codelengthSavings: number | null;
  downloaded: boolean;
  hiddenOutputKeys: Set<OutputKey>;
  levelModules: Map<number, Map<number, string>>;
  modules: Map<number, ModuleId>;
  moduleFlows: ModuleFlowMap;
  nodePaths: Map<number, number[]>;
  numLevels: number | null;
};

export const emptyOutput = (): OutputState => ({
  clu: "",
  tree: "",
  ftree: "",
  net: "",
  newick: "",
  json: "",
  csv: "",
  states_as_physical: "",
  clu_states: "",
  tree_states: "",
  ftree_states: "",
  newick_states: "",
  json_states: "",
  csv_states: "",
  states: "",
  flow: "",
  flow_as_physical: "",
  activeKey: "tree",
  codeLength: null,
  codelengthSavings: null,
  downloaded: false,
  hiddenOutputKeys: new Set(),
  levelModules: new Map(),
  modules: new Map(),
  moduleFlows: new Map(),
  nodePaths: new Map(),
  numLevels: null,
});

export function outputFiles(output: OutputState, name: string): OutputFile[] {
  return OUTPUT_FORMATS.filter(
    ({ key }) => output[key] && !output.hiddenOutputKeys.has(key),
  ).map((format) => ({
    ...format,
    filename: `${name}${format.suffix}.${format.extension}`,
  }));
}

export function physicalFiles(output: OutputState, name: string) {
  return outputFiles(output, name).filter((file) => !file.isStates);
}

export function stateFiles(output: OutputState, name: string) {
  return outputFiles(output, name).filter((file) => file.isStates);
}

export function parseCluModules(clu: string) {
  if (!clu) return new Map<number, ModuleId>();

  const flows = parseCluModuleFlows(clu);
  const modules = new Map<number, ModuleId>();
  for (const [id, entries] of flows) {
    let best = entries[0];
    for (const entry of entries) {
      if (entry.flow > best.flow) best = entry;
    }
    modules.set(id, best.module);
  }
  return modules;
}

type ModuleFlow = { module: ModuleId; flow: number };
export type ModuleFlowMap = Map<number, ModuleFlow[]>;

function parseCluModuleFlows(clu: string): ModuleFlowMap {
  const result: ModuleFlowMap = new Map();
  if (!clu) return result;

  const lines = clu.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("%")) {
      continue;
    }
    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 2) continue;
    const id = Number(tokens[0]);
    const moduleId = tokens[1];
    const flow = tokens.length >= 3 ? Number(tokens[2]) : 1;
    if (!Number.isFinite(id) || !moduleId) continue;
    let arr = result.get(id);
    if (!arr) {
      arr = [];
      result.set(id, arr);
    }
    arr.push({ module: moduleId, flow: Number.isFinite(flow) ? flow : 1 });
  }
  return result;
}

type JsonOutputNode = {
  id?: unknown;
  flow?: unknown;
  path?: unknown;
};

type ParsedJsonOutput = {
  codelength?: unknown;
  codeLength?: unknown;
  nodes?: unknown;
  numLevels?: unknown;
  relativeCodelengthSavings?: unknown;
};

type ParsedJsonDerivedState = Pick<
  OutputState,
  | "codeLength"
  | "codelengthSavings"
  | "levelModules"
  | "modules"
  | "moduleFlows"
  | "nodePaths"
  | "numLevels"
>;

function parseJsonOutput(value: unknown): ParsedJsonOutput | null {
  const json = value;
  if (!json) return null;

  if (typeof json === "object") {
    return json as ParsedJsonOutput;
  }

  if (typeof json !== "string") return null;

  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object"
      ? (parsed as ParsedJsonOutput)
      : null;
  } catch {
    return null;
  }
}

function parseJsonDerivedState(
  parsed: ParsedJsonOutput | null,
): ParsedJsonDerivedState {
  const moduleFlows: ModuleFlowMap = new Map();
  const bestPathByNode = new Map<number, { flow: number; path: number[] }>();
  const bestByNodeAndLevel = new Map<
    string,
    { flow: number; id: number; level: number; moduleId: string }
  >();
  const nodes = Array.isArray(parsed?.nodes)
    ? (parsed.nodes as JsonOutputNode[])
    : [];

  for (const node of nodes) {
    const id = Number(node.id);
    const path = Array.isArray(node.path) ? node.path.map(Number) : [];
    const flow = Number(node.flow);
    const finiteFlow = Number.isFinite(flow) ? flow : 1;

    if (!Number.isFinite(id)) {
      continue;
    }

    const module = path[0];
    if (Number.isFinite(module)) {
      const moduleId = String(module);
      const entries = moduleFlows.get(id) ?? [];
      const existing = entries.find((entry) => entry.module === moduleId);
      if (existing) {
        existing.flow += finiteFlow;
      } else {
        entries.push({ module: moduleId, flow: finiteFlow });
        moduleFlows.set(id, entries);
      }
    }

    if (path.length >= 2) {
      if (path.every((part) => Number.isFinite(part))) {
        const previousPath = bestPathByNode.get(id);
        if (!previousPath || finiteFlow > previousPath.flow) {
          bestPathByNode.set(id, { flow: finiteFlow, path });
        }
      }

      const moduleDepth = Math.max(1, path.length - 1);
      for (let level = 1; level <= moduleDepth; level += 1) {
        const moduleId = path.slice(0, level).join(":");
        const key = `${id}:${level}`;
        const previous = bestByNodeAndLevel.get(key);
        if (!previous || finiteFlow > previous.flow) {
          bestByNodeAndLevel.set(key, {
            flow: finiteFlow,
            id,
            level,
            moduleId,
          });
        }
      }
    }
  }

  const modules = new Map<number, ModuleId>();
  for (const [id, entries] of moduleFlows) {
    let best = entries[0];
    for (const entry of entries) {
      if (entry.flow > best.flow) best = entry;
    }
    modules.set(id, best.module);
  }

  const nodePaths = new Map(
    [...bestPathByNode].map(([id, value]) => [id, value.path]),
  );
  const levelModules = new Map<number, Map<number, string>>();
  for (const { id, level, moduleId } of bestByNodeAndLevel.values()) {
    const levelModule = levelModules.get(level) ?? new Map<number, string>();
    levelModule.set(id, moduleId);
    levelModules.set(level, levelModule);
  }

  const codeLength = Number(parsed?.codelength ?? parsed?.codeLength);
  const codelengthSavings = Number(parsed?.relativeCodelengthSavings);
  const numLevels = Number(parsed?.numLevels);
  return {
    codeLength: Number.isFinite(codeLength) ? codeLength : null,
    codelengthSavings: Number.isFinite(codelengthSavings)
      ? codelengthSavings
      : null,
    levelModules,
    modules,
    moduleFlows,
    nodePaths,
    numLevels: Number.isFinite(numLevels) ? numLevels : null,
  };
}

export function applyOutputContent(
  current: OutputState,
  content: OutputContent,
  hiddenOutputKeys: Set<OutputKey> = new Set(),
): OutputState {
  const next = { ...current, hiddenOutputKeys };

  for (const { key } of OUTPUT_FORMATS) {
    const value = content[key];
    if (!value) continue;
    next[key] =
      key === "json" || key === "json_states"
        ? JSON.stringify(value, null, 2)
        : String(value);
  }

  const jsonContent =
    content.json_states ?? content.json ?? next.json_states ?? next.json;
  const jsonState = parseJsonDerivedState(parseJsonOutput(jsonContent));
  next.modules = jsonState.modules;
  next.moduleFlows = jsonState.moduleFlows;
  next.nodePaths = jsonState.nodePaths;
  next.levelModules = jsonState.levelModules;
  next.codeLength = jsonState.codeLength;
  next.codelengthSavings = jsonState.codelengthSavings;
  next.numLevels = jsonState.numLevels;
  next.activeKey =
    ([
      "clu",
      "tree",
      "ftree",
      "newick",
      "json",
      "csv",
      "net",
      "states",
      "flow",
    ].find((key) => {
      const outputKey = key as OutputKey;
      return content[outputKey] && !hiddenOutputKeys.has(outputKey);
    }) as OutputKey | undefined) || "clu";

  return next;
}

export function outputFileMimeType(formatKey: OutputKey) {
  return formatKey === "json" || formatKey === "json_states"
    ? "application/json;charset=utf-8"
    : "text/plain;charset=utf-8";
}

export function outputFileDownloadData(
  output: OutputState,
  name: string,
  formatKey: OutputKey,
) {
  const file = outputFiles(output, name).find(({ key }) => key === formatKey);
  const content = output[formatKey];
  if (!file) return null;

  return {
    data: content,
    fileName: file.filename,
    mimeType: outputFileMimeType(formatKey),
  };
}

export function outputFilesDownloadData(output: OutputState, name: string) {
  return outputFiles(output, name).map((file) => ({
    data: output[file.key],
    fileName: file.filename,
    mimeType: outputFileMimeType(file.key),
  }));
}
