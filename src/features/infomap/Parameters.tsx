import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  CloseButton,
  chakra,
  FileUpload,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Kbd,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import {
  type ComponentProps,
  type FC,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { LuMinus, LuPlus, LuSearch } from "react-icons/lu";
import { ToggleField } from "../../shared/components/ToggleField";
import useStore from "../../state";
import { applyArgsToParams, createParams } from "../../state/parameters";
import type { InfomapParameter } from "../../state/types";

const parameterGroups = ["Input", "Output", "Algorithm", "Accuracy", "About"];
const parameterControlWidth = "8.5rem";
const FileUploadTrigger = FileUpload.Trigger as FC<
  ComponentProps<typeof FileUpload.Trigger> & {
    asChild?: boolean;
    children: ReactNode;
  }
>;
const parameterSelectStyles = {
  container: (provided) => ({
    ...provided,
    minW: "10rem",
  }),
  control: (provided) => ({
    ...provided,
    bg: "bg.panel",
    fontSize: "0.75rem",
    minH: "1.875rem",
  }),
  dropdownIndicator: (provided) => ({ ...provided, p: 1 }),
  input: (provided) => ({ ...provided, fontSize: "0.75rem" }),
  placeholder: (provided) => ({ ...provided, fontSize: "0.75rem" }),
  singleValue: (provided) => ({ ...provided, fontSize: "0.75rem" }),
  valueContainer: (provided) => ({
    ...provided,
    bg: "bg.panel",
    px: 2,
    w: "100%",
  }),
};

const normalizeSearch = (value: string) => value.trim().toLowerCase();

const paramShortcuts: Record<string, string> = {
  "--two-level": "2",
  "--directed": "D",
};
const paramShortcut = (long: string): string | undefined =>
  paramShortcuts[long];

type ParameterMatch = "name" | "description" | null;

const stripFlagPrefix = (value: string) => value.replace(/(^|\s)--?/g, "$1");

const parameterLabel = (param: InfomapParameter) =>
  stripFlagPrefix(param.longString);

const parameterMatchType = (
  param: InfomapParameter,
  query: string,
): ParameterMatch => {
  if (!query) return "name";

  const nameFields = [
    param.long,
    param.short,
    param.longString,
    param.shortString,
    param.longType,
    ...(param.options ?? []),
  ];
  if (
    nameFields
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  ) {
    return "name";
  }

  if (param.description?.toLowerCase().includes(query)) return "description";
  return null;
};

const parameterMatches = (param: InfomapParameter, query: string) =>
  parameterMatchType(param, query) !== null;

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let index = lower.indexOf(query, cursor);
  while (index !== -1) {
    if (index > cursor) parts.push(text.slice(cursor, index));
    parts.push(
      <chakra.mark
        key={parts.length}
        bg="yellow.200"
        borderRadius="2px"
        color="inherit"
        p={0}
      >
        {text.slice(index, index + query.length)}
      </chakra.mark>,
    );
    cursor = index + query.length;
    index = lower.indexOf(query, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export function AdvancedParametersToggle({
  advanced,
  onToggle,
}: {
  advanced: boolean;
  onToggle: () => void;
}) {
  return (
    <ToggleField
      id="show-advanced"
      checked={advanced}
      ariaLabel="Show advanced parameters"
      onChange={onToggle}
    >
      Advanced
    </ToggleField>
  );
}

export function ParametersSearch({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) {
  const endElement = search ? (
    <CloseButton
      aria-label="Clear search"
      size="xs"
      onClick={() => setSearch("")}
      me="-2"
    />
  ) : undefined;

  return (
    <InputGroup startElement={<LuSearch />} endElement={endElement}>
      <Input
        aria-label="Search parameters"
        id="parameters-search"
        name="parameters-search"
        placeholder="Search parameters…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          setSearch("");
          event.currentTarget.blur();
        }}
        pl={9}
        pr={search ? 9 : 3}
        size="sm"
        bg="bg.panel"
      />
    </InputGroup>
  );
}

const DropdownParameter = ({ param }: { param: any }) => {
  const store = useStore();

  const isMulti = param.longType === "list";

  const value = isMulti
    ? param.value.map((v) => ({ label: v, value: v }))
    : param.value
      ? { label: param.value, value: param.value }
      : null;

  const onChange = (value) => {
    if (!value) {
      return store.params.setOption(
        param,
        isMulti ? [] : (param.default ?? ""),
      );
    }

    return store.params.setOption(
      param,
      isMulti ? value.map((v) => v.value) : value.value,
    );
  };

  const options = param.options.map((option) => ({
    value: option,
    label: option,
  }));

  return (
    <Select
      id={param.long}
      ref={(ref) => store.params.setRef(param.long, ref)}
      chakraStyles={parameterSelectStyles}
      placeholder={param.longType}
      isMulti={isMulti}
      isClearable={param.clearable}
      closeMenuOnSelect={!isMulti}
      value={value}
      onChange={onChange}
      options={options}
    />
  );
};

const InputParameter = ({ param }: { param: any }) => {
  const store = useStore();

  return (
    <Input
      id={param.long}
      name={param.long}
      w={parameterControlWidth}
      bg="bg.panel"
      borderColor={param.active ? "blue.300" : "border.emphasized"}
      borderWidth="1px"
      _hover={{ bg: "bg.panel", borderColor: "border.emphasized" }}
      _focus={{ bg: "bg.panel", borderColor: "blue.500", boxShadow: "outline" }}
      fontSize="xs"
      h="1.875rem"
      variant="outline"
      placeholder={param.default}
      value={param.value}
      onChange={(e) => store.params.setInput(param, e.target.value)}
    />
  );
};

const FileInputParameter = ({ param }: { param: any }) => {
  const store = useStore();

  const onFileAccept: NonNullable<
    ComponentProps<typeof FileUpload.Root>["onFileAccept"]
  > = (details) => {
    const { files } = details as { files: File[] };
    if (files.length < 1) return;

    const file = files[0];

    const reader = new FileReader();

    reader.onloadend = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value || !param.tabName) return;
      store.setActiveInput(param.tabName);
      store.params.setFileParam(param, {
        name: file.name,
        value,
      });
    };

    reader.readAsText(file, "utf-8");
  };

  return (
    <FileUpload.Root
      accept={{ "text/plain": param.accept }}
      maxFiles={1}
      onFileAccept={onFileAccept}
      unstyled
    >
      <FileUpload.HiddenInput />
      <FileUploadTrigger asChild unstyled>
        <Button variant="outline" size="xs" w={parameterControlWidth}>
          Load file
        </Button>
      </FileUploadTrigger>
    </FileUpload.Root>
  );
};

