import { type BoxProps, Card, type HeadingProps, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";

type DocsCardProps = BoxProps & {
  children: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
  headingAs?: HeadingProps["as"];
};

export function DocsCard({
  children,
  eyebrow,
  id,
  p = { base: 5, md: 6 },
  title,
  headingAs = "h2",
  ...props
}: DocsCardProps) {
  return (
    <Card.Root
      as="section"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.emphasized"
      borderRadius="md"
      scrollMarginTop="6rem"
      id={id}
      {...props}
    >
      <Card.Body p={p}>
        {eyebrow && (
          <Text
            color="fg.muted"
            fontFamily="monospace"
            fontSize="xs"
            letterSpacing="0.1em"
            textTransform="uppercase"
            mb={2}
          >
            {eyebrow}
          </Text>
        )}
        {title && (
          <SectionHeading as={headingAs} size="md" mb={3} anchorId={id}>
            {title}
          </SectionHeading>
        )}
        {children}
      </Card.Body>
    </Card.Root>
  );
}
