import { Box, chakra, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { CopyButton } from "../components/CopyButton";
import { DocsCard } from "../components/DocsCard";
import { Tag } from "../components/Tag";
import { trackEvent } from "../analytics";
import { infomapVersion } from "../infomapVersion";

const currentYear = new Date().getFullYear();

const softwareBibtex = `@misc{mapequation${currentYear}software,
  title        = {{The MapEquation software package}},
  author       = {Daniel Edler and Anton Holmgren and Martin Rosvall},
  howpublished = {\\url{https://mapequation.org}},
  version      = {${infomapVersion}},
  year         = {${currentYear}},
}`;

const paperBibtex = `@article{rosvall2008maps,
  title   = {Maps of random walks on complex networks reveal community structure},
  author  = {Rosvall, Martin and Bergstrom, Carl T.},
  journal = {Proceedings of the National Academy of Sciences},
  volume  = {105},
  number  = {4},
  pages   = {1118--1123},
  year    = {2008},
  doi     = {10.1073/pnas.0706851105},
}`;

type ChipTone = "neutral" | "accent";

function Chip({
  tone = "neutral",
  children,
}: {
  tone?: ChipTone;
  children: string;
}) {
  return (
    <Tag
      display="inline-block"
      px={2.5}
      py={1}
      letterSpacing="0.08em"
      textTransform="uppercase"
      bg={tone === "accent" ? "green.50" : "bg.subtle"}
      color={tone === "accent" ? "green.800" : "fg.muted"}
    >
      {children}
    </Tag>
  );
}

function citationDestination(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("doi")) return "doi";
  if (normalized.includes("pdf")) return "pdf";
  if (normalized.includes("scholar")) return "google-scholar";
  return normalized.replaceAll(" ", "-");
}

function ExternalLink({
  href,
  paper,
  children,
}: {
  href: string;
  paper: string;
  children: string;
}) {
  return (
    <chakra.a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        trackEvent("outbound_clicked", {
          site_area: "publications",
          cta_type: children.toLowerCase().includes("pdf") ? "read" : "cite",
          paper,
          destination: citationDestination(children),
        })
      }
      display="inline-flex"
      alignItems="center"
      px={3}
      py={1.5}
      fontSize="sm"
      fontWeight={500}
      color="fg"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.emphasized"
      borderRadius="md"
      textDecoration="none"
      _hover={{ borderColor: "fg.muted", textDecoration: "none" }}
    >
      {children} →
    </chakra.a>
  );
}

function CitationCard({
  id,
  chipLabel,
  chipTone,
  meta,
  title,
  description,
  bibtex,
  links,
  paper,
}: {
  id: string;
  chipLabel: string;
  chipTone?: ChipTone;
  meta: string;
  title: string;
  description: string;
  bibtex: string;
  links?: { label: string; href: string }[];
  paper: string;
}) {
  return (
    <DocsCard id={id} mb={5}>
      <Flex justify="space-between" align="center" mb={4} gap={4}>
        <Chip tone={chipTone}>{chipLabel}</Chip>
        <Text
          color="fg.muted"
          fontFamily="monospace"
          fontSize="xs"
          letterSpacing="0.04em"
          textTransform="uppercase"
          mb={0}
        >
          {meta}
        </Text>
      </Flex>
      <Heading as="h3" fontWeight={700} textStyle="h2" lineHeight={1.2} mb={3}>
        {title}
      </Heading>
      <Text
        color="fg.muted"
        fontSize="sm"
        mb={4}
        lineHeight={1.55}
        maxW="48rem"
      >
        {description}
      </Text>
      <Flex gap={2} flexWrap="wrap">
        <CopyButton
          text={bibtex}
          label="Copy BibTeX"
          copiedLabel="Copied"
          size="sm"
          variant="solid"
          analyticsEvent="citation_copied"
          analyticsProperties={{
            site_area: "publications",
            cta_type: "cite",
            paper,
            citation_type: "bibtex",
          }}
        />
        {links?.map((l) => (
          <ExternalLink key={l.href} href={l.href} paper={paper}>
            {l.label}
          </ExternalLink>
        ))}
      </Flex>
    </DocsCard>
  );
}

export default function HowToCite() {
  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        How to cite
      </Heading>
      <Text
        color="fg.muted"
        fontSize={{ base: "md", md: "lg" }}
        maxW="44rem"
        mb={6}
      >
        Most papers using Infomap cite two things: the software package, which
        identifies the implementation and version, and the map equation paper,
        which credits the method.
      </Text>

      <Stack gap={0}>
        <CitationCard
          id="cite-paper"
          chipLabel="Canonical"
          chipTone="accent"
          meta={`2008 · PNAS`}
          title="Maps of random walks on complex networks reveal community structure"
          description="Rosvall, M., & Bergstrom, C. T. Cite the original paper when you describe the map equation method behind Infomap."
          bibtex={paperBibtex}
          paper="map-equation-2008"
          links={[
            { label: "DOI", href: "https://doi.org/10.1073/pnas.0706851105" },
            {
              label: "PDF",
              href: "/publications/Rosvall-Bergstrom-2008-Maps-of-information-flow/RosvallBergstromPNAS2008Full.pdf",
            },
          ]}
        />

        <CitationCard
          id="cite-software"
          chipLabel="Software"
          meta={`${currentYear} · v${infomapVersion}`}
          title="The MapEquation software package"
          description="Edler, D., Holmgren, A., & Rosvall, M. Cite this when your analysis depends on Infomap as software and the release version matters for reproducibility."
          bibtex={softwareBibtex}
          paper="software-package"
          links={[
            {
              label: "Google Scholar",
              href: "https://scholar.google.com/citations?view_op=view_citation&citation_for_view=IDZlurgAAAAJ:ZeXyd9-uunAC",
            },
          ]}
        />
      </Stack>
    </Box>
  );
}
