import {
  Box,
  type BoxProps,
  Flex,
  Heading,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

type WorkbenchPanelProps = StackProps & {
  tone?: "raised" | "subtle";
};

export function WorkbenchPanel({
  children,
  tone = "subtle",
  ...props
}: WorkbenchPanelProps) {
  const isRaised = tone === "raised";

  return (
    <Stack
      bg={isRaised ? "bg.panel" : "bg.subtle"}
      borderColor="border.emphasized"
      borderRadius="md"
      borderWidth="1px"
      boxShadow={isRaised ? "xl" : "inner"}
      gap={0}
      minH={0}
      minW={0}
      overflow="hidden"
      p={4}
      {...props}
    >
      {children}
    </Stack>
  );
}

export function WorkbenchPanelHeader({
  title,
  description,
  action,
  ...props
}: BoxProps & {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Box flexShrink={0} mb={3} {...props}>
      <Flex align="center" gap={3} justify="space-between">
        <Heading as="h2" size="sm" mb={0}>
          {title}
        </Heading>
        {action}
      </Flex>
      {description && (
        <Text color="fg.muted" fontSize="sm" mb={0} mt={1}>
          {description}
        </Text>
      )}
    </Box>
  );
}
