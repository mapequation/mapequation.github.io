import {
  HStack,
  Spinner,
  Stack,
  Text,
  type StackProps,
} from "@chakra-ui/react";

type WorkbenchOverlayProps = StackProps & {
  description?: string;
  kind: "loading" | "empty" | "error";
  progressLabel?: string;
  title: string;
};

export function WorkbenchOverlay({
  description,
  kind,
  progressLabel,
  title,
  ...props
}: WorkbenchOverlayProps) {
  const isCenteredCard = kind !== "loading";

  if (isCenteredCard) {
    return (
      <Stack
        bg="bg.panel/90"
        borderColor="border"
        borderRadius="md"
        borderWidth="1px"
        color="fg.muted"
        gap={1}
        left="50%"
        maxW="24rem"
        p={4}
        position="absolute"
        textAlign="center"
        top="50%"
        transform="translate(-50%, -50%)"
        {...props}
      >
        <Text color="fg" fontSize="sm" fontWeight={700} mb={0}>
          {title}
        </Text>
        {description && (
          <Text fontSize="sm" mb={0}>
            {description}
          </Text>
        )}
      </Stack>
    );
  }

  return (
    <HStack
      bg="bg.panel/70"
      color="fg"
      inset={0}
      position="absolute"
      alignItems="center"
      justifyContent="center"
      gap={2}
      zIndex={20}
      pointerEvents="none"
      {...props}
    >
      <Spinner size="sm" />
      <Text fontSize="sm" fontWeight={600} mb={0}>
        {progressLabel ?? title}
      </Text>
    </HStack>
  );
}
