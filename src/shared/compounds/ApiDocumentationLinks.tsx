import { chakra, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { LuArrowRight } from "react-icons/lu";
import { trackEvent, type AnalyticsProps } from "../analytics";
import { INFOMAP_PYTHON_DOCS_URL, INFOMAP_R_DOCS_URL } from "../docsUrls";

type ApiDocumentationLinksProps = {
  pythonContentId: string;
  rContentId: string;
  siteArea: AnalyticsProps["site_area"];
};

const docsLinks = [
  {
    description:
      "Installation, quick start, tutorial notebooks, usage patterns, and full API reference.",
    href: INFOMAP_PYTHON_DOCS_URL,
    label: "Python API",
  },
  {
    description:
      "R package reference, binaries, manuals, exported functions, and build status on r-universe.",
    href: INFOMAP_R_DOCS_URL,
    label: "R package",
  },
] as const;

export function ApiDocumentationLinks({
  pythonContentId,
  rContentId,
  siteArea,
}: ApiDocumentationLinksProps) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
      {docsLinks.map((link) => {
        const contentId =
          link.href === INFOMAP_PYTHON_DOCS_URL ? pythonContentId : rContentId;

        return (
          <chakra.a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            display="block"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.emphasized"
            borderRadius="md"
            p={5}
            textDecoration="none"
            color="inherit"
            transition="border-color 150ms"
            onClick={() =>
              trackEvent("outbound_clicked", {
                site_area: siteArea,
                cta_type: "docs",
                content_id: contentId,
                destination: link.href,
              })
            }
            _hover={{ borderColor: "gray.400", textDecoration: "none" }}
          >
            <Stack gap={2}>
              <Heading as="h3" size="sm" mb={0}>
                {link.label}
              </Heading>
              <Text color="fg.muted" fontSize="sm" mb={0}>
                {link.description}
              </Text>
              <Text color="link.emphasis" fontSize="sm" fontWeight={600} mb={0}>
                Open documentation ↗
              </Text>
            </Stack>
          </chakra.a>
        );
      })}
    </SimpleGrid>
  );
}
