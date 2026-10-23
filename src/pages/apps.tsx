import {
  Container,
  chakra,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import type { IconType } from "react-icons";
import { LuBookOpen } from "react-icons/lu";
import { SiNpm, SiPypi, SiR } from "react-icons/si";
import { type AnalyticsProps, trackEvent } from "../shared/analytics";
import { TabbedCodeBlock } from "../shared/components/CodeBlock";
import { SeoHead } from "../shared/components/SeoHead";
import { INFOMAP_R_DOCS_URL } from "../shared/docsUrls";
import AppCard from "../shared/compounds/AppCard";
import { PortalEyebrow, PortalSection } from "../shared/compounds/portal";

interface AppItem {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  imagePosition?: string;
}

const APPS: AppItem[] = [
  {
    id: "navigator",
    title: "Infomap Network Navigator",
    description:
      "Browse Infomap results and zoom through the module hierarchy.",
    href: "https://www.mapequation.org/navigator",
    image: "/apps/InfomapNetworkNavigator.png",
  },
  {
    id: "bioregions",
    title: "Infomap Bioregions",
    description:
      "Map species distributions to coherent bioregions and inspect them on a globe.",
    href: "https://www.mapequation.org/bioregions",
    image: "/apps/InfomapBioregions.png",
    imagePosition: "50% 25%",
  },
  {
    id: "alluvial",
    title: "Alluvial Generator",
    description:
      "Compare partitions side by side to see which modules split, merge, or persist.",
    href: "https://www.mapequation.org/alluvial",
    image: "/apps/NewAlluvialGenerator.png",
    imagePosition: "bottom left",
  },
  {
    id: "state",
    title: "State Network Visualizer",
    description:
      "Inspect the higher-order state networks behind memory and context effects.",
    href: "https://www.mapequation.org/state-visualizer",
    image: "/apps/StateVisualizer.png",
  },
  {
    id: "c3",
    title: "C3 – Consistent Categorical Colors",
    description:
      "Generate distinct, deterministic categorical colors for maps and charts.",
    href: "https://www.mapequation.org/c3",
    image: "/apps/C3.png",
  },
];

interface LibraryPackage {
  id: NonNullable<AnalyticsProps["package"]>;
  label: string;
  command: string;
  language: string;
  registry: keyof typeof REGISTRY_ICONS;
  href: string;
}

const REGISTRY_ICONS = {
  npm: SiNpm,
  PyPI: SiPypi,
  "r-universe": SiR,
} satisfies Record<string, IconType>;

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  href: string;
  packages: LibraryPackage[];
}

const LIBRARIES: LibraryItem[] = [
  {
    id: "infomap",
    title: "Infomap",
    description:
      "Community detection with the map equation, in Python, R, and the browser through WebAssembly.",
    href: "/infomap",
    packages: [
      {
        id: "typescript",
        label: "TypeScript",
        command: "npm install @mapequation/infomap",
        language: "shell",
        registry: "npm",
        href: "https://www.npmjs.com/package/@mapequation/infomap",
      },
      {
        id: "python",
        label: "Python",
        command: "pip install infomap",
        language: "shell",
        registry: "PyPI",
        href: "https://pypi.org/project/infomap/",
      },
      {
        id: "r",
        label: "R",
        command:
          'install.packages("infomap", repos = c("https://mapequation.r-universe.dev", "https://cloud.r-project.org"))',
        language: "r",
        registry: "r-universe",
        href: INFOMAP_R_DOCS_URL,
      },
    ],
  },
  {
    id: "alluvial",
    title: "Alluvial diagrams",
    description:
      "Draw the Alluvial Generator's diagrams of changing partitions in web apps, or with matplotlib in Python.",
    href: "https://www.mapequation.org/alluvial-py/",
    packages: [
      {
        id: "typescript",
        label: "TypeScript",
        command: "npm install @mapequation/alluvial-diagram",
        language: "shell",
        registry: "npm",
        href: "https://www.npmjs.com/package/@mapequation/alluvial-diagram",
      },
      {
        id: "python",
        label: "Python",
        command: "pip install alluvial",
        language: "shell",
        registry: "PyPI",
        href: "https://pypi.org/project/alluvial/",
      },
    ],
  },
  {
    id: "c3",
    title: "C3",
    description:
      "Generate distinct and consistent categorical colors in milliseconds for your interactive maps and plots.",
    href: "https://www.mapequation.org/c3/",
    packages: [
      {
        id: "typescript",
        label: "TypeScript",
        command: "npm install @mapequation/c3",
        language: "shell",
        registry: "npm",
        href: "https://www.npmjs.com/package/@mapequation/c3",
      },
      {
        id: "python",
        label: "Python",
        command: "pip install c3-colors",
        language: "shell",
        registry: "PyPI",
        href: "https://pypi.org/project/c3-colors/",
      },
    ],
  },
  {
    id: "d3gl",
    title: "d3gl",
    description:
      "GPU-accelerated rendering for d3 maps, plots, and networks with millions of links, on SVG, Canvas2D, or WebGL2.",
    href: "https://www.mapequation.org/d3gl/",
    packages: [
      {
        id: "typescript",
        label: "TypeScript",
        command: "npm install @mapequation/d3gl",
        language: "shell",
        registry: "npm",
        href: "https://www.npmjs.com/package/@mapequation/d3gl",
      },
    ],
  },
];

