import { chakra, Flex, Text } from "@chakra-ui/react";
import { trackEvent, type AnalyticsProps } from "../analytics";
import { TabbedCodeBlock } from "../components/CodeBlock";
import { INFOMAP_PYTHON_DOCS_URL, INFOMAP_R_DOCS_URL } from "../docsUrls";

type InstallOption = {
  id: string;
  label: string;
  command: string;
  commandContentId: string;
  note: string;
  package: AnalyticsProps["package"];
  snippet?: string;
  links?: { label: string; href: string }[];
  language: string;
};

const installOptions: InstallOption[] = [
  {
    id: "python",
    label: "Python",
    command: "pip install infomap",
    commandContentId: "pip-install",
    note: "Recommended for most research workflows · Python 3.11+ · Windows / macOS / Linux wheels",
    package: "python",
    links: [
      {
        label: "Python API docs",
        href: INFOMAP_PYTHON_DOCS_URL,
      },
    ],
    language: "shell",
  },
  {
    id: "r",
    label: "R",
    command:
      'install.packages("infomap", repos = c("https://mapequation.r-universe.dev", "https://cloud.r-project.org"))',
    commandContentId: "r-install",
    note: "For R analysis workflows · Pre-built binaries from r-universe",
    package: "r",
    links: [
      {
        label: "r-universe",
        href: INFOMAP_R_DOCS_URL,
      },
    ],
    language: "r",
  },
  {
    id: "homebrew",
    label: "Homebrew",
    command: "brew install mapequation/infomap/infomap",
    commandContentId: "homebrew-install",
    note: "Native CLI for macOS and Linux workflows",
    package: "homebrew",
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
    commandContentId: "docker-run",
    note: "Reproducible CLI runs from GitHub Container Registry",
    package: "docker",
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
    commandContentId: "npm-install",
    note: "WebAssembly package for browser, Node.js, and TypeScript apps",
    package: "typescript",
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
    commandContentId: "source-build",
    note: "Native CLI from source",
    package: "source",
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
      copyEvent="command_copied"
      copyProperties={(file) => {
        const option = installOptions.find((item) => item.id === file.value);
        return {
          site_area: "install",
          cta_type: "install",
          package: option?.package,
          content_id: option?.commandContentId,
        };
      }}
      onTabChange={(file) => {
        const option = installOptions.find((item) => item.id === file.value);
        trackEvent("cta_clicked", {
          site_area: "install",
          cta_type: "install",
          package: option?.package,
          content_id: `install-tab-${file.value}`,
        });
      }}
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
                      onClick={() =>
                        trackEvent("outbound_clicked", {
                          site_area: "install",
                          cta_type: "install",
                          package: option.package,
                          content_id: `${option.id}-${link.label
                            .toLowerCase()
                            .replaceAll(" ", "-")}`,
                          destination: link.href,
                        })
                      }
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
