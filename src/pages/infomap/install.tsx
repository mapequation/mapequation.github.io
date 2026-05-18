import {
  Box,
  Link as CkLink,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useState } from "react";
import { LuArrowRight, LuMonitor, LuTerminal } from "react-icons/lu";
import { CodeBlock } from "../../shared/components/CodeBlock";
import { DocsCard } from "../../shared/components/DocsCard";
import { DocsRail, type DocsRailItem } from "../../shared/components/DocsRail";
import { Tag } from "../../shared/components/Tag";

const installMethods = [
  {
    id: "PythonPackage",
    label: "Python",
    title: "Python package",
    recommended: true,
    description:
      "Start here for most research workflows. The package installs both the Python API and the infomap command-line tool.",
    tags: ["Python 3.11+", "macOS", "Linux", "Windows"],
    command: "pip install infomap",
    commands: [
      ["Upgrade an existing installation", "pip install --upgrade infomap"],
      ["Verify the installation", "infomap -v"],
    ],
    links: [
      ["PyPI", "//pypi.org/project/infomap/"],
      ["Python API reference", "//mapequation.github.io/infomap-python-docs/"],
    ],
    language: "shell",
  },
  {
    id: "HomebrewCli",
    label: "CLI",
    title: "Native CLI with Homebrew",
    description:
      "Use Homebrew when you want the native command-line tool without installing the Python package.",
    tags: ["macOS", "Linux", "CLI"],
    command: "brew install mapequation/infomap/infomap",
    commands: [
      [
        "Tap and install separately",
        "brew tap mapequation/infomap\nbrew install infomap",
      ],
      ["Upgrade with the normal Homebrew flow", "brew upgrade infomap"],
    ],
    links: [["Homebrew tap", "//github.com/mapequation/homebrew-infomap"]],
    language: "shell",
  },
  {
    id: "DownloadBinary",
    label: "Binaries",
    title: "Standalone binaries",
    description:
      "Use a standalone binary when you only need the executable. OpenMP builds may be faster on larger networks but require OpenMP runtime libraries.",
    tags: ["macOS", "Linux", "Windows", "OpenMP"],
    custom: "binaries",
    links: [
      ["Latest release", "//github.com/mapequation/infomap/releases/latest"],
    ],
    language: "shell",
  },
  {
    id: "RPackage",
    label: "R",
    title: "R package",
    description:
      "Use the R package when Infomap is part of an R analysis workflow. Pre-built binaries are published on r-universe.",
    tags: ["R", "r-universe"],
    command:
      'install.packages("infomap", repos = c("https://mapequation.r-universe.dev", "https://cloud.r-project.org"))',
    links: [["r-universe", "//mapequation.r-universe.dev/infomap"]],
    language: "r",
  },
  {
    id: "JavaScriptPackage",
    label: "TypeScript",
    title: "TypeScript package",
    description:
      "Use the WebAssembly worker package to embed Infomap in browser, Node.js, and TypeScript applications.",
    tags: ["TypeScript", "NPM"],
    command: "npm install @mapequation/infomap",
    links: [["npm", "//www.npmjs.com/package/@mapequation/infomap"]],
    language: "shell",
  },
  {
    id: "Docker",
    label: "Docker",
    title: "Docker",
    description:
      "Use the container image for reproducible CLI runs in CI, teaching material, or shared compute environments.",
    tags: ["Docker", "amd64", "arm64"],
    command:
      'docker run -it --rm -v "$(pwd)":/data ghcr.io/mapequation/infomap:latest [infomap arguments]',
    links: [
      [
        "ghcr.io/mapequation/infomap",
        "//github.com/mapequation/infomap/pkgs/container/infomap",
      ],
    ],
    language: "shell",
  },
  {
    id: "CompilingFromSource",
    label: "Source",
    title: "Build from source",
    description:
      "Build locally when you want to modify Infomap, inspect the implementation, or compile with custom flags. Requires a working gcc or clang toolchain.",
    tags: ["gcc", "clang"],
    command:
      "git clone git@github.com:mapequation/infomap.git\ncd infomap\nmake build-native",
    commands: [
      ["Build without OpenMP", "make build-native OPENMP=0"],
      ["Show available CLI options", "./Infomap --help"],
    ],
    links: [["GitHub repository", "//github.com/mapequation/infomap"]],
    language: "shell",
  },
];

const railItems: DocsRailItem[] = [
  ...installMethods.map(({ id, label }) => ({ id, label })),
  { id: "Running", label: "Run Infomap" },
  { kind: "heading", label: "Read next" },
  { id: "FormatsNext", label: "Formats", href: "/infomap/formats" },
];

