import { Box, Link as CkLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export type DocsRailItem =
  | { kind: "heading"; label: string; id?: never; href?: never }
  | { kind?: never; id: string; label: string; href?: string };

type DocsRailProps = {
  items: DocsRailItem[];
  active: string;
  onActiveChange: (id: string) => void;
};

export function DocsRail({ items, active, onActiveChange }: DocsRailProps) {
  return (
    <Box
      as="aside"
      display={{ base: "none", lg: "block" }}
      position="sticky"
      top="5rem"
    >
      <Text
        color="fg.muted"
        fontFamily="monospace"
        fontSize="xs"
        letterSpacing="0.1em"
        textTransform="uppercase"
        mb={3}
      >
        On this page
      </Text>
      <Box borderLeftWidth="1px" borderLeftColor="border.emphasized">
        {items.map((item, index) =>
          item.kind === "heading" ? (
            <Text
              key={`${item.label}-${index}`}
              color="fg.muted"
              fontSize="xs"
              letterSpacing="0.08em"
              textTransform="uppercase"
              px={4}
              pt={index === 0 ? 2 : 4}
              pb={1}
              mb={0}
            >
              {item.label}
            </Text>
          ) : item.href ? (
            <CkLink
              key={item.id}
              asChild
              {...railLinkProps(active === item.id)}
            >
              <NextLink href={item.href}>{item.label}</NextLink>
            </CkLink>
          ) : (
            <CkLink
              key={item.id}
              href={`#${item.id}`}
              {...railLinkProps(active === item.id)}
              onClick={() => onActiveChange(item.id)}
            >
              {item.label}
            </CkLink>
          ),
        )}
      </Box>
    </Box>
  );
}

function railLinkProps(isActive: boolean) {
  return {
    display: "block",
    color: isActive ? "fg" : "fg.muted",
    fontWeight: isActive ? 700 : 400,
    borderLeftWidth: "2px",
    borderLeftColor: isActive ? "red.600" : "transparent",
    ml: "-1px",
    px: 4,
    py: 1.5,
    fontSize: "sm",
    textDecoration: "none",
  } as const;
}
