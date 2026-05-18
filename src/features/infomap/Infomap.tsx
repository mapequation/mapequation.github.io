import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Grid,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import Infomap from "@mapequation/infomap";
import localforage from "localforage";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LuChevronDown,
  LuChevronRight,
  LuDownload,
  LuFiles,
  LuPanelLeftOpen,
  LuPanelRightOpen,
  LuPlay,
  LuShare2,
  LuTerminal,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import { PreformattedOutput } from "../../shared/components/PreformattedOutput";
import { WorkbenchActionMenu } from "../../shared/components/WorkbenchActionMenu";
import {
  WorkbenchPanel,
  WorkbenchPanelHeader,
} from "../../shared/components/WorkbenchPanel";
import { WorkbenchTabs } from "../../shared/components/WorkbenchTabs";
import useStore from "../../state";
import { parseCluModules } from "../../state/output";
import {
  argsRequestOutputFormat,
  DEFAULT_INFOMAP_ARGS,
  ensurePreviewOutputs,
} from "../../state/parameters";
import type { InputFile, InputName, OutputKey } from "../../state/types";
import ExampleNetworksList from "./ExamplesMenu";
import { InfomapStatsStrip } from "./InfomapStatsStrip";
import InputParameters from "./InputParameters";
import InputTextarea from "./InputTextarea";
import LoadButton from "./LoadButton";
import {
  buildHierarchicalModuleColors,
  type ModuleId,
  type ModuleMap,
} from "./moduleColors";
import NetworkPreview from "./NetworkPreview";
import Parameters, {
  AdvancedParametersToggle,
  ParametersSearch,
} from "./Parameters";
import {
  errorGraph,
  type PreviewGraph,
  parseInfomapPreviewResult,
} from "./parseInfomapPreview";

localforage.config({ name: "infomap" });

const toolbarControlHeight = "2.75rem";

const inputPlaceholders = {
  network: "Paste network data here…",
  "cluster data": "Paste cluster data here…",
  "meta data": "Paste metadata here…",
} satisfies Record<InputName, string>;

const inputCards = [
  {
    key: "network",
    label: "Network",
    description: "Network data used as the main Infomap input.",
  },
  {
    key: "cluster data",
    label: "Clusters",
    description: "Optional partition data for evaluating known modules.",
  },
  {
    key: "meta data",
    label: "Metadata",
    description: "Optional node metadata for metadata-aware runs.",
  },
] satisfies { key: InputName; label: string; description: string }[];

type EvaluationMetadata = {
  codeLength: number | null;
  codelengthSavings: number | null;
  numLevels: number | null;
};

type LastRunSummary = {
  args: string;
  completedAt: number;
  elapsedMs: number;
  networkSignature: string;
  status: "complete" | "error";
};

type ResultTab = "network" | "console" | "output";

type OutputFileOption = {
  key: OutputKey;
  name: string;
};

function parseEvaluationMetadata(content: Record<string, unknown>) {
  const json = content.json ?? content.json_states;
  if (!json) {
    return { codeLength: null, codelengthSavings: null, numLevels: null };
  }

  let parsed: unknown = json;
  if (typeof json === "string") {
    try {
      parsed = JSON.parse(json) as Record<string, unknown>;
    } catch {
      return { codeLength: null, codelengthSavings: null, numLevels: null };
    }
  }
  if (!parsed || typeof parsed !== "object") {
    return { codeLength: null, codelengthSavings: null, numLevels: null };
  }

  const source = parsed as {
    codelength?: unknown;
    numLevels?: unknown;
    relativeCodelengthSavings?: unknown;
  };
  const codeLength = Number(source.codelength);
  const codelengthSavings = Number(source.relativeCodelengthSavings);
  const numLevels = Number(source.numLevels);

  return {
    codeLength: Number.isFinite(codeLength) ? codeLength : null,
    codelengthSavings: Number.isFinite(codelengthSavings)
      ? codelengthSavings
      : null,
    numLevels: Number.isFinite(numLevels) ? numLevels : null,
  };
}

function previewNodeIdSet(previewGraph: PreviewGraph) {
  if (previewGraph.status !== "ok") return new Set<string>();
  return new Set(previewGraph.nodes.map((node) => node.id));
}

function modulesMatchPreviewNodes(
  modules: Map<number, unknown>,
  previewNodeIds: Set<string>,
) {
  if (modules.size === 0 || previewNodeIds.size === 0) return false;
  for (const id of modules.keys()) {
    if (previewNodeIds.has(String(id))) return true;
  }
  return false;
}

function textSignature(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return `${value.length}:${hash}`;
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${Math.max(1, Math.round(ms))} ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
}

function formatRunTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

