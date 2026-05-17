import { Box, type BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

type TagProps = BoxProps & {
  children: ReactNode;
};

export const Tag = ({ children, ...props }: TagProps) => (
  <Box
    as="span"
    bg="bg.subtle"
    color="fg.muted"
    borderRadius="sm"
    px={2}
    py={1}
    fontFamily="monospace"
    fontSize="xs"
    {...props}
  >
    {children}
  </Box>
);
