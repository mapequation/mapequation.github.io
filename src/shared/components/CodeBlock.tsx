import {
  CodeBlock as CkCodeBlock,
  createShikiAdapter,
  Float,
  IconButton,
  Tabs,
  useTabs,
} from "@chakra-ui/react";
import type { ElementType, ReactNode } from "react";
import type { HighlighterGeneric, LanguageRegistration } from "shiki";
import {
  type AnalyticsEvent,
  type AnalyticsProps,
  trackEvent,
} from "../analytics";

const infomapLanguage: LanguageRegistration = {
  name: "infomap",
  displayName: "Infomap",
  scopeName: "source.infomap",
  aliases: ["pajek", "clu", "tree", "ftree", "map"],
  patterns: [
    {
      match: "^\\s*[#%].*$",
      name: "comment.line.number-sign.infomap",
    },
    {
      match: "^\\s*(\\*[A-Za-z][A-Za-z0-9_-]*)(?:\\s+([^#%]+))?",
      captures: {
        "1": { name: "keyword.control.section.infomap" },
        "2": { patterns: [{ include: "#data" }] },
      },
    },
    { include: "#data" },
  ],
  repository: {
    data: {
      patterns: [
        {
          match: '"(?:[^"\\\\]|\\\\.)*"',
          name: "string.quoted.double.infomap",
        },
        {
          match: "\\b\\d+(?::\\d+)+\\b",
          name: "entity.name.section.path.infomap",
        },
        {
          match: "\\b[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?\\b",
          name: "constant.numeric.infomap",
        },
      ],
    },
  },
};

const newickLanguage: LanguageRegistration = {
  name: "newick",
  displayName: "Newick",
  scopeName: "source.newick",
  aliases: ["nwk"],
  patterns: [
    {
      begin: "\\[",
      beginCaptures: {
        "0": { name: "punctuation.definition.comment.begin.newick" },
      },
      end: "\\]",
      endCaptures: {
        "0": { name: "punctuation.definition.comment.end.newick" },
      },
      name: "comment.block.bracket.newick",
    },
    {
      match: "'(?:[^']|'')*'",
      name: "string.quoted.single.newick",
    },
    {
      match: "(:)([+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?)",
      captures: {
        "1": { name: "punctuation.separator.branch-length.newick" },
        "2": { name: "constant.numeric.branch-length.newick" },
      },
    },
    {
      match: "[(),;]",
      name: "punctuation.separator.newick",
    },
    {
      match: "[^\\s()':,;\\[\\]]+",
      name: "entity.name.label.newick",
    },
  ],
  repository: {},
};

const shikiAdapter = createShikiAdapter<HighlighterGeneric<any, any>>({
  async load() {
    const { createHighlighter } = await import("shiki");
    return createHighlighter({
      langs: [
        "shell",
        "json",
        "python",
        "r",
        "ini",
        "markdown",
        infomapLanguage,
        newickLanguage,
      ],
      themes: ["github-dark", "github-light"],
    });
  },
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
});

type CodeBlockProps = Omit<CkCodeBlock.RootProps, "children" | "code"> & {
  copyEvent?: AnalyticsEvent;
  copyProperties?: AnalyticsProps;
  children: ReactNode;
};

type CodeBlockFile = {
  code: string;
  label?: string;
  language: string;
  value?: string;
};

type TabbedCodeBlockProps = Omit<
  CkCodeBlock.RootProps,
  "children" | "code" | "language"
> & {
  ariaLabel?: string;
  copyEvent?: AnalyticsEvent;
  copyProperties?: AnalyticsProps | ((file: CodeBlockFile) => AnalyticsProps);
  defaultValue?: string;
  files: CodeBlockFile[];
  onTabChange?: (file: CodeBlockFile) => void;
  renderFooter?: (file: CodeBlockFile) => ReactNode;
  tabListProps?: Record<string, unknown>;
  tabTriggerProps?: Record<string, unknown>;
};