function RunStatus({
  changedSinceRun,
  isRunning,
  lastRun,
}: {
  changedSinceRun: boolean;
  isRunning: boolean;
  lastRun: LastRunSummary | null;
}) {
  const color = isRunning
    ? "fg.muted"
    : lastRun?.status === "complete"
      ? "green.700"
      : lastRun?.status === "error"
        ? "red.700"
        : "fg.muted";
  const statusText = isRunning
    ? "Running Infomap…"
    : !lastRun
      ? "Not run yet"
      : lastRun.status === "complete"
        ? `Completed in ${formatDuration(lastRun.elapsedMs)}`
        : `Run failed · ${formatDuration(lastRun.elapsedMs)}`;
  const detailText =
    !isRunning && lastRun
      ? changedSinceRun
        ? "Inputs changed since last run"
        : `Updated ${formatRunTime(lastRun.completedAt)}`
      : "\u00a0";

  return (
    <Stack align="flex-end" gap={0.5} minH="2.25rem" justify="center">
      <Text
        color={color}
        fontSize="xs"
        fontWeight={lastRun && !isRunning ? 600 : 400}
        mb={0}
      >
        {statusText}
      </Text>
      <Text color="fg.muted" fontSize="xs" mb={0}>
        {detailText}
      </Text>
    </Stack>
  );
}

function OutputFileSelector({
  activeOutputFile,
  files,
  hasMultipleFiles,
  selectedOutputFile,
  setActiveKey,
  setTab,
  tab,
}: {
  activeOutputFile?: OutputFileOption;
  files: OutputFileOption[];
  hasMultipleFiles: boolean;
  selectedOutputFile?: OutputFileOption;
  setActiveKey: (key: OutputKey) => void;
  setTab: (tab: ResultTab) => void;
  tab: ResultTab;
}) {
  if (files.length === 0) return null;

  const selectedStyles = {
    "aria-pressed": tab === "output",
    bg: tab === "output" ? "bg.subtle" : undefined,
    borderColor: tab === "output" ? "border.emphasized" : undefined,
    color: tab === "output" ? "fg" : undefined,
    fontSize: "sm",
    fontWeight: 600,
    h: toolbarControlHeight,
    maxW: { base: "9rem", xl: "12rem" },
    minW: 0,
    size: "sm" as const,
    variant: "outline" as const,
    _hover: tab === "output" ? { bg: "bg.subtle" } : undefined,
  };

  if (hasMultipleFiles) {
    return (
      <WorkbenchActionMenu
        ariaLabel="Select output file"
        trigger={
          <>
            <Text
              as="span"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {tab === "output" ? (
                activeOutputFile?.name || "Output"
              ) : (
                <>
                  <Box as="span" display={{ base: "inline", md: "none" }}>
                    Output
                  </Box>
                  <Box as="span" display={{ base: "none", md: "inline" }}>
                    Output files
                  </Box>
                </>
              )}
            </Text>
            <LuChevronDown />
          </>
        }
        triggerProps={selectedStyles}
        items={files.map((file) => ({
          label: file.name,
          onSelect: () => {
            setTab("output");
            setActiveKey(file.key);
          },
          value: file.key,
        }))}
      />
    );
  }

  if (!selectedOutputFile) return null;

  return (
    <Button
      {...selectedStyles}
      onClick={() => {
        setTab("output");
        setActiveKey(selectedOutputFile.key);
      }}
    >
      <Text
        as="span"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {selectedOutputFile.name}
      </Text>
    </Button>
  );
}

function ResultViewControls({
  activeOutputFile,
  files,
  hasMultipleFiles,
  selectedOutputFile,
  setActiveKey,
  setTab,
  tab,
}: {
  activeOutputFile?: OutputFileOption;
  files: OutputFileOption[];
  hasMultipleFiles: boolean;
  selectedOutputFile?: OutputFileOption;
  setActiveKey: (key: OutputKey) => void;
  setTab: (tab: ResultTab) => void;
  tab: ResultTab;
}) {
  return (
    <HStack gap={2} minW={0} w="100%" wrap="wrap">
      <WorkbenchTabs
        ariaLabel="Result views"
        value={tab}
        onValueChange={setTab}
        triggerHeight={toolbarControlHeight}
        items={[
          {
            value: "network",
            label: "Network",
            icon: <LuShare2 style={{ transform: "rotate(90deg)" }} />,
            title: "Show network preview (N)",
          },
          {
            value: "console",
            label: "Console",
            icon: <LuTerminal />,
            title: "Show console output (C)",
          },
        ]}
      />
      <Box display="block" ml={{ base: 0, xl: "auto" }} minW={0}>
        <OutputFileSelector
          activeOutputFile={activeOutputFile}
          files={files}
          hasMultipleFiles={hasMultipleFiles}
          selectedOutputFile={selectedOutputFile}
          setActiveKey={setActiveKey}
          setTab={setTab}
          tab={tab}
        />
      </Box>
    </HStack>
  );
}

