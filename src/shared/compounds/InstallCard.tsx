import { chakra, Flex, Text } from "@chakra-ui/react";
import { TabbedCodeBlock } from "../components/CodeBlock";

type InstallOption = {
  id: string;
  label: string;
  command: string;
  note: string;
  snippet?: string;
  links?: { label: string; href: string }[];
  language: string;
};

const installOptions: InstallOption[] = [
  {
    id: "python",
    label: "Python",
    command: "pip install infomap",
    note: "Recommended for most research workflows · Python 3.11+ · Windows / macOS / Linux wheels",
    links: [
      { label: "PyPI", href: "https://pypi.org/project/infomap/" },
      {
        label: "Python API docs",
        href: "https://mapequation.github.io/infomap-python-docs/",
      },
    ],
    language: "shell",
  },
  {
    id: "r",
    label: "R",
    command:
      'install.packages("infomap", repos = c("https://mapequation.r-universe.dev", "https://cloud.r-project.org"))',
    note: "For R analysis workflows · Pre-built binaries from r-universe",
    links: [
      {
        label: "r-universe",
        href: "https://mapequation.r-universe.dev/infomap",
      },
    ],
    language: "r",
  },
  {
    id: "homebrew",
    label: "Homebrew",
    command: "brew install mapequation/infomap/infomap",
    note: "Native CLI for macOS and Linux workflows",
    links: [
      {
        label: "Homebrew tap",
        href: "https://github.com/mapequation/homebrew-infomap",
      },
    ],
    language: "shell",
  },
  {
    id: "docker",
    label: "Docker",
    command: "docker run ghcr.io/mapequation/infomap:latest",
    note: "Reproducible CLI runs from GitHub Container Registry",
    links: [
      {
        label: "ghcr.io/mapequation/infomap",
        href: "https://github.com/mapequation/infomap/pkgs/container/infomap",
      },
    ],
    language: "shell",
  },
  {
    id: "typescript",
    label: "TypeScript",
    command: "npm install @mapequation/infomap",
    note: "WebAssembly package for browser, Node.js, and TypeScript apps",
    links: [
      {
        label: "npm",
        href: "https://www.npmjs.com/package/@mapequation/infomap",
      },
    ],
    language: "shell",
  },
  {
    id: "source",
    label: "Source",
    command: "make build-native",
    note: "Native CLI from source",
    links: [
      {
        label: "GitHub repository",
        href: "https://github.com/mapequation/infomap/",
      },
    ],
    language: "shell",
  },
];

export default function InstallCard() {
  return (
    <TabbedCodeBlock
      ariaLabel="Install options"
      files={installOptions.map((option) => ({
        code: option.command,
        label: option.label,
        language: option.language,
        value: option.id,
      }))}
      renderFooter={(file) => {
        const option = installOptions.find((item) => item.id === file.value);
        if (!option) return null;

        return (
          <Flex mt={3}>
            <Flex
              justify="space-between"
              align="center"
              gap={4}
              flexWrap="wrap"
            >
              <Text color="fg.muted" mb={0}>
                {option.note}
              </Text>
              {option.links && option.links.length > 0 && (
                <Flex gap={4} flexWrap="wrap">
                  {option.links.map((link) => (
                    <chakra.a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      fontSize="sm"
                      color="link.emphasis"
                      textDecoration="none"
                      _hover={{
                        color: "link.emphasisHover",
                        textDecoration: "underline",
                      }}
                    >
                      {link.label} ↗
                    </chakra.a>
                  ))}
                </Flex>
              )}
            </Flex>
          </Flex>
        );
      }}
    />
  );
}
