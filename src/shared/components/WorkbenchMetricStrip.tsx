import { Grid, Stat, type GridProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type WorkbenchMetric = {
  children?: ReactNode;
  detail: string;
  unit?: string;
  value: string;
};

type WorkbenchMetricStripProps = GridProps & {
  metrics: WorkbenchMetric[];
};

export function WorkbenchMetricStrip({
  metrics,
  ...props
}: WorkbenchMetricStripProps) {
  return (
    <Grid
      borderColor="border"
      borderRadius="md"
      borderWidth="1px"
      boxShadow="sm"
      display={{ base: "none", md: "grid" }}
      flexShrink={0}
      gap={0}
      mb={3}
      overflow="hidden"
      templateColumns={`repeat(${metrics.length}, minmax(0, 1fr))`}
      {...props}
    >
      {metrics.map((metric, index) => (
        <Stat.Root
          key={`${metric.value}-${metric.detail}-${index}`}
          size="sm"
          py={3}
          px={4}
          h="100%"
          borderRightWidth="1px"
          borderColor="border"
          _last={{ borderRightWidth: 0 }}
        >
          <Stat.ValueText alignItems="baseline">
            {metric.value}
            {metric.unit && <Stat.ValueUnit>{metric.unit}</Stat.ValueUnit>}
          </Stat.ValueText>
          <Stat.HelpText>{metric.detail}</Stat.HelpText>
          {metric.children}
        </Stat.Root>
      ))}
    </Grid>
  );
}