const ToggleParameter = ({ param }: { param: InfomapParameter }) => {
  const store = useStore();

  return (
    <ToggleField
      id={param.long}
      checked={param.active}
      ariaLabel={param.longString}
      onChange={() => store.params.toggle(param.long)}
    />
  );
};

const IncrementalParameter = ({ param }: { param: any }) => {
  const store = useStore();
  const { value, maxValue, stringValue } = param;

  const setValue = (value) => store.params.setIncremental(param, value);

  return (
    <ButtonGroup
      variant="outline"
      attached
      size="xs"
      id={param.long}
      w={parameterControlWidth}
    >
      <IconButton
        aria-label="minus"
        flex="0 0 2.25rem"
        disabled={value === 0}
        onClick={() => setValue(value - 1)}
      >
        <LuMinus />
      </IconButton>
      <Button disabled={value === 0} flex="1 1 auto">
        {stringValue(value)}
      </Button>
      <IconButton
        aria-label="plus"
        flex="0 0 2.25rem"
        disabled={value === maxValue}
        onClick={() => setValue(value + 1)}
      >
        <LuPlus />
      </IconButton>
    </ButtonGroup>
  );
};

const ParameterControl = ({ param }: { param: InfomapParameter }) => {
  if (param.dropdown) return <DropdownParameter param={param} />;
  if (param.input) return <InputParameter param={param} />;
  if (param.incremental) return <IncrementalParameter param={param} />;
  if (param.file) return <FileInputParameter param={param} />;

  return <ToggleParameter param={param} />;
};

const isToggleOnlyParameter = (param: InfomapParameter) =>
  !param.dropdown && !param.input && !param.incremental && !param.file;

type ParameterBaseline = Map<string, InfomapParameter>;

const parameterValueSignature = (param: InfomapParameter) =>
  Array.isArray(param.value)
    ? param.value.join(",")
    : String(param.value ?? "");