function codeText(children: ReactNode) {
  if (Array.isArray(children)) return children.join("");
  return String(children);
}

function fileValue(file: CodeBlockFile) {
  return file.value ?? file.label ?? file.language;
}

function CodeBlockContent() {
  return (
    <CkCodeBlock.Content>
      <Float placement="top-end" offset="5" zIndex="1">
        <CkCodeBlock.CopyTrigger asChild>
          <IconButton aria-label="Copy code" variant="ghost" size="2xs">
            <CkCodeBlock.CopyIndicator />
          </IconButton>
        </CkCodeBlock.CopyTrigger>
      </Float>
      <CkCodeBlock.Code>
        <CkCodeBlock.CodeText />
      </CkCodeBlock.Code>
      <CkCodeBlock.Overlay
        bgImage="linear-gradient(0deg, var(--chakra-colors-bg) 25%, transparent 100%)"
        color="fg"
      >
        <CkCodeBlock.CollapseTrigger>
          <CkCodeBlock.CollapseText textStyle="sm" />
        </CkCodeBlock.CollapseTrigger>
      </CkCodeBlock.Overlay>
    </CkCodeBlock.Content>
  );
}

export function CodeBlock({
  children,
  copyEvent,
  copyProperties,
  meta,
  ...props
}: CodeBlockProps) {
  return (
    <CkCodeBlock.AdapterProvider value={shikiAdapter}>
      <CkCodeBlock.Root
        code={codeText(children)}
        meta={{ wordWrap: true, colorScheme: "light", ...meta }}
        onCopy={() => {
          if (copyEvent) trackEvent(copyEvent, copyProperties);
        }}
        {...props}
      >
        <CodeBlockContent />
      </CkCodeBlock.Root>
    </CkCodeBlock.AdapterProvider>
  );
}

const TabsRoot = Tabs.RootProvider as ElementType;
const TabsList = Tabs.List as ElementType;
const TabsTrigger = Tabs.Trigger as ElementType;

export function TabbedCodeBlock({
  ariaLabel = "Code examples",
  copyEvent,
  copyProperties,
  defaultValue,
  files,
  meta,
  onTabChange,
  renderFooter,
  tabListProps,
  tabTriggerProps,
  ...props
}: TabbedCodeBlockProps) {
  const fallbackValue = files[0] ? fileValue(files[0]) : "";
  const tabs = useTabs({
    defaultValue: defaultValue ?? fallbackValue,
    onValueChange: ({ value }) => {
      const nextFile = files.find((file) => fileValue(file) === value);
      if (nextFile) onTabChange?.(nextFile);
    },
  });

  const activeFile =
    files.find((file) => fileValue(file) === tabs.value) ?? files[0];

  if (!activeFile) return null;

  const activeCopyProperties =
    typeof copyProperties === "function"
      ? copyProperties(activeFile)
      : copyProperties;

  return (
    <CkCodeBlock.AdapterProvider value={shikiAdapter}>
      <TabsRoot value={tabs} size="sm" variant="line">
        <CkCodeBlock.Root
          code={activeFile.code}
          language={activeFile.language}
          meta={{ wordWrap: true, colorScheme: "light", ...meta }}
          onCopy={() => {
            if (copyEvent) trackEvent(copyEvent, activeCopyProperties);
          }}
          {...props}
        >
          <CkCodeBlock.Header px={0} py={0}>
            <TabsList aria-label={ariaLabel} gap={0} w="full" {...tabListProps}>
              {files.map((file) => {
                const value = fileValue(file);
                return (
                  <TabsTrigger
                    key={value}
                    value={value}
                    fontSize="sm"
                    {...tabTriggerProps}
                  >
                    {file.label ?? file.language}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </CkCodeBlock.Header>
          <CodeBlockContent />
        </CkCodeBlock.Root>
        {renderFooter?.(activeFile)}
      </TabsRoot>
    </CkCodeBlock.AdapterProvider>
  );
}