function MethodCard({ method }) {
  return (
    <DocsCard
      as="article"
      id={method.id}
      borderColor={method.recommended ? "border.emphasized" : "border"}
      position="relative"
    >
      {method.recommended && (
        <Box
          position="absolute"
          top="-0.7rem"
          left={5}
          borderRadius="sm"
          bg="bg.panel"
          borderColor="border.emphasized"
          borderWidth="1px"
          px={2}
          py={1}
          fontFamily="monospace"
          fontSize="xs"
          letterSpacing="0.08em"
          textTransform="uppercase"
        >
          Recommended for research workflows
        </Box>
      )}

      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "baseline" }}
        gap={3}
        direction={{ base: "column", md: "row" }}
        mb={2}
      >
        <Heading as="h2" size="md">
          {method.title}
        </Heading>
        <Flex gap={2} flexWrap="wrap">
          {method.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Flex>
      </Flex>

      <Text color="fg.muted" fontSize="sm">
        {method.description}
      </Text>

      {method.custom === "binaries" ? (
        <BinaryTable />
      ) : (
        <CodeBlock language={method.language}>{method.command}</CodeBlock>
      )}

      {method.commands?.length > 0 && (
        <Box mt={3}>
          <Stack gap={4} mt={3}>
            {method.commands.map(([title, command]) => (
              <Box key={title}>
                <Text color="fg.muted" fontSize="sm" mb={2}>
                  {title}
                </Text>
                <CodeBlock language={method.language}>{command}</CodeBlock>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {method.links?.length > 0 && (
        <Flex gap={4} flexWrap="wrap" mt={4} pt={4} borderTopWidth="1px">
          {method.links.map(([label, href]) => (
            <CkLink
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              fontSize="sm"
              fontWeight={600}
            >
              {label} <LuArrowRight />
            </CkLink>
          ))}
        </Flex>
      )}
    </DocsCard>
  );
}

function BinaryTable() {
  return (
    <Box overflowX="auto">
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader />
            <Table.ColumnHeader>OpenMP</Table.ColumnHeader>
            <Table.ColumnHeader>Without OpenMP</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Icon as={LuMonitor} color="fg.muted" mr={2} />
              Windows
            </Table.Cell>
            <Table.Cell>
              <a href="//github.com/mapequation/infomap/releases/latest/download/infomap-win.zip">
                infomap-win.zip
              </a>
            </Table.Cell>
            <Table.Cell>
              <a href="//github.com/mapequation/infomap/releases/latest/download/infomap-win-noomp.zip">
                infomap-win-noomp.zip
              </a>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Icon as={LuMonitor} color="fg.muted" mr={2} />
              macOS
            </Table.Cell>
            <Table.Cell>
              <a href="//github.com/mapequation/infomap/releases/latest/download/infomap-mac.zip">
                infomap-mac.zip
              </a>
            </Table.Cell>
            <Table.Cell>
              <a href="//github.com/mapequation/infomap/releases/latest/download/infomap-mac-noomp.zip">
                infomap-mac-noomp.zip
              </a>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Icon as={LuTerminal} color="fg.muted" mr={2} />
              Ubuntu
            </Table.Cell>
            <Table.Cell>
              <a href="//github.com/mapequation/infomap/releases/latest/download/infomap-ubuntu.zip">
                infomap-ubuntu.zip
              </a>
            </Table.Cell>
            <Table.Cell>
              <a href="//github.com/mapequation/infomap/releases/latest/download/infomap-ubuntu-noomp.zip">
                infomap-ubuntu-noomp.zip
              </a>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

const InstallPage: NextPage = () => {
  const [active, setActive] = useState("PythonPackage");

  return (
    <Container>
      <Grid
        templateColumns={{ base: "1fr", lg: "13rem 1fr" }}
        gap={{ base: 8, lg: 12 }}
        alignItems="start"
        mt={8}
      >
        <DocsRail
          items={railItems}
          active={active}
          onActiveChange={setActive}
        />

        <Box as="main">
          <Text color="gray.500" fontSize="sm" mb={2}>
            Documentation
          </Text>
          <Heading
            as="h1"
            textStyle="h1"
            mb={4}
            id="Install"
            scrollMarginTop="7rem"
          >
            Install Infomap for Python, R, or build from source
          </Heading>

          <Text
            color="gray.700"
            fontSize={{ base: "md", md: "lg" }}
            maxW="42rem"
          >
            For most researchers, the Python package is the best starting point:
            it installs both the Python API and the <code>infomap</code>{" "}
            command-line tool. Use R for analysis workflows, Docker for
            reproducible compute environments, or standalone binaries when you
            only need the executable.
          </Text>

          <Flex gap={2} flexWrap="wrap" mb={8}>
            {["Python 3.11+", "CLI included", "macOS / Linux / Windows"].map(
              (tag) => (
                <Tag key={tag}>{tag}</Tag>
              ),
            )}
          </Flex>

          <Stack gap={6}>
            {installMethods.map((method) => (
              <MethodCard key={method.id} method={method} />
            ))}
          </Stack>

          <DocsCard id="Running" title="Run Infomap" mt={8} mb={12}>
            <Text color="fg.muted">
              After installation, the command-line form is:
            </Text>
            <CodeBlock>infomap [options] network_data destination</CodeBlock>

            <Text color="fg.muted" mt={5}>
              For example:
            </Text>
            <CodeBlock language="shell">
              {
                "infomap network.net out\ninfomap --two-level --directed network.net out"
              }
            </CodeBlock>

            <Text color="fg.muted" mt={5}>
              List all available options with:
            </Text>
            <CodeBlock language="shell">infomap --help</CodeBlock>
          </DocsCard>

          <DocsCard id="ReadNext" title="Read next" mb={12}>
            <Flex gap={4} flexWrap="wrap">
              <CkLink asChild fontWeight={600}>
                <NextLink href="/infomap/formats">
                  Input and output formats <LuArrowRight />
                </NextLink>
              </CkLink>
            </Flex>
          </DocsCard>
        </Box>
      </Grid>
    </Container>
  );
};

export default InstallPage;