const parameterIsChanged = (
  param: InfomapParameter,
  baseline: ParameterBaseline | null,
) => {
  if (!baseline) return false;
  const lastRunParam = baseline.get(param.long);
  if (!lastRunParam) return false;

  return (
    param.active !== lastRunParam.active ||
    parameterValueSignature(param) !== parameterValueSignature(lastRunParam)
  );
};

function ParamName({
  param,
  short = false,
}: {
  param: InfomapParameter;
  short?: boolean;
}) {
  const name =
    short && param.shortString
      ? stripFlagPrefix(param.shortString)
      : parameterLabel(param);
  const parts = name.split(/(<[^>]+>)/g);

  return (
    <chakra.code
      bg="transparent"
      border={0}
      color="fg"
      fontSize="0.78rem"
      fontWeight={500}
      lineHeight={1.4}
      p={0}
      title={param.longString}
      userSelect="none"
    >
      {parts.map((part) =>
        part.startsWith("<") && part.endsWith(">") ? null : part,
      )}
    </chakra.code>
  );
}

function ParameterGroupHeader({
  activeCount,
  count,
  id,
  title,
}: {
  activeCount: number;
  count: number;
  id: string;
  title: string;
}) {
  return (
    <HStack align="center" justify="space-between" mb={1.5} gap={3}>
      <Text
        id={id}
        color="fg.muted"
        fontFamily="monospace"
        fontSize="0.68rem"
        fontWeight={700}
        letterSpacing="0.12em"
        textTransform="uppercase"
        mb={0}
      >
        {title}
      </Text>
      <Text color="fg.muted" fontSize="0.68rem" mb={0}>
        <Text as="span" color="blue.600" fontWeight="600">
          {activeCount}
        </Text>
        /{count} active
      </Text>
    </HStack>
  );
}

function ParameterActiveIndicator() {
  return (
    <Box
      aria-hidden="true"
      bg="blue.500"
      borderRadius="full"
      boxShadow="0 0 0 2px color-mix(in srgb, var(--chakra-colors-blue-500) 14%, transparent)"
      h="0.375rem"
      title="Active"
      w="0.375rem"
    />
  );
}

function ParameterDescription({
  changed,
  description,
  query,
}: {
  changed: boolean;
  description?: string;
  query: string;
}) {
  return (
    <>
      <Box color="fg.muted" fontSize="xs" lineHeight={1.38} mt={0.5}>
        {description ? (
          <HighlightedText text={description} query={query} />
        ) : null}
      </Box>
      {changed && (
        <Text
          color="fg.muted"
          fontFamily="monospace"
          fontSize="0.68rem"
          mb={0}
          mt={0.5}
        >
          changed since last run
        </Text>
      )}
    </>
  );
}

function ParameterRow({
  changed,
  children,
  onToggle,
  param,
  query,
  textToggles,
}: {
  changed: boolean;
  children: React.ReactNode;
  onToggle: () => void;
  param: InfomapParameter;
  query: string;
  textToggles: boolean;
}) {
  return (
    <HStack
      alignItems="flex-start"
      bg={param.active ? "blue.50" : "transparent"}
      borderLeftColor={changed ? "blue.500" : "transparent"}
      borderLeftWidth="2px"
      borderRadius="md"
      flexWrap="wrap"
      gap={2}
      justifyContent="space-between"
      px={2}
      py={2}
      _hover={{ bg: param.active ? "blue.50" : "bg.subtle" }}
    >
      <Box flex="1 1 13rem" minW={0}>
        <Box
          aria-label={textToggles ? `Toggle ${param.longString}` : undefined}
          as={textToggles ? "button" : "div"}
          bg="transparent"
          border={0}
          cursor={textToggles ? "pointer" : undefined}
          display="block"
          onClick={textToggles ? onToggle : undefined}
          p={0}
          textAlign="left"
          w="100%"
        >
          <HStack lineHeight={1.35} gap={1.5}>
            <Box fontSize="xs">
              <ParamName param={param} />
            </Box>
            {param.advanced && (
              <Badge colorPalette="blue" size="xs" variant="subtle">
                Advanced
              </Badge>
            )}
            {paramShortcut(param.long) && (
              <Kbd
                fontSize="0.65rem"
                title={`Press ${paramShortcut(param.long)} to toggle`}
              >
                {paramShortcut(param.long)}
              </Kbd>
            )}
            {param.active && <ParameterActiveIndicator />}
          </HStack>
          <ParameterDescription
            changed={changed}
            description={param.description}
            query={query}
          />
        </Box>
      </Box>
      <Flex flex="0 0 auto" maxW="100%" minW="4rem" pt={0.5} justify="flex-end">
        {children}
      </Flex>
    </HStack>
  );
}