const SOURCE_TOOLS = [
  {
    id: "tutorial",
    title: "Infomap tutorial notebooks",
    desc: "Walkthrough of the map equation, two-level and multilevel phases, memory and multilayer networks, and the solution landscape.",
    href: "https://github.com/mapequation/infomap/tree/master/examples/notebooks",
    link: "infomap/examples/notebooks",
  },
  {
    id: "partval",
    title: "Partition validation",
    desc: "Identify partition clusters and validate other partitions.",
    href: "https://github.com/mapequation/partition-validation",
    link: "mapequation/partition-validation",
  },
  {
    id: "sigclu",
    title: "Significance clustering",
    desc: "Assess the significance of cluster assignments via bootstrap.",
    href: "https://github.com/mapequation/significance-clustering",
    link: "mapequation/significance-clustering",
  },
];

const AppsPage: NextPage = () => (
  <>
    <SeoHead
      title="MapEquation apps and notebooks"
      description="Explore apps, libraries, notebooks, visualization tools, and companion methods for inspecting Infomap results and map equation workflows."
      path="/apps/"
    />
    <Container>
      <Stack mt={{ base: 8, md: 12 }} gap={4} align="flex-start">
        <PortalEyebrow>Apps</PortalEyebrow>
        <Heading as="h1" textStyle="h1" maxW="20ch">
          Tools for inspecting Infomap results
        </Heading>
        <Text color="gray.700" textStyle="body" maxW="42rem">
          Explore module hierarchies, compare partitions, inspect higher-order
          state networks, visualize bioregions, and color modules consistently.
        </Text>
      </Stack>

      <PortalSection title="Start here">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
          <AppCard
            href="/tutorial"
            title="Tutorial"
            description="Understand the mechanics of the Map Equation through interactive visualizations."
            image="/apps/Tutorial.jpg"
            imageAlt="Tutorial"
            imagePosition="center top"
            external={false}
            cta="Start the tutorial"
            onClick={() =>
              trackEvent("cta_clicked", {
                site_area: "apps",
                cta_type: "tutorial",
                content_id: "apps-tutorial",
              })
            }
          />
        </SimpleGrid>
      </PortalSection>

      <PortalSection title="Apps">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
          {APPS.map((a) => (
            <AppCard
              key={a.id}
              href={a.href}
              title={a.title}
              description={a.description}
              image={a.image}
              imageAlt={a.title}
              imagePosition={a.imagePosition}
              onClick={() =>
                trackEvent("outbound_clicked", {
                  site_area: "apps",
                  content_id: `apps-${a.id}`,
                  destination: a.href,
                })
              }
            />
          ))}
        </SimpleGrid>
      </PortalSection>

      <PortalSection title="Libraries">
        <Text color="gray.600" fontSize="sm" mb={4} maxW="42rem">
          The packages behind the apps, for your own analyses, notebooks, and
          web apps.
        </Text>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          {LIBRARIES.map((lib) => {
            const links = [
              { id: "docs", label: "Docs", href: lib.href, Icon: LuBookOpen },
              ...lib.packages.map((pkg) => ({
                id: pkg.registry.toLowerCase(),
                label: pkg.registry,
                href: pkg.href,
                Icon: REGISTRY_ICONS[pkg.registry],
              })),
            ];
            return (
              <Stack
                key={lib.id}
                gap={3}
                minW={0}
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                p={5}
              >
                <Heading as="h3" size="sm" mb={0}>
                  {lib.title}
                </Heading>
                <Text color="gray.700" fontSize="sm" mb={0}>
                  {lib.description}
                </Text>
                <TabbedCodeBlock
                  ariaLabel={`Install ${lib.title}`}
                  files={lib.packages.map((pkg) => ({
                    code: pkg.command,
                    label: pkg.label,
                    language: pkg.language,
                    value: pkg.id,
                  }))}
                  copyEvent="command_copied"
                  copyProperties={(file) => ({
                    site_area: "apps",
                    cta_type: "install",
                    package: lib.packages.find((pkg) => pkg.id === file.value)
                      ?.id,
                    content_id: `libraries-${lib.id}-${file.value}`,
                  })}
                />
                <Flex gap={4} flexWrap="wrap">
                  {links.map(({ id, label, href, Icon }) => {
                    const external = href.startsWith("http");
                    return (
                      <chakra.a
                        key={id}
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        display="inline-flex"
                        alignItems="center"
                        gap={1.5}
                        fontSize="sm"
                        color="link.emphasis"
                        textDecoration="none"
                        _hover={{
                          color: "link.emphasisHover",
                          textDecoration: "underline",
                        }}
                        onClick={() =>
                          trackEvent("outbound_clicked", {
                            site_area: "apps",
                            content_id: `libraries-${lib.id}-${id}`,
                            destination: href,
                          })
                        }
                      >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                      </chakra.a>
                    );
                  })}
                </Flex>
              </Stack>
            );
          })}
        </SimpleGrid>
      </PortalSection>

      <PortalSection title="Notebooks and companion methods">
        <Text color="gray.600" fontSize="sm" mb={4} maxW="42rem">
          Tutorials, validation tools, and significance tests for researchers
          working with map equation results.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {SOURCE_TOOLS.map((t) => (
            <chakra.a
              key={t.id}
              href={t.href}
              target="_blank"
              rel="noreferrer"
              role="group"
              display="block"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={5}
              textDecoration="none"
              color="inherit"
              transition="border-color 150ms"
              _hover={{ borderColor: "gray.400", textDecoration: "none" }}
            >
              <Heading as="h3" size="sm" mb={2}>
                {t.title}
              </Heading>
              <Text color="gray.700" fontSize="sm" mb={3}>
                {t.desc}
              </Text>
              <Text
                color="link.emphasis"
                fontFamily="monospace"
                fontSize="xs"
                mb={0}
                _groupHover={{ color: "link.emphasisHover" }}
              >
                {t.link} ↗
              </Text>
            </chakra.a>
          ))}
        </SimpleGrid>
      </PortalSection>
    </Container>
  </>
);

export default AppsPage;
