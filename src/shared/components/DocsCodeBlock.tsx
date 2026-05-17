import { Box, type BoxProps, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { CopyButton } from "./CopyButton";

type DocsCodeBlockProps = BoxProps & {
  children: ReactNode;
};

function codeText(children: ReactNode) {
  if (Array.isArray(children)) return children.join("");
  return String(children);
}

export function DocsCodeBlock({ children, ...props }: DocsCodeBlockProps) {
  return (
    <Box position="relative" {...props}>
      <Box
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.emphasized"
        borderRadius="md"
        p={4}
        overflowX="auto"
      >
        <chakra.pre
          m={0}
          fontFamily="monospace"
          fontSize="sm"
          lineHeight={1.6}
          whiteSpace="pre-wrap"
        >
          {children}
        </chakra.pre>
      </Box>
      <Box position="absolute" top={2} right={2}>
        <CopyButton
          text={codeText(children)}
          size="xs"
          variant="surface"
          ariaLabel="Copy code block"
        />
      </Box>
    </Box>
  );
}