const ParameterGroup = ({
  group,
  advanced,
  baseline,
  query,
}: {
  group: string;
  advanced: boolean;
  baseline: ParameterBaseline | null;
  query: string;
}) => {
  const store = useStore();

  const matchPriority = (match: ParameterMatch) =>
    match === "name" ? 0 : match === "description" ? 1 : 2;
  const params = store.params
    .getParamsForGroup(group)
    .filter((param) => !param.advanced || advanced || param.active)
    .map((param) => ({ param, match: parameterMatchType(param, query) }))
    .filter((entry) => entry.match !== null)
    .sort((a, b) => {
      const advancedDiff =
        a.param.advanced === b.param.advanced ? 0 : a.param.advanced ? 1 : -1;
      if (advancedDiff !== 0) return advancedDiff;
      return matchPriority(a.match) - matchPriority(b.match);
    });

  const id = `Params${group}`;

  if (params.length === 0) return null;

  const activeCount = params.filter(({ param }) => param.active).length;

  return (
    <Box as="section" mt={4} mb={5}>
      <ParameterGroupHeader
        activeCount={activeCount}
        count={params.length}
        id={id}
        title={group}
      />
      <Box>
        {params.map(({ param }, key) => {
          const textToggles = isToggleOnlyParameter(param);
          const changed = parameterIsChanged(param, baseline);

          return (
            <ParameterRow
              key={key}
              changed={changed}
              onToggle={() => store.params.toggle(param.long)}
              param={param}
              query={query}
              textToggles={textToggles}
            >
              <ParameterControl param={param} />
            </ParameterRow>
          );
        })}
      </Box>
    </Box>
  );
};

export default function Parameters({
  advanced,
  changedFromArgs,
  search,
  setAdvanced,
}: {
  advanced: boolean;
  changedFromArgs?: string;
  search: string;
  setAdvanced: (advanced: boolean) => void;
}) {
  const store = useStore();
  const query = normalizeSearch(search);
  const baseline = useMemo<ParameterBaseline | null>(() => {
    if (!changedFromArgs) return null;
    return new Map(
      applyArgsToParams(createParams(), changedFromArgs.split(/\s+/)).map(
        (param) => [param.long, param],
      ),
    );
  }, [changedFromArgs]);

  useEffect(() => {
    if (!window.location.hash) return;

    const hash = window.location.hash.slice(1);
    const param = store.params.getParam(hash);

    if (param?.advanced) {
      setAdvanced(true);
    }
  }, [store.params.getParam]);

  // Remember what `advanced` was when the search began, so we can restore it
  // when the search is cleared — and never override the user's manual toggle.
  const prevQueryRef = useRef("");
  const advancedBeforeSearchRef = useRef<boolean | null>(null);

  useEffect(() => {
    const prevQuery = prevQueryRef.current;
    prevQueryRef.current = query;

    if (!prevQuery && query) {
      advancedBeforeSearchRef.current = advanced;
    }

    if (prevQuery && !query) {
      if (advancedBeforeSearchRef.current !== null) {
        setAdvanced(advancedBeforeSearchRef.current);
        advancedBeforeSearchRef.current = null;
      }
      return;
    }

    if (!query) return;

    const hasAdvancedMatch = parameterGroups.some((group) =>
      store.params
        .getParamsForGroup(group)
        .some((param) => param.advanced && parameterMatches(param, query)),
    );

    if (hasAdvancedMatch) {
      setAdvanced(true);
    }
    // `advanced` is read only at the empty→non-empty transition; intentionally
    // not in deps so manual toggles while searching don't get overridden.
  }, [query, store.params.getParamsForGroup]);

  const hasResults = parameterGroups.some((group) =>
    store.params
      .getParamsForGroup(group)
      .some(
        (param) =>
          (!param.advanced || advanced || param.active) &&
          parameterMatches(param, query),
      ),
  );

  return (
    <>
      {hasResults ? (
        parameterGroups.map((group) => (
          <ParameterGroup
            key={group}
            group={group}
            advanced={advanced}
            baseline={baseline}
            query={query}
          />
        ))
      ) : (
        <Text color="fg.muted" fontSize="xs" mt={4}>
          No parameters match "{search}".
        </Text>
      )}
    </>
  );
}
