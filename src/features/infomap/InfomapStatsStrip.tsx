import { Box, Grid, HStack, Stat } from "@chakra-ui/react";
import type { ModuleFlowMap } from "../../state/output";
import {
  type ModuleId,
  type ModuleMap,
  moduleColorFromModel,
} from "./moduleColors";

function formatCodeLengthValue(value: number | null) {
  return value === null ? "—" : value.toFixed(3);
}

function parseTrialCount(consoleContent: string) {
  const match = consoleContent.match(/Summary after\s+(\d+)\s+trials/i);
  if (!match?.[1]) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function moduleSegments(modules: ModuleMap, moduleFlows?: ModuleFlowMap) {
  if (moduleFlows && moduleFlows.size > 0) {
    const flows = new Map<ModuleId, number>();
    for (const entries of moduleFlows.values()) {
      for (const { flow, module } of entries) {
        if (flow <= 0) continue;
        flows.set(module, (flows.get(module) ?? 0) + flow);
      }
    }
    if (flows.size > 0) {
      return [...flows].map(([moduleId, flow]) => ({ moduleId, value: flow }));
    }
  }

  const counts = new Map<ModuleId, number>();
  for (const moduleId of modules.values()) {
    counts.set(moduleId, (counts.get(moduleId) ?? 0) + 1);
  }

  return [...counts].map(([moduleId, count]) => ({ moduleId, value: count }));
}

type ModuleStripSegment = {
  isRemainder?: boolean;
  moduleId?: ModuleId;
  value: number;
};
const minColoredModuleStripShare = 0.025;

function moduleStripSegments(
  segments: { moduleId: ModuleId; value: number }[],
): ModuleStripSegment[] {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total <= 0) return [];

  const firstSmallIndex = segments.findIndex(
    (segment) => segment.value / total < minColoredModuleStripShare,
  );
  const coloredCount =
    firstSmallIndex === -1 ? segments.length : firstSmallIndex;
  const coloredSegments = segments.slice(0, coloredCount);
  const remainderValue = segments
    .slice(coloredCount)
    .reduce((sum, segment) => sum + segment.value, 0);

  if (remainderValue <= 0) return coloredSegments;
  return [...coloredSegments, { isRemainder: true, value: remainderValue }];
}

export function InfomapStatsStrip({
  codeLength,
  codelengthSavings,
  consoleContent,
  moduleColors,
  moduleFlows,
  modules,
  nodeCount,
  numLevels,
  oneLevelCodeLength,
  trialSetting,
}: {
  codeLength: number | null;
  codelengthSavings: number | null;
  consoleContent: string;
  moduleColors: Map<ModuleId, string>;
  moduleFlows?: ModuleFlowMap;
  modules: ModuleMap;
  nodeCount: number;
  numLevels: number | null;
  oneLevelCodeLength: number | null;
  trialSetting: string | null;
}) {
  const segments = moduleSegments(modules, moduleFlows).sort(
    (a, b) => b.value - a.value,
  );
  const moduleCount = segments.length;
  const visibleSegments = moduleStripSegments(segments);
  const trialCount = parseTrialCount(consoleContent);
  const displayedCodeLength = codeLength ?? oneLevelCodeLength;

  return (
    <Grid
      flexShrink={0}
      gap={0}
      templateColumns="repeat(4, minmax(0, 1fr))"
      display={{ base: "none", md: "grid" }}
      overflow="hidden"
      mb={3}
      borderColor="gray.200"
      borderRadius="md"
      borderWidth="1px"
    >
      <ResultStat
        value={moduleCount > 0 ? String(moduleCount) : "0"}
        unit={numLevels != null && numLevels < 3 ? "modules" : "top modules"}
        detail={
          nodeCount > 0
            ? `${nodeCount.toLocaleString()} nodes`
            : "No modules yet"
        }
      >
        <HStack
          aria-hidden="true"
          gap={0.5}
          h="0.375rem"
          mt={1.5}
          visibility={visibleSegments.length > 0 ? "visible" : "hidden"}
          w="100%"
        >
          {visibleSegments.map(({ isRemainder, moduleId, value }, index) => (
            <Box
              bg={
                isRemainder || moduleId === undefined
                  ? "gray.300"
                  : moduleColorFromModel(moduleColors, moduleId)
              }
              borderRadius="full"
              flex={`${value} 1 0`}
              h="100%"
              key={isRemainder ? "remaining-modules" : `${moduleId}-${index}`}
              minW="0.375rem"
            />
          ))}
        </HStack>
      </ResultStat>
      <ResultStat
        value={numLevels === null ? "1" : String(numLevels)}
        unit={numLevels === null || numLevels === 1 ? "level" : "levels"}
        detail={
          numLevels === null
            ? "Awaiting result"
            : numLevels > 2
              ? "Multi-level"
              : "Two-level"
        }
      />
      <ResultStat
        value={formatCodeLengthValue(displayedCodeLength)}
        unit={displayedCodeLength === null ? undefined : "bits"}
        detail={
          codeLength === null && oneLevelCodeLength !== null
            ? "One-level codelength"
            : codelengthSavings === null
              ? "Run Infomap for codelength"
              : `${new Intl.NumberFormat(undefined, {
                  maximumFractionDigits: 2,
                  style: "percent",
                }).format(codelengthSavings)} savings`
        }
      />
      <ResultStat
        value={trialCount === null ? (trialSetting ?? "1") : String(trialCount)}
        unit={trialCount === null ? "trial" : "trials"}
        detail={trialCount === null ? "Current setting" : "Latest run"}
      />
    </Grid>
  );
}

function ResultStat({
  children,
  detail,
  unit,
  value,
}: {
  children?: React.ReactNode;
  detail: string;
  unit?: string;
  value: string;
}) {
  return (
    <Stat.Root
      size="sm"
      py={3}
      px={4}
      h="100%"
      borderRightWidth="1px"
      borderColor="gray.200"
      _last={{ borderRightWidth: 0 }}
    >
      <Stat.ValueText alignItems="baseline">
        {value}
        {unit && <Stat.ValueUnit>{unit}</Stat.ValueUnit>}
      </Stat.ValueText>
      <Stat.HelpText>{detail}</Stat.HelpText>
      {children}
    </Stat.Root>
  );
}