export default function InfomapOnline() {
  const store = useStore();
  const [infomapOutput, setInfomapOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [lastRun, setLastRun] = useState<LastRunSummary | null>(null);
  const [showAdvancedParameters, setShowAdvancedParameters] = useState(false);
  const [parameterSearch, setParameterSearch] = useState("");
  const [openInputCards, setOpenInputCards] = useState<Set<InputName>>(
    () => new Set(),
  );
  const outputBufferRef = useRef<string[]>([]);
  const outputFrameRef = useRef<number | null>(null);
  const runStartedAtRef = useRef(0);

  const { activeKey, setActiveKey, physicalFiles, stateFiles } = store.output;
  const { hasArgsError } = store.params;

  const [tab, setTab] = useState<ResultTab>("network");
  const [mobilePanel, setMobilePanel] = useState<"input" | "parameters" | null>(
    null,
  );
  const [outputChangedAt, setOutputChangedAt] = useState(0);
  const [clusterChangedAt, setClusterChangedAt] = useState(0);
  const [outputNetworkSignature, setOutputNetworkSignature] = useState("");
  const pendingOutputNetworkSignatureRef = useRef("");
  const drainOutputBuffer = () => {
    const buffered = outputBufferRef.current;
    outputBufferRef.current = [];

    if (outputFrameRef.current !== null) {
      window.cancelAnimationFrame(outputFrameRef.current);
      outputFrameRef.current = null;
    }

    return buffered;
  };
  const flushOutputBuffer = () => {
    outputFrameRef.current = null;
    const buffered = outputBufferRef.current;
    if (buffered.length === 0) return;
    outputBufferRef.current = [];
    setInfomapOutput((output) => [...output, ...buffered]);
  };
  const queueInfomapOutput = (data: unknown) => {
    outputBufferRef.current.push(String(data));
    if (outputFrameRef.current !== null) return;
    outputFrameRef.current = window.requestAnimationFrame(flushOutputBuffer);
  };

  const [previewGraph, setPreviewGraph] = useState<PreviewGraph>(() =>
    errorGraph("Parsing network…"),
  );
  const [isPreviewParsing, setIsPreviewParsing] = useState(false);
  const previewRunIdRef = useRef(0);
  const previewTimeoutRef = useRef<number | null>(null);

  const [infomap] = useState(() =>
    new Infomap()
      .on("data", queueInfomapOutput)
      .on("error", (error) => {
        const infomapError = error.replace(/^Error:\s+/i, "");
        const buffered = drainOutputBuffer();
        setInfomapOutput((output) => [
          ...output,
          ...buffered,
          `Error: ${infomapError}`,
        ]);
        setIsRunning(false);
        setLastRun({
          args: storeRef.current.params.args,
          completedAt: Date.now(),
          elapsedMs: performance.now() - runStartedAtRef.current,
          networkSignature: pendingOutputNetworkSignatureRef.current,
          status: "error",
        });
        console.error(infomapError);
      })
      .on("finished", async (content) => {
        const buffered = drainOutputBuffer();
        if (buffered.length > 0) {
          setInfomapOutput((output) => [...output, ...buffered]);
        }
        setOutputNetworkSignature(pendingOutputNetworkSignatureRef.current);
        store.output.setContent(content, hiddenOutputKeysRef.current);
        setOutputChangedAt(Date.now());
        await localforage.setItem("network", {
          timestamp: Date.now(),
          name: store.network.name,
          input: store.network.value,
          ...content,
        });
        setIsRunning(false);
        setLastRun({
          args: storeRef.current.params.args,
          completedAt: Date.now(),
          elapsedMs: performance.now() - runStartedAtRef.current,
          networkSignature: pendingOutputNetworkSignatureRef.current,
          status: "complete",
        });
      }),
  );
  const hiddenOutputKeysRef = useRef<Set<OutputKey>>(new Set());

  useEffect(() => {
    const args = new URLSearchParams(window.location.search).get("args");
    const setArgs = store.params.setArgs;

    if (args) {
      setArgs(args);
    } else {
      setArgs(DEFAULT_INFOMAP_ARGS);
    }
  }, [store.params.setArgs]);

  const directedActive = Boolean(store.params.getParam("--directed").active);
  const networkValue = store.network.value;
  const networkName = store.network.name;
  useEffect(() => {
    drainOutputBuffer();
    setInfomapOutput([]);
    store.output.resetContent();
    setOutputNetworkSignature("");
    setPreviewGraph(errorGraph("Loading network…"));
    setIsPreviewParsing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkName]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (previewTimeoutRef.current !== null) {
      window.clearTimeout(previewTimeoutRef.current);
    }
    const runId = ++previewRunIdRef.current;
    let previewInfomap: Infomap | null = null;
    let previewWorkerId: number | null = null;
    const trimmed = networkValue?.trim() ?? "";
    if (!trimmed) {
      setPreviewGraph(errorGraph("Add a network to preview it here."));
      setIsPreviewParsing(false);
      return;
    }
    previewTimeoutRef.current = window.setTimeout(() => {
      previewInfomap = new Infomap();
      setIsPreviewParsing(true);
      const previewArgs = [
        "--no-infomap",
        "--output",
        "json,flow",
        "--silent",
        directedActive ? "--directed" : "",
      ]
        .filter(Boolean)
        .join(" ");
      previewInfomap
        .on("finished", (result) => {
          if (runId !== previewRunIdRef.current) {
            return;
          }
          setPreviewGraph(parseInfomapPreviewResult(result));
          setIsPreviewParsing(false);
        })
        .on("error", (message) => {
          if (runId !== previewRunIdRef.current) {
            return;
          }
          setPreviewGraph(errorGraph(message));
          setIsPreviewParsing(false);
        });
      previewWorkerId = previewInfomap.run({
        network: networkValue,
        filename: networkName || "network",
        args: previewArgs,
      });
    }, 300);

    return () => {
      if (previewTimeoutRef.current !== null) {
        window.clearTimeout(previewTimeoutRef.current);
        previewTimeoutRef.current = null;
      }
      if (previewInfomap && previewWorkerId !== null) {
        void previewInfomap.terminate(previewWorkerId, 0);
      }
      if (previewRunIdRef.current === runId) {
        previewRunIdRef.current += 1;
      }
    };
  }, [networkValue, networkName, directedActive]);

  const onInputChange =
    (activeInput: InputName) =>
    ({ name, value }: InputFile) => {
      if (activeInput === "network") {
        store.setNetwork({ name, value });
      } else if (activeInput === "cluster data") {
        const param = store.params.getParam("--cluster-data");
        setClusterChangedAt(Date.now());
        if (!value) return store.params.resetFileParam(param);
        store.params.setFileParam(param, { name, value });
      } else if (activeInput === "meta data") {
        const param = store.params.getParam("--meta-data");
        if (!value) return store.params.resetFileParam(param);
        store.params.setFileParam(param, { name, value });
      }

      store.output.setDownloaded(false);
    };

  const onLoad = (activeInput: InputName) => (files: File[]) => {
    if (files.length < 1) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      onInputChange(activeInput)({ name: file.name, value });
    };

    reader.readAsText(file, "utf-8");
  };

  const canRun = !hasArgsError && !isRunning;
  const canRunRef = useRef(canRun);
  canRunRef.current = canRun;
  const runRef = useRef<() => void>(() => {});
  const storeRef = useRef(store);
  storeRef.current = store;
  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
        return true;
      return target.isContentEditable;
    };

    const togglePresetParam = (name: string) => {
      storeRef.current.params.toggle(name);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        if (!canRunRef.current) return;
        event.preventDefault();
        runRef.current();
        return;
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        (event.key === "k" || event.key === "K")
      ) {
        const input = document.getElementById("parameters-search");
        if (input instanceof HTMLInputElement) {
          event.preventDefault();
          input.focus();
          input.select();
        }
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      if (event.key === "2") {
        event.preventDefault();
        togglePresetParam("--two-level");
        return;
      }
      if (event.key === "d" || event.key === "D") {
        event.preventDefault();
        togglePresetParam("--directed");
        return;
      }
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        setTab("network");
        return;
      }
      if (event.key === "c" || event.key === "C") {
        event.preventDefault();
        setTab("console");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = () => {
    const args = store.params.args;
    hiddenOutputKeysRef.current = argsRequestOutputFormat(args, "ftree")
      ? new Set()
      : new Set<OutputKey>(["ftree", "ftree_states"]);
    store.output.resetContent();
    setOutputNetworkSignature("");

    setIsRunning(true);
    drainOutputBuffer();
    setInfomapOutput([]);

    try {
      pendingOutputNetworkSignatureRef.current = textSignature(
        store.infomapNetwork.content,
      );
      runStartedAtRef.current = performance.now();
      infomap.run({
        network: store.infomapNetwork.content,
        filename: store.infomapNetwork.filename,
        args: ensurePreviewOutputs(args),
        files: store.infomapFiles,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setIsRunning(false);
      drainOutputBuffer();
      setInfomapOutput([`Error: ${message}`]);
      setLastRun({
        args,
        completedAt: Date.now(),
        elapsedMs: performance.now() - runStartedAtRef.current,
        networkSignature: pendingOutputNetworkSignatureRef.current,
        status: "error",
      });
      console.error(e);
      return;
    }
  };
  runRef.current = run;

  const onCopyClusters = () => store.output.setDownloaded(true);

  const { network, clusterData, metaData, output, params } = store;
  const [clusterEvaluation, setClusterEvaluation] =
    useState<EvaluationMetadata>({
      codeLength: null,
      codelengthSavings: null,
      numLevels: null,
    });
  const clusterModules = useMemo(
    () => parseCluModules(clusterData.value),
    [clusterData.value],
  );
  const previewNodeIds = useMemo(
    () => previewNodeIdSet(previewGraph),
    [previewGraph],
  );
  const currentNetworkSignature = useMemo(
    () => textSignature(network.value),
    [network.value],
  );
  const outputMatchesPreview =
    outputNetworkSignature === currentNetworkSignature &&
    modulesMatchPreviewNodes(output.modules, previewNodeIds);
  const clusterMatchesPreview = modulesMatchPreviewNodes(
    clusterModules,
    previewNodeIds,
  );
  const emptyPreviewModules = useMemo<ModuleMap>(() => new Map(), []);
  const outputWins =
    outputMatchesPreview &&
    (!clusterMatchesPreview || outputChangedAt >= clusterChangedAt);
  const clusterWins = clusterMatchesPreview && !outputWins;
  const previewModules = outputWins
    ? output.modules
    : clusterWins
      ? clusterModules
      : emptyPreviewModules;
  const previewCodeLength =
    outputWins && output.codeLength !== null
      ? output.codeLength
      : clusterWins && clusterEvaluation.codeLength !== null
        ? clusterEvaluation.codeLength
        : null;
  const previewCodelengthSavings =
    outputWins && output.codelengthSavings !== null
      ? output.codelengthSavings
      : clusterWins && clusterEvaluation.codelengthSavings !== null
        ? clusterEvaluation.codelengthSavings
        : null;
  const previewNumLevels =
    outputWins && output.numLevels !== null
      ? output.numLevels
      : clusterWins && clusterEvaluation.numLevels !== null
        ? clusterEvaluation.numLevels
        : null;
  const previewLevelModules = outputWins ? output.levelModules : undefined;
  const previewModuleFlows = outputWins ? output.moduleFlows : undefined;
  const previewNodePaths = outputWins ? output.nodePaths : undefined;
  const previewFtree = outputWins
    ? output.ftree_states || output.ftree
    : undefined;
  const previewModuleColors = useMemo(() => {
    if (previewGraph.status !== "ok" || previewModules.size === 0) {
      return new Map<ModuleId, string>();
    }
    return buildHierarchicalModuleColors({
      activeLevel: 1,
      levelModules: previewLevelModules,
      modules: previewModules,
      nodes: previewGraph.nodes,
    }).colorByModule;
  }, [previewGraph, previewLevelModules, previewModules]);
  const cluLevelParam = params.getParam("--clu-level");
  const numTrialsParam = params.getParam("--num-trials");
  const previewTrialSetting =
    numTrialsParam.active && numTrialsParam.value
      ? String(numTrialsParam.value)
      : "1";
  const previewSelectedLevel = cluLevelParam.active
    ? Number(cluLevelParam.value)
    : null;

  useEffect(() => {
    setClusterEvaluation({
      codeLength: null,
      codelengthSavings: null,
      numLevels: null,
    });
    if (!clusterData.value || !network.value) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      const evaluator = new Infomap()
        .on("finished", (content) => {
          if (cancelled) return;
          setClusterEvaluation(
            parseEvaluationMetadata(content as Record<string, unknown>),
          );
        })
        .on("error", () => {
          if (!cancelled) {
            setClusterEvaluation({
              codeLength: null,
              codelengthSavings: null,
              numLevels: null,
            });
          }
        });

      try {
        const args = params.noInfomapArgs.replace(/-o\s+\S+/g, "-o json");
        evaluator.run({
          network: network.value,
          filename: network.name,
          args,
          files: { [clusterData.name || "clusters.clu"]: clusterData.value },
        });
      } catch {
        setClusterEvaluation({
          codeLength: null,
          codelengthSavings: null,
          numLevels: null,
        });
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    clusterData.name,
    clusterData.value,
    network.name,
    network.value,
    params.noInfomapArgs,
  ]);

  const inputOptions: Record<InputName, InputFile> = {
    network: network,
    "cluster data": clusterData,
    "meta data": metaData,
  };

  const inputAccept: Record<InputName, string[] | undefined> = {
    network: [".net", ".txt", ".edges", ".graph", ".pajek"],
    "cluster data": params.getParam("--cluster-data").accept,
    "meta data": params.getParam("--meta-data").accept,
  };

  const inputPreviewLineLimit = 500;
  const getInputDisplayValue = (value: string) => {
    const lineCount = value ? value.split("\n").length : 0;
    const isLarge = lineCount > inputPreviewLineLimit || value.length > 200_000;
    if (!isLarge) return { value, isLarge, lineCount };

    return {
      value: `${value
        .split("\n")
        .slice(0, inputPreviewLineLimit)
        .join("\n")}\n…\n# ${
        lineCount - inputPreviewLineLimit
      } more lines hidden - input is read-only above the size threshold`,
      isLarge,
      lineCount,
    };
  };
  const getInputSummary = (key: InputName, file: InputFile) => {
    if (!file.value) return "Optional";
    const fileName = file.name || "Pasted input";
    if (key === "network") return fileName;
    const lineCount = file.value.split("\n").length;
    return `${fileName} · ${lineCount.toLocaleString()} lines`;
  };
  const getExpandedInputDetail = (
    key: InputName,
    display: { lineCount: number; isLarge: boolean },
  ) => {
    if (key === "network" && previewGraph.status === "ok") {
      return [
        `${previewGraph.nodes.length.toLocaleString()} nodes`,
        `${previewGraph.links.length.toLocaleString()} links`,
      ];
    }
    return [
      `${display.lineCount.toLocaleString()} lines${
        display.isLarge ? " · preview truncated" : ""
      }`,
    ];
  };
  const toggleInputCard = (key: InputName) => {
    store.setActiveInput(key);
    setOpenInputCards((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  const consoleContent = infomapOutput.join("\n");
  const changedSinceRun =
    !!lastRun &&
    (lastRun.networkSignature !== currentNetworkSignature ||
      lastRun.args !== params.args);
  const showJsonOutput = argsRequestOutputFormat(params.args, "json");
  const outputFiles = [...physicalFiles, ...stateFiles].filter(
    (file) => showJsonOutput || !file.key.startsWith("json"),
  );
  const activeOutputFile = outputFiles.find((file) => file.key === activeKey);
  const selectedOutputFile = activeOutputFile ?? outputFiles[0];
  const hasMultipleOutputFiles = outputFiles.length > 1;
  const resultViewControls = (
    <ResultViewControls
      activeOutputFile={activeOutputFile}
      files={outputFiles}
      hasMultipleFiles={hasMultipleOutputFiles}
      selectedOutputFile={selectedOutputFile}
      setActiveKey={setActiveKey}
      setTab={setTab}
      tab={tab}
    />
  );

  useEffect(() => {
    if (tab === "output" && outputFiles.length === 0) {
      setTab("network");
    }
  }, [outputFiles.length, tab]);

  const runShortcut =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform)
      ? "⌘ + Enter"
      : "Ctrl + Enter";
  const runButton = (
    <Button
      bg="brand.solid"
      color="white"
      _hover={{ bg: "brand.hover" }}
      _active={{ bg: "brand.active" }}
      _disabled={{ bg: "gray.300", color: "gray.500" }}
      disabled={hasArgsError || isRunning}
      loading={isRunning}
      onClick={run}
      size="sm"
      title={`Run Infomap (${runShortcut})`}
    >
      <LuPlay />
      Run
    </Button>
  );
  const renderInputPanel = () => (
    <>
      <WorkbenchPanelHeader
        title="Input data"
        description="Paste, upload, or try an example below."
      />
      <Box
        display="flex"
        flex="1"
        flexDirection="column"
        minH={0}
        overflowX="hidden"
        overflowY="auto"
        pr={1}
      >
        <Stack flexShrink={0} gap={2}>
          {inputCards.map(({ key, label, description }) => {
            const file = inputOptions[key];
            const hasInput = Boolean(file.value);
            const isOpen = openInputCards.has(key);
            const display = getInputDisplayValue(file.value);

            return (
              <Card.Root
                key={key}
                bg="bg.panel"
                borderColor="border"
                overflow="hidden"
                size="sm"
                variant="outline"
              >
                <Card.Body p={2}>
                  <HStack gap={1}>
                    <Button
                      aria-expanded={isOpen}
                      flex="1"
                      justifyContent="flex-start"
                      minH="3rem"
                      minW={0}
                      onClick={() => toggleInputCard(key)}
                      px={2}
                      py={2}
                      size="sm"
                      type="button"
                      variant="ghost"
                      _hover={{ bg: "bg.subtle" }}
                    >
                      <HStack gap={2} minW={0}>
                        {isOpen ? <LuChevronDown /> : <LuChevronRight />}
                        <Box minW={0} textAlign="left">
                          <HStack gap={1.5}>
                            <Text as="span" fontWeight={700}>
                              {label}
                            </Text>
                          </HStack>
                          <Text
                            as="span"
                            color="fg.muted"
                            display="block"
                            fontSize="xs"
                            fontWeight={400}
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                          >
                            {getInputSummary(key, file)}
                          </Text>
                        </Box>
                      </HStack>
                    </Button>
                    {key === "network" && !isOpen && (
                      <LoadButton
                        onDrop={onLoad(key)}
                        accept={inputAccept[key]}
                        disabled={isInputLoading}
                        flexShrink={0}
                        size="xs"
                        variant={hasInput ? "outline" : "surface"}
                      >
                        {hasInput ? "Change" : "Browse"}
                      </LoadButton>
                    )}
                  </HStack>
                </Card.Body>
                {isOpen && (
                  <Card.Body
                    borderTopWidth="1px"
                    borderColor="border"
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    p={3}
                  >
                    {hasInput ? (
                      <HStack gap={2} justify="space-between" wrap="wrap">
                        <Stack gap={0} minW={0} pl={1}>
                          {getExpandedInputDetail(key, display).map(
                            (detail) => (
                              <Text
                                key={detail}
                                color="fg.muted"
                                fontSize="xs"
                                fontWeight={400}
                                mb={0}
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                              >
                                {detail}
                              </Text>
                            ),
                          )}
                        </Stack>
                        <HStack gap={1}>
                          <LoadButton
                            onDrop={onLoad(key)}
                            accept={inputAccept[key]}
                            disabled={isInputLoading}
                            size="xs"
                            variant="surface"
                          >
                            Change file
                          </LoadButton>
                          <Button
                            aria-label={`Clear ${label.toLowerCase()} input`}
                            disabled={isInputLoading}
                            onClick={() =>
                              onInputChange(key)({ name: "", value: "" })
                            }
                            size="xs"
                            type="button"
                            variant="ghost"
                          >
                            <LuTrash2 />
                          </Button>
                        </HStack>
                      </HStack>
                    ) : (
                      <Box
                        bg="bg.subtle"
                        borderColor="border"
                        borderRadius="md"
                        borderStyle="dashed"
                        borderWidth="1px"
                        p={3}
                      >
                        <Stack align="flex-start" gap={2}>
                          <Box>
                            <Text
                              color="gray.700"
                              fontSize="sm"
                              fontWeight={700}
                              mb={0}
                            >
                              Add {label.toLowerCase()} input
                            </Text>
                            <Text color="fg.muted" fontSize="xs" mb={0}>
                              {description}
                            </Text>
                          </Box>
                          <LoadButton
                            onDrop={onLoad(key)}
                            accept={inputAccept[key]}
                            disabled={isInputLoading}
                            size="sm"
                            variant="surface"
                          >
                            Browse file
                          </LoadButton>
                        </Stack>
                      </Box>
                    )}
                    <InputTextarea
                      aria-label={`${key} input`}
                      name={`${key}-input`}
                      onDrop={onLoad(key)}
                      accept={inputAccept[key]}
                      onChange={(event) =>
                        onInputChange(key)({
                          name: file.name,
                          value: event.target.value,
                        })
                      }
                      value={display.value}
                      readOnly={display.isLarge}
                      disabled={isInputLoading}
                      placeholder={inputPlaceholders[key]}
                      spellCheck={false}
                      wrap="off"
                      overflow="auto"
                      resize="vertical"
                      minH="9rem"
                      maxH={{ base: "16rem", lg: "22rem" }}
                      variant="outline"
                      bg="bg.subtle"
                      fontSize="sm"
                    />
                  </Card.Body>
                )}
              </Card.Root>
            );
          })}
        </Stack>
        <Box flexShrink={0}>
          <ExampleNetworksList
            disabled={isRunning}
            onLoadingChange={setIsInputLoading}
            onSelectNetwork={() => setMobilePanel(null)}
          />
        </Box>
      </Box>
    </>
  );
  const renderParametersPanel = () => (
    <>
      <WorkbenchPanelHeader
        title="Parameters"
        description="Configure how Infomap runs."
        action={
          <AdvancedParametersToggle
            advanced={showAdvancedParameters}
            onToggle={() => setShowAdvancedParameters(!showAdvancedParameters)}
          />
        }
      />

      <HStack flexShrink={0} justify="space-between" gap={3} mb={3}>
        {runButton}
        <RunStatus
          changedSinceRun={changedSinceRun}
          isRunning={isRunning}
          lastRun={lastRun}
        />
      </HStack>

      <Box flexShrink={0} mb={5}>
        <InputParameters loading={isRunning} onClick={run} />
      </Box>

      <Box flexShrink={0} mb={2}>
        <ParametersSearch
          search={parameterSearch}
          setSearch={setParameterSearch}
        />
      </Box>

      <Box flex="1" minH={0} overflowY="auto" overflowX="hidden" pr={1}>
        <Parameters
          advanced={showAdvancedParameters}
          changedFromArgs={lastRun?.args}
          search={parameterSearch}
          setAdvanced={setShowAdvancedParameters}
        />
      </Box>
    </>
  );

  return (
    <Grid
      flex="1"
      minH={0}
      h="100%"
      overflow="hidden"
      gap={4}
      p={4}
      templateAreas={{
        base: "'console'",
        lg: "'console output'",
        xl: "'input console output'",
      }}
      templateColumns={{
        base: "minmax(0, 1fr)",
        lg: "minmax(28rem, 1fr) 30rem",
        xl: "22rem minmax(28rem, 1fr) 30rem",
      }}
      templateRows={{
        base: "minmax(0, 1fr)",
        xl: "minmax(0, 1fr)",
      }}
    >
      <WorkbenchPanel
        gridArea="input"
        minH={0}
        minW={0}
        display={{ base: "none", xl: "flex" }}
        flexDirection="column"
        overflowY="auto"
        overflowX="hidden"
      >
        {renderInputPanel()}
      </WorkbenchPanel>
      <WorkbenchPanel
        gridArea="console"
        minH={0}
        minW={0}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        tone="raised"
      >
        <WorkbenchPanelHeader
          title="Results"
          description="Network, run log, and output files from the latest run."
        />

        <InfomapStatsStrip
          codeLength={previewCodeLength}
          codelengthSavings={previewCodelengthSavings}
          consoleContent={consoleContent}
          moduleColors={previewModuleColors}
          moduleFlows={previewModuleFlows}
          modules={previewModules}
          nodeCount={
            previewGraph.status === "ok" ? previewGraph.nodes.length : 0
          }
          numLevels={previewNumLevels}
          oneLevelCodeLength={
            previewGraph.status === "ok"
              ? previewGraph.oneLevelCodeLength
              : null
          }
          trialSetting={previewTrialSetting}
        />

        <Stack gap={2} flexShrink={0} mb={1}>
          <Flex
            align="center"
            display={{ base: "flex", md: "none" }}
            justify="space-between"
            gap={2}
            w="100%"
          >
            <Button
              fontSize="sm"
              fontWeight={600}
              h={toolbarControlHeight}
              onClick={() => setMobilePanel("input")}
              size="sm"
              variant="outline"
            >
              <LuPanelLeftOpen />
              Input
            </Button>
            <Button
              fontSize="sm"
              fontWeight={600}
              h={toolbarControlHeight}
              onClick={() => setMobilePanel("parameters")}
              size="sm"
              variant="outline"
            >
              <LuPanelRightOpen />
              Parameters
            </Button>
          </Flex>
          <Flex display={{ base: "flex", md: "none" }} minW={0} w="100%">
            {resultViewControls}
          </Flex>
          <HStack
            align="center"
            display={{ base: "none", md: "flex" }}
            gap={2}
            justify="space-between"
            w="100%"
          >
            <HStack display={{ base: "flex", xl: "none" }} gap={2}>
              <Button
                fontSize="sm"
                fontWeight={600}
                h={toolbarControlHeight}
                onClick={() => setMobilePanel("input")}
                size="sm"
                variant="outline"
              >
                <LuPanelLeftOpen />
                Input
              </Button>
            </HStack>
            <Box flex="1" minW={0}>
              {resultViewControls}
            </Box>
            <Button
              display={{ base: "none", md: "inline-flex", lg: "none" }}
              fontSize="sm"
              fontWeight={600}
              h={toolbarControlHeight}
              ml="auto"
              onClick={() => setMobilePanel("parameters")}
              size="sm"
              variant="outline"
            >
              <LuPanelRightOpen />
              Parameters
            </Button>
          </HStack>
        </Stack>

        <Box display={tab === "network" ? "flex" : "none"} flex="1" minH={0}>
          <NetworkPreview
            directed={Boolean(params.getParam("--directed").active)}
            ftree={previewFtree}
            levelModules={previewLevelModules}
            loadingState={
              isRunning
                ? "running"
                : isInputLoading || isPreviewParsing
                  ? "loading"
                  : null
            }
            previewGraph={previewGraph}
            networkName={network.name}
            modules={previewModules}
            moduleFlows={previewModuleFlows}
            nodePaths={previewNodePaths}
            numLevels={previewNumLevels}
            selectedLevel={previewSelectedLevel}
          />
        </Box>
        <Box display={tab === "console" ? "flex" : "none"} flex="1" minH={0}>
          <PreformattedOutput
            ariaLabel="Infomap console output"
            autoScroll
            content={consoleContent}
            fontSize="0.6875rem"
            isActive={tab === "console"}
            onCopy={() => {}}
            placeholder="Run Infomap to see the log…"
            variant="terminal"
          />
        </Box>
        <Box display={tab === "output" ? "flex" : "none"} flex="1" minH={0}>
          <Field.Root flex="1" minH={0} position="relative">
            {output.activeContent && (
              <Box position="absolute" right={3} top={3} zIndex={1}>
                <WorkbenchActionMenu
                  ariaLabel="Download output"
                  disabled={isRunning}
                  trigger={<LuDownload />}
                  items={[
                    {
                      icon: <LuDownload />,
                      label: "Download file",
                      onSelect: output.downloadActiveContent,
                      value: "download-file",
                    },
                    ...(hasMultipleOutputFiles
                      ? [
                          {
                            icon: <LuFiles />,
                            label: "Download all",
                            onSelect: store.output.downloadAll,
                            value: "download-all",
                          },
                        ]
                      : []),
                  ]}
                />
              </Box>
            )}
            <PreformattedOutput
              content={output.activeContent}
              onCopy={onCopyClusters}
            />
          </Field.Root>
        </Box>
      </WorkbenchPanel>
      <WorkbenchPanel
        gridArea="output"
        minH={0}
        minW={0}
        maxH="100%"
        display={{ base: "none", lg: "flex" }}
        flexDirection="column"
        overflow="hidden"
      >
        {renderParametersPanel()}
      </WorkbenchPanel>
      {mobilePanel && (
        <Box
          display={{ base: "block", xl: "none" }}
          inset={0}
          position="fixed"
          zIndex={1400}
        >
          <Box
            bg="blackAlpha.500"
            inset={0}
            onClick={() => setMobilePanel(null)}
            position="absolute"
            zIndex={0}
          />
          <WorkbenchPanel
            bottom={0}
            boxShadow="xl"
            display="flex"
            flexDirection="column"
            left={mobilePanel === "input" ? 0 : undefined}
            maxW="min(28rem, calc(100vw - 2rem))"
            minH={0}
            overflow="hidden"
            p={4}
            position="absolute"
            right={mobilePanel === "parameters" ? 0 : undefined}
            top={0}
            tone="raised"
            w="100%"
            zIndex={1}
          >
            <HStack justify="flex-end" mb={2} flexShrink={0}>
              <Button
                aria-label="Close panel"
                onClick={() => setMobilePanel(null)}
                size="sm"
                variant="ghost"
              >
                <LuX />
              </Button>
            </HStack>
            {mobilePanel === "parameters"
              ? renderParametersPanel()
              : renderInputPanel()}
          </WorkbenchPanel>
        </Box>
      )}
    </Grid>
  );
}
