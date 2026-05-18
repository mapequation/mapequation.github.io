import { Box, type BoxProps } from "@chakra-ui/react";
import { useLayoutEffect, useRef } from "react";

type PreformattedOutputProps = Omit<BoxProps, "content"> & {
  ariaLabel?: string;
  autoScroll?: boolean;
  content: string;
  fontSize?: BoxProps["fontSize"];
  isActive?: boolean;
  onCopy?: () => void;
  placeholder?: string;
  variant?: "default" | "terminal";
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? () => undefined : useLayoutEffect;

export function PreformattedOutput({
  ariaLabel = "Generated output",
  autoScroll = false,
  content,
  fontSize = "xs",
  isActive = true,
  onCopy,
  placeholder = "",
  variant = "default",
  ...props
}: PreformattedOutputProps) {
  const scrollContainerRef = useRef<HTMLPreElement | null>(null);
  const isTerminal = variant === "terminal";
  const selectionStyle = isTerminal
    ? { background: "#374151", color: "#f9fafb" }
    : { background: "#1d4ed8", color: "white" };

  useIsomorphicLayoutEffect(() => {
    if (!autoScroll || !isActive) return;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, [autoScroll, content.length, isActive]);

  return (
    <Box
      aria-label={ariaLabel}
      as="pre"
      bg={isTerminal ? "#0b1020" : "bg.subtle"}
      borderColor={isTerminal ? "#1f2937" : "border.emphasized"}
      borderRadius="md"
      borderWidth="1px"
      boxShadow={isTerminal ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "inner"}
      color={isTerminal ? "#d1d5db" : "fg"}
      fontFamily="monospace"
      fontSize={fontSize}
      h="100%"
      lineHeight={1.5}
      m={0}
      minH={0}
      onCopy={onCopy}
      overflow="auto"
      p={3}
      ref={scrollContainerRef}
      role="textbox"
      tabIndex={0}
      whiteSpace="pre"
      w="100%"
      css={{
        "& *::selection": selectionStyle,
        "&::selection": selectionStyle,
      }}
      {...props}
    >
      {content || placeholder}
    </Box>
  );
}
